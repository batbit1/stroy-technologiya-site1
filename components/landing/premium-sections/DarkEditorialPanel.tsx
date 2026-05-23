"use client";

import type { ReactNode } from "react";
import { SectionReveal } from "@/components/landing/premium-sections/SectionReveal";

export function DarkEditorialPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={["section-dark-panel", className].filter(Boolean).join(" ")}>
      <div aria-hidden className="section-dark-panel__vignette" />
      <div aria-hidden className="section-dark-panel__glow" />
      <div className="section-dark-panel__inner">{children}</div>
    </div>
  );
}

export function DarkEditorialCtaGroup({
  primaryLabel,
  secondaryLabel,
  onPrimary,
  onSecondary,
  className = "",
  delayMs = 0,
}: {
  primaryLabel: string;
  secondaryLabel?: string;
  onPrimary: () => void;
  onSecondary?: () => void;
  className?: string;
  delayMs?: number;
}) {
  return (
    <SectionReveal
      className={["section-dark-cta", className].filter(Boolean).join(" ")}
      delayMs={delayMs}
    >
      <button type="button" onClick={onPrimary} className="section-dark-btn section-dark-btn--primary">
        <span>{primaryLabel}</span>
      </button>
      {secondaryLabel && onSecondary ? (
        <button
          type="button"
          onClick={onSecondary}
          className="section-dark-btn section-dark-btn--secondary"
        >
          <span>{secondaryLabel}</span>
        </button>
      ) : null}
    </SectionReveal>
  );
}
