"use client";

import { useEffect, useRef } from "react";

export function useOnBack(onBack: () => void) {
  const cbRef = useRef(onBack);
  cbRef.current = onBack; // always the latest callback

  useEffect(() => {
    const handlePop = (_e: PopStateEvent) => {
      // fires when user presses Back/Forward
      cbRef.current?.();
    };

    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);
}
