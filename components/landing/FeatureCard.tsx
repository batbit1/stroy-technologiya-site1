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
          "w-full",
          /* Premium glassmorphism */
          "rounded-[24px]",
          "border border-white/55",
          "bg-white/45 backdrop-blur-2xl",
          /*
           * Shadow layers:
           * 1. tight ambient (close, soft)
           * 2. mid diffuse
           * 3. far halo (premium depth)
           * 4. inset top highlight (glass edge)
           */
          "shadow-[0_2px_12px_rgba(44,40,36,0.05),0_8px_36px_-6px_rgba(44,40,36,0.09),0_40px_80px_-20px_rgba(44,40,36,0.07),inset_0_1px_0_rgba(255,255,255,0.92)]",
          /* Spacing */
          "p-8 lg:p-9",
          /* Entrance animation */
          "transition-all duration-[1000ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          isInView
            ? "translate-y-0 opacity-100 blur-0"
            : "translate-y-10 opacity-0 blur-[10px]",
          articleAlign,
        ].join(" ")}
      >
        <p className="font-sans text-[10px] font-semibold uppercase tracking-[0.34em] text-ink/35">
          {String(index + 1).padStart(2, "0")} — раздел
        </p>
        <h3 className="mt-5 font-display text-2xl font-medium leading-[1.08] tracking-tight text-ink sm:text-[1.65rem]">
          {content.title}
        </h3>
        <p className="mt-4 font-sans text-sm leading-[1.7] text-ink/60 sm:text-[0.9rem]">
          {content.body}
        </p>
      </article>
    </div>
  );
}
