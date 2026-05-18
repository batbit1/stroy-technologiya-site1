"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { SiteHero } from "@/data/siteContent";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CINEMATIC_TEXT_ENTER_S } from "@/lib/cinematic-scroll-story";
import { CinematicTitle, EASE_PREMIUM } from "./CinematicTitle";

/** Фиксированная подпись hero: обычный текст без SplitType (иначе пропадают пробелы). */
const HERO_COVER_EYEBROW = "ОРЕНБУРГ И ОБЛАСТЬ";

const HERO_HEADLINE_LINES = ["Строим дома", "и объекты", "под ключ"] as const;

export type HeroContentProps = {
  variant: "mobile" | "desktop";
  data: SiteHero;
  onGoPortfolio: () => void;
  onOpenRequestForm: () => void;
  /**
   * Только mobile: hero как первый блок вертикальной ленты (не sticky overlay).
   * Desktop-вариант и вёрстка lg+ не затрагиваются.
   */
  scrollFlowLayout?: boolean;
};

/** Слева: локальный cinematic mist под колонкой текста; справа дом остаётся читаемым. */
const HERO_SCRIM_LG = `
  radial-gradient(
    circle at 18% 42%,
    rgba(248, 244, 238, 0.94) 0%,
    rgba(248, 244, 238, 0.82) 28%,
    rgba(248, 244, 238, 0.58) 48%,
    rgba(248, 244, 238, 0.18) 72%,
    rgba(248, 244, 238, 0) 100%
  ),
  linear-gradient(
    to top,
    rgba(38, 34, 29, 0.04) 0%,
    transparent 42%
  )
`;

/** Mobile: тот же принцип — сильнее под строкой заголовка, растворение вправо. */
const HERO_SCRIM_MO = `
  radial-gradient(
    circle at 14% 38%,
    rgba(248, 244, 238, 0.9) 0%,
    rgba(248, 244, 238, 0.72) 26%,
    rgba(248, 244, 238, 0.46) 46%,
    rgba(248, 244, 238, 0.14) 68%,
    rgba(248, 244, 238, 0) 100%
  ),
  linear-gradient(
    to top,
    rgba(38, 34, 29, 0.035) 0%,
    transparent 38%
  )
`;

/**
 * Mount-time reveal оверлей-сцены: один короткий cинематичный кадр
 * (opacity 0 → 1, y 14 → 0, blur 6 → 0) за ≈ 0.28 c.
 *
 * Не зависит от scroll progress. Срабатывает только при mount-е компонента
 * (т.е. при смене activeChapterIndex). exit'а нет — если пользователь
 * уходит к следующей главе, родитель просто демонтирует Hero.
 *
 * При остановке скролла reveal завершается по таймеру и оставляет текст
 * полностью чётким — поймать blur/полупрозрачное состояние невозможно.
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

/** Eyebrow без SplitType — сохраняет пробелы и « / ». */
function HeroCoverEyebrow({
  narrow,
  reduceFx,
  delay,
  className,
}: {
  narrow: boolean;
  reduceFx: boolean;
  delay: number;
  className: string;
}) {
  const enter = reduceFx
    ? { opacity: 1, y: 0, filter: "blur(0px)" }
    : narrow
      ? { opacity: 0, y: 10, filter: "blur(6px)" }
      : { opacity: 0, y: 10, filter: "blur(6px)" };
  const alive = { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <motion.p
      initial={enter}
      animate={alive}
      transition={{
        duration: reduceFx ? 0.12 : CINEMATIC_TEXT_ENTER_S,
        ease: EASE_PREMIUM,
        delay: reduceFx ? 0 : delay,
      }}
      className={`cinematic-text-render pointer-events-none m-0 max-w-[620px] ${className}`}
    >
      {HERO_COVER_EYEBROW}
    </motion.p>
  );
}

function HeroPremiumButton({
  onClick,
  children,
  fullWidthMobile,
}: {
  onClick: () => void;
  children: ReactNode;
  fullWidthMobile?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "premium-cta-button premium-cta-button--primary group/hp relative inline-flex h-[58px] cursor-pointer items-center justify-center border-0 px-[34px]",
        "font-sans text-[13px] font-semibold uppercase tracking-[0.14em]",
        "outline-none ring-offset-2 ring-offset-[var(--paper-soft)] focus-visible:ring-2 focus-visible:ring-[rgba(41,37,32,0.14)]",
        fullWidthMobile ? "w-full sm:w-auto" : "",
      ].join(" ")}
    >
      <span className="premium-cta-button__label">{children}</span>
    </button>
  );
}

function HeroSecondaryLink({
  onClick,
  children,
  centeredMobile,
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  centeredMobile?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "premium-cta-button premium-cta-button--secondary hero-button-secondary group/hs relative inline-flex h-[50px] cursor-pointer items-center justify-center border-0",
        "px-[22px] font-sans text-[12px] font-medium tracking-[0.08em] max-sm:tracking-[0.06em]",
        "outline-none active:opacity-92",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(41,37,32,0.08)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--paper-soft)]",
        centeredMobile ? "w-full max-sm:mx-auto max-sm:flex max-sm:justify-center" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="premium-cta-button__label relative text-center sm:text-left">
        {children}
      </span>
    </button>
  );
}

function HeroDesktop({
  data,
  reduceFx,
  onGoPortfolio,
  onOpenRequestForm,
}: {
  data: SiteHero;
  reduceFx: boolean;
  onGoPortfolio: () => void;
  onOpenRequestForm: () => void;
}) {
  const titleText = [...HERO_HEADLINE_LINES].join("\n");

  const enterSub = reduceFx
    ? { opacity: 1, y: 0, filter: "blur(0px)" }
    : { opacity: 0, y: 10, filter: "blur(6px)" };
  const aliveSub = { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[22] hidden min-h-0 flex-col lg:flex"
      initial={reduceFx ? SCENE_REVEAL_VISIBLE : SCENE_REVEAL_INITIAL}
      animate={SCENE_REVEAL_VISIBLE}
      transition={reduceFx ? SCENE_REVEAL_TRANSITION_REDUCED : SCENE_REVEAL_TRANSITION}
      style={{ willChange: "opacity, transform, filter" }}
    >
      <div
        aria-hidden
        className="absolute inset-0"
        style={{ background: HERO_SCRIM_LG }}
      />

      <div className="absolute inset-0 flex min-h-0 items-start justify-start">
        <div className="relative w-full pl-[clamp(40px,6vw,120px)] pr-[clamp(20px,3vw,48px)] pt-[max(7.25rem,min(22svh,calc(env(safe-area-inset-top,0px)+19.5svh)))]">
          <div className="hero-copy">
            <div className="hero-readability-glow" aria-hidden />
            <div className="hero-copy-eyebrow">
              <HeroCoverEyebrow
                narrow={false}
                reduceFx={reduceFx}
                delay={0}
                className="font-sans text-[0.72rem] font-bold uppercase leading-snug tracking-[0.24em] text-[rgba(23,23,23,0.46)]"
              />
            </div>

            <CinematicTitle
              as="h1"
              text={titleText}
              narrow={false}
              reduceFx={reduceFx}
              active
              delay={0.04}
              className="premium-engraved-title hero-cinematic-title hero-title-measure cinematic-text-render font-display"
            />

            <motion.p
              initial={enterSub}
              animate={aliveSub}
              transition={{
                duration: reduceFx ? 0.12 : CINEMATIC_TEXT_ENTER_S,
                ease: EASE_PREMIUM,
                delay: reduceFx ? 0 : 0.08,
              }}
              className="hero-body-lede font-sans"
            >
              {data.subheadline}
            </motion.p>

            <motion.div
              initial={enterSub}
              animate={aliveSub}
              transition={{
                duration: reduceFx ? 0.12 : CINEMATIC_TEXT_ENTER_S,
                ease: EASE_PREMIUM,
                delay: reduceFx ? 0 : 0.14,
              }}
              className="hero-buttons"
              style={{ pointerEvents: "auto" }}
            >
              <HeroPremiumButton onClick={onOpenRequestForm}>
                {data.ctaPrimary}
              </HeroPremiumButton>
              <HeroSecondaryLink onClick={onGoPortfolio}>
                {data.ctaSecondary}
              </HeroSecondaryLink>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroMobile({
  data,
  reduceFx,
  onGoPortfolio,
  onOpenRequestForm,
  scrollFlowLayout = false,
}: {
  data: SiteHero;
  reduceFx: boolean;
  onGoPortfolio: () => void;
  onOpenRequestForm: () => void;
  scrollFlowLayout?: boolean;
}) {
  const titleText = [...HERO_HEADLINE_LINES].join("\n");

  const soft = reduceFx || scrollFlowLayout;

  const enterSub = soft
    ? { opacity: 1, y: 0, filter: "blur(0px)" }
    : { opacity: 0, y: 10, filter: "blur(6px)" };
  const aliveSub = { opacity: 1, y: 0, filter: "blur(0px)" };

  const scrim = scrollFlowLayout ? null : (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ background: HERO_SCRIM_MO }}
    />
  );

  const columnClass = scrollFlowLayout
    ? "relative z-[22] mx-auto flex w-full max-w-[calc(100vw-48px)] translate-x-[8px] flex-col items-center px-[22px] text-center pt-0"
    : "relative mx-auto flex w-full max-w-[calc(100vw-32px)] flex-col px-1 xs:max-w-[min(22.5rem,calc(100vw-36px))] xs:px-2";

  const columnStyle = scrollFlowLayout
    ? undefined
    : {
        paddingTop:
          "calc(5.625rem + env(safe-area-inset-top, 0px) + max(14px, 3.75svh))",
      };

  const body = (
    <div
      className={[
        "hero-copy",
        scrollFlowLayout ? "hero-copy--mobile-luxury-scroll mobile-luxury-mist-host" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="hero-readability-glow" aria-hidden />
      <div className="hero-copy-eyebrow">
        <HeroCoverEyebrow
          narrow
          reduceFx={soft}
          delay={0}
          className="font-sans text-[0.72rem] font-bold uppercase leading-snug tracking-[0.24em] text-[rgba(23,23,23,0.46)]"
        />
      </div>

      <CinematicTitle
        as="h1"
        text={titleText}
        narrow
        reduceFx={soft}
        active
        delay={0.04}
        className="premium-engraved-title hero-cinematic-title hero-title-measure cinematic-text-render font-display"
      />

      <motion.p
        initial={enterSub}
        animate={aliveSub}
        transition={{
          duration: scrollFlowLayout ? 0 : soft ? 0.12 : CINEMATIC_TEXT_ENTER_S,
          ease: EASE_PREMIUM,
          delay: scrollFlowLayout || soft ? 0 : 0.08,
        }}
        className="hero-body-lede font-sans"
      >
        {data.subheadline}
      </motion.p>

      <motion.div
        initial={enterSub}
        animate={aliveSub}
        transition={{
          duration: scrollFlowLayout ? 0 : soft ? 0.12 : CINEMATIC_TEXT_ENTER_S,
          ease: EASE_PREMIUM,
          delay: scrollFlowLayout || soft ? 0 : 0.14,
        }}
        className="hero-buttons hero-buttons--mobile"
        style={{ pointerEvents: "auto" }}
      >
        <HeroPremiumButton fullWidthMobile onClick={onOpenRequestForm}>
          {data.ctaPrimary}
        </HeroPremiumButton>

        <HeroSecondaryLink
          centeredMobile
          className="hero-secondary-cta"
          onClick={onGoPortfolio}
        >
          {data.ctaSecondary}
        </HeroSecondaryLink>
      </motion.div>
    </div>
  );

  if (scrollFlowLayout) {
    return (
      <div
        className="hero-content hero-content--scroll-flow relative z-[22] flex min-h-full w-full flex-1 flex-col pointer-events-auto lg:hidden"
        data-hero-content=""
      >
        {scrim}
        <div
          className={`${columnClass} flex min-h-0 flex-1 flex-col justify-center motion-hero-scroll-col`}
        >
          {body}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-[22] flex min-h-0 flex-col lg:hidden"
      initial={reduceFx ? SCENE_REVEAL_VISIBLE : SCENE_REVEAL_INITIAL}
      animate={SCENE_REVEAL_VISIBLE}
      transition={reduceFx ? SCENE_REVEAL_TRANSITION_REDUCED : SCENE_REVEAL_TRANSITION}
      style={{ willChange: "opacity, transform, filter" }}
    >
      {scrim}

      <div className={columnClass} style={columnStyle}>
        {body}
      </div>
    </motion.div>
  );
}

/**
 * Hero overlay (chapter 0):
 * - Desktop (lg+): HeroDesktop в sticky при heroIsActive (LandingScrollScene).
 * - Mobile: HeroMobile первый шаг `MobileCinematicStoryScrollFlow` (scrollFlowLayout) поверх fixed-фона.
 */
export function HeroContent({
  variant,
  data,
  onGoPortfolio,
  onOpenRequestForm,
  scrollFlowLayout = false,
}: HeroContentProps) {
  const mqReduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const fmReduce = useReducedMotion();
  const reduceFx = Boolean(mqReduce || fmReduce);

  if (variant === "mobile") {
    return (
      <HeroMobile
        data={data}
        reduceFx={reduceFx}
        onGoPortfolio={onGoPortfolio}
        onOpenRequestForm={onOpenRequestForm}
        scrollFlowLayout={scrollFlowLayout}
      />
    );
  }
  return (
    <HeroDesktop
      data={data}
      reduceFx={reduceFx}
      onGoPortfolio={onGoPortfolio}
      onOpenRequestForm={onOpenRequestForm}
    />
  );
}
