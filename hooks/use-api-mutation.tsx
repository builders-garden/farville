import { useMutation, UseMutationOptions } from "@tanstack/react-query";

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface UseApiMutationOptions<TData, TVariables>
  extends Omit<UseMutationOptions<TData, Error, TVariables>, "mutationFn"> {
  url: string | ((variables: TVariables) => string);
  method?: HttpMethod;
  isProtected?: boolean;
  body?: (variables: TVariables) => unknown;
}

export const useApiMutation = <TData, TVariables = unknown>(
  options: UseApiMutationOptions<TData, TVariables>
) => {
  const {
    url,
    method = "POST",
    isProtected = true,
    ...mutationOptions
  } = options;

  return useMutation<TData, Error, TVariables>({
    ...mutationOptions,
    mutationFn: async (variables) => {
      const resolvedUrl = typeof url === "function" ? url(variables) : url;
      const resolvedBody = options.body ? options.body(variables) : null;

      // Helper: check if any value in the body is a File or Blob
      const hasFile = (obj: unknown): boolean => {
        if (!obj || typeof obj !== "object") return false;
        return Object.values(obj as Record<string, unknown>).some(
          (v) => v instanceof File || v instanceof Blob
        );
      };

      const fetchOptions: RequestInit = {
        method,
        ...(isProtected && {
          credentials: "include",
        }),
      };

      if (resolvedBody && hasFile(resolvedBody)) {
        console.log("Detected file upload in body, using FormData");
        // Use FormData for file upload
        const formData = new FormData();
        Object.entries(resolvedBody).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            // If value is an array, append all
            if (Array.isArray(value)) {
              value.forEach((v, i) => formData.append(`${key}[${i}]`, v));
            } else {
              formData.append(key, value as string | Blob);
            }
          }
        });
        fetchOptions.body = formData;
      } else if (resolvedBody) {
        fetchOptions.body = JSON.stringify(resolvedBody);
      }

      const response = await fetch(resolvedUrl, fetchOptions);

      if (!response.ok) {
        console.error("API Error", response);
        throw new Error(`API Error: ${response.status}`);
      }

      return response.json();
    },
  });
};
