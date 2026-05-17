"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import {
  PORTFOLIO_IMAGE_BLUR_DATA_URL,
  PORTFOLIO_SHOWCASE_PROJECTS,
} from "@/data/portfolioMedia";
import { SITE_CONTENT } from "@/data/siteContent";
import { useNavScrollOpenRequestForm } from "@/components/landing/NavScrollContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const { portfolio } = SITE_CONTENT;

const EASE_SHOWCASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function PremiumImageFallback({ index }: { index: number }) {
  const num = String(index + 1).padStart(2, "0");
  return (
    <div className="pointer-events-none relative isolate size-full min-h-[12rem]">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(135deg, rgba(250,246,238,0.96) 0%, rgba(232,218,198,0.72) 55%, rgba(218,200,178,0.55) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(74,58,38,0.07) 1px,transparent 1px)," +
            "linear-gradient(90deg,rgba(74,58,38,0.07) 1px,transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 72% 55% at 78% 18%, rgba(255,253,246,0.55) 0%, transparent 60%)",
        }}
      />
      <div className="absolute left-6 top-6 font-display text-[clamp(3rem,8vw,4.5rem)] font-medium tabular-nums tracking-[0.08em] text-[rgba(42,34,26,0.12)]">
        {num}
      </div>
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-[40%]"
        style={{
          background:
            "linear-gradient(to top, rgba(232,218,198,0.45) 0%, transparent)",
        }}
      />
    </div>
  );
}

export function PortfolioSection() {
  const projects = PORTFOLIO_SHOWCASE_PROJECTS;
  const openRequestForm = useNavScrollOpenRequestForm();
  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);

  const total = projects.length;

  useEffect(() => {
    if (total === 0) return;
    setActiveIndex((i) => Math.min(i, total - 1));
  }, [total]);

  const idx = total === 0 ? 0 : Math.min(activeIndex, total - 1);
  const project = total > 0 ? projects[idx] : null;

  const dur = reduceMotion ? 0.12 : 0.55;

  const textTransition = {
    duration: dur,
    ease: EASE_SHOWCASE,
  };

  const imageTransition = {
    duration: reduceMotion ? 0.12 : 0.52,
    ease: EASE_SHOWCASE,
  };

  const goPrev = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((i) => (i - 1 + total) % total);
  }, [total]);

  const goNext = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((i) => (i + 1) % total);
  }, [total]);

  const selectProject = useCallback((i: number) => {
    setActiveIndex(i);
  }, []);

  const isMobileSwipe = useMediaQuery("(max-width: 767px)");
  const swipeEnabled = isMobileSwipe && !reduceMotion && total > 1;

  const onMobileSwipeEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!swipeEnabled) return;
      if (info.offset.x < -60) goNext();
      if (info.offset.x > 60) goPrev();
    },
    [swipeEnabled, goNext, goPrev],
  );

  if (total === 0 || !project) {
    return (
      <section
        className="portfolio-showcase relative bg-paper-soft py-16"
        aria-labelledby="portfolio-heading"
      >
        <div className="mx-auto max-w-[min(1200px,100%)] px-5">
          <h2 id="portfolio-heading" className="font-display text-ink">
            {portfolio.heading}
          </h2>
          <p className="font-sans text-muted">Объекты скоро появятся.</p>
        </div>
      </section>
    );
  }

  return (
    <section
      className="portfolio-showcase relative overflow-x-clip bg-paper-soft pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(3rem,6vw,4.5rem)] lg:flex lg:min-h-[100svh] lg:flex-col"
      aria-labelledby="portfolio-heading"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_88%_70%_at_10%_0%,rgba(255,251,243,0.92)_0%,transparent_58%),radial-gradient(ellipse_50%_44%_at_96%_18%,rgba(238,229,218,0.4)_0%,transparent_50%)]"
      />
      <div
        aria-hidden
        className="portfolio-showcase-grid pointer-events-none absolute inset-0 opacity-[0.034]"
      />

      <div className="relative z-[1] mx-auto flex w-full max-w-[min(1240px,100%)] flex-1 flex-col px-4 xs:px-5 sm:px-8 lg:px-12">
        {/* Header */}
        <header className="mb-8 shrink-0 lg:mb-10 xl:mb-12">
          <p className="m-0 font-sans text-[12px] font-semibold uppercase tracking-[0.22em] text-[rgba(42,34,26,0.42)]">
            {portfolio.eyebrowLine}
          </p>
          <h2
            id="portfolio-heading"
            className="mt-3 max-w-[14ch] text-balance font-display text-[clamp(2.35rem,5vw,3.85rem)] font-medium leading-[0.95] tracking-[-0.032em] text-[rgba(28,24,20,0.96)]"
          >
            {portfolio.heading}
          </h2>
        </header>

        {total > 1 ? (
          <p className="portfolio-showcase-swipe-hint">
            Смахните, чтобы посмотреть следующий проект
          </p>
        ) : null}

        {/* Main viewer shell */}
        <div
          className="portfolio-showcase-viewer relative flex min-h-0 flex-1 flex-col rounded-[32px] border border-[rgba(74,58,38,0.10)] p-[clamp(1rem,3vw,1.65rem)] shadow-[0_40px_120px_rgba(70,52,28,0.10)] lg:rounded-[40px] lg:p-[clamp(1.35rem,2.8vw,2.25rem)]"
          style={{
            background:
              "linear-gradient(135deg, rgba(250,246,238,0.92), rgba(232,218,198,0.58))",
          }}
        >
          {/* Desktop: row | Mobile: column image first */}
          <motion.div
            className="flex min-h-0 w-full flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-10 xl:gap-14"
            drag={swipeEnabled ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={swipeEnabled ? onMobileSwipeEnd : undefined}
          >
            {/* Image — top on mobile, right on desktop */}
            <div className="order-1 flex min-h-0 w-full shrink-0 flex-col lg:order-2 lg:w-[min(54%,520px)] lg:flex-1 xl:w-[min(56%,580px)]">
              <div className="portfolio-showcase-image-frame group/img relative aspect-[16/10] w-full overflow-hidden rounded-[28px] border border-[rgba(74,58,38,0.08)] bg-[rgba(255,252,246,0.35)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] lg:rounded-[32px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={project.id}
                    className="absolute inset-0"
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.96, x: 24 }
                    }
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.98, x: -12 }
                    }
                    transition={imageTransition}
                  >
                    <div className="relative size-full origin-center transition-transform duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] lg:group-hover/img:scale-[1.025]">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          priority
                          sizes="(max-width: 1023px) min(96vw, 720px), min(580px, 56vw)"
                          quality={86}
                          className="object-cover object-center [filter:contrast(1.04)_saturate(0.92)_brightness(0.96)]"
                          placeholder="blur"
                          blurDataURL={
                            project.blurDataURL ?? PORTFOLIO_IMAGE_BLUR_DATA_URL
                          }
                        />
                      ) : (
                        <PremiumImageFallback index={idx} />
                      )}
                      <div
                        aria-hidden
                        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(28,22,18,0.42)] via-[rgba(28,22,18,0.08)] to-transparent"
                      />
                      <div className="pointer-events-none absolute bottom-5 left-5 right-5 z-[2]">
                        <p className="m-0 font-sans text-[11px] font-semibold uppercase tracking-[0.2em] text-[rgba(248,244,238,0.55)]">
                          {project.category}
                        </p>
                        <p className="mt-1 line-clamp-2 font-display text-[clamp(1.1rem,2.2vw,1.45rem)] font-medium leading-[1.15] tracking-[-0.02em] text-[rgba(248,244,238,0.94)]">
                          {project.title}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Arrows — below image on mobile, could show on desktop at bottom of image col */}
              <div className="mt-4 flex items-center justify-end gap-2 lg:mt-5">
                <button
                  type="button"
                  onClick={goPrev}
                  className="portfolio-showcase-arrow flex size-11 items-center justify-center rounded-full border border-[rgba(74,58,38,0.12)] bg-[rgba(255,255,255,0.45)] text-[rgba(28,24,20,0.72)] shadow-[0_8px_24px_rgba(70,52,28,0.08)] backdrop-blur-sm transition-[transform,background,border-color] duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:border-[rgba(74,58,38,0.2)] hover:bg-[rgba(255,255,255,0.62)] active:scale-[0.97]"
                  aria-label="Предыдущий проект"
                >
                  <span className="text-lg leading-none" aria-hidden>
                    ←
                  </span>
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="portfolio-showcase-arrow flex size-11 items-center justify-center rounded-full border border-[rgba(74,58,38,0.12)] bg-[rgba(255,255,255,0.45)] text-[rgba(28,24,20,0.72)] shadow-[0_8px_24px_rgba(70,52,28,0.08)] backdrop-blur-sm transition-[transform,background,border-color] duration-300 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] hover:border-[rgba(74,58,38,0.2)] hover:bg-[rgba(255,255,255,0.62)] active:scale-[0.97]"
                  aria-label="Следующий проект"
                >
                  <span className="text-lg leading-none" aria-hidden>
                    →
                  </span>
                </button>
              </div>
            </div>

            {/* Copy panel */}
            <div className="order-2 flex min-w-0 flex-1 flex-col justify-center lg:order-1 lg:max-w-[min(100%,480px)] lg:pr-2">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={project.id}
                  initial={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: 16, filter: "blur(8px)" }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: reduceMotion ? "blur(0px)" : "blur(0px)",
                  }}
                  exit={
                    reduceMotion
                      ? { opacity: 0 }
                      : { opacity: 0, y: -10, filter: "blur(6px)" }
                  }
                  transition={textTransition}
                  className="flex flex-col"
                >
                  <p className="m-0 mt-px font-sans text-[11px] font-semibold uppercase leading-snug tracking-[0.22em] text-[rgba(118,94,72,0.88)]">
                    {project.category}
                  </p>
                  <h3 className="mt-4 font-display text-[clamp(1.75rem,2.75vw,2.5rem)] font-medium leading-[1.04] tracking-[-0.028em] text-[rgba(22,18,16,0.97)]">
                    {project.title}
                  </h3>
                  <div className="mt-5">
                    <p className="m-0 font-sans text-[11px] font-medium leading-snug tracking-[0.06em] text-[rgba(42,34,26,0.48)]">
                      Заказчик:
                    </p>
                    <p className="mt-2 font-sans text-[1rem] font-bold leading-tight tracking-[0.04em] text-[rgba(24,20,18,0.94)]">
                      {project.client}
                    </p>
                  </div>
                  <p className="mt-6 max-w-[620px] font-sans text-[clamp(0.97rem,1.05vw,1.08rem)] font-medium leading-[1.72] tracking-[-0.008em] text-[rgba(42,34,26,0.74)]">
                    {project.description}
                  </p>
                  <div className="mt-7">
                    <button
                      type="button"
                      onClick={openRequestForm ?? undefined}
                      className="premium-cta-button premium-cta-button--primary inline-flex h-[52px] cursor-pointer items-center justify-center border-0 px-[28px] font-sans text-[12px] font-semibold uppercase tracking-[0.14em] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2"
                    >
                      <span className="premium-cta-button__label">
                        Оставить заявку
                      </span>
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Bottom rail */}
          <div className="portfolio-project-rail mt-8 shrink-0 border-t border-[rgba(74,58,38,0.08)] pt-6 lg:mt-10 lg:pt-8">
            <div className="portfolio-showcase-rail -mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 max-lg:px-1 lg:mx-0 lg:grid lg:snap-none lg:grid-cols-5 lg:gap-3 lg:overflow-visible">
              {projects.map((p, i) => {
                const active = i === idx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProject(i)}
                    className={[
                      "snap-start scroll-ml-1",
                      "flex min-h-[96px] min-w-[220px] flex-col justify-center gap-2 rounded-[20px] border px-4 py-3 text-left transition-[transform,background,border-color,box-shadow] duration-500 [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] active:scale-[0.99] lg:min-h-[104px] lg:min-w-0 lg:max-h-[120px]",
                      active
                        ? "border-transparent bg-[rgba(30,24,18,0.92)] text-[rgba(248,244,238,0.94)] shadow-[0_20px_48px_rgba(28,22,18,0.18)]"
                        : "border-[rgba(70,52,28,0.10)] bg-[rgba(255,255,255,0.38)] text-[rgba(28,24,20,0.88)] hover:border-[rgba(70,52,28,0.16)] hover:bg-[rgba(255,255,255,0.5)]",
                    ].join(" ")}
                  >
                    <span
                      className={[
                        "line-clamp-1 font-sans text-[9px] font-semibold uppercase tracking-[0.18em]",
                        active ? "text-[rgba(248,244,238,0.45)]" : "text-[rgba(118,94,72,0.75)]",
                      ].join(" ")}
                    >
                      {p.category}
                    </span>
                    <span
                      className={[
                        "line-clamp-2 font-display text-[13px] font-medium leading-snug tracking-[-0.015em] lg:text-[12.5px]",
                        active ? "text-[rgba(248,244,238,0.92)]" : "text-[rgba(28,24,20,0.88)]",
                      ].join(" ")}
                    >
                      {p.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
