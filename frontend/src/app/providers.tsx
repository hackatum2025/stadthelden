"use client";

import { SessionProvider } from "./chat/context/SessionContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

