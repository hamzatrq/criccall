"use client";

import { ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig } from "@/lib/wagmi";
import { AuthProvider } from "@/lib/auth-context";
import { RoleProvider } from "@/lib/role-context";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RoleProvider>{children}</RoleProvider>
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
