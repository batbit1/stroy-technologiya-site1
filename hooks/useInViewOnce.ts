"use client";

import { useEffect, useRef, useState } from "react";

type Options = {
  rootMargin?: string;
  threshold?: number;
};

/**
 * Triggers once when element enters viewport — for card entrance animations.
 */
export function useInViewOnce<T extends Element>(
  { rootMargin = "0px 0px -12% 0px", threshold = 0 }: Options = {},
) {
  const ref = useRef<T | null>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || isInView) return;

    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setIsInView(true);
            obs.disconnect();
            return;
          }
        }
      },
      { rootMargin, threshold },
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [isInView, rootMargin, threshold]);

  return { ref, isInView };
}
