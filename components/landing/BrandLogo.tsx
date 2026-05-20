"use client";

import { useId } from "react";

/** Premium navbar palette — champagne / graphite / warm metal (no green). */
export const BRAND_LOGO_COLORS = {
  main: "#2A241E",
  mainSoft: "#3A3028",
  accent: "#C8B891",
  accentLight: "#E7DBC2",
  highlight: "#F4EAD2",
} as const;

export type BrandLogoVariant = "header" | "icon";

export type BrandLogoProps = {
  /** `header` — единый responsive lockup для navbar. */
  variant?: BrandLogoVariant;
  className?: string;
};

function MonogramSK({
  className,
  gradientId,
}: {
  className?: string;
  gradientId: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable="false"
    >
      <defs>
        <linearGradient
          id={gradientId}
          x1="8"
          y1="6"
          x2="38"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0" stopColor={BRAND_LOGO_COLORS.highlight} />
          <stop offset="0.42" stopColor={BRAND_LOGO_COLORS.accentLight} />
          <stop offset="1" stopColor={BRAND_LOGO_COLORS.accent} />
        </linearGradient>
      </defs>
      {/* Architectural corner ticks */}
      <path
        d="M3 11V3h8"
        stroke={BRAND_LOGO_COLORS.accent}
        strokeWidth="0.75"
        strokeLinecap="square"
        opacity="0.72"
      />
      <path
        d="M33 41h8V33"
        stroke={BRAND_LOGO_COLORS.accent}
        strokeWidth="0.75"
        strokeLinecap="square"
        opacity="0.72"
      />
      {/* S — geometric terminals, single fill */}
      <path
        fill={BRAND_LOGO_COLORS.main}
        d="M9 9.5c-3.6 0-5.5 2.1-5.5 5.4 0 2.8 1.7 4.5 5.2 5.2l1.8.35c2.2.45 3 1.1 3 2.3 0 1.6-1.4 2.8-4.1 2.8-2.5 0-4.2-1-5-2.4l-1.8 1c.9 2.3 3.2 3.7 6.2 3.7 4 0 6.6-2.3 6.6-5.8 0-2.9-1.8-4.6-5.5-5.3l-1.8-.35c-2-.4-2.7-1-2.7-2 0-1.2 1.1-2 2.9-2 1.8 0 3.1.7 3.7 1.7l1.7-.95C13.8 10.2 11.5 9.5 9 9.5Z"
      />
      <path fill={BRAND_LOGO_COLORS.main} d="M21.5 8.5h2.4v27H21.5z" />
      <path
        fill={BRAND_LOGO_COLORS.main}
        d="M24.2 21.2 32.5 8.5H35.4L27.3 20.2 38.5 35.5H35.3L26.1 21.9 24.2 25.8v9.7h-2.4V21.2z"
      />
      <path
        fill="none"
        stroke={`url(#${gradientId})`}
        strokeWidth="1.1"
        strokeLinecap="square"
        d="M24.4 20.8 33.6 9.2"
        opacity="0.92"
      />
      <line
        x1="20.1"
        y1="11.5"
        x2="20.1"
        y2="32.5"
        stroke={BRAND_LOGO_COLORS.accent}
        strokeWidth="0.5"
        opacity="0.55"
      />
    </svg>
  );
}

function Wordmark() {
  return (
    <span className="brand-logo__wordmark" aria-hidden>
      ТЕХНОЛОГИЯ
    </span>
  );
}

export function BrandLogo({
  variant = "header",
  className = "",
}: BrandLogoProps) {
  const gradientId = `brand-logo-metal-${useId().replace(/:/g, "")}`;

  if (variant === "icon") {
    return (
      <span
        className={`brand-logo brand-logo--icon ${className}`.trim()}
        aria-hidden
      >
        <MonogramSK
          className="brand-logo__mark brand-logo__mark--icon"
          gradientId={gradientId}
        />
      </span>
    );
  }

  return (
    <span
      className={`brand-logo brand-logo--header ${className}`.trim()}
      aria-hidden
    >
      <MonogramSK className="brand-logo__mark" gradientId={gradientId} />
      <span className="brand-logo__rule" aria-hidden />
      <Wordmark />
    </span>
  );
}
