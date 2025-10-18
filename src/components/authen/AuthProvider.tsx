"use client";

import React, { useEffect, useState, createContext, useContext } from "react";
import { useRouter } from "next/navigation";
import { whoami } from "@/lib/authentication";
import { UserPayload } from "@/type/authenticationType";


type AuthContextType = {
  user: User | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const checkAuth = async () => {
    try {
      // 1️⃣ try whoami with current access token
      const me = await whoami();
      setUser(me);
    } catch (e) {
      console.warn("whoami failed, trying refresh()", e);
      try {
        // 2️⃣ try refresh token
        await refresh();

        // 3️⃣ retry whoami after successful refresh
        const me = await whoami();
        setUser(me);
      } catch (refreshError) {
        console.error("refresh failed, redirecting to /auth", refreshError);
        setUser(null);
        router.push("/auth");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // manual refresh (e.g., after login)
  const refreshUser = async () => {
    setLoading(true);
    try {
      const me = await whoami();
      setUser(me);
    } catch {
      try {
        await refresh();
        const me = await whoami();
        setUser(me);
      } catch {
        setUser(null);
        router.push("/auth");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
