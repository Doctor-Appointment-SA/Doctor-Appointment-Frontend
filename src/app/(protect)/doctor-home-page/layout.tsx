"use client"

import { useAuth } from "@/components/authen/AuthProvider";
import { useRouter } from "next/navigation";

export default function DoctorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();

  // user might still be fetching
  if (user === null) return <p>loading ...</p>;

  // finish fetch, Authorize 
  if (user.role !== "doctor") router.push("/403");

  return <>{children}</>;
}
