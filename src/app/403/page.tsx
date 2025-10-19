"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 text-center p-6">
      <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
      <h1 className="text-3xl font-bold mb-2 text-gray-800">403 – Forbidden</h1>
      <p className="text-gray-600 mb-6">
        You don’t have permission to access this page.
      </p>

      <Link href="/">
        <Button>Go back home</Button>
      </Link>
    </main>
  );
}
