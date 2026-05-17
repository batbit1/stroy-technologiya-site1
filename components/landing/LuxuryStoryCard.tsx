"use client";

import { useMemo } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import type { StoryStep } from "@/lib/landing-data";
import { STORY_STEPS } from "@/lib/landing-data";
import { useNavScrollOpenRequestForm } from "@/components/landing/NavScrollContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  EASE_LUXURY,
  MOTION_DURATION_S,
  STORY_STAGGER_S,
} from "@/lib/motion-system";

// ─── Progress boundaries (синхрон с LandingScrollScene / Hero) ───────────────
//
//  0.00 – 0.10  hero; карточка скрыта
//  0.10 – 0.26  вход карточки
//  0.26 – 0.92  главы
//  0.92 – 1.00  выход

const CARD_ENTER_START = 0.1;
const CARD_ENTER_END = 0.26;
const CARD_STAY_END = 0.92;
const CARD_EXIT_END = 1.0;

const STEP_START = CARD_ENTER_END;
const STEP_END = CARD_STAY_END;
const STEP_T = 0.032;

const BRONZE = "rgba(105, 82, 58, 0.42)";
const BRONZE_SOFT = "rgba(105, 82, 58, 0.28)";

function smoothstep01(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x * x * (3 - 2 * x);
}

const CARD_TY_ENTER = 420;
const CARD_TY_EXIT = 32;

/** Внешнее положение карточки по скроллу — только opacity + translateY */
function cardVis(p: number): { opacity: number; ty: number } {
  if (p <= CARD_ENTER_START) return { opacity: 0, ty: CARD_TY_ENTER };
  if (p <= CARD_ENTER_END) {
    const u =
      (p - CARD_ENTER_START) / (CARD_ENTER_END - CARD_ENTER_START);
    const t = smoothstep01(u);
    return { opacity: t, ty: CARD_TY_ENTER * (1 - t) };
  }
  if (p <= CARD_STAY_END) return { opacity: 1, ty: 0 };
  if (p <= CARD_EXIT_END) {
    const u =
      (p - CARD_STAY_END) / (CARD_EXIT_END - CARD_STAY_END);
    const t = smoothstep01(u);
    return { opacity: 1 - t, ty: -CARD_TY_EXIT * t };
  }
  return { opacity: 0, ty: -CARD_TY_EXIT };
}

function cardEntranceProgress(p: number): number {
  if (p <= CARD_ENTER_START) return 0;
  if (p >= CARD_ENTER_END) return 1;
  return smoothstep01(
    (p - CARD_ENTER_START) / (CARD_ENTER_END - CARD_ENTER_START),
  );
}

function easeOut3(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - (1 - c) ** 3;
}

/**
 * Окна видимости глав по скроллу — как на исходном лендинге; используется для
 * выбора доминирующей главы без конфликта с LandingScrollScene.
 */
function stepVis(
  p: number,
  i: number,
  total: number,
): { opacity: number; ty: number; blur: number } {
  const nomRange = (STEP_END - STEP_START) / total;
  const nomStart = STEP_START + i * nomRange;
  const nomEnd = STEP_START + (i + 1) * nomRange;

  const fiStart = nomStart - STEP_T;
  const fiEnd = nomStart + STEP_T;
  const foStart = nomEnd - STEP_T;
  const foEnd = nomEnd + STEP_T;

  if (i === 0 && p <= fiEnd) return { opacity: 1, ty: 0, blur: 0 };
  if (p < fiStart) return { opacity: 0, ty: 14, blur: 5 };

  if (p < fiEnd) {
    const t = easeOut3((p - fiStart) / (2 * STEP_T));
    return { opacity: t, ty: 14 * (1 - t), blur: 5 * (1 - t) };
  }

  if (p < foStart) return { opacity: 1, ty: 0, blur: 0 };
  if (i === total - 1) return { opacity: 1, ty: 0, blur: 0 };

  if (p < foEnd) {
    const t = easeOut3((p - foStart) / (2 * STEP_T));
    return { opacity: 1 - t, ty: -10 * t, blur: 5 * t };
  }
  return { opacity: 0, ty: -10, blur: 0 };
}

function dominantChapterIndex(p: number): number {
  const n = STORY_STEPS.length;
  let best = 0;
  let bestOp = -1;
  for (let i = 0; i < n; i++) {
    const { opacity } = stepVis(p, i, n);
    if (opacity > bestOp) {
      bestOp = opacity;
      best = i;
    }
  }
  return best;
}

function clamp01(v: number) {
  return Math.max(0, Math.min(1, v));
}

/** Прогресс по дуге глав для мобильной полоски (синхрон с StoryProgress). */
function chapterArcProgress01(progress01: number): number {
  if (progress01 <= STEP_START) return 0;
  if (progress01 >= CARD_STAY_END) return 1;
  return clamp01(
    (progress01 - STEP_START) / (CARD_STAY_END - STEP_START),
  );
}

/** Горизонтальный редакционный индикатор этапов (только узкий экран, внутри карточки). */
function StoryStageStripMobile({
  progress01,
  cardOpacity,
  dominantIndex,
  reduceFx,
}: {
  progress01: number;
  cardOpacity: number;
  dominantIndex: number;
  reduceFx: boolean;
}) {
  const arc = chapterArcProgress01(progress01);
  const fadeProg = smoothstep01((progress01 - 0.1) / 0.065);
  const fadeEarly =
    progress01 >= CARD_ENTER_START
      ? 1
      : smoothstep01((progress01 - 0.08) / 0.045);
  const stripOpacity = clamp01(cardOpacity * fadeProg * fadeEarly);

  const n = STORY_STEPS.length;
  const total = Math.max(n - 1, 1);

  return (
    <div
      aria-hidden
      className="shrink-0 border-b border-[rgba(72,54,42,0.09)] px-4 pb-4 pt-4 lg:hidden xs:px-5 sm:px-7 sm:pb-[1.1rem] sm:pt-[1.15rem]"
      style={{
        opacity: stripOpacity,
        transition: reduceFx
          ? "none"
          : `opacity ${MOTION_DURATION_S.micro}s cubic-bezier(0.22,1,0.36,1)`,
      }}
    >
      <div className="flex justify-between gap-0.5">
        {STORY_STEPS.map((step, i) => {
          const active = i === dominantIndex;
          const past = i < dominantIndex;
          return (
            <div key={`lbl-${step.eyebrow}-${i}`} className="flex min-w-0 flex-1 flex-col items-center gap-2">
              <span
                className="truncate text-center font-sans text-[9px] font-semibold uppercase leading-tight tracking-[0.14em] sm:text-[9.25px] sm:tracking-[0.16em]"
                style={{
                  color: active
                    ? "rgba(32,29,26,0.78)"
                    : past
                      ? "rgba(41,37,32,0.38)"
                      : "rgba(41,37,32,0.22)",
                  maxWidth: "4.75rem",
                  transition: reduceFx
                    ? undefined
                    : "color 0.65s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                {step.eyebrow}
              </span>
              <span
                className="tabular-nums font-sans text-[9.5px] font-semibold tracking-[0.09em] sm:text-[10px]"
                style={{
                  color: active ? BRONZE_SOFT : "rgba(41,37,32,0.18)",
                  transition: reduceFx
                    ? undefined
                    : "color 0.65s cubic-bezier(0.22,1,0.36,1)",
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-px">
        {STORY_STEPS.map((_step, i) => {
          const segStart = i / total;
          const segEnd = (i + 1) / total;
          let fill = 0;
          if (arc >= segEnd) fill = 1;
          else if (arc > segStart)
            fill = clamp01((arc - segStart) / (segEnd - segStart));
          return (
            <div
              key={`seg-${i}`}
              className="relative h-[2px] flex-1 overflow-hidden rounded-full bg-[rgba(41,37,32,0.065)]"
            >
              <motion.div
                className="absolute inset-y-0 left-0 h-full w-full origin-left rounded-full"
                initial={false}
                style={{
                  backgroundColor: BRONZE_SOFT,
                  boxShadow:
                    fill > 0.02 ? "0 0 8px -2px rgba(105,82,58,0.28)" : "none",
                }}
                animate={{ scaleX: Math.max(fill, 0.004) }}
                transition={{
                  duration: reduceFx
                    ? MOTION_DURATION_S.reduced
                    : MOTION_DURATION_S.lineReveal,
                  ease: EASE_LUXURY,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function splitTitle(title: string): [string, string | null] {
  if (title.includes("\n")) {
    const [a, ...rest] = title.split("\n");
    return [a.trim(), rest.join("\n").trim() || null];
  }
  const dash = title.split(/[—–\-]/);
  if (dash.length >= 2) {
    return [dash[0].trim(), dash.slice(1).join("—").trim()];
  }
  const words = title.trim().split(/\s+/);
  if (words.length <= 2) return [title, null];
  const mid = Math.ceil(words.length / 2);
  return [
    words.slice(0, mid).join(" "),
    words.slice(mid).join(" "),
  ];
}

// ─── Visual infographic ─────────────────────────────────────────────────────

function VisualInfographic({
  step,
  index,
  total,
}: {
  step: StoryStep;
  index: number;
  total: number;
}) {
  const stage = (index + 1) / total;
  return (
    <div className="relative flex h-full min-h-[120px] flex-col lg:min-h-[168px]">
      <div
        className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-[20px] border border-[rgba(72,56,40,0.12)] bg-gradient-to-br from-[rgba(255,253,248,0.55)] to-[rgba(244,239,228,0.28)]"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.45]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(80,60,40,0.04) 1px,transparent 1px)," +
              "linear-gradient(90deg,rgba(80,60,40,0.04) 1px,transparent 1px)",
            backgroundSize: "22px 22px",
            WebkitMaskImage:
              "radial-gradient(ellipse 85% 85% at 50% 50%,black 20%,transparent 75%)",
            maskImage:
              "radial-gradient(ellipse 85% 85% at 50% 50%,black 20%,transparent 75%)",
          }}
        />
        {step.imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={step.imageSrc}
            alt={step.visualTitle ?? ""}
            className="absolute inset-0 size-full object-cover"
          />
        ) : (
          <svg
            viewBox="0 0 160 128"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden
            className="relative z-[1] w-[42%] max-w-[84px] text-[rgba(32,28,23,0.26)]"
          >
            <polyline
              points="20,108 20,56 80,18 140,56 140,108"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            <line
              x1="20"
              y1="108"
              x2="140"
              y2="108"
              stroke="currentColor"
              strokeWidth="1.2"
            />
            <rect
              x="37"
              y="70"
              width="24"
              height="20"
              stroke="currentColor"
              strokeWidth="0.9"
              rx="1"
            />
            <rect
              x="99"
              y="70"
              width="24"
              height="20"
              stroke="currentColor"
              strokeWidth="0.9"
              rx="1"
            />
            <path
              d="M68 108 L68 85 Q80 81 92 85 L92 108"
              stroke="currentColor"
              strokeWidth="0.9"
            />
          </svg>
        )}
        <div className="relative z-[1] mt-2 flex flex-col items-center gap-0.5 px-2 text-center">
          {step.visualTitle ? (
            <p className="m-0 font-sans text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/48 sm:text-[10.5px]">
              {step.visualTitle}
            </p>
          ) : null}
          {step.visualLabel ? (
            <p className="m-0 font-sans text-[9.5px] leading-snug text-ink/32 sm:text-[10px]">
              {step.visualLabel}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-2.5 space-y-1">
        <div className="flex items-center justify-between font-sans text-[10px] font-medium uppercase tracking-[0.12em] text-ink/38">
          <span>прогресс этапа</span>
          <span className="tabular-nums text-ink/48">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </span>
        </div>
        <div className="relative h-px w-full overflow-hidden rounded-full bg-ink/[0.08]">
          <motion.div
            className="absolute inset-y-0 left-0 h-full w-full origin-left rounded-full"
            style={{ backgroundColor: BRONZE_SOFT }}
            initial={false}
            animate={{ scaleX: Math.max(stage, 0.004) }}
            transition={{ duration: MOTION_DURATION_S.card, ease: EASE_LUXURY }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step panel (Framer stagger) ─────────────────────────────────────────────

function EditorialStepPanel({
  step,
  index,
  total,
  reduceFx,
}: {
  step: StoryStep;
  index: number;
  total: number;
  reduceFx: boolean;
}) {
  const openRequestForm = useNavScrollOpenRequestForm();
  const [titleA, titleB] = splitTitle(step.title);
  const stageRight = `STAGE ${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
  const baseDur = reduceFx ? MOTION_DURATION_S.reduced : MOTION_DURATION_S.card;
  const ease = EASE_LUXURY;
  const lineDur = reduceFx ? MOTION_DURATION_S.reduced : MOTION_DURATION_S.lineReveal;
  const bulletStaggerBase = 0.2;

  const stepInitial = reduceFx
    ? { opacity: 0 }
    : { opacity: 0, y: 20, scale: 0.988, filter: "blur(5px)" };
  const stepAnimate = reduceFx
    ? { opacity: 1 }
    : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" };
  const stepExit = reduceFx
    ? { opacity: 0 }
    : { opacity: 0, y: -14, scale: 0.996, filter: "blur(4px)" };

  const d = (n: number) => (reduceFx ? 0 : n);

  return (
    <motion.div
      className="flex min-h-0 flex-1 flex-col"
      initial={stepInitial}
      animate={stepAnimate}
      exit={stepExit}
      transition={{ duration: baseDur + 0.03, ease }}
    >
      <motion.div
        className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
        initial={{ opacity: 0, y: d(10) }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: baseDur, ease, delay: d(0.05) }}
      >
        <p className="m-0 min-w-0 max-w-[92%] font-sans text-[10.75px] font-semibold uppercase leading-snug tracking-[0.22em] text-ink/72 xs:max-w-[88%] sm:text-[11px] sm:tracking-[0.24em] lg:text-[10.5px] lg:tracking-[0.28em]">
          <span className="whitespace-nowrap font-medium tabular-nums text-ink">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="mx-1.5 font-normal text-ink/28">/</span>
          <span className="break-words">{step.eyebrow}</span>
        </p>
        <p className="m-0 shrink-0 font-sans text-[10px] font-medium uppercase tracking-[0.18em] text-ink/40 tabular-nums sm:text-[10.5px] sm:tracking-[0.22em]">
          {stageRight}
        </p>
      </motion.div>

      <motion.div
        className="mt-3 h-px w-full origin-left rounded-full bg-gradient-to-r from-[rgba(105,82,58,0.5)] via-ink/18 to-transparent"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: lineDur, ease, delay: d(0.07) }}
      />

      <div className="mt-5 min-w-0 sm:mt-6">
        <div
          className="relative inline-block max-w-full rounded-xl px-1 py-0.5"
          style={{
            background:
              "linear-gradient(90deg, rgba(255,252,245,0.52) 0%, rgba(255,250,242,0.22) 72%, transparent 100%)",
          }}
        >
          <motion.h3
            className="font-display m-0 max-w-[min(16ch,calc(100vw-52px))] text-[clamp(1.62rem,4.9vw,2.85rem)] font-medium leading-[0.95] tracking-[-0.038em] text-[rgba(20,18,16,0.97)] antialiased xs:max-w-[16ch] sm:max-w-none lg:text-[clamp(2.1rem,3.1vw,3rem)] lg:leading-[0.9] lg:tracking-[-0.045em]"
            initial={{ opacity: 0, y: d(14) }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: baseDur, ease, delay: d(0.12) }}
          >
            <span className="block">{titleA}</span>
            {titleB ? (
              <span className="mt-0.5 block text-[rgba(20,18,16,0.92)]">
                {titleB}
              </span>
            ) : null}
          </motion.h3>
        </div>

        <motion.p
          className="relative mt-4 max-w-[min(52ch,calc(100vw-52px))] rounded-xl px-1 py-0.5 font-sans text-[0.9575rem] font-medium leading-[1.64] text-ink/88 sm:mt-5 sm:text-[1.035rem] sm:leading-[1.62] lg:max-w-[52ch] lg:text-[1.06rem] lg:leading-[1.66]"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,252,245,0.38) 0%, transparent 100%)",
          }}
          initial={{ opacity: 0, y: d(12) }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: baseDur, ease, delay: d(0.16) }}
        >
          {step.text}
        </motion.p>
      </div>

      <div className="mt-5 flex min-h-0 flex-1 flex-col gap-5 sm:mt-6 lg:grid lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.82fr)] lg:gap-7 lg:pt-1">
        <div className="flex min-h-0 flex-col gap-4">
          {step.bullets && step.bullets.length > 0 ? (
            <ul className="m-0 list-none p-0" aria-label="Ключевые пункты">
              {step.bullets.map((bullet, bi) => (
                <motion.li
                  key={`${index}-${bi}`}
                  initial={{ opacity: 0, y: d(10) }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: baseDur,
                    ease,
                    delay: d(bulletStaggerBase + bi * STORY_STAGGER_S.bullet),
                  }}
                  className="group/item flex items-baseline gap-2.5 border-b border-[rgba(80,60,40,0.09)] py-2.5 transition-[transform,opacity,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] last:border-b-0 sm:gap-3 sm:py-3 [@media(hover:hover)]:lg:hover:translate-x-0.5 [@media(hover:hover)]:lg:hover:border-[rgba(105,82,58,0.22)]"
                >
                  <span className="w-7 shrink-0 font-sans text-[10.5px] font-medium tabular-nums tracking-[0.06em] text-ink/36">
                    {String(bi + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className="h-px w-4 shrink-0 origin-left bg-[rgba(80,60,40,0.14)] transition-colors duration-300 [@media(hover:hover)]:lg:group-hover/item:bg-[rgba(105,82,58,0.42)]"
                  />
                  <span className="min-w-0 font-sans text-[0.915rem] font-medium leading-[1.55] text-ink/86 sm:text-[0.94rem] lg:text-[0.93rem] lg:leading-[1.52]">
                    {bullet}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : null}

          {step.cta ? (
            <motion.div
              initial={{ opacity: 0, y: d(8) }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: baseDur,
                ease,
                delay: d(
                  bulletStaggerBase +
                    (step.bullets?.length ?? 0) * STORY_STAGGER_S.bullet +
                    0.065,
                ),
              }}
            >
              <button
                type="button"
                onClick={() => openRequestForm?.()}
                className="inline-flex max-w-full cursor-pointer items-center justify-center rounded-full border-0 bg-[#141210] px-7 py-3.5 font-sans text-[0.86rem] font-semibold tracking-[0.05em] text-[#faf7f0] shadow-[0_6px_24px_rgba(28,24,20,0.14)] outline-none ring-offset-[var(--paper-soft)] ring-offset-2 transition-[transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-[#1c1916] focus-visible:ring-2 focus-visible:ring-[#faf7f0]/55 active:scale-[0.98] sm:px-8 sm:text-[0.89rem]"
              >
                {step.cta}
              </button>
            </motion.div>
          ) : null}
        </div>

        <motion.div
          className="min-h-0 lg:block"
          initial={
            reduceFx ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.991 }
          }
          animate={
            reduceFx ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }
          }
          transition={{ duration: baseDur, ease, delay: d(0.24) }}
        >
          <VisualInfographic step={step} index={index} total={total} />
        </motion.div>
      </div>

      <motion.p
        className="mt-auto border-t border-[rgba(80,60,40,0.1)] pt-4 font-sans text-[9px] font-semibold uppercase leading-relaxed tracking-[0.24em] text-ink/36 sm:pt-5 sm:text-[9.5px] sm:tracking-[0.28em] lg:tracking-[0.32em]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: baseDur * 0.92, ease, delay: d(0.28) }}
      >
        частное домостроение / полный цикл работ · оренбург и область
      </motion.p>
    </motion.div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

type Props = { progress01: number };

export function LuxuryStoryCard({ progress01 }: Props) {
  const narrow = useMediaQuery("(max-width: 1023px)");
  const mqReduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const fmReduce = useReducedMotion();
  const reduceFx = Boolean(mqReduce || fmReduce);

  const { opacity: cOpacity, ty: cTy } = cardVis(progress01);
  const isVisible = cOpacity > 0.01;
  const enterT = cardEntranceProgress(progress01);
  const activeIndex = useMemo(
    () => dominantChapterIndex(progress01),
    [progress01],
  );

  const skipShellBlur = narrow || reduceFx;
  const shellBlurPx = skipShellBlur ? 0 : (1 - enterT) * 8;

  const step = STORY_STEPS[activeIndex]!;
  const total = STORY_STEPS.length;

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[24] flex items-end justify-center pb-[max(12px,env(safe-area-inset-bottom,0px))] lg:items-center lg:pb-0"
      aria-hidden={!isVisible}
    >
      <div
        className="pointer-events-auto w-[min(860px,max(274px,calc(100vw-32px-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px))))] max-w-[860px] lg:w-[min(860px,max(274px,calc(100vw-48px-env(safe-area-inset-left,0px)-env(safe-area-inset-right,0px))))]"
        style={{
          opacity: cOpacity,
          transform: `translateY(${cTy.toFixed(1)}px)`,
          willChange: "opacity, transform",
          visibility: isVisible ? "visible" : "hidden",
        }}
      >
        <div
          data-card="luxury-story-card"
          className="luxury-card-shell luxury-card-scene luxury-editorial-card relative flex max-h-[min(66svh,34rem)] flex-col overflow-hidden xs:max-h-[min(68svh,36rem)] lg:max-h-none lg:h-[clamp(520px,min(58vh,620px),620px)] lg:max-h-[620px] lg:min-h-[520px]"
          style={{
            transform: `translateY(${28 * (1 - enterT)}px) scale(${0.985 + 0.015 * enterT})`,
            filter:
              skipShellBlur || shellBlurPx < 0.35
                ? undefined
                : `blur(${shellBlurPx.toFixed(2)}px)`,
          }}
        >
          {/* Узкий бронзовый акцент — верх */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-6 right-6 top-0 z-[1] h-px sm:left-8 sm:right-8"
            style={{
              background: `linear-gradient(90deg, transparent, ${BRONZE}, transparent)`,
            }}
          />

          <StoryStageStripMobile
            progress01={progress01}
            cardOpacity={cOpacity}
            dominantIndex={activeIndex}
            reduceFx={reduceFx}
          />

          <div
            aria-hidden
            className="luxury-editorial-corner-grid pointer-events-none absolute inset-0 z-0 rounded-[inherit]"
          />

          <div className="luxury-sheen opacity-35" aria-hidden />
          <div className="luxury-noise" aria-hidden />

          <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden overscroll-contain [-webkit-overflow-scrolling:touch]">
            <AnimatePresence mode="wait" initial={false}>
              <EditorialStepPanel
                key={activeIndex}
                step={step}
                index={activeIndex}
                total={total}
                reduceFx={reduceFx}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
