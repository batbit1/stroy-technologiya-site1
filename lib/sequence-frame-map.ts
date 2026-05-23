/**
 * Маппинг scroll progress → индекс кадра house sequence.
 * Overlay (главы, hero) использует сырой progress01 — меняется только canvas.
 */

/** Доля скролла (0…1), где canvas держит статичный premium hero-кадр. */
export const SEQUENCE_HERO_DEAD_ZONE = 0.1;

/** Индекс статичного hero-кадра (0-based) ≈ frame_0010.webp */
export const SEQUENCE_HERO_STATIC_FRAME_INDEX = 9;

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function clampFrameIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, index), total - 1);
}

/** true, пока sequence должен оставаться на hero-кадре. */
export function isInSequenceHeroDeadZone(progress01: number): boolean {
  return clamp01(progress01) < SEQUENCE_HERO_DEAD_ZONE;
}

/** Remap (deadZone…1] → (0…1] для анимации после hero-hold. */
export function remapProgressAfterHeroHold(progress01: number): number {
  const p = clamp01(progress01);
  if (p <= SEQUENCE_HERO_DEAD_ZONE) return 0;
  return (p - SEQUENCE_HERO_DEAD_ZONE) / (1 - SEQUENCE_HERO_DEAD_ZONE);
}

/**
 * Desktop / mobile subsampled sequence: hero-hold + плавная интерполяция.
 * На границе dead-zone (p = 0.1) возвращает тот же hero-кадр — без скачка.
 */
export function resolveSequenceFrameIndex(
  progress01: number,
  totalFrames: number,
  reducedMotion: boolean,
  useFloorSoftMobile: boolean,
): number {
  const total = Math.max(1, totalFrames);
  if (reducedMotion) return total - 1;
  if (total <= 1) return 0;

  const heroFrame = clampFrameIndex(SEQUENCE_HERO_STATIC_FRAME_INDEX, total);

  if (isInSequenceHeroDeadZone(progress01)) {
    return heroFrame;
  }

  const t = remapProgressAfterHeroHold(progress01);
  const end = total - 1;
  const scaled = heroFrame + t * (end - heroFrame);

  if (useFloorSoftMobile) {
    return clampFrameIndex(Math.floor(scaled), total);
  }
  return clampFrameIndex(Math.round(scaled), total);
}

/** Логический keyframe mobile cinematic, соответствующий hero static frame. */
export function resolveHeroStaticKeyframeLogical(
  mobileFrameCount: number,
  keyframeCount: number,
): number {
  const k = Math.max(1, keyframeCount);
  if (k <= 1) return 0;
  const n = Math.max(1, mobileFrameCount);
  const targetPhysical = clampFrameIndex(
    SEQUENCE_HERO_STATIC_FRAME_INDEX,
    n,
  );
  const denom = Math.max(1, k - 1);
  return clampFrameIndex(
    Math.round((targetPhysical * denom) / Math.max(1, n - 1)),
    k,
  );
}

/** Mobile cinematic keyframes (≤9 логических кадров) с тем же hero-hold. */
export function resolveMobileKeyframeLogicalIndex(
  progress01: number,
  keyframeCount: number,
  mobileFrameCount: number,
): number {
  const k = Math.max(1, keyframeCount);
  if (k <= 1) return 0;

  const heroLogical = resolveHeroStaticKeyframeLogical(mobileFrameCount, k);

  if (isInSequenceHeroDeadZone(progress01)) {
    return heroLogical;
  }

  const t = remapProgressAfterHeroHold(progress01);
  const end = k - 1;
  const scaled = heroLogical + t * (end - heroLogical);
  return clampFrameIndex(Math.floor(scaled), k);
}
