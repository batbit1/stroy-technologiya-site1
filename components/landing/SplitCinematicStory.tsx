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

const MOBILE_GLASS_SCENE_KEYS = new Set([
  "about",
  "services",
  "guarantees",
  "process",
  "engineering",
  "documents",
]);

function isMobileGlassScene(
  scrollFlow: boolean | undefined,
  sceneKey: string | undefined,
): boolean {
  return Boolean(scrollFlow && sceneKey && MOBILE_GLASS_SCENE_KEYS.has(sceneKey));
}

const PROOF_TRUST_ICON_IDS = [
  "region",
  "bank",
  "license",
  "clipboard",
  "building",
  "quality",
] as const;

type ProofTrustIconId = (typeof PROOF_TRUST_ICON_IDS)[number];

function ProofTrustIcon({ id }: { id: ProofTrustIconId }) {
  const stroke = "currentColor";
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "region":
      return (
        <svg {...common}>
          <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
          <circle cx="12" cy="11" r="2.25" />
        </svg>
      );
    case "bank":
      return (
        <svg {...common}>
          <path d="M4 10V8l8-4 8 4v2" />
          <path d="M6 10v8h12v-8" />
          <path d="M10 14h4M10 18h4" />
        </svg>
      );
    case "license":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.2 3.4 7.4 8 9 4.6-1.6 8-4.8 8-9V6l-8-3Z" />
          <path d="m9.5 11.5 2 2 3.5-3.5" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <rect x="6" y="4" width="12" height="16" rx="1.5" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M5 20V9l7-5 7 5v11" />
          <path d="M9 20v-6h6v6" />
          <path d="M10 12h1M13 12h1M10 15h1M13 15h1" />
        </svg>
      );
    case "quality":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 12 2.25 2.25L15.5 9.5" />
        </svg>
      );
    default:
      return null;
  }
}

function proofTrustIconId(index: number): ProofTrustIconId {
  return PROOF_TRUST_ICON_IDS[index] ?? PROOF_TRUST_ICON_IDS[0];
}

const SERVICE_PROOF_ICON_IDS = [
  "house",
  "commercial",
  "industrial",
  "brick",
  "reconstruction",
] as const;

type ServiceProofIconId = (typeof SERVICE_PROOF_ICON_IDS)[number];

function ServiceProofIcon({ id }: { id: ServiceProofIconId }) {
  const stroke = "currentColor";
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "house":
      return (
        <svg {...common}>
          <path d="M4 11 12 4l8 7" />
          <path d="M6 11v9h12v-9" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "commercial":
      return (
        <svg {...common}>
          <path d="M5 20V7l7-4 7 4v13" />
          <path d="M9 20v-4h2v4M13 20v-6h2v6M9 10h1M13 10h1M9 14h1M13 14h1" />
        </svg>
      );
    case "industrial":
      return (
        <svg {...common}>
          <path d="M4 20V10l4-2v12M12 20V6l4-2v16" />
          <path d="M8 20h12" />
          <path d="M16 8V4h3v4" />
          <path d="M17 4v-2" />
        </svg>
      );
    case "brick":
      return (
        <svg {...common}>
          <rect x="5" y="6" width="14" height="12" rx="1" />
          <path d="M5 10h14M5 14h14M12 6v12M5 10H12M12 10h7M5 14H12M12 14h7" />
        </svg>
      );
    case "reconstruction":
      return (
        <svg {...common}>
          <path d="M5 12 12 6l7 6" />
          <path d="M7 12v8h10v-8" />
          <circle cx="17" cy="17" r="3.5" />
          <path d="M17 15.2v3.6M15.2 17h3.6" />
        </svg>
      );
    default:
      return null;
  }
}

function serviceProofIconId(index: number): ServiceProofIconId {
  return SERVICE_PROOF_ICON_IDS[index] ?? SERVICE_PROOF_ICON_IDS[0];
}

const GUARANTEE_QUALITY_ICON_IDS = [
  "shield",
  "clipboard",
  "wallet",
  "certificate",
  "magnifier",
  "folder",
] as const;

type GuaranteeQualityIconId = (typeof GUARANTEE_QUALITY_ICON_IDS)[number];

function GuaranteeQualityIcon({ id }: { id: GuaranteeQualityIconId }) {
  const stroke = "currentColor";
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.2 3.4 7.4 8 9 4.6-1.6 8-4.8 8-9V6l-8-3Z" />
        </svg>
      );
    case "clipboard":
      return (
        <svg {...common}>
          <rect x="6" y="4" width="12" height="16" rx="1.5" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "wallet":
      return (
        <svg {...common}>
          <rect x="4" y="7" width="16" height="12" rx="2" />
          <path d="M4 11h16M16 14h2" />
        </svg>
      );
    case "certificate":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="m8.5 12 2.25 2.25L15.5 9.5" />
        </svg>
      );
    case "magnifier":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      );
    case "folder":
      return (
        <svg {...common}>
          <path d="M4 8a2 2 0 0 1 2-2h3l2 2h7a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
        </svg>
      );
    default:
      return null;
  }
}

function guaranteeQualityIconId(index: number): GuaranteeQualityIconId {
  return GUARANTEE_QUALITY_ICON_IDS[index] ?? GUARANTEE_QUALITY_ICON_IDS[0];
}

const PROCESS_STEP_ICON_IDS = [
  "chat",
  "search",
  "calculator",
  "document",
  "shield",
  "wrench",
] as const;

type ProcessStepIconId = (typeof PROCESS_STEP_ICON_IDS)[number];

function ProcessStepIcon({ id }: { id: ProcessStepIconId }) {
  const stroke = "currentColor";
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "chat":
      return (
        <svg {...common}>
          <path d="M6 9.5a6 6 0 0 1 12 0v5a6 6 0 0 1-6 6h-1.4L9 21v-2H6a6 6 0 0 1-6-6v-5.5Z" />
          <path d="M9 12h6M9 15h3.5" />
        </svg>
      );
    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16.5 16.5 4 4" />
        </svg>
      );
    case "calculator":
      return (
        <svg {...common}>
          <rect x="6" y="4" width="12" height="16" rx="1.5" />
          <path d="M9 8h6M9 11.5h2M13 11.5h2M9 15h2M13 15h2" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M8 4h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M14 4v4h4M10 12h6M10 16h4" />
        </svg>
      );
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.2 3.4 7.4 8 9 4.6-1.6 8-4.8 8-9V6l-8-3Z" />
          <path d="m9.5 12 2.25 2.25L15.5 9.5" />
        </svg>
      );
    case "wrench":
      return (
        <svg {...common}>
          <path d="M14.5 6.5a4.5 4.5 0 0 0-6.2 6.2L4 17l3 3 4.3-4.3a4.5 4.5 0 0 0 6.2-6.2l-2.2 2.2-1.4-1.4 2.2-2.2Z" />
        </svg>
      );
    default:
      return null;
  }
}

function processStepIconId(index: number): ProcessStepIconId {
  return PROCESS_STEP_ICON_IDS[index] ?? PROCESS_STEP_ICON_IDS[0];
}

const ENGINEERING_WORK_ICON_IDS = [
  "networks",
  "electricity",
  "water",
  "heating",
  "finishing",
  "handover",
] as const;

type EngineeringWorkIconId = (typeof ENGINEERING_WORK_ICON_IDS)[number];

function EngineeringWorkIcon({ id }: { id: EngineeringWorkIconId }) {
  const stroke = "currentColor";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "networks":
      return (
        <svg {...common}>
          <path d="M5 8h14M5 12h14M5 16h10" />
          <circle cx="18" cy="8" r="1.25" />
          <circle cx="18" cy="12" r="1.25" />
          <circle cx="15" cy="16" r="1.25" />
        </svg>
      );
    case "electricity":
      return (
        <svg {...common}>
          <path d="M13 3 8 13h5l-1 8 7-12h-5l-1-6Z" />
        </svg>
      );
    case "water":
      return (
        <svg {...common}>
          <path d="M12 3c3 4.5 6 7.2 6 10.5a6 6 0 1 1-12 0C6 10.2 9 7.5 12 3Z" />
        </svg>
      );
    case "heating":
      return (
        <svg {...common}>
          <rect x="5" y="6" width="14" height="12" rx="1.5" />
          <path d="M8 10v4M12 10v4M16 10v4M8 18h8" />
        </svg>
      );
    case "finishing":
      return (
        <svg {...common}>
          <path d="M5 18 12 6l7 12" />
          <path d="M8 14h8" />
        </svg>
      );
    case "handover":
      return (
        <svg {...common}>
          <path d="M4 11 12 4l8 7" />
          <path d="M6 11v9h12v-9" />
          <path d="m10 17 2 2 4-4" />
        </svg>
      );
    default:
      return null;
  }
}

function engineeringWorkIconId(index: number): EngineeringWorkIconId {
  return ENGINEERING_WORK_ICON_IDS[index] ?? ENGINEERING_WORK_ICON_IDS[0];
}

const DOCUMENT_PROOF_ICON_IDS = [
  "shield",
  "bank",
  "certificate",
  "document",
] as const;

type DocumentProofIconId = (typeof DOCUMENT_PROOF_ICON_IDS)[number];

function DocumentProofIcon({ id }: { id: DocumentProofIconId }) {
  const stroke = "currentColor";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.2 3.4 7.4 8 9 4.6-1.6 8-4.8 8-9V6l-8-3Z" />
          <path d="m9.5 12 2.25 2.25L15.5 9.5" />
        </svg>
      );
    case "bank":
      return (
        <svg {...common}>
          <path d="M4 10V8l8-4 8 4v2" />
          <path d="M6 10v8h12v-8" />
          <path d="M10 14h4M10 18h4" />
        </svg>
      );
    case "certificate":
      return (
        <svg {...common}>
          <circle cx="12" cy="13" r="7" />
          <path d="M12 10v3l2 1.5" />
          <path d="M9 5h6l1 2H8l1-2Z" />
        </svg>
      );
    case "document":
      return (
        <svg {...common}>
          <path d="M8 4h6l4 4v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z" />
          <path d="M14 4v4h4M10 12h6M10 16h4" />
        </svg>
      );
    default:
      return null;
  }
}

function documentProofIconId(index: number): DocumentProofIconId {
  return DOCUMENT_PROOF_ICON_IDS[index] ?? DOCUMENT_PROOF_ICON_IDS[0];
}

const GUARANTEE_STAT_ICON_IDS = ["shield", "buildings", "license"] as const;

type GuaranteeStatIconId = (typeof GUARANTEE_STAT_ICON_IDS)[number];

function GuaranteeStatIcon({ id }: { id: GuaranteeStatIconId }) {
  const stroke = "currentColor";
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke,
    strokeWidth: 1.35,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (id) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.2 3.4 7.4 8 9 4.6-1.6 8-4.8 8-9V6l-8-3Z" />
        </svg>
      );
    case "buildings":
      return (
        <svg {...common}>
          <path d="M5 20V7l7-4 7 4v13" />
          <path d="M9 20v-4h2v4M13 20v-6h2v6" />
        </svg>
      );
    case "license":
      return (
        <svg {...common}>
          <rect x="5" y="4" width="14" height="16" rx="1.5" />
          <path d="M8 9h8M8 13h5" />
          <path d="M9 17h6" />
        </svg>
      );
    default:
      return null;
  }
}

function guaranteeStatIconId(index: number): GuaranteeStatIconId {
  return GUARANTEE_STAT_ICON_IDS[index] ?? GUARANTEE_STAT_ICON_IDS[0];
}

function ProofListColumn({
  items,
  storyIndex,
  reduceFx,
  scrollFlow = false,
  cardHeader = DEFAULT_PROOF_CARD_HEADER,
  sceneKey,
}: {
  items: StoryFeaturePoint[];
  storyIndex: number;
  reduceFx: boolean;
  scrollFlow?: boolean;
  cardHeader?: string;
  sceneKey?: string;
}) {
  const CARD_ENTER_S = 0.64;
  const itemBaseDelay = reduceFx ? 0.06 : 0.22;
  const itemStagger = reduceFx ? 0.02 : 0.04;
  const isMobileGlassList = isMobileGlassScene(scrollFlow, sceneKey);
  const isServicesGlassList = scrollFlow && sceneKey === "services";
  const isGuaranteesGlassList = scrollFlow && sceneKey === "guarantees";
  const isProcessGlassList = scrollFlow && sceneKey === "process";
  const isEngineeringGlassList = scrollFlow && sceneKey === "engineering";
  const isDocumentsGlassList = scrollFlow && sceneKey === "documents";
  const proofCardClass = [
    "about-proof-card",
    isMobileGlassList ? "m-story-glass-card m-story-glass-card--trust" : "",
    isServicesGlassList ? "m-story-glass-card--services-list" : "",
    isGuaranteesGlassList ? "m-story-glass-card--guarantees-list" : "",
    isProcessGlassList ? "m-story-glass-card--process-list" : "",
    isEngineeringGlassList ? "m-story-glass-card--engineering-list" : "",
    isDocumentsGlassList ? "m-story-glass-card--documents-list" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className="relative flex min-w-0 w-full max-w-full select-none flex-col justify-start max-lg:pointer-events-auto lg:pointer-events-none lg:flex-row lg:justify-end"
      aria-label="Преимущества и надёжность"
    >
      <div className="about-proof-card-outer">
        {scrollFlow ? (
          <div className={proofCardClass}>
            <div
              className={[
                "about-proof-card-header",
                isServicesGlassList ||
                isGuaranteesGlassList ||
                isProcessGlassList ||
                isEngineeringGlassList ||
                isDocumentsGlassList
                  ? "about-proof-card-header--services-list"
                  : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {isServicesGlassList ||
              isGuaranteesGlassList ||
              isProcessGlassList ||
              isEngineeringGlassList ||
              isDocumentsGlassList ? (
                <span
                  aria-hidden
                  className="about-proof-card-header__line"
                />
              ) : null}
              {cardHeader}
            </div>
            <ul className="about-proof-list">
              {items.map((fp, i) => (
                <li
                  key={`${storyIndex}-proof-${i}-${fp.title}`}
                  className={[
                    "about-proof-item",
                    isMobileGlassList ? "m-story-trust-row" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isMobileGlassList && sceneKey === "about" ? (
                    <span className="m-story-trust-row__icon" aria-hidden>
                      <ProofTrustIcon id={proofTrustIconId(i)} />
                    </span>
                  ) : null}
                  {isMobileGlassList && sceneKey === "services" ? (
                    <span className="m-story-trust-row__icon" aria-hidden>
                      <ServiceProofIcon id={serviceProofIconId(i)} />
                    </span>
                  ) : null}
                  {isMobileGlassList && sceneKey === "guarantees" ? (
                    <span className="m-story-trust-row__icon" aria-hidden>
                      <GuaranteeQualityIcon id={guaranteeQualityIconId(i)} />
                    </span>
                  ) : null}
                  {isMobileGlassList && sceneKey === "process" ? (
                    <span className="m-story-trust-row__icon" aria-hidden>
                      <ProcessStepIcon id={processStepIconId(i)} />
                    </span>
                  ) : null}
                  {isMobileGlassList && sceneKey === "engineering" ? (
                    <span className="m-story-trust-row__icon" aria-hidden>
                      <EngineeringWorkIcon id={engineeringWorkIconId(i)} />
                    </span>
                  ) : null}
                  {isMobileGlassList && sceneKey === "documents" ? (
                    <span className="m-story-trust-row__icon" aria-hidden>
                      <DocumentProofIcon id={documentProofIconId(i)} />
                    </span>
                  ) : null}
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

  const isMobileGlassIntro = isMobileGlassScene(scrollFlow, step.sceneKey);
  const isGuaranteesGlassIntro =
    scrollFlow && step.sceneKey === "guarantees";
  const isProcessGlassIntro = scrollFlow && step.sceneKey === "process";
  const isEngineeringGlassIntro =
    scrollFlow && step.sceneKey === "engineering";
  const isDocumentsGlassIntro = scrollFlow && step.sceneKey === "documents";

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
    (scrollFlow ? " mobile-story-editorial-card mobile-story-copy--luxury-scroll" : "") +
    (isMobileGlassIntro ? " m-story-glass-card" : "") +
    (isMobileGlassIntro &&
    !isProcessGlassIntro &&
    !isGuaranteesGlassIntro &&
    !isEngineeringGlassIntro &&
    !isDocumentsGlassIntro
      ? " m-story-glass-card--about"
      : "") +
    (isProcessGlassIntro ? " m-story-glass-card--process-intro" : "") +
    (isEngineeringGlassIntro
      ? " m-story-glass-card--engineering-intro m-card m-card--dark"
      : "") +
    (isDocumentsGlassIntro
      ? " m-story-glass-card--documents-intro m-card m-card--dark"
      : "") +
    (isGuaranteesGlassIntro ? " m-story-glass-card--guarantees-intro" : "");

  const eyebrowDecorLine =
    "inline-block h-px w-10 shrink-0 bg-[rgba(230,205,160,0.32)] max-lg:bg-[rgba(230,205,160,0.32)]";

  const eyebrowRowClass = proofListLayout
    ? [
        "about-copy-eyebrow-row scene-copy-eyebrow-row mb-[clamp(24px,3.5vmin,34px)] flex w-full max-w-full items-center gap-3 lg:max-w-none",
        scrollFlow && !isMobileGlassIntro
          ? "flex-col items-center justify-center gap-2 text-center"
          : "",
        isMobileGlassIntro
          ? "max-lg:mb-[clamp(18px,4.2vw,22px)] max-lg:justify-center max-lg:gap-3"
          : "",
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
        {!isMobileGlassIntro ? (
          <div className="split-copy-rule mb-2.5 lg:mb-3" aria-hidden />
        ) : null}
        <div className={eyebrowRowClass}>
          {isMobileGlassIntro ? (
            <>
              <span aria-hidden className={eyebrowDecorLine} />
              <div className="flex min-w-0 shrink-0 justify-center px-1">
                <CinematicEyebrow
                  text={step.eyebrow}
                  narrow={narrow}
                  reduceFx={softFx}
                  className="m-section-label font-sans text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.2em]"
                />
              </div>
              <span aria-hidden className={eyebrowDecorLine} />
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
        <div
          className={
            narrow
              ? "premium-engraved-title-wrap mb-[clamp(28px,3.6vmin,36px)] min-h-0 w-full"
              : `premium-engraved-title-wrap mb-[clamp(28px,3.6vmin,36px)] min-h-0 w-full${proofListLayout ? " about-copy-title-wrap" : ""}`
          }
        >
          {isGuaranteesGlassIntro ? (
            <h2 className="premium-engraved-title cinematic-text-render text-balance font-display m-guarantees-editorial-title">
              <span className="m-guarantees-editorial-title__lead">
                Гарантии и{" "}
              </span>
              <span className="m-guarantees-editorial-title__accent">
                контроль качества
              </span>
            </h2>
          ) : isEngineeringGlassIntro ? (
            <h2 className="premium-engraved-title cinematic-text-render text-balance font-display m-section-title m-engineering-editorial-title">
              {step.title}
            </h2>
          ) : isDocumentsGlassIntro ? (
            <h2 className="premium-engraved-title cinematic-text-render text-balance font-display m-section-title m-documents-editorial-title">
              {step.title}
            </h2>
          ) : (
            <CinematicTitle
              text={step.title}
              narrow={narrow}
              reduceFx={softFx}
              delay={narrow ? 0.1 : 0.14}
              className="premium-engraved-title cinematic-text-render text-balance font-display"
            />
          )}
        </div>
        <p
          className={[
            "scene-copy-description pointer-events-none m-0 w-full max-w-[min(560px,100%)]",
            scrollFlow ? "text-center" : "text-left",
            proofMainSceneCopyDescriptionMb,
            isEngineeringGlassIntro || isDocumentsGlassIntro ? "m-section-copy" : "",
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
              isProcessGlassIntro ? "m-process-body-secondary" : "",
              isEngineeringGlassIntro
                ? "m-section-copy m-engineering-body-secondary"
                : "",
              isDocumentsGlassIntro
                ? "m-section-copy m-documents-body-secondary"
                : "",
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
                isGuaranteesGlassIntro ? "m-guarantee-cta" : "",
                isProcessGlassIntro ? "m-process-cta" : "",
                isEngineeringGlassIntro
                  ? "m-engineering-cta m-btn-primary"
                  : "",
                isDocumentsGlassIntro ? "m-documents-cta m-btn-primary" : "",
              ]
                .filter(Boolean)
                .join(" ")}
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
              isGuaranteesGlassIntro ? "m-guarantee-stats" : "",
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
                  isGuaranteesGlassIntro ? "m-guarantee-stat-card" : "",
                  si > 0 && !isGuaranteesGlassIntro
                    ? "border-t border-[rgba(34,30,26,0.1)] pt-4 sm:border-l sm:border-t-0 sm:pl-[clamp(14px,2.2vw,22px)] sm:pt-0 lg:ml-0 lg:pl-[clamp(18px,2.8vw,28px)]"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {isGuaranteesGlassIntro ? (
                  <span className="m-guarantee-stat-card__icon" aria-hidden>
                    <GuaranteeStatIcon id={guaranteeStatIconId(si)} />
                  </span>
                ) : null}
                <div className="m-guarantee-stat-card__text">
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
                  sceneKey={step.sceneKey}
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
        className="mobile-cinematic-step mobile-hero-step mobile-hero-step--dark mobile-text-step mobile-story-step"
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
