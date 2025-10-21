"use client";

import { useAuth } from "@/components/authen/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // finish fetch, Authorize
  useEffect(() => {
    if (user && user?.role !== "patient") router.push("/403"); // authenticated but unauthorized
  }, [user]);

  // user might still be fetching
  if (user === null) return <p>Loading...</p>;
  return <>{children}</>;
  
}
