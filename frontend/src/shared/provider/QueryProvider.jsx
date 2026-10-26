import { useState } from "react";
import {
    QueryClient,
    QueryClientProvider,
} from "@tanstack/react-query";

export default function QueryProvider({ children }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        gcTime: 5 * 60_000,
                        refetchOnWindowFocus: false,

                        retry: (failureCount, error) => {
                            // Lỗi hợp đồng hoặc đầu vào không được retry tự động.
                            if (error?.kind === "contract") {
                                return false;
                            }

                            if (
                                error?.status >= 400 &&
                                error?.status < 500
                            ) {
                                return false;
                            }

                            return failureCount < 1;
                        },
                    },

                    mutations: {
                        retry: false,
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}