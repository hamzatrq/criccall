"use client";

import { RoleProvider } from "@/lib/role-context";
import { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return <RoleProvider>{children}</RoleProvider>;
}
