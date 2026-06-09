import { createContext, useContext, useState, type ReactNode } from "react";

export type CustomerRole = "Customer Admin" | "Operator" | "Reviewer" | "Auditor" | "Support Engineer";

interface RoleState {
  role: CustomerRole;
  setRole: (r: CustomerRole) => void;
}

const RoleContext = createContext<RoleState | null>(null);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<CustomerRole>("Customer Admin");
  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within RoleProvider");
  return ctx;
}
