"use client";

import { useAuth } from "@/components/authen/AuthProvider";
import { useRouter } from "next/navigation";

export default function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // user might still be fetching
  if (user === null) return <p>Loading...</p>;

  // finish fetch, Authorize 
  if (user?.role !== "patient") router.push("/403"); // authenticated but unauthorized

  return <>{children}</>;
}
