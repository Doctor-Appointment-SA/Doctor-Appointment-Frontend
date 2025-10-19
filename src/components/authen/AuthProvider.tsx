"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { refreshToken, whoami } from "@/lib/authentication";
import { UserPayload } from "@/type/authenticationType";

type AuthContextType = {
  user: UserPayload | null;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
});

// wrap this around Root => prevent user with wrong token => by doing whoami() and refreshToken()
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const router = useRouter();

  // try whoami with current access token
  const CheckAuth = async () => {
    try {
      const me = await whoami();
      setUser(me);
    } catch (e) {
      console.warn("whoami failed, trying refresh()", e);
      Retrywhoami();
    }
  };

  // after fail whoami() => do refreshToken() and retry whoami() again
  const Retrywhoami = async () => {
    try {
      await refreshToken();
      const me = await whoami();
      setUser(me);
    } catch (refreshError) {
      console.error("refresh failed, redirecting to /auth", refreshError);
      setUser(null);
      router.push("/authen");
    }
  };

  // Run when mount the page
  useEffect(() => {
    // disable auth for testing
    CheckAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
}

// context helper => called by childen to access variable in context
export function useAuth() {
  return useContext(AuthContext);
}