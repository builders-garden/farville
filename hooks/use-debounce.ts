import { useEffect, useRef } from "react";
import { UseMutateFunction } from "@tanstack/react-query";

export function useDebounce<TData, TVariables>(
  callback: UseMutateFunction<TData, Error, TVariables, unknown>,
  delay: number
): UseMutateFunction<TData, Error, TVariables, unknown> {
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return ((...args: Parameters<typeof callback>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    return new Promise<ReturnType<typeof callback>>((resolve) => {
      timeoutRef.current = setTimeout(() => {
        resolve(callback(...args));
      }, delay);
    });
  }) as typeof callback;
}
