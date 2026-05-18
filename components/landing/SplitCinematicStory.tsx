"use client";

import {
  motion,
  useReducedMotion,
  type TargetAndTransition,
  type Transition,
} from "framer-motion";
import type { StoryFeaturePoint, StoryStep, StoryVisualType } from "@/lib/landing-data";
import { STORY_STEPS } from "@/lib/landing-data";
import {
  CINEMATIC_TEXT_ENTER_S,
  CINEMATIC_VISUAL_ENTER_S,
} from "@/lib/cinematic-scroll-story";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useNavScrollOpenRequestForm } from "@/components/landing/NavScrollContext";
import type { SiteHero } from "@/data/siteContent";
import { HeroContent } from "./HeroContent";
import { CinematicEyebrow, CinematicTitle } from "./CinematicTitle";

const EASE_PREMIUM: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Z-index активной story-сцены. В one-scene-at-a-time модели одновременно
 * рендерится только одна сцена — статичного значения достаточно, чтобы быть
 * выше canvas / atmosphere / mist и наравне с Hero (Hero = z-[22]).
 */
const SCENE_Z = 24;

/**
 * Mount-time wrapper reveal: один короткий time-based кадр
 * (opacity 0 → 1, y 14 → 0, blur 6 → 0) за ≈ 0.28 c. Не зависит от scroll.
 * При смене activeStoryIndex родитель меняет key — старая сцена демонтируется
 * без exit-фейда, новая монтируется и проигрывает reveal целиком.
 */
const SCENE_REVEAL_INITIAL = {
  opacity: 0,
  y: 14,
  filter: "blur(6px)",
} as const;

const SCENE_REVEAL_VISIBLE = {
  opacity: 1,
  y: 0,
  filter: "blur(0px)",
} as const;

const SCENE_REVEAL_TRANSITION = {
  duration: 0.28,
  ease: EASE_PREMIUM,
} as const;

const SCENE_REVEAL_TRANSITION_REDUCED = {
  duration: 0.12,
  ease: EASE_PREMIUM,
} as const;

function defaultVisualType(index: number): StoryVisualType {
  const fallbacks: StoryVisualType[] = [
    "blueprint",
    "foundation",
    "structure",
    "envelope",
    "interior",
    "document-kit",
  ];
  return fallbacks[index] ?? "blueprint";
}

/**
 * Правая колонка: luxury proof-card (общий паттерн с главой «О нас»).
 * Только для visualType === "proofCard». Заголовок карточки — `cardHeader`.
 */
const DEFAULT_PROOF_CARD_HEADER = "Надёжность в деталях";

function ProofListColumn({
  items,
  storyIndex,
  reduceFx,
  scrollFlow = false,
  cardHeader = DEFAULT_PROOF_CARD_HEADER,
}: {
  items: StoryFeaturePoint[];
  storyIndex: number;
  reduceFx: boolean;
  scrollFlow?: boolean;
  cardHeader?: string;
}) {
  const CARD_ENTER_S = 0.64;
  const itemBaseDelay = reduceFx ? 0.06 : 0.22;
  const itemStagger = reduceFx ? 0.02 : 0.04;

  return (
    <div
      className="relative flex min-w-0 w-full max-w-full select-none flex-col justify-start max-lg:pointer-events-auto lg:pointer-events-none lg:flex-row lg:justify-end"
      aria-label="Преимущества и надёжность"
    >
      <div className="about-proof-card-outer">
        {scrollFlow ? (
          <div className="about-proof-card">
            <div className="about-proof-card-header">{cardHeader}</div>
            <ul className="about-proof-list">
              {items.map((fp, i) => (
                <li
                  key={`${storyIndex}-proof-${i}-${fp.title}`}
                  className="about-proof-item"
                >
                  <div className="about-proof-item-title">{fp.title}</div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
        <motion.div
          className="about-proof-card"
          initial={
            reduceFx
              ? { opacity: 0 }
              : { opacity: 0, x: 32, filter: "blur(10px)" }
          }
          animate={
            reduceFx
              ? { opacity: 1 }
              : { opacity: 1, x: 0, filter: "blur(0px)" }
          }
          transition={{
            duration: reduceFx ? 0.12 : CARD_ENTER_S,
            ease: EASE_PREMIUM,
          }}
        >
        <div className="about-proof-card-header">{cardHeader}</div>
        <ul className="about-proof-list">
          {items.map((fp, i) => (
            <motion.li
              key={`${storyIndex}-proof-${i}-${fp.title}`}
              className="about-proof-item"
              initial={
                reduceFx
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8 }
              }
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: reduceFx ? 0.1 : 0.38,
                ease: EASE_PREMIUM,
                delay: reduceFx ? 0 : itemBaseDelay + i * itemStagger,
              }}
            >
              <div className="about-proof-item-title">{fp.title}</div>
            </motion.li>
          ))}
        </ul>
      </motion.div>
        )}
      </div>
    </div>
  );
}

/**
 * Mount-time enter для SceneCopy (текстовая колонка). Только enter-фаза,
 * exit'а нет — при смене сцены родитель демонтирует компонент через key.
 * Длительность короткая (≈ 0.28 c.), чтобы пользователь не успел поймать
 * blur/полупрозрачное промежуточное состояние.
 */
function copyMotionProps(
  narrow: boolean,
  reduceFx: boolean,
): {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
} {
  if (reduceFx) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.12, ease: EASE_PREMIUM },
    };
  }
  if (narrow) {
    return {
      initial: { opacity: 0, y: 12, filter: "blur(6px)" },
      animate: { opacity: 1, y: 0, filter: "blur(0px)" },
      transition: {
        duration: CINEMATIC_TEXT_ENTER_S,
        ease: EASE_PREMIUM,
      },
    };
  }
  return {
    initial: { opacity: 0, x: -16, filter: "blur(6px)" },
    animate: { opacity: 1, x: 0, filter: "blur(0px)" },
    transition: {
      duration: CINEMATIC_TEXT_ENTER_S,
      ease: EASE_PREMIUM,
    },
  };
}

/**
 * Mount-time enter для SceneVisualFrame (визуальная карточка справа).
 * Аналогично copyMotionProps — короткий enter, без exit-фазы.
 */
function visualMotionProps(
  narrow: boolean,
  reduceFx: boolean,
): {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
} {
  if (reduceFx) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.12, ease: EASE_PREMIUM },
    };
  }
  if (narrow) {
    return {
      initial: { opacity: 0, y: 14, scale: 0.985 },
      animate: { opacity: 1, y: 0, scale: 1 },
      transition: {
        duration: CINEMATIC_VISUAL_ENTER_S,
        ease: EASE_PREMIUM,
      },
    };
  }
  return {
    initial: { opacity: 0, x: 18, scale: 0.985 },
    animate: { opacity: 1, x: 0, scale: 1 },
    transition: {
      duration: CINEMATIC_VISUAL_ENTER_S,
      ease: EASE_PREMIUM,
    },
  };
}

const BRONZE_SOFT = "rgba(105, 82, 58, 0.35)";

function hudGridBg(className?: string) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 opacity-[0.28] ${className ?? ""}`}
      style={{
        backgroundImage:
          "linear-gradient(rgba(72,58,44,0.07) 1px,transparent 1px)," +
          "linear-gradient(90deg,rgba(72,58,44,0.07) 1px,transparent 1px)",
        backgroundSize: "20px 20px",
      }}
    />
  );
}

function HouseOutlineSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 128"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <polyline
        points="20,108 20,56 80,18 140,56 140,108"
        stroke="currentColor"
        strokeWidth="1.15"
        strokeLinejoin="round"
      />
      <line
        x1="20"
        y1="108"
        x2="140"
        y2="108"
        stroke="currentColor"
        strokeWidth="1.15"
      />
      <rect
        x="37"
        y="70"
        width="24"
        height="20"
        stroke="currentColor"
        strokeWidth="0.95"
        rx="1"
      />
      <rect
        x="99"
        y="70"
        width="24"
        height="20"
        stroke="currentColor"
        strokeWidth="0.95"
        rx="1"
      />
      <path
        d="M68 108 L68 85 Q80 81 92 85 L92 108"
        stroke="currentColor"
        strokeWidth="0.9"
      />
    </svg>
  );
}

function SceneVisualBlueprint() {
  return (
    <div className="split-visual-card relative min-h-[168px] overflow-hidden p-4 lg:min-h-[198px] lg:p-5">
      {hudGridBg()}
      <div className="pointer-events-none absolute left-4 top-5 space-y-1">
        <div className="split-hud-line w-16" />
        <div className="split-hud-line w-10 opacity-70" />
        <div className="split-hud-line w-12 opacity-50" />
      </div>
      <div className="relative z-[1] flex flex-col items-center justify-center gap-4 pt-2">
        <HouseOutlineSvg className="w-[48%] max-w-[140px] text-ink/26" />
        <p className="m-0 font-sans text-[10px] font-semibold uppercase tracking-[0.28em] text-ink/55">
          WORKING SET
        </p>
      </div>
    </div>
  );
}

function SceneVisualFoundation({ scrollFlow = false }: { scrollFlow?: boolean }) {
  return (
    <div className="split-visual-card relative min-h-[168px] overflow-hidden p-4 lg:min-h-[198px] lg:p-5">
      {hudGridBg("opacity-[0.22]")}
      <div className="relative z-[1] flex flex-col gap-3 pt-1">
        {[
          { label: "axis", w: "72%" },
          { label: "concrete", w: "88%" },
          { label: "waterproofing", w: "64%" },
        ].map((row) => (
          <div key={row.label} className="space-y-2">
            <div className="flex items-center justify-between gap-2 font-sans text-[9px] font-semibold uppercase tracking-[0.22em] text-ink/48">
              <span>{row.label}</span>
              <span
                className="tabular-nums opacity-50"
                style={{ color: BRONZE_SOFT }}
              >
                ·
              </span>
            </div>
            <div
              className="split-hud-line rounded-full"
              style={{ width: row.w }}
            />
          </div>
        ))}
        <div className="mt-4 h-px w-full overflow-hidden rounded-full bg-[rgba(41,37,32,0.08)]">
          {scrollFlow ? (
            <div
              className="h-full w-full origin-left scale-x-100 rounded-full"
              style={{ backgroundColor: BRONZE_SOFT }}
              aria-hidden
            />
          ) : (
          <motion.div
            className="h-full w-full origin-left rounded-full"
            style={{ backgroundColor: BRONZE_SOFT }}
            initial={false}
            animate={{ scaleX: 1 }}
                transition={{ duration: 1, ease: EASE_PREMIUM }}
          />
          )}
        </div>
      </div>
    </div>
  );
}

function SceneVisualStructure() {
  const items = ["Стены", "Перекрытия", "Проёмы", "Коробка"];
  return (
    <div className="relative flex min-h-[168px] items-center justify-center py-2 lg:min-h-[198px]">
      {items.map((label, i) => (
        <div
          key={label}
          className="split-visual-card absolute w-[88%] max-w-[260px] p-3.5 shadow-[0_8px_22px_rgba(38,30,22,0.035)]"
          style={{
            transform: `translate(${i * 5}px, ${i * -9}px) rotate(${-1.2 + i * 0.9}deg)`,
            zIndex: 10 + i,
          }}
        >
          {hudGridBg("opacity-[0.2]")}
          <p className="relative z-[1] m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/72">
            {label}
          </p>
          <div className="relative z-[1] mt-2 split-hud-line" />
        </div>
      ))}
    </div>
  );
}

function SceneVisualEnvelope() {
  return (
    <div className="split-visual-card relative min-h-[168px] overflow-hidden p-4 lg:min-h-[198px] lg:p-5">
      {hudGridBg("opacity-[0.28]")}
      <div className="relative z-[1] flex flex-col items-center gap-4 pt-1">
        <div className="relative w-[72%] max-w-[200px]">
          <HouseOutlineSvg className="w-full text-ink/30" />
          <div className="pointer-events-none absolute -right-1 top-[8%] flex items-start gap-1">
            <div className="mt-2 h-px w-6 origin-left rotate-[12deg] bg-[rgba(72,58,44,0.22)]" />
            <span className="font-sans text-[8.5px] font-semibold uppercase tracking-[0.2em] text-ink/45">
              roof
            </span>
          </div>
          <div className="pointer-events-none absolute -left-2 top-[42%] flex items-center gap-1">
            <span className="font-sans text-[8.5px] font-semibold uppercase tracking-[0.2em] text-ink/45">
              facade
            </span>
            <div className="h-px w-7 bg-[rgba(72,58,44,0.2)]" />
          </div>
          <div className="pointer-events-none absolute -right-3 bottom-[12%] flex items-end gap-1">
            <div className="mb-1 h-px w-8 origin-right rotate-[-18deg] bg-[rgba(72,58,44,0.2)]" />
            <span className="font-sans text-[8.5px] font-semibold uppercase tracking-[0.2em] text-ink/45">
              drainage
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function SceneVisualInterior() {
  const facts = ["Электрика", "Вода", "Отопление", "Отделка"];
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
      {facts.map((label) => (
        <div
          key={label}
          className="split-floating-card px-3 py-3 lg:px-3.5 lg:py-3.5"
        >
          <div className="split-hud-line mb-2 w-8 opacity-80" />
          <p className="m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/78">
            {label}
          </p>
        </div>
      ))}
    </div>
  );
}

function KeyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={className}
    >
      <path
        d="M8.5 12.5c-1.1-1.1-1.1-2.9 0-4 1.1-1.1 2.9-1.1 4 0l1.2 1.2L20 19l-1.5 1.5-4.8-4.8-.7.7L12 15l-1.5-1.5 1.4-1.4-.7-.7-1.4 1.4c-1.1 1.1-2.9 1.1-4 0z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="9.2" cy="8.5" r="1.75" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SceneVisualDocumentKit() {
  const rows = ["Акты", "Документы", "Гарантия", "Эксплуатация"];
  return (
    <div className="split-visual-card relative min-h-[168px] overflow-hidden p-4 lg:min-h-[198px] lg:p-5">
      {hudGridBg("opacity-[0.18]")}
      <div className="relative z-[1] flex gap-4">
        <div className="flex shrink-0 flex-col items-center gap-2 pt-0.5">
          <div className="flex size-11 items-center justify-center rounded-2xl border border-[rgba(72,58,44,0.1)] bg-[rgba(250,247,240,0.55)] text-ink/50">
            <KeyIcon className="size-6" />
          </div>
          <HouseOutlineSvg className="mt-1 w-10 text-ink/22" />
        </div>
        <div className="min-w-0 flex-1 space-y-2.5">
          <p className="m-0 font-sans text-[9.5px] font-semibold uppercase tracking-[0.24em] text-ink/50">
            owner kit
          </p>
          {rows.map((r, i) => (
            <div key={r} className="flex items-center gap-2">
              <span
                className="tabular-nums font-sans text-[10px] font-medium text-[var(--bronze)]"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="split-hud-line flex-1" />
              <span className="font-sans text-[12px] font-medium text-ink/88">
                {r}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SceneVisual({
  type,
  scrollFlow = false,
}: {
  type: StoryVisualType;
  scrollFlow?: boolean;
}) {
  switch (type) {
    case "proofCard":
      return null;
    case "foundation":
      return <SceneVisualFoundation scrollFlow={scrollFlow} />;
    case "structure":
      return <SceneVisualStructure />;
    case "envelope":
      return <SceneVisualEnvelope />;
    case "interior":
      return <SceneVisualInterior />;
    case "document-kit":
      return <SceneVisualDocumentKit />;
    case "blueprint":
    default:
      return <SceneVisualBlueprint />;
  }
}

/**
 * Premium fade-in для всего technical-list блока. Список появляется одним
 * целым (opacity 0 → 1, y 12 → 0) сразу после headline. Никаких per-item
 * staggers, blur / contrast / brightness фильтров и привязки к scroll
 * progress — после mount-time enter'а список всегда чёткий.
 *
 * Базовая задержка = delay headline (CinematicTitle: 0.10 / 0.14) + 0.08,
 * чтобы блок "поддерживал" заголовок, а не появлялся вместе с ним.
 */
function bulletListMotionProps(
  narrow: boolean,
  reduceFx: boolean,
): {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
} {
  if (reduceFx) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.12, ease: EASE_PREMIUM, delay: 0.16 },
    };
  }
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: narrow ? 0.45 : 0.5,
      ease: EASE_PREMIUM,
      delay: (narrow ? 0.1 : 0.14) + 0.08,
    },
  };
}

function SceneCopy({
  step,
  index,
  narrow,
  reduceFx,
  scrollFlow = false,
  ctaPointerEvents,
  proofListLayout = false,
}: {
  step: StoryStep;
  index: number;
  narrow: boolean;
  reduceFx: boolean;
  scrollFlow?: boolean;
  ctaPointerEvents: "auto" | "none";
  /** Левая колонка только eyebrow + title + text; список преимуществ вынесен вправо. */
  proofListLayout?: boolean;
}) {
  const openRequestForm = useNavScrollOpenRequestForm();
  const softFx = reduceFx || scrollFlow;
  const cm = copyMotionProps(narrow, reduceFx);
  const bullets = step.bullets ?? [];
  const featurePoints = step.featurePoints ?? [];
  const stats = step.stats ?? [];
  const blm = bulletListMotionProps(narrow, reduceFx);
  const hasSupplementaryList =
    bullets.length > 0 || (featurePoints.length > 0 && !proofListLayout);

  const supportingParagraphProof =
    proofListLayout &&
    typeof step.supportingParagraph === "string"
      ? step.supportingParagraph.trim()
      : "";
  const hasProofSupportingParagraph = supportingParagraphProof.length > 0;

  const hasProofFooter =
    proofListLayout && Boolean(step.cta || stats.length > 0);

  const proofMainSceneCopyDescriptionMb =
    proofListLayout && hasProofSupportingParagraph
      ? "mb-0"
      : hasProofFooter
        ? "mb-[clamp(22px,3vmin,30px)]"
        : proofListLayout
          ? "mb-0"
          : "mb-[clamp(34px,4vmin,44px)]";

  const copyShellClass =
    (proofListLayout
      ? [
          "relative isolate min-w-0 w-full max-w-full about-copy lg:max-w-none lg:self-center lg:justify-self-start lg:translate-x-[clamp(-12px,-0.65vw,-4px)]",
          hasProofSupportingParagraph ? "proof-scene-unified-body-copy" : "",
        ]
          .filter(Boolean)
          .join(" ")
      : "relative isolate min-w-0 w-full max-w-full lg:max-w-[min(680px,46vw)] lg:self-center lg:justify-self-start lg:pt-[clamp(88px,10vh,128px)] lg:pb-[clamp(48px,7vh,88px)] lg:translate-x-[clamp(-12px,-0.65vw,-4px)]") +
    (scrollFlow ? " mobile-luxury-mist-host mobile-story-copy--luxury-scroll" : "");

  const eyebrowRowClass = proofListLayout
    ? [
        "about-copy-eyebrow-row scene-copy-eyebrow-row mb-[clamp(24px,3.5vmin,34px)] flex w-full max-w-full items-center gap-3 lg:max-w-none",
        scrollFlow ? "flex-col items-center justify-center gap-2 text-center" : "",
      ]
        .filter(Boolean)
        .join(" ")
    : [
        "scene-copy-eyebrow-row mb-[clamp(24px,3.5vmin,34px)] flex w-full max-w-full items-center gap-3 lg:max-w-[min(680px,46vw)]",
        scrollFlow ? "flex-col items-center justify-center gap-2 text-center" : "",
      ]
        .filter(Boolean)
        .join(" ");

  const fpNotesClassName = [
    "scene-copy-notes w-full max-w-[min(560px,100%)] list-none",
    scrollFlow ? "mx-auto text-center" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const bulletNotesClassName = [
    "scene-copy-notes w-full max-w-[min(560px,100%)] list-none",
    scrollFlow ? "mx-auto" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const sceneCopyInterior = (
    <>
      <div className="scene-copy-readability-glow" aria-hidden />
      <div
        className={[
          "relative z-[1] flex flex-col gap-0 scene-copy-stack",
          scrollFlow ? "items-center text-center" : "text-left",
        ].join(" ")}
      >
        <div className="split-copy-rule mb-2.5 lg:mb-3" aria-hidden />
        <div className={eyebrowRowClass}>
          {softFx ? (
            <span
              aria-hidden
              className="inline-block h-px w-14 shrink-0 bg-[rgba(137,103,67,0.34)]"
            />
          ) : (
            <motion.span
              aria-hidden
              className="inline-block h-px w-14 shrink-0 origin-center bg-[rgba(137,103,67,0.34)]"
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{
                duration: CINEMATIC_TEXT_ENTER_S,
                ease: EASE_PREMIUM,
                delay: 0.04,
              }}
            />
          )}
          <div
            className={
              scrollFlow
                ? "flex w-full min-w-0 justify-center px-1"
                : "min-w-0 flex-1"
            }
          >
            <CinematicEyebrow
              text={step.eyebrow}
              narrow={narrow}
              reduceFx={softFx}
              className="font-sans text-[0.72rem] font-bold uppercase leading-snug tracking-[0.22em] text-[rgba(23,23,23,0.48)]"
            />
          </div>
        </div>
        <div
          className={
            narrow
              ? "premium-engraved-title-wrap mb-[clamp(28px,3.6vmin,36px)] min-h-0 w-full"
              : `premium-engraved-title-wrap mb-[clamp(28px,3.6vmin,36px)] min-h-0 w-full${proofListLayout ? " about-copy-title-wrap" : ""}`
          }
        >
          <CinematicTitle
            text={step.title}
            narrow={narrow}
            reduceFx={softFx}
            delay={narrow ? 0.1 : 0.14}
            className="premium-engraved-title cinematic-text-render text-balance font-display"
          />
        </div>
        <p
          className={[
            "scene-copy-description pointer-events-none m-0 w-full max-w-[min(560px,100%)]",
            scrollFlow ? "text-center" : "text-left",
            proofMainSceneCopyDescriptionMb,
          ].join(" ")}
        >
          {step.text}
        </p>

        {hasProofSupportingParagraph ? (
          <p
            className={[
              "scene-copy-description pointer-events-none m-0 w-full max-w-[min(560px,100%)]",
              "mt-[clamp(14px,1.75vmin,18px)]",
              scrollFlow ? "text-center" : "text-left",
              hasProofFooter ? "mb-[clamp(22px,3vmin,30px)]" : "mb-0",
            ].join(" ")}
          >
            {supportingParagraphProof}
          </p>
        ) : null}

        {featurePoints.length > 0 && !proofListLayout ? (
          scrollFlow ? (
            <ul
              className={fpNotesClassName}
              aria-label="Преимущества"
            >
              {featurePoints.map((fp, bi) => (
                <li
                  key={`${index}-fp-${bi}`}
                  className={`scene-copy-feature-row border-b py-[13px] last:border-b-0 last:pb-0 first:pt-0 mobile-luxury-list-row border-[rgba(34,30,26,0.05)] text-center`}
                >
                  <div
                    className={`min-w-0 font-sans font-semibold text-[rgba(26,22,18,0.88)] [font-size:clamp(13px,0.88vw,16px)] [line-height:1.38] mx-auto max-w-[min(560px,100%)] text-center`}
                  >
                    {fp.title}
                  </div>
                  <p
                    className={`pointer-events-none m-0 mt-2 max-w-[560px] font-sans font-normal text-[rgba(26,22,18,0.62)] [font-size:clamp(13px,0.84vw,15px)] [line-height:1.66] mx-auto text-center`}
                  >
                    {fp.description}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <motion.ul
              className={fpNotesClassName}
              initial={blm.initial}
              animate={blm.animate}
              transition={blm.transition}
              aria-label="Преимущества"
            >
              {featurePoints.map((fp, bi) => (
                <li
                  key={`${index}-fp-${bi}`}
                  className="scene-copy-feature-row border-b border-[rgba(34,30,26,0.08)] py-[13px] text-left last:border-b-0 last:pb-0 first:pt-0"
                >
                  <div
                    className="min-w-0 text-left font-sans font-semibold text-[rgba(26,22,18,0.88)] [font-size:clamp(13px,0.88vw,16px)] [line-height:1.38]"
                  >
                    {fp.title}
                  </div>
                  <p
                    className="pointer-events-none m-0 mt-2 max-w-[560px] text-left font-sans font-normal text-[rgba(26,22,18,0.62)] [font-size:clamp(13px,0.84vw,15px)] [line-height:1.66]"
                  >
                    {fp.description}
                  </p>
                </li>
              ))}
            </motion.ul>
          )
        ) : null}

        {featurePoints.length === 0 && bullets.length > 0 ? (
          scrollFlow ? (
            <ul
              className={bulletNotesClassName}
              aria-label="Ключевые пункты"
            >
              {bullets.map((bullet, bi) => (
                <li
                  key={`${index}-${bi}`}
                  className="scene-copy-note-row"
                >
                  <span className="scene-copy-note-index font-sans tabular-nums">
                    {String(bi + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`scene-copy-bullet-text min-w-0 font-sans text-center`}
                  >
                    {bullet}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <motion.ul
              className={bulletNotesClassName}
              initial={blm.initial}
              animate={blm.animate}
              transition={blm.transition}
              aria-label="Ключевые пункты"
            >
              {bullets.map((bullet, bi) => (
                <li
                  key={`${index}-${bi}`}
                  className="scene-copy-note-row"
                >
                  <span className="scene-copy-note-index font-sans tabular-nums">
                    {String(bi + 1).padStart(2, "0")}
                  </span>
                  <span className="scene-copy-bullet-text min-w-0 text-left font-sans">
                    {bullet}
                  </span>
                </li>
              ))}
            </motion.ul>
          )
        ) : null}

        {hasSupplementaryList ? (
          <p
            className={[
              "scene-copy-footnote pointer-events-none font-sans",
              scrollFlow
                ? "mx-auto max-w-[min(500px,100%)] text-center"
                : "max-w-[500px] text-left",
            ].join(" ")}
          >
            частное домостроение / полный цикл работ / оренбург и область
          </p>
        ) : null}

        {step.cta ? (
          <div
            className={[
              proofListLayout ? "pb-0 pt-0 sm:pb-0" : "pt-1 sm:pt-1.5",
              scrollFlow ? "flex w-full justify-center" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={{ pointerEvents: ctaPointerEvents }}
          >
            <button
              type="button"
              onClick={() => openRequestForm?.()}
              className={[
                "scene-copy-premium-cta premium-cta-button premium-cta-button--primary group/hp",
                "relative inline-flex h-[58px] max-w-full min-w-0 cursor-pointer items-center justify-center border-0 px-[34px]",
                "font-sans text-[13px] font-semibold uppercase tracking-[0.14em]",
                "outline-none ring-offset-2 ring-offset-[var(--paper-soft)] focus-visible:ring-2 focus-visible:ring-[rgba(41,37,32,0.14)]",
              ].join(" ")}
            >
              <span className="premium-cta-button__label">{step.cta}</span>
            </button>
          </div>
        ) : null}

        {proofListLayout && stats.length > 0 ? (
          <div
            className={[
              "story-proof-stats pointer-events-none mt-[clamp(14px,2.2vmin,22px)] flex w-full max-w-[620px] flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:gap-0",
              step.sceneKey === "guarantees" ? "scene-stats" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label="Ключевые показатели"
          >
            {stats.map((stat, si) => (
              <div
                key={`${index}-stat-${si}-${stat.label}`}
                className={[
                  "flex min-w-0 flex-[1_1_auto] flex-col gap-1 sm:flex-[1_1_0]",
                  step.sceneKey === "guarantees" ? "scene-stat-item" : "",
                  si > 0
                    ? "border-t border-[rgba(34,30,26,0.1)] pt-4 sm:border-l sm:border-t-0 sm:pl-[clamp(14px,2.2vw,22px)] sm:pt-0 lg:ml-0 lg:pl-[clamp(18px,2.8vw,28px)]"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span
                  className={[
                    "story-proof-stat-value",
                    step.sceneKey === "guarantees" ? "scene-stat-value" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {stat.value}
                </span>
                <span
                  className={[
                    "story-proof-stat-label",
                    step.sceneKey === "guarantees" ? "scene-stat-label" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </>
  );

  return scrollFlow ? (
    <div className={copyShellClass}>{sceneCopyInterior}</div>
  ) : (
    <motion.div
      className={copyShellClass}
      initial={cm.initial}
      animate={cm.animate}
      transition={cm.transition}
    >
      {sceneCopyInterior}
    </motion.div>
  );
}

function SceneVisualFrame({
  type,
  narrow,
  reduceFx,
  scrollFlow = false,
}: {
  type: StoryVisualType;
  narrow: boolean;
  reduceFx: boolean;
  scrollFlow?: boolean;
}) {
  const vm = visualMotionProps(narrow, reduceFx);
  const shellClass =
    "min-w-0 w-full max-w-[400px] lg:justify-self-end lg:self-center";
  const shellStyle = { transformOrigin: narrow ? "50% 100%" : "90% 50%" } as const;

  if (scrollFlow) {
    return (
      <div className={shellClass} style={shellStyle}>
        <SceneVisual type={type} scrollFlow />
      </div>
    );
  }

  return (
    <motion.div
      className={shellClass}
      style={shellStyle}
      initial={vm.initial}
      animate={vm.animate}
      transition={vm.transition}
    >
      <SceneVisual type={type} />
    </motion.div>
  );
}

/**
 * Один сюжетный блок (активная story-глава).
 *
 * В one-scene-at-a-time модели рендерится ровно одна StoryScene; наложений и
 * crossfade'ов с соседями быть не может by design.
 *
 * Wrapper делает один короткий mount-time reveal (≈ 0.28 c.) и остаётся
 * полностью чётким. Никаких scroll-driven opacity/blur/x состояний нет —
 * поймать «уходящий» или «полупрозрачный» текст невозможно. При смене
 * activeStoryIndex родитель меняет key и StoryScene демонтируется без exit'а.
 *
 * Внутренние Framer-анимации (CinematicTitle / bullets / SceneVisual)
 * проигрываются короткими enter'ами поверх wrapper-reveal'а — даёт
 * cinematic flourish, завершается за ≤ 0.32 c. полностью.
 */
function StoryScene({
  step,
  index,
  narrow,
  reduceFx,
  scrollFlow = false,
  chapterSegmentHeight,
}: {
  step: StoryStep;
  index: number;
  narrow: boolean;
  reduceFx: boolean;
  /** Вертикальная лента сцен на mobile; без overlay snap. */
  scrollFlow?: boolean;
  /** Один сегмент скролла на главу (hero + каждая story), совпадает с timeline canvas. */
  chapterSegmentHeight?: string;
}) {
  const visualType = step.visualType ?? defaultVisualType(index);
  const isProofCard = visualType === "proofCard";
  const proofItems = step.featurePoints ?? [];

  const mobileTopAlignedScene =
    !scrollFlow &&
    (step.sceneKey === "about" || step.sceneKey === "services");

  const widthShell =
    scrollFlow && isProofCard
      ? "min-w-0 w-[calc(100vw-48px)] lg:w-full lg:max-w-none"
      : scrollFlow
        ? "w-[calc(100vw-48px)] max-w-[1600px] lg:w-full"
        : isProofCard
          ? "min-w-0 w-[calc(100vw-32px)] lg:w-full lg:max-w-none"
          : "w-[calc(100vw-32px)] max-w-[1600px] lg:w-full";

  const copyColScroll = scrollFlow ? " mobile-story-copy-col--luxury-scroll" : "";

  const proofSceneClass = scrollFlow
    ? "about-story-scene about-scene-layout cinematic-story-scene flex min-h-0 w-full min-w-0 flex-col justify-center gap-5 overflow-x-hidden px-0 py-0 lg:h-full lg:max-h-none lg:min-h-0 lg:overflow-visible lg:justify-end lg:pt-0 lg:pb-0"
    : "about-story-scene about-scene-layout cinematic-story-scene flex h-[min(88dvh,100%)] max-h-[88dvh] min-w-0 flex-col justify-end gap-5 overflow-x-hidden px-0 pt-8 pb-1 lg:h-full lg:max-h-none lg:min-h-0 lg:overflow-visible lg:pt-0 lg:pb-0";

  const splitSceneClass = scrollFlow
    ? "cinematic-story-scene mx-auto flex min-h-0 w-full flex-col justify-center gap-4 px-0 py-0 lg:grid lg:h-full lg:max-h-none lg:min-h-0 lg:grid-cols-[minmax(280px,min(560px,52vw))_minmax(240px,1fr)_minmax(260px,400px)] lg:items-center lg:justify-end lg:justify-items-stretch lg:gap-6 lg:pl-[max(10px,1.5vw)] lg:pr-[clamp(16px,3.25vw,52px)] lg:pt-0 lg:pb-0 xl:grid-cols-[minmax(520px,680px)_minmax(360px,1fr)_minmax(320px,480px)]"
    : "cinematic-story-scene mx-auto flex h-[min(88dvh,100%)] max-h-[88dvh] flex-col justify-end gap-4 px-0 pt-8 lg:grid lg:h-full lg:max-h-none lg:min-h-0 lg:grid-cols-[minmax(280px,min(560px,52vw))_minmax(240px,1fr)_minmax(260px,400px)] lg:items-center lg:justify-items-stretch lg:gap-6 lg:pl-[max(10px,1.5vw)] lg:pr-[clamp(16px,3.25vw,52px)] lg:pt-0 lg:pb-0 xl:grid-cols-[minmax(520px,680px)_minmax(360px,1fr)_minmax(320px,480px)]";

  const inner = (
    <div className={widthShell}>
        {isProofCard ? (
          <div data-scene-key={step.sceneKey} className={proofSceneClass}>
            <div
              className={`story-scene-copy-col relative min-h-0 min-w-0 lg:self-center lg:justify-self-start${copyColScroll}`}
            >
              <SceneCopy
                step={step}
                index={index}
                narrow={narrow}
                reduceFx={reduceFx}
                scrollFlow={scrollFlow}
                ctaPointerEvents="auto"
                proofListLayout
              />
            </div>
            <div
              className={`about-proof-column relative min-h-0 min-w-0 shrink-0 lg:justify-self-end lg:self-center${scrollFlow ? " mobile-story-proof-col--luxury" : ""}`}
            >
              {proofItems.length > 0 ? (
                <ProofListColumn
                  items={proofItems}
                  storyIndex={index}
                  reduceFx={reduceFx}
                  scrollFlow={scrollFlow}
                  cardHeader={
                    step.proofCardHeader ?? DEFAULT_PROOF_CARD_HEADER
                  }
                />
              ) : null}
            </div>
          </div>
        ) : (
          <div data-scene-key={step.sceneKey} className={splitSceneClass}>
            <div
              className={`story-scene-copy-col relative min-h-0 min-w-0 lg:justify-self-start lg:self-center${copyColScroll}`}
            >
              <SceneCopy
                step={step}
                index={index}
                narrow={narrow}
                reduceFx={reduceFx}
                scrollFlow={scrollFlow}
                ctaPointerEvents="auto"
              />
            </div>

            <div
              className="hidden min-h-0 min-w-[280px] lg:block"
              aria-hidden
            />

            <div className="relative min-h-0 min-w-0 shrink-0 pt-2 lg:shrink lg:pt-0">
              <SceneVisualFrame
                type={visualType}
                narrow={narrow}
                reduceFx={reduceFx}
                scrollFlow={scrollFlow}
              />
            </div>
          </div>
        )}
    </div>
  );

  if (scrollFlow) {
    return (
      <section
        className={[
          "mobile-story-step mobile-text-step",
          mobileTopAlignedScene ? "mobile-story-step--top-weighted" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-scene-key={step.sceneKey}
        style={
          chapterSegmentHeight
            ? { minHeight: chapterSegmentHeight }
            : undefined
        }
        aria-label={accessibilityStoryLabel(step)}
      >
        <div className="mobile-story-step__shell w-full">{inner}</div>
      </section>
    );
  }

  return (
    <motion.div
      data-scene-key={step.sceneKey}
      className={[
        "story-scene-slot pointer-events-none absolute inset-0 flex items-end justify-center pb-[max(12px,env(safe-area-inset-bottom,0px))] lg:items-center lg:pb-0",
        mobileTopAlignedScene ? "mobile-scene-align-top" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        zIndex: SCENE_Z,
        willChange: "opacity, transform, filter",
      }}
      initial={reduceFx ? SCENE_REVEAL_VISIBLE : SCENE_REVEAL_INITIAL}
      animate={SCENE_REVEAL_VISIBLE}
      transition={reduceFx ? SCENE_REVEAL_TRANSITION_REDUCED : SCENE_REVEAL_TRANSITION}
    >
      {inner}
    </motion.div>
  );
}

function accessibilityStoryLabel(step: StoryStep): string {
  return step.title.replace(/\r?\n/g, " ").trim() || step.eyebrow;
}

type SplitCinematicStoryProps = {
  /**
   * Индекс активной story-сцены (0..STORY_STEPS.length − 1).
   * Значение < 0 (Hero активен) или вне диапазона — ничего не рендерится.
   */
  activeStoryIndex: number;
};

export type MobileCinematicStoryScrollFlowProps = {
  heroData: SiteHero;
  onGoPortfolio: () => void;
  onOpenRequestForm: () => void;
};

/**
 * Mobile: первый экран — Hero, далее STORY_STEPS; весь блок скроллится поверх fixed-фона.
 */
/** Мобильная вертикальная лента: без отложенного motion-reveal (стабильно при fast scroll). */
const MOBILE_SCROLL_FLOW_REDUCE_MOTION = true as const;

export function MobileCinematicStoryScrollFlow({
  heroData,
  onGoPortfolio,
  onOpenRequestForm,
}: MobileCinematicStoryScrollFlowProps) {
  return (
    <div className="mobile-cinematic-flow pointer-events-auto w-full">
      <section
        className="mobile-cinematic-step mobile-hero-step mobile-text-step mobile-story-step"
        aria-label="Главный экран"
      >
        <div className="mobile-cinematic-step__shell flex min-h-0 w-full min-w-0 flex-1 flex-col">
          <HeroContent
            variant="mobile"
            data={heroData}
            onGoPortfolio={onGoPortfolio}
            onOpenRequestForm={onOpenRequestForm}
            scrollFlowLayout
            instantMotion
          />
        </div>
      </section>
      {STORY_STEPS.map((step, index) => (
        <StoryScene
          key={step.sceneKey}
          step={step}
          index={index}
          narrow
          reduceFx={MOBILE_SCROLL_FLOW_REDUCE_MOTION}
          scrollFlow
        />
      ))}
    </div>
  );
}

/**
 * SplitCinematicStory — ONE-SCENE-AT-A-TIME контроллер story-сцен.
 *
 * Рендерит ровно один STORY_STEPS[activeStoryIndex] (или ничего, если активен
 * Hero / индекс некорректен). Не мапит остальные сцены. Состояния, в котором
 * два story-текста одновременно видимы, не существует by design.
 *
 * При смене activeStoryIndex компонент сцены полностью демонтируется и новый
 * монтируется. Никакого scroll-driven blur/opacity, никакого exit-фейда —
 * новая сцена сразу появляется в финальном чётком виде через короткий
 * mount-time reveal (≈ 0.28 c., time-based). Через `key={activeStoryIndex}`
 * внутренние Framer-Motion enter-анимации (CinematicTitle, bullets,
 * SceneVisualFrame) корректно перезапускаются на каждой новой сцене.
 */
export function SplitCinematicStory({
  activeStoryIndex,
}: SplitCinematicStoryProps) {
  const narrow = useMediaQuery("(max-width: 1023px)");
  const mqReduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const fmReduce = useReducedMotion();
  const reduceFx = Boolean(mqReduce || fmReduce);

  if (activeStoryIndex < 0 || activeStoryIndex >= STORY_STEPS.length) {
    return null;
  }

  const step = STORY_STEPS[activeStoryIndex];
  if (!step) return null;

  return (
    <StoryScene
      key={activeStoryIndex}
      step={step}
      index={activeStoryIndex}
      narrow={narrow}
      reduceFx={reduceFx}
    />
  );
}
