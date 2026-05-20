"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from "framer-motion";
import { useCallback, useState } from "react";
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
    <div className="portfolio-showcase-fallback pointer-events-none relative isolate size-full min-h-[12rem]">
      <div className="portfolio-showcase-fallback__base" aria-hidden />
      <div className="portfolio-showcase-fallback__grid" aria-hidden />
      <div className="portfolio-showcase-fallback__glow" aria-hidden />
      <div className="portfolio-showcase-fallback__num font-display tabular-nums">
        {num}
      </div>
    </div>
  );
}

function PortfolioNavIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg
      className="portfolio-showcase-nav__icon"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d={direction === "prev" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"}
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export function PortfolioSection() {
  const projects = PORTFOLIO_SHOWCASE_PROJECTS;
  const openRequestForm = useNavScrollOpenRequestForm();
  const reduceMotion = useReducedMotion();

  const [activeIndex, setActiveIndex] = useState(0);

  const total = projects.length;

  const idx = total === 0 ? 0 : Math.min(activeIndex, total - 1);
  if (idx !== activeIndex) {
    setActiveIndex(idx);
  }
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
  const isPortfolioDragViewportDesktop = useMediaQuery("(min-width: 1024px)");
  const swipeEnabled = isMobileSwipe && !reduceMotion && total > 1;
  /** Desktop ≥lg: drag; phone ≤767: горизонтальный swipe по stage (порог 56px). */
  const allowPortfolioDrag =
    swipeEnabled && isPortfolioDragViewportDesktop;
  const allowMobilePortfolioSwipe = swipeEnabled && !isPortfolioDragViewportDesktop;
  const enableHorizontalDrag = allowPortfolioDrag || allowMobilePortfolioSwipe;

  const onMobileSwipeEnd = useCallback(
    (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      if (!enableHorizontalDrag) return;
      const threshold = allowMobilePortfolioSwipe ? 56 : 60;
      if (info.offset.x < -threshold) goNext();
      if (info.offset.x > threshold) goPrev();
    },
    [enableHorizontalDrag, allowMobilePortfolioSwipe, goNext, goPrev],
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
      className="portfolio-showcase portfolio-showcase--stack relative overflow-x-clip bg-paper-soft pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(3rem,6vw,4.5rem)] lg:flex lg:min-h-[100svh] lg:flex-col"
      aria-labelledby="portfolio-heading"
    >
      <div aria-hidden className="portfolio-showcase-atmosphere pointer-events-none absolute inset-0" />
      <div
        aria-hidden
        className="portfolio-showcase-grid pointer-events-none absolute inset-0 opacity-[0.034]"
      />

      <div className="ds-container relative z-[1] flex w-full flex-1 flex-col">
        {/* Header */}
        <header className="portfolio-showcase-header mb-8 shrink-0 lg:mb-10 xl:mb-12">
          <p className="ds-eyebrow portfolio-showcase-header__eyebrow m-0">
            {portfolio.eyebrowLine}
          </p>
          <h2
            id="portfolio-heading"
            className="ds-heading-display portfolio-showcase-header__title mt-3 max-w-[14ch]"
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
        <div className="portfolio-showcase-viewer relative flex min-h-0 flex-1 flex-col">
          <motion.div
            className="portfolio-showcase-stage flex min-h-0 w-full flex-1 flex-col gap-8 lg:flex-row lg:items-stretch lg:gap-12 xl:gap-16"
            drag={enableHorizontalDrag ? "x" : false}
            dragConstraints={enableHorizontalDrag ? { left: 0, right: 0 } : undefined}
            dragElastic={enableHorizontalDrag ? 0.1 : 0}
            onDragEnd={enableHorizontalDrag ? onMobileSwipeEnd : undefined}
          >
            {/* Image — top on mobile, right on desktop */}
            <div className="portfolio-showcase-visual order-1 flex min-h-0 w-full shrink-0 flex-col lg:order-2 lg:w-[min(58%,560px)] lg:flex-1 xl:w-[min(60%,620px)]">
              <div className="portfolio-showcase-media">
              <div className="portfolio-showcase-image-frame relative w-full overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={project.id}
                    className="portfolio-showcase-image-layer absolute inset-0"
                    initial={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.985, x: 18 }
                    }
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={
                      reduceMotion
                        ? { opacity: 0 }
                        : { opacity: 0, scale: 0.992, x: -10 }
                    }
                    transition={imageTransition}
                  >
                    <div className="portfolio-showcase-image-inner relative size-full origin-center">
                      {project.image ? (
                        <Image
                          src={project.image}
                          alt={project.title}
                          fill
                          priority
                          sizes="(max-width: 1023px) min(96vw, 720px), min(580px, 56vw)"
                          quality={86}
                          className="portfolio-showcase-image object-cover object-center"
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
                        className="portfolio-showcase-image-edge portfolio-showcase-image-edge--top"
                      />
                      <div
                        aria-hidden
                        className="portfolio-showcase-image-edge portfolio-showcase-image-edge--bottom"
                      />
                      <div
                        aria-hidden
                        className="portfolio-showcase-image-letterbox"
                      />
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="portfolio-showcase-nav flex flex-col gap-3">
                <div className="portfolio-showcase-nav__row flex items-center justify-between gap-3">
                  <p
                    className="portfolio-showcase-nav__label m-0 max-lg:hidden"
                    aria-live="polite"
                  >
                    {project.category}
                  </p>
                  <div className="portfolio-showcase-nav__controls flex flex-1 items-center justify-center gap-2 lg:flex-none lg:justify-end">
                    <button
                      type="button"
                      onClick={goPrev}
                      className="portfolio-showcase-nav__btn"
                      aria-label="Предыдущий проект"
                    >
                      <PortfolioNavIcon direction="prev" />
                    </button>
                    <p
                      className="portfolio-showcase-nav__counter m-0 min-w-[3.25rem] text-center tabular-nums lg:hidden"
                      aria-live="polite"
                    >
                      <span className="portfolio-showcase-nav__counter-current">
                        {String(idx + 1).padStart(2, "0")}
                      </span>
                      <span className="portfolio-showcase-nav__counter-sep" aria-hidden>
                        /
                      </span>
                      <span className="portfolio-showcase-nav__counter-total">
                        {String(total).padStart(2, "0")}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={goNext}
                      className="portfolio-showcase-nav__btn"
                      aria-label="Следующий проект"
                    >
                      <PortfolioNavIcon direction="next" />
                    </button>
                  </div>
                </div>
                {total > 1 ? (
                  <div
                    className="portfolio-showcase-dots flex items-center justify-center gap-2 lg:hidden"
                    role="tablist"
                    aria-label="Выбор проекта"
                  >
                    {projects.map((p, i) => {
                      const active = i === idx;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          role="tab"
                          aria-selected={active}
                          aria-label={`${p.title}`}
                          className={[
                            "portfolio-showcase-dot",
                            active ? "portfolio-showcase-dot--active" : "",
                          ].join(" ")}
                          onClick={() => selectProject(i)}
                        />
                      );
                    })}
                  </div>
                ) : null}
              </div>
              </div>
            </div>

            <div className="portfolio-showcase-panel order-2 flex min-w-0 flex-1 flex-col justify-center lg:order-1 lg:max-w-[min(100%,440px)] lg:pr-1 xl:max-w-[min(100%,480px)]">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={project.id}
                  initial={
                    reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }
                  }
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                  transition={textTransition}
                  className="portfolio-showcase-copy-shell portfolio-showcase-copy portfolio-showcase-copy--panel flex min-h-0 flex-1 flex-col"
                >
                  <p className="portfolio-showcase-copy__index portfolio-showcase-copy__index--panel m-0">
                    <span className="portfolio-showcase-copy__index-current">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <span className="portfolio-showcase-copy__index-sep" aria-hidden>
                      /
                    </span>
                    <span className="portfolio-showcase-copy__index-total">
                      {String(total).padStart(2, "0")}
                    </span>
                  </p>
                  <p className="portfolio-showcase-copy__category m-0">
                    {project.category}
                  </p>
                  <h3 className="portfolio-showcase-copy__title">
                    {project.title}
                  </h3>
                  <div className="portfolio-showcase-copy__meta">
                    <p className="portfolio-showcase-copy__meta-label m-0">
                      Заказчик
                    </p>
                    <p className="portfolio-showcase-copy__meta-value m-0">
                      {project.client}
                    </p>
                  </div>
                  <p className="portfolio-showcase-copy__body">
                    {project.description}
                  </p>
                  <div className="portfolio-showcase-copy__cta">
                    <button
                      type="button"
                      onClick={openRequestForm ?? undefined}
                      className="portfolio-showcase-cta portfolio-showcase-cta--panel premium-cta-button premium-cta-button--secondary inline-flex w-full cursor-pointer items-center justify-center border-0 font-sans outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 sm:w-auto"
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
          <div className="portfolio-project-rail mt-10 shrink-0 pt-8 lg:mt-12 lg:pt-10">
            <p className="portfolio-project-rail__label m-0">Все объекты</p>
            <div className="portfolio-showcase-rail -mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 max-lg:px-1 lg:mx-0 lg:mt-5 lg:grid lg:snap-none lg:grid-cols-5 lg:gap-4 lg:overflow-visible">
              {projects.map((p, i) => {
                const active = i === idx;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => selectProject(i)}
                    className={[
                      "portfolio-rail-card snap-start scroll-ml-1",
                      active ? "portfolio-rail-card--active" : "",
                    ].join(" ")}
                    aria-current={active ? "true" : undefined}
                  >
                    <span className="portfolio-rail-card__num tabular-nums">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="portfolio-rail-card__category line-clamp-1">
                      {p.category}
                    </span>
                    <span className="portfolio-rail-card__title line-clamp-2">
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
