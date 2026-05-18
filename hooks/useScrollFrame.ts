"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

type Options = {
  /**
   * Progress сцены 0..1 не зависит от кадров.
   * Если задано — frameIndex в ответе считается по этой шкале (например max desktop).
   */
  timelineFrames?: number;
  /** Корень scroll-сцены. Если ref пустой — progress по всему документу */
  sectionRef?: RefObject<HTMLElement | null>;
  /** Если false — слушатели scroll не ставятся (например mobile без cinematic progress). */
  enabled?: boolean;
};

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

/** Fallback: глобальный скролл документа (как раньше). */
function documentScrollProgress(scrollY: number, innerHeight: number): number {
  const doc = document.documentElement;
  const maxScroll = Math.max(1, doc.scrollHeight - innerHeight);
  return clamp01(scrollY / maxScroll);
}

/**
 * progress по секции:
 * - 0 при scrollY, когда верх секции у верха viewport;
 * - 1 после «полного» прохода: при h ≥ vh — до позиции, где низ секции у низа viewport;
 *   при h < vh — на интервале высоты секции (низ уходит за верх viewport).
 */
function sectionScrollProgress(
  section: HTMLElement,
  scrollY: number,
  innerHeight: number,
): number {
  const sectionHeight = section.offsetHeight;
  const sectionTop = scrollY + section.getBoundingClientRect().top;

  const start = sectionTop;
  let end = sectionTop + sectionHeight - innerHeight;
  if (end < start) {
    end = sectionTop + sectionHeight;
  }
  const range = Math.max(end - start, 1);
  return clamp01((scrollY - start) / range);
}

/**
 * scrollProgress (0..1) и опционально frameIndex по timelineFrames.
 * setState только из requestAnimationFrame на scroll/resize.
 */
export function useScrollFrame({
  timelineFrames,
  sectionRef,
  enabled = true,
}: Options) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  const rafIdRef = useRef(0);
  const lastRef = useRef({ progress: -1, index: -1 });

  const computeAndCommit = useCallback(() => {
    const scrollY = window.scrollY;
    const innerHeight = window.innerHeight;
    const section = sectionRef?.current;

    const progress =
      section != null
        ? sectionScrollProgress(section, scrollY, innerHeight)
        : documentScrollProgress(scrollY, innerHeight);

    const index =
      timelineFrames != null && timelineFrames > 1
        ? Math.round(progress * (timelineFrames - 1))
        : 0;

    if (
      lastRef.current.progress !== progress ||
      lastRef.current.index !== index
    ) {
      lastRef.current = { progress, index };
      setScrollProgress(progress);
      setFrameIndex(index);
    }
  }, [sectionRef, timelineFrames]);

  useEffect(() => {
    if (!enabled) return;

    const schedule = () => {
      if (rafIdRef.current !== 0) return;
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = 0;
        computeAndCommit();
      });
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule, { passive: true });
    schedule();

    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (rafIdRef.current !== 0) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = 0;
      }
    };
  }, [computeAndCommit, enabled]);

  return {
    frameIndex,
    frameLabel: String(frameIndex + 1).padStart(3, "0"),
    scrollProgress,
  };
}
