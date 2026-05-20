"use client";

import type { LandingCardContent } from "@/lib/landing-data";
import { useInViewOnce } from "@/hooks/useInViewOnce";

type Side = "left" | "right";

type Props = {
  index: number;
  side: Side;
  content: LandingCardContent;
};

export function FeatureCard({ index, side, content }: Props) {
  const { ref, isInView } = useInViewOnce<HTMLDivElement>({
    rootMargin: "0px 0px -8% 0px",
    threshold: 0,
  });

  /*
   * Desktop safe-zone:
   * justify-center — карточка по центру боковой колонки (не у края canvas).
   * items-end      — ниже вертикального центра, крыша и верхний фасад свободны.
   */
  const wrapperAlign = "lg:justify-center lg:items-end";

  const articleAlign =
    side === "left"
      ? "lg:max-w-[320px] lg:text-left"
      : "lg:max-w-[320px] lg:text-left";

  return (
    <div
      ref={ref}
      className={[
        "flex min-h-[72vh] items-center px-5 py-14",
        "lg:min-h-[85vh] lg:px-8 lg:pb-16 lg:pt-8",
        wrapperAlign,
      ].join(" ")}
    >
      <article
        className={[
          "ds-panel ds-panel--feature w-full",
          "p-8 lg:p-9",
          /* Entrance animation */
          "transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          isInView
            ? "translate-y-0 opacity-100 blur-0"
            : "translate-y-10 opacity-0 blur-[10px]",
          articleAlign,
        ].join(" ")}
      >
        <p className="ds-eyebrow text-[10px] tracking-[0.34em]">
          {String(index + 1).padStart(2, "0")} — раздел
        </p>
        <h3 className="ds-heading-display mt-5 text-2xl sm:text-[1.65rem]">
          {content.title}
        </h3>
        <p className="ds-prose mt-4 text-sm sm:text-[0.9rem]">
          {content.body}
        </p>
      </article>
    </div>
  );
}
