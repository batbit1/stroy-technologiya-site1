/**
 * Cinematic chapter timeline для overlay-сцен (Hero + STORY_STEPS).
 *
 * Модель: ONE-SCENE-AT-A-TIME, без scroll-driven промежуточных состояний.
 *
 * - Hero = chapter 0, STORY_STEPS[i] = chapter (i + 1).
 *   totalChapters = STORY_STEPS.length + 1. Главы равной длины.
 * - raw = clamp01(progress01) * totalChapters.
 * - activeChapterIndex = floor(raw), clamped to [0, totalChapters − 1].
 * - localProgress = raw − activeChapterIndex ∈ [0, 1].
 *
 * Между сценами никаких scroll-driven blur'ов, opacity-ramp'ов или x-сдвигов
 * быть не должно. Активная глава либо полностью видима (visibility = 1) и
 * рендерится, либо её нет в DOM. Mount-time enter-анимация управляется
 * самим компонентом сцены (time-based, ~0.22–0.32 c.), не зависит от scroll
 * и завершается, даже если пользователь остановил прокрутку.
 *
 * Canvas работает от progress01 напрямую — система оверлеев на него не влияет.
 */

export function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

/** Стандартный smoothstep между edge0 и edge1. */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

/** Smoothstep на нормированном [0..1]. */
export function smoothstep01(t: number): number {
  return smoothstep(0, 1, t);
}

/** undefined / null / NaN / out-of-range → 0..1. Используется на первом рендере. */
export function safeProgress01(progress: number | null | undefined): number {
  if (typeof progress !== "number") return 0;
  return clamp01(progress);
}

/**
 * raw = clamp01(progress01) * totalChapters. Целая часть = activeChapterIndex,
 * дробная = localProgress в пределах активного сегмента.
 */
export function chapterRaw(
  progress01: number,
  totalChapters: number,
): number {
  if (totalChapters <= 0) return 0;
  return safeProgress01(progress01) * totalChapters;
}

export type ChapterTiming = {
  /**
   * Активная глава (единственная видимая): floor(raw), clamped to
   * [0, totalChapters − 1]. На progress01 = 0 → 0 (Hero активен).
   */
  chapterIndex: number;
  /**
   * Локальный прогресс внутри активного сегмента (0..1). Используется
   * только для диагностики/aria — визуальный рендер сцены от него не зависит.
   */
  local: number;
  /** raw = progress01 * totalChapters. */
  raw: number;
};

/**
 * Активная глава и локальный прогресс внутри её сегмента.
 *
 * - chapterIndex = floor(raw), clamped to [0, totalChapters − 1].
 * - localProgress = raw − chapterIndex.
 *
 * На progress01 = 0 → chapterIndex = 0, local = 0 (Hero активен).
 * На progress01 = 1 → chapterIndex = totalChapters − 1, local = 1.
 */
export function getChapterTiming(
  progress01: number,
  totalChapters: number,
): ChapterTiming {
  if (totalChapters <= 0) {
    return { chapterIndex: 0, local: 0, raw: 0 };
  }
  const raw = chapterRaw(progress01, totalChapters);
  let chapterIndex = Math.floor(raw);
  if (chapterIndex >= totalChapters) chapterIndex = totalChapters - 1;
  if (chapterIndex < 0) chapterIndex = 0;
  const local = clamp01(raw - chapterIndex);
  return { chapterIndex, local, raw };
}

/**
 * Бинарная visibility конкретной главы.
 *
 *   chapterIndex === activeChapterIndex → 1 (рендерится, mount-time enter
 *                                            проигрывает сам компонент).
 *   иначе                                → 0 (глава не рендерится).
 *
 * Никаких промежуточных значений между 0 и 1: scroll-driven blur/opacity
 * на оверлее запрещён by design — пользователь не может поймать сцену
 * в полупрозрачном состоянии.
 */
export function getChapterVisibility(
  chapterIndex: number,
  progress01: number,
  totalChapters: number,
): number {
  if (totalChapters <= 0) return chapterIndex === 0 ? 1 : 0;
  const { chapterIndex: active } = getChapterTiming(progress01, totalChapters);
  return chapterIndex === active ? 1 : 0;
}

/**
 * Локальный прогресс конкретной главы (0..1).
 * - Активная глава: фактический local внутри её сегмента.
 * - Главы до активной: 1 (уже прошли).
 * - Главы после активной: 0 (ещё не наступили).
 */
export function getChapterLocal(
  chapterIndex: number,
  progress01: number,
  totalChapters: number,
): number {
  if (totalChapters <= 0) return 0;
  const { chapterIndex: active, local } = getChapterTiming(
    progress01,
    totalChapters,
  );
  if (chapterIndex === active) return local;
  if (chapterIndex < active) return 1;
  return 0;
}

/** Активная глава (floor-based). Полезно для aria/debug. */
export function getActiveChapterIndex(
  progress01: number,
  totalChapters: number,
): number {
  return getChapterTiming(progress01, totalChapters).chapterIndex;
}
