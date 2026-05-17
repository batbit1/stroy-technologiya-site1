"use client";

import { useEffect, useRef } from "react";
import { HeroContent } from "./HeroContent";
import { HouseSequenceCanvas } from "./HouseSequenceCanvas";
import { HouseStageFrame } from "./HouseStageFrame";
import { SplitCinematicStory } from "./SplitCinematicStory";
import {
  DESKTOP_SEQUENCE_FRAMES,
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
const SCROLL_LENGTH_VH_MOBILE = 1250;
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
      // Диагностика: подтверждение монтирования scroll-сцены (без спама на каждый кадр скролла).
      console.log("[LandingScrollScene] render");
    }
  }, []);

  // Защита от undefined/NaN на первом рендере: progress = 0 → Hero активен.
  const progress01 = safeProgress01(scrollProgress);
  const heroData = SITE_CONTENT.hero;

  // Hero = chapter 0, story = chapters 1..N. Главы равной длины.
  const totalChapters = STORY_STEPS.length + 1;

  const { chapterIndex: activeChapterIndex } =
    getChapterTiming(progress01, totalChapters);

  // ONE-SCENE-AT-A-TIME: рендерится либо Hero, либо одна story-сцена.
  // Между сценами никаких промежуточных opacity/blur состояний нет —
  // активная глава всегда отрисована в финальном «чётком» виде, неактивные
  // главы просто отсутствуют в DOM. Mount-time reveal (≈ 0.22–0.32 c.)
  // отрабатывает каждый раз при смене activeChapterIndex (key remount).
  const heroIsActive = activeChapterIndex === 0;

  const activeStoryIndex = activeChapterIndex - 1;

  return (
    <div className="relative text-ink">
      <section
        ref={sceneSectionRef}
        className="relative isolate"
        aria-label="Сцена прокрутки"
      >
        {/*
         * Sticky viewport + spacer: Hero + STORY_STEPS как равные главы единой timeline.
         * Canvas получает progress01 без изменений и продолжает плавно строить дом
         * на протяжении всего скролла, независимо от phase-based overlay.
         */}

        <div className="sticky top-0 z-[1] h-screen min-h-0 w-full overflow-hidden">

          <div className="absolute inset-0 z-0 canvas-breathe" aria-hidden>
            <HouseStageFrame>
              <HouseSequenceCanvas
                desktopFrames={DESKTOP_SEQUENCE_FRAMES}
                mobileFrames={MOBILE_SEQUENCE_FRAMES}
                progress01={progress01}
                className="pointer-events-none"
              />
            </HouseStageFrame>
          </div>

          <SceneAtmosphere />

          <div className="scene-grain-layer" aria-hidden />

          <div className="cinematic-readability-mist" aria-hidden />

          {/*
           * ONE-SCENE-AT-A-TIME: рендерится только активная глава.
           * Hero рендерится исключительно при activeChapterIndex === 0
           * (на progress01 = 0 виден сразу, без ожидания скролла).
           * Story-сцена — при activeStoryIndex ≥ 0; SplitCinematicStory сам
           * выбирает один STORY_STEPS[activeStoryIndex] и не мапит остальные.
           * Никаких scroll-driven blur/opacity на оверлеях: смена сцен
           * — это remount, а не fade.
           */}
          {heroIsActive ? (
            <>
              <HeroContent
                variant="mobile"
                data={heroData}
                onGoPortfolio={onGoPortfolio}
                onOpenRequestForm={onOpenRequestForm}
              />
              <HeroContent
                variant="desktop"
                data={heroData}
                onGoPortfolio={onGoPortfolio}
                onOpenRequestForm={onOpenRequestForm}
              />
            </>
          ) : null}

          <SplitCinematicStory activeStoryIndex={activeStoryIndex} />
        </div>

        {/* Spacer: SCROLL_LENGTH_VH_MOBILE / SCROLL_LENGTH_VH_DESKTOP. */}
        <div
          className="h-[1250vh] md:h-[1450vh]"
          aria-hidden
          data-scroll-length-mobile={SCROLL_LENGTH_VH_MOBILE}
          data-scroll-length-desktop={SCROLL_LENGTH_VH_DESKTOP}
        />
      </section>
    </div>
  );
}
