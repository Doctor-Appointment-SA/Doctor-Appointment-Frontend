"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Session = { userId: string; role: string } | null;

const AuthCtx = createContext<{ session: Session; setSession: (s: Session)=>void }>({
  session: null,
  setSession: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session>(null);

  useEffect(() => {
    // optionally bootstrap via /identity/whoami on mount (client side)
    // (commented—prefer server fetch on layout if you use SSR)
  }, []);

  return <AuthCtx.Provider value={{ session, setSession }}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
