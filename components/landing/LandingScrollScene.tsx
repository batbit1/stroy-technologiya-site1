"use client";

import { useEffect, useRef } from "react";
import { HeroContent } from "./HeroContent";
import {
  HouseSequenceCanvas,
  type SequencePlacement,
} from "./HouseSequenceCanvas";
import { HouseStageFrame } from "./HouseStageFrame";
import {
  MobileCinematicStoryScrollFlow,
  SplitCinematicStory,
} from "./SplitCinematicStory";
import {
  DESKTOP_SEQUENCE_FRAMES,
  MOBILE_LANDING_SCROLL_SPACER_VH,
  MOBILE_SEQUENCE_FRAMES,
  STORY_STEPS,
} from "@/lib/landing-data";
import {
  getChapterTiming,
  safeProgress01,
} from "@/lib/scrollStoryTimeline";
import { SITE_CONTENT } from "@/data/siteContent";
import { useScrollFrame } from "@/hooks/useScrollFrame";

/**
 * Длина скролла секции (sticky 100vh + spacer ≈ total).
 * Замедление достигается ИМЕННО за счёт scroll height, а не за счёт растягивания
 * dissolve внутри главы — внутри глав стоит длинный стабильный HOLD.
 */
const SCROLL_LENGTH_VH_MOBILE = MOBILE_LANDING_SCROLL_SPACER_VH;
const SCROLL_LENGTH_VH_DESKTOP = 1450;

/**
 * Cinematic atmosphere — house остаётся читаемым, но больше не выбеливается:
 *   - выбеливающие слои (1–4) ослаблены на ~18–20%,
 *   - vignette по краям слегка усилен, чтобы добавить дому глубины и контраста.
 * Только градиенты (GPU-friendly), без filter на весь кадр.
 */
function SceneAtmosphere() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-[2]"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 64% 52% at 50% 55%, rgba(243,239,230,0.16) 0%, rgba(243,239,230,0.04) 48%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 130% 58% at 50% -12%, rgba(255,252,244,0.26) 0%, transparent 55%)",
        }}
      />
      <div
        className="absolute inset-x-0 bottom-0"
        style={{
          height: "62%",
          background:
            "linear-gradient(to top, rgba(238,232,220,0.21) 0%, rgba(241,236,226,0.07) 44%, transparent 74%)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "rgba(238,234,224,0.04)" }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 92% 92% at 50% 48%, transparent 38%, rgba(44,40,36,0.05) 72%, rgba(38,34,30,0.09) 100%)",
        }}
      />
    </div>
  );
}

/** Canvas + атмосфера + grain + mist. `breathing`: scale-pulse на обёртке sequence (только desktop). */
function CinematicBackdropStack({
  progress01,
  breathing = true,
  sequencePlacement = "desktopSticky",
}: {
  progress01: number;
  breathing?: boolean;
  sequencePlacement?: SequencePlacement;
}) {
  return (
    <>
      <div
        className={[
          "absolute inset-0 z-0",
          breathing ? "canvas-breathe" : "mobile-cinematic-canvas-root",
        ].join(" ")}
        aria-hidden
      >
        <HouseStageFrame>
          <HouseSequenceCanvas
            desktopFrames={DESKTOP_SEQUENCE_FRAMES}
            mobileFrames={MOBILE_SEQUENCE_FRAMES}
            progress01={progress01}
            className="pointer-events-none"
            sequencePlacement={sequencePlacement}
          />
        </HouseStageFrame>
      </div>
      <SceneAtmosphere />
      <div className="scene-grain-layer" aria-hidden />
      <div className="cinematic-readability-mist" aria-hidden />
    </>
  );
}

export type LandingScrollSceneProps = {
  onGoPortfolio: () => void;
  onOpenRequestForm: () => void;
};

export function LandingScrollScene({
  onGoPortfolio,
  onOpenRequestForm,
}: LandingScrollSceneProps) {
  const sceneSectionRef = useRef<HTMLElement>(null);
  const { scrollProgress } = useScrollFrame({
    sectionRef: sceneSectionRef,
    timelineFrames: DESKTOP_SEQUENCE_FRAMES,
  });

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("[LandingScrollScene] render");
    }
  }, []);

  const progress01 = safeProgress01(scrollProgress);
  const heroData = SITE_CONTENT.hero;

  const totalChapters = STORY_STEPS.length + 1;

  const { chapterIndex: activeChapterIndex } =
    getChapterTiming(progress01, totalChapters);

  const heroIsActive = activeChapterIndex === 0;

  const activeStoryIndex = activeChapterIndex - 1;

  return (
    <div className="relative text-ink">
      <section
        ref={sceneSectionRef}
        className="landing-scroll-scene relative isolate"
        aria-label="Сцена прокрутки"
      >
        {/*
         * Desktop (lg+): без изменений — sticky viewport + scroll-спейсер.
         */}
        <div className="hidden lg:block">
          <div className="sticky top-0 z-[1] h-screen min-h-0 w-full overflow-hidden">
            <CinematicBackdropStack progress01={progress01} />

            {heroIsActive ? (
              <HeroContent
                variant="desktop"
                data={heroData}
                onGoPortfolio={onGoPortfolio}
                onOpenRequestForm={onOpenRequestForm}
              />
            ) : null}

            <SplitCinematicStory activeStoryIndex={activeStoryIndex} />
          </div>

          <div
            className="h-[1250vh] md:h-[1450vh]"
            aria-hidden
            data-scroll-length-mobile={SCROLL_LENGTH_VH_MOBILE}
            data-scroll-length-desktop={SCROLL_LENGTH_VH_DESKTOP}
          />
        </div>

        {/*
         * Mobile: высота секции по контенту; canvas — fixed; лента — Hero + story (нативный скролл).
         */}
        <div className="lg:hidden relative w-full overflow-visible">
          <div
            className="cinematic-bg mobile-cinematic-bg house-sequence-layer house-sequence-canvas-wrapper pointer-events-none"
            aria-hidden
          >
            <div className="mobile-cinematic-bg__stage">
              <CinematicBackdropStack
                progress01={progress01}
                breathing={false}
                sequencePlacement="mobileCinematic"
              />
            </div>
          </div>

          <div className="mobile-story-flow">
            <MobileCinematicStoryScrollFlow
              heroData={heroData}
              onGoPortfolio={onGoPortfolio}
              onOpenRequestForm={onOpenRequestForm}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
