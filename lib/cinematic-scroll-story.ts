/**
 * Единый chapter timeline: Hero = глава 0, далее STORY_STEPS[i].
 * Canvas progress01 (0…1) не меняется — маппинг только для overlay.
 * Индекс кадра sequence: hero-hold + delayed start — `lib/sequence-frame-map.ts`.
 */

/** Фазы внутри одной главы: 0–0.28 вход; 0.28–0.82 hold; 0.82–1.0 выход */
export const CHAPTER_ENTER_END = 0.28;
export const CHAPTER_HOLD_END = 0.82;
export const CHAPTER_EXIT_START = 0.82;

export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function getChapterVisibility(local: number): number {
  const enter = smoothstep(0.0, CHAPTER_ENTER_END, local);
  const exit = 1 - smoothstep(CHAPTER_EXIT_START, 1.0, local);
  return Math.min(enter, exit);
}

export type ChapterScrollState = {
  totalChapters: number;
  chapterFloat: number;
  activeChapter: number;
  localChapterProgress: number;
};

const PROGRESS_NEAR_END = 0.999;

/**
 * Равные главы по длине скролла. У конца шкалы — последняя глава с local=1
 * (избегает дрожания индекса).
 */
export function mapScrollToChapters(
  progress01: number,
  storyStepsCount: number,
): ChapterScrollState {
  const totalChapters = storyStepsCount + 1;
  const p = Math.min(1, Math.max(0, progress01));

  if (p >= PROGRESS_NEAR_END) {
    return {
      totalChapters,
      chapterFloat: (totalChapters - 1 + 1),
      activeChapter: totalChapters - 1,
      localChapterProgress: 1,
    };
  }

  const chapterFloat = p * totalChapters;
  const activeChapter = Math.min(
    Math.max(Math.floor(chapterFloat), 0),
    totalChapters - 1,
  );
  const localChapterProgress = chapterFloat - activeChapter;
  return {
    totalChapters,
    chapterFloat,
    activeChapter,
    localChapterProgress,
  };
}

/**
 * Длительности mount-time reveal'а (Hero + Split SceneCopy / visual).
 *
 * Главное правило: текст не должен висеть в blur/полупрозрачном состоянии.
 * Поэтому reveal-анимации короткие (≤ 0.32 c.) — пользователь физически
 * не успевает поймать промежуточный кадр. exit-фаз не используется
 * (старая сцена просто демонтируется при смене activeChapterIndex).
 *
 * Эти константы — time-based, не зависят от scroll progress.
 */
export const CINEMATIC_TEXT_ENTER_S = 0.28;
export const CINEMATIC_TEXT_EXIT_S = 0.08;
export const CINEMATIC_VISUAL_ENTER_S = 0.3;
export const CINEMATIC_VISUAL_EXIT_S = 0.08;
