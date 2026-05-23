"use client";

import type { CSSProperties, ReactNode, RefObject } from "react";
import { EASE_LUXURY_CSS, MOTION_DURATION_MS } from "@/lib/motion-system";
import { useInViewOnce } from "@/hooks/useInViewOnce";

const SHOW_MS = MOTION_DURATION_MS.section;

type Props = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "article" | "li";
};

export function SectionReveal({
  children,
  className = "",
  delayMs = 0,
  as: Tag = "div",
}: Props) {
  const { ref, isInView } = useInViewOnce<HTMLElement>({
    rootMargin: "0px 0px -8% 0px",
    threshold: 0,
  });

  const style: CSSProperties = {
    opacity: isInView ? 1 : 0,
    transform: isInView ? "translateY(0)" : "translateY(22px)",
    transition: `opacity ${SHOW_MS}ms ${EASE_LUXURY_CSS} ${delayMs}ms, transform ${SHOW_MS}ms ${EASE_LUXURY_CSS} ${delayMs}ms`,
  };

  return (
    <Tag ref={ref as RefObject<HTMLDivElement & HTMLLIElement>} className={className} style={style}>
      {children}
    </Tag>
  );
}

export function PremiumSectionShell({
  id,
  ariaLabelledBy,
  className = "",
  children,
}: {
  id?: string;
  ariaLabelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className={`premium-home-section relative overflow-hidden bg-paper-soft ${className}`}
      aria-labelledby={ariaLabelledBy}
    >
      <div aria-hidden className="premium-home-section__atmosphere pointer-events-none absolute inset-0" />
      <div aria-hidden className="premium-home-section__fog pointer-events-none absolute inset-0" />
      <div className="ds-container relative z-[1]">{children}</div>
    </section>
  );
}
