/**
 * Единая motion-система лендинга: cinematic / luxury / editorial.
 *
 * Принципы: transform + opacity (+ умеренный blur), общий easing, stagger,
 * без spring/bounce и без избыточной анимации width/height.
 *
 * Связано с `:root` в `app/globals.css` (`--motion-*-ms`).
 */

/** Framer Motion + общий редакторский easing (decelerate, «дорого»). */
export const EASE_LUXURY: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

/** CSS `transition` / `animation` timing-function. */
export const EASE_LUXURY_CSS = "cubic-bezier(0.22, 1, 0.36, 1)";

/** То же без пробелов — удобно для строковых шаблонов. */
export const EASE_LUXURY_CSS_COMPACT = "cubic-bezier(0.22,1,0.36,1)";

/**
 * Длительности в секундах (Framer `duration`).
 * Диапазоны из брифа: micro 250–350, section 700–1000, hero title 900–1200,
 * card 600–900.
 */
export const MOTION_DURATION_S = {
  micro: 0.3,
  card: 0.76,
  section: 0.84,
  heroTitle: 1.06,
  lineReveal: 0.72,
  /** `prefers-reduced-motion`: короткий fade без blur */
  reduced: 0.12,
} as const;

/** Миллисекунды — CSS inline, задержки колонок, stagger. */
export const MOTION_DURATION_MS = {
  micro: Math.round(MOTION_DURATION_S.micro * 1000),
  card: Math.round(MOTION_DURATION_S.card * 1000),
  section: Math.round(MOTION_DURATION_S.section * 1000),
  heroTitle: Math.round(MOTION_DURATION_S.heroTitle * 1000),
  lineReveal: Math.round(MOTION_DURATION_S.lineReveal * 1000),
  reduced: Math.round(MOTION_DURATION_S.reduced * 1000),
  staggerPortfolio: 80,
  staggerFormFields: 100,
  contactFormLead: 140,
  /** Вертикальный индикатор глав — следует скроллу, чуть медленнее карточки */
  scrollSpine: 980,
} as const;

/** Stagger hero: meta → заголовок (построчно) → подзаголовок → CTA (0.08–0.14 s). */
export const HERO_STAGGER_S = {
  mobileStep: 0.105,
  desktopStep: 0.118,
} as const;

/** Stagger контента LuxuryStoryCard (сек.), коррелируется с задержками буллетов. */
export const STORY_STAGGER_S = {
  bullet: 0.085,
} as const;

export function framerTransition(
  durationSec: number,
  delaySec = 0,
  reducedFx: boolean,
) {
  return {
    duration: reducedFx ? MOTION_DURATION_S.reduced : durationSec,
    ease: EASE_LUXURY,
    delay: reducedFx ? 0 : delaySec,
  };
}
