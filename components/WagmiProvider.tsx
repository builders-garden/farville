import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// export const config = createConfig({
//   chains: [base],
//   transports: {
//     [base.id]: http(),
//   },
//   connectors: [frameConnector()],
// });

const queryClient = new QueryClient();

export default function Provider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
