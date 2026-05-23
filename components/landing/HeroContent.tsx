"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { SiteHero } from "@/data/siteContent";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CINEMATIC_TEXT_ENTER_S } from "@/lib/cinematic-scroll-story";
import { CinematicTitle, EASE_PREMIUM } from "./CinematicTitle";

/** Фиксированная подпись hero: обычный текст без SplitType (иначе пропадают пробелы). */
const HERO_COVER_EYEBROW = "ОРЕНБУРГ И ОБЛАСТЬ";

const HERO_HEADLINE_LINES = ["Проектируем", "и строим", "современные дома"] as const;

const MOBILE_HERO_TRUST_ITEMS = [
  { id: "region", label: "Архитектурное проектирование" },
  { id: "terms", label: "Строительство домов под ключ" },
  { id: "quality", label: "Инженерные системы" },
  { id: "duty", label: "Контроль качества на площадке" },
] as const;

function HeroTrustIcon({ id }: { id: (typeof MOBILE_HERO_TRUST_ITEMS)[number]["id"] }) {
  const stroke = "currentColor";
  const common = {
    width: 16,
    height: 16,
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
    case "terms":
      return (
        <svg {...common}>
          <path d="M12 3 4 6v6c0 4.2 3.4 7.4 8 9 4.6-1.6 8-4.8 8-9V6l-8-3Z" />
          <path d="m9.5 11.5 2 2 3.5-3.5" />
        </svg>
      );
    case "quality":
      return (
        <svg {...common}>
          <rect x="6" y="4" width="12" height="16" rx="1.5" />
          <path d="M9 8h6M9 12h6M9 16h4" />
        </svg>
      );
    case "duty":
      return (
        <svg {...common}>
          <path d="M8 11V8a4 4 0 1 1 8 0v3" />
          <path d="M6 11h12v2.5a4.5 4.5 0 0 1-4.5 4.5h-3A4.5 4.5 0 0 1 6 13.5V11Z" />
          <path d="M9.5 15.5 12 18l2.5-2.5" />
        </svg>
      );
    default:
      return null;
  }
}

function HeroMobileTrustRow() {
  return (
    <div className="m-hero-trust-row" aria-label="Преимущества">
      <ul className="m-hero-trust-row__list">
        {MOBILE_HERO_TRUST_ITEMS.map((item) => (
          <li key={item.id} className="m-hero-trust-row__item">
            <span className="m-hero-trust-row__icon">
              <HeroTrustIcon id={item.id} />
            </span>
            <span className="m-hero-trust-row__label">{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
  /**
   * Только mobile scroll-лента: сразу финальный кадр текста без time-based reveal
   * (избегает «пустых» блоков при быстром инерционном скролле).
   */
  instantMotion?: boolean;
};

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
  scrollFlowStatic = false,
}: {
  narrow: boolean;
  reduceFx: boolean;
  delay: number;
  className: string;
  /** Mobile scroll-лента: без motion-обёртки (нет deferred paint от Framer). */
  scrollFlowStatic?: boolean;
}) {
  if (scrollFlowStatic) {
    return (
      <p
        className={`cinematic-text-render pointer-events-none m-0 max-w-[620px] ${className}`}
      >
        {HERO_COVER_EYEBROW}
      </p>
    );
  }

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
        duration: reduceFx ? 0 : CINEMATIC_TEXT_ENTER_S,
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
  className,
}: {
  onClick: () => void;
  children: ReactNode;
  fullWidthMobile?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "hero-mobile-cta-primary hero-mobile-cta--dark m-btn-primary premium-cta-button premium-cta-button--primary group/hp relative inline-flex cursor-pointer items-center justify-center border-0",
        "outline-none ring-offset-2 ring-offset-[var(--paper-soft)] focus-visible:ring-2 focus-visible:ring-[rgba(41,37,32,0.14)]",
        fullWidthMobile ? "w-full sm:w-auto" : "",
        className ?? "",
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
        "premium-cta-button premium-cta-button--secondary hero-button-secondary hero-mobile-cta-secondary--dark m-btn-secondary group/hs relative inline-flex h-[50px] cursor-pointer items-center justify-center border-0",
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
      className="hero-desktop pointer-events-none absolute inset-0 z-[22] hidden min-h-0 flex-col lg:flex"
      initial={reduceFx ? SCENE_REVEAL_VISIBLE : SCENE_REVEAL_INITIAL}
      animate={SCENE_REVEAL_VISIBLE}
      transition={reduceFx ? SCENE_REVEAL_TRANSITION_REDUCED : SCENE_REVEAL_TRANSITION}
      style={{ willChange: "opacity, transform, filter" }}
    >
      <div aria-hidden className="hero-desktop-scrim absolute inset-0" />

      <div className="hero-desktop-stage absolute inset-0 flex min-h-0 items-start justify-start">
        <div className="hero-desktop-column relative w-full">
          <div className="hero-copy hero-copy--desktop ds-overlay-text-zone">
            <div className="hero-readability-glow" aria-hidden />
            <div className="hero-copy-eyebrow">
              <HeroCoverEyebrow
                narrow={false}
                reduceFx={reduceFx}
                delay={0}
                className="ds-eyebrow hero-eyebrow cinematic-text-render"
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
              className="hero-buttons hero-buttons--desktop"
              style={{ pointerEvents: "auto" }}
            >
              <HeroPremiumButton
                className="hero-cta-primary"
                onClick={onOpenRequestForm}
              >
                {data.ctaPrimary}
              </HeroPremiumButton>
              <HeroSecondaryLink
                className="hero-cta-secondary"
                onClick={onGoPortfolio}
              >
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

  const scrim = (
    <div
      aria-hidden
      className={[
        "hero-mobile-scrim hero-mobile-scrim--dark pointer-events-none absolute inset-0",
        scrollFlowLayout ? "hero-mobile-scrim--scroll" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    />
  );

  const columnClass = scrollFlowLayout
    ? "hero-mobile-column hero-mobile-column--scroll relative z-[22] mx-auto flex w-full flex-col items-center text-center pt-0"
    : "hero-mobile-column hero-mobile-column--overlay relative mx-auto flex w-full flex-col";

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
        scrollFlowLayout
          ? "hero-copy--mobile hero-copy--mobile-dark m-hero-glass-panel hero-copy--mobile-luxury-scroll"
          : "hero-copy--mobile hero-copy--mobile-dark m-hero-glass-panel",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="hero-readability-glow hero-readability-glow--mobile-off" aria-hidden />
      <div className="hero-copy-eyebrow">
        <HeroCoverEyebrow
          narrow
          reduceFx={soft}
          delay={0}
          scrollFlowStatic={scrollFlowLayout}
          className="hero-mobile-eyebrow hero-mobile-eyebrow--dark m-section-label cinematic-text-render"
        />
      </div>

      <CinematicTitle
        as="h1"
        text={titleText}
        narrow
        reduceFx={soft}
        active
        delay={0.04}
        className="premium-engraved-title hero-cinematic-title hero-title-measure hero-mobile-title hero-mobile-title--dark cinematic-text-render font-display"
      />

      {scrollFlowLayout ? (
        <p className="hero-body-lede font-sans">{data.subheadline}</p>
      ) : (
        <motion.p
          initial={enterSub}
          animate={aliveSub}
          transition={{
            duration: soft ? 0.12 : CINEMATIC_TEXT_ENTER_S,
            ease: EASE_PREMIUM,
            delay: soft ? 0 : 0.08,
          }}
          className="hero-body-lede font-sans"
        >
          {data.subheadline}
        </motion.p>
      )}

      {scrollFlowLayout ? (
        <div className="hero-buttons hero-buttons--mobile" style={{ pointerEvents: "auto" }}>
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
        </div>
      ) : (
        <motion.div
          initial={enterSub}
          animate={aliveSub}
          transition={{
            duration: soft ? 0.12 : CINEMATIC_TEXT_ENTER_S,
            ease: EASE_PREMIUM,
            delay: soft ? 0 : 0.14,
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
      )}
    </div>
  );

  if (scrollFlowLayout) {
    return (
      <div
        className="hero-content hero-content--scroll-flow hero-content--premium-screen relative z-[22] flex min-h-full w-full flex-1 flex-col pointer-events-auto lg:hidden"
        data-hero-content=""
      >
        {scrim}
        <div className="m-hero-premium-stage flex min-h-0 w-full flex-1 flex-col justify-center">
          <div
            className={`${columnClass} m-hero-premium-stack flex min-h-0 flex-col items-center motion-hero-scroll-col`}
          >
            {body}
            <HeroMobileTrustRow />
          </div>
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
  instantMotion = false,
}: HeroContentProps) {
  const mqReduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  const fmReduce = useReducedMotion();
  const reduceFx = Boolean(mqReduce || fmReduce || instantMotion);

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
