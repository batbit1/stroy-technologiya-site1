"use client";

import { useEffect, useState } from "react";

/**
 * matchMedia без рассинхрона гидрации: первый рендер всегда false,
 * затем фактическое значение после mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const apply = () => setMatches(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [query]);

  return matches;
}
