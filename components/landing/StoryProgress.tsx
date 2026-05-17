"use client";

import {
  EASE_LUXURY_CSS_COMPACT,
  MOTION_DURATION_MS,
} from "@/lib/motion-system";

/** Минимальная форма шага для индикатора глав (название — опционально, для подсказок). */
export type ProgressStep = {
  id: string;
  startProgress: number;
  /** Подпись главы для hover-tooltip (обычно eyebrow контента). */
  label?: string;
};

type Props = {
  steps: ProgressStep[];
  progress01: number;
};

/** Конец глав (синхрон с CARD_STAY_END в LuxuryStoryCard). */
const STORY_FILL_END = 0.92;

const BRONZE_FILL =
  "linear-gradient(to bottom, rgba(115,92,72,0.34), rgba(72,54,42,0.16))";

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

function smoothstep01(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

/** Плавность появления и ухода индикатора после hero и к финалу сцены. */
function containerRevealOpacity(progress01: number): number {
  const SHOW_FROM = 0.112;
  const SHOW_TO = 0.974;
  const FADE = 0.058;
  if (progress01 <= SHOW_FROM || progress01 >= SHOW_TO) return 0;
  const fadeIn = smoothstep01((progress01 - SHOW_FROM) / FADE);
  const fadeOut = smoothstep01((SHOW_TO - progress01) / FADE);
  return fadeIn * fadeOut;
}

function arcFill01(steps: ProgressStep[], progress01: number): number {
  if (steps.length === 0) return 0;
  const s0 = steps[0]!.startProgress;
  const stride =
    steps.length >= 2
      ? steps[1]!.startProgress - steps[0]!.startProgress
      : (STORY_FILL_END - s0) / Math.max(steps.length, 1);
  const arcEnd = s0 + stride * steps.length;
  return clamp01((progress01 - s0) / (arcEnd - s0));
}

/**
 * Вертикальная навигация по главам — редакционный индикатор (не «точки слайдера»).
 *
 * Справа: тонкая вертикальная ось и заполнение по скроллу, номера 01–0N и маркер.
 * Активная глава — сдержанный bronze/ink, остальные едва заметны.
 * Только lg+ — на узких экранах см. полоску внутри LuxuryStoryCard.
 */
export function StoryProgress({ steps, progress01 }: Props) {
  let activeIdx = -1;
  for (let i = 0; i < steps.length; i++) {
    if (progress01 >= steps[i]!.startProgress - 0.006) activeIdx = i;
  }

  const containerOpacity = containerRevealOpacity(progress01);
  if (steps.length === 0 || containerOpacity < 0.008) return null;

  const fill01 = arcFill01(steps, progress01);
  /** Расстояние между центрами соседних маркеров. */
  const segmentPx = 28;
  const n = steps.length;
  const spineH = n <= 1 ? 0 : (n - 1) * segmentPx;

  return (
    <div
      className="absolute right-7 top-1/2 z-[28] hidden w-[100px] -translate-y-1/2 select-none lg:block xl:right-9"
      style={{
        opacity: containerOpacity,
        transition: `opacity ${MOTION_DURATION_MS.section}ms ${EASE_LUXURY_CSS_COMPACT}`,
      }}
      role="navigation"
      aria-label="Ход глав сцены"
    >
      {/* Высота трека: ровная сетка от первой главы до последней. */}
      <div className="relative" style={{ height: n <= 1 ? 28 : spineH }}>
        {/* Вертикальная ось + заполнение. */}
        {spineH > 0 ? (
          <div
            className="pointer-events-none absolute right-[5px] top-0"
            aria-hidden
            style={{ height: spineH, width: "1px" }}
          >
            <div className="absolute inset-0 rounded-full bg-[rgba(41,37,32,0.065)]" />
            <div
              className="absolute left-0 top-0 h-full origin-top rounded-full opacity-[0.92]"
              style={{
                width: "100%",
                background: BRONZE_FILL,
                transform: `scaleY(${fill01})`,
                transition: `transform ${MOTION_DURATION_MS.scrollSpine}ms ${EASE_LUXURY_CSS_COMPACT}`,
              }}
            />
          </div>
        ) : null}

        {steps.map((step, i) => {
          const isActive = i === activeIdx;
          const isPast = i < activeIdx;
          const label = step.label?.trim();

          const topPct = n <= 1 ? 50 : clamp01(i / Math.max(n - 1, 1)) * 100;

          const numMuted = "rgba(41,37,32,0.2)";
          const numPast = "rgba(32,29,26,0.5)";
          const numActiveInk = "rgba(32,29,26,0.76)";

          const markerBorder = isActive
            ? "rgba(105,82,58,0.38)"
            : isPast
              ? "rgba(72,54,42,0.16)"
              : "rgba(41,37,32,0.1)";
          const markerFill = isActive
            ? "rgba(105,82,58,0.18)"
            : isPast
              ? "rgba(41,37,32,0.08)"
              : "rgba(41,37,32,0.028)";

          const rowInteractive = Boolean(label);

          return (
            <div
              key={step.id}
              className={[
                "group/step absolute flex w-[calc(100%-8px)] -translate-y-1/2 flex-row items-center justify-end gap-[9px]",
                "rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ink/20 focus-visible:ring-offset-1 focus-visible:ring-offset-transparent",
                rowInteractive ? "pointer-events-auto" : "pointer-events-none",
              ].join(" ")}
              tabIndex={rowInteractive ? 0 : undefined}
              role={rowInteractive ? "group" : undefined}
              aria-label={
                label
                  ? `Глава ${String(i + 1).padStart(2, "0")}: ${label}`
                  : undefined
              }
              style={{
                top:
                  spineH <= 0 ? `${topPct}%` : `${(i / Math.max(n - 1, 1)) * 100}%`,
                right: "0px",
                transition: `opacity ${MOTION_DURATION_MS.card}ms ${EASE_LUXURY_CSS_COMPACT}, transform ${MOTION_DURATION_MS.card}ms ${EASE_LUXURY_CSS_COMPACT}`,
              }}
            >
              {label ? (
                <span
                  className={[
                    "pointer-events-none absolute right-[calc(100%-2px)] top-1/2 z-[1] mr-[18px]",
                    "-translate-y-1/2 whitespace-nowrap text-right font-sans text-[7.75px] font-semibold uppercase",
                    "leading-snug tracking-[0.42em]",
                    "text-[rgba(41,37,32,0.62)] opacity-0",
                    "transition-[opacity,transform] duration-[720ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "group-hover/step:translate-x-0 group-hover/step:opacity-100",
                    "group-focus-visible/step:translate-x-0 group-focus-visible/step:opacity-100",
                    "-translate-x-1.5",
                  ].join(" ")}
                >
                  {label}
                </span>
              ) : null}

              <span
                className="min-w-[1.1rem] text-right font-sans text-[8.75px] font-semibold tabular-nums tracking-[0.16em]"
                style={{
                  color: isActive
                    ? numActiveInk
                    : isPast
                      ? numPast
                      : numMuted,
                  transition: `color ${MOTION_DURATION_MS.section}ms ${EASE_LUXURY_CSS_COMPACT}`,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>

              <span
                aria-hidden
                className="shrink-0 rounded-full transition-[width,height,border-color,background-color,box-shadow] duration-[760ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: isActive ? 7 : isPast ? 5.25 : 4.75,
                  height: isActive ? 7 : isPast ? 5.25 : 4.75,
                  border: `1px solid ${markerBorder}`,
                  background: markerFill,
                  marginRight: "1px",
                  boxShadow: isActive
                    ? "0 0 0 1px rgba(255,252,246,0.5) inset, 0 0 14px -6px rgba(105,82,58,0.35)"
                    : "none",
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
