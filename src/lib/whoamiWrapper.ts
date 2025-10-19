"use client";
import useSWR from "swr";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "./api";
import axios from "axios";

const fetcher = async (url: string) => {
  try {
    const res = await axios.get(url);
    return res;
  } catch (e) {
    throw new Error(""+e);
  }
};

export function whoamiWrapper(options?: { redirectTo?: string; enabled?: boolean }) {
  const router = useRouter();
  const { redirectTo = "/auth", enabled = true } = options || {};
  const { data, error, isLoading, mutate } = useSWR(
    enabled ? `http://localhost:4001/api/auth/whoami` : null,
    fetcher,
    { revalidateOnFocus: false, shouldRetryOnError: false }
  );

  useEffect(() => {
    // If request fails even after refresh, treat as unauth
    if (error && redirectTo) router.replace(redirectTo);
  }, [error, redirectTo, router]);

  return { me: data, isLoading, error, refreshMe: () => mutate() };
}
