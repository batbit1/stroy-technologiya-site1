"use client";

import type { SceneCard as SceneCardData } from "@/data/siteContent";

type Props = {
  card: SceneCardData;
  progress01?: number;
};

// ─── Physical scroll-driven motion ────────────────────────────────────────────

/**
 * TRAVEL_PX = total vertical arc across the card's scroll window.
 *
 * The panel enters +HALF below the reading base, rises linearly
 * to -HALF above it as the user scrolls. At the window midpoint
 * the panel is exactly at its base (comfortable reading position).
 *
 * With window=0.16 and range=800vh:
 *   travel rate ≈ 140px / 128vh ≈ 1.09px/vh — imperceptibly slow,
 *   but physically tied to scroll. Pure cinematic drift.
 */
const TRAVEL_PX = 140;

/**
 * Fraction of the window used for opacity/blur fade at each edge.
 * 12% in → 76% crystal-clear reading → 12% out.
 */
const FADE = 0.12;

interface VisState {
  opacity: number;
  ty:      number;   // translateY (px) — linear with scroll, no jumps
  blur:    number;   // soft veil only at edges
}

function easeOut2(t: number): number {
  const c = Math.max(0, Math.min(1, t));
  return 1 - (1 - c) * (1 - c);
}

/**
 * Compute visual state from scroll progress.
 *
 * Y moves CONTINUOUSLY and LINEARLY throughout the window.
 * The panel physically rises with the scroll — no stable/frozen phase.
 * Opacity/blur gate visibility at entry and exit edges only.
 */
function fromProgress(p: number, start: number, end: number): VisState {
  const HALF = TRAVEL_PX * 0.5;

  // Outside window: invisible, parked at approach position
  if (p < start) return { opacity: 0, ty:  HALF, blur: 5 };
  if (p > end)   return { opacity: 0, ty: -HALF, blur: 5 };

  const t = (p - start) / (end - start); // linear 0..1

  // Continuous upward travel: +70px → 0 → −70px
  const ty = HALF * (1 - 2 * t);

  // Opacity edges
  let opacity: number;
  if      (t < FADE)     opacity = easeOut2(t / FADE);
  else if (t > 1 - FADE) opacity = easeOut2((1 - t) / FADE);
  else                   opacity = 1;

  // Blur edges — soften at entry / exit, clear in reading zone
  let blur: number;
  if      (t < FADE)     blur = 5 * (1 - easeOut2(t / FADE));
  else if (t > 1 - FADE) blur = 5 * (1 - easeOut2((1 - t) / FADE));
  else                   blur = 0;

  return { opacity, ty, blur };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SceneCard({ card, progress01 }: Props) {
  const vis: VisState =
    typeof progress01 === "number"
      ? fromProgress(progress01, card.startProgress, card.endProgress)
      : { opacity: 1, ty: 0, blur: 0 };

  const { opacity, ty, blur } = vis;

  /**
   * visibility:hidden when opacity=0 disables backdrop-filter on invisible
   * panels — the only reliable way to prevent ghost blur-stacking.
   */
  const isHidden = opacity < 0.02;

  /**
   * ONE FIXED READING ZONE — outer div is the positional anchor (never moves).
   * Inner article carries the scroll-driven translateY.
   *
   * Desktop: base at bottom:72px / left:64px
   *   Entry  → effective bottom ≈ 2px  (rises from just above screen edge)
   *   Center → effective bottom = 72px  (reading sweet spot)
   *   Exit   → effective bottom ≈ 142px (drifts into upper composition)
   *
   * Mobile: bottom:16px, full-width with 16px margins
   */
  return (
    <div
      className={[
        // Mobile: full-width bottom sheet
        "absolute bottom-4 left-4 right-4",
        // Desktop: left-anchored editorial panel
        "lg:bottom-[72px] lg:left-16 lg:right-auto",
      ].join(" ")}
      style={{ visibility: isHidden ? "hidden" : "visible" }}
      aria-hidden={isHidden ? true : undefined}
    >
      <article
        style={{
          opacity,
          transform:            `translateY(${ty.toFixed(2)}px)`,
          ...(blur > 0.05 ? { filter: `blur(${blur.toFixed(2)}px)` } : {}),
          willChange:           "opacity, transform, filter",
          backdropFilter:       "blur(26px) saturate(118%)",
          WebkitBackdropFilter: "blur(26px) saturate(118%)",
        }}
        className={[
          "relative w-full overflow-hidden",
          // Desktop width: luxury editorial panel
          "lg:w-[720px] xl:w-[780px] 2xl:w-[820px]",
          // Shape
          "rounded-[24px] lg:rounded-[32px]",
          // Warm parchment — opaque enough to read over any house frame
          "bg-[rgba(248,242,235,0.82)]",
          // Clean white border
          "border border-[rgba(255,255,255,0.36)]",
          // Layered cinematic shadow
          "shadow-[0_2px_8px_rgba(44,40,36,0.05),0_10px_36px_-6px_rgba(44,40,36,0.13),0_40px_80px_-20px_rgba(44,40,36,0.09),inset_0_1px_0_rgba(255,252,245,0.86)]",
          // Generous editorial padding
          "p-6 lg:p-10 xl:p-12",
        ].join(" ")}
      >
        {/* Subtle inner top warmth */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 rounded-t-[inherit]"
          style={{
            height:     "72px",
            background: "linear-gradient(to bottom, rgba(255,252,242,0.28) 0%, transparent 100%)",
          }}
        />

        {/* Eyebrow */}
        <p className="relative font-sans text-[10px] lg:text-[11px] font-semibold uppercase tracking-[0.36em] text-ink/38">
          {card.eyebrow}
        </p>

        {/* Title — luxury serif, editorial scale */}
        <h3
          className="relative mt-3 lg:mt-4 font-display font-semibold"
          style={{
            fontSize:      "clamp(1.875rem, 4.5vw, 4.25rem)",
            lineHeight:    1.04,
            letterSpacing: "-0.02em",
            color:         "#1a1714",
          }}
        >
          {card.title}
        </h3>

        {/* Description */}
        <p
          className="relative font-sans text-ink/78"
          style={{
            marginTop:  "clamp(12px, 1.2vw, 18px)",
            fontSize:   "clamp(1rem, 1.2vw, 1.2rem)",
            lineHeight: 1.72,
            maxWidth:   "560px",
          }}
        >
          {card.text}
        </p>

        {listSeparatorVisible(card) && (
          <div
            aria-hidden
            className="relative border-t border-ink/[0.08]"
            style={{ marginTop: "clamp(16px, 1.6vw, 24px)" }}
          />
        )}

        {/* Feature points — title + description, без нумерации (все пункты на mobile) */}
        {featurePointsList(card).length > 0 && (
          <>
            <ul
              className="lg:hidden"
              style={{ marginTop: "clamp(12px, 1.2vw, 16px)" }}
              aria-label="Преимущества"
            >
              {featurePointsList(card).map((fp, i, arr) => (
                <li
                  key={`${card.id}-fp-m-${i}`}
                  className="border-b border-ink/[0.06] font-sans last:border-b-0"
                  style={{
                    paddingBottom: i < arr.length - 1 ? "clamp(16px, 4vw, 20px)" : 0,
                  }}
                >
                  <p
                    className="text-ink/[0.88] font-medium"
                    style={{ fontSize: "0.9375rem", lineHeight: 1.35 }}
                  >
                    {fp.title}
                  </p>
                  <p
                    className="mt-1.5 text-ink/64"
                    style={{ fontSize: "0.875rem", lineHeight: 1.65 }}
                  >
                    {fp.description}
                  </p>
                </li>
              ))}
            </ul>
            <ul
              className="hidden lg:grid grid-cols-2"
              style={{
                marginTop: "clamp(12px, 1.4vw, 18px)",
                gap: "clamp(14px, 1.4vw, 20px) clamp(24px, 2.4vw, 40px)",
              }}
              aria-label="Преимущества"
            >
              {featurePointsList(card).map((fp, i) => (
                <li
                  key={`${card.id}-fp-d-${i}`}
                  className="border-b border-ink/[0.06] pb-4 font-sans lg:border-0 lg:pb-0"
                >
                  <p
                    className="text-ink/[0.88] font-medium"
                    style={{ fontSize: "clamp(0.9rem, 0.95vw, 1.05rem)", lineHeight: 1.38 }}
                  >
                    {fp.title}
                  </p>
                  <p
                    className="mt-1.5 text-ink/62"
                    style={{
                      fontSize: "clamp(0.8125rem, 0.88vw, 0.9375rem)",
                      lineHeight: 1.66,
                    }}
                  >
                    {fp.description}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Items — mobile (max 4) */}
        {simpleItemsVisible(card) && mobileItems(card).length > 0 && (
          <ul className="lg:hidden" style={{ marginTop: "12px" }} aria-label="Список">
            {mobileItems(card).map((item, i, arr) => (
              <li
                key={item}
                className="flex items-start gap-3 font-sans text-ink/70"
                style={{ fontSize: "0.975rem", lineHeight: 1.6, paddingBottom: i < arr.length - 1 ? "9px" : 0 }}
              >
                <span className="shrink-0 font-mono text-ink/25 tabular-nums" style={{ fontSize: "9.5px", paddingTop: "0.22em", width: "18px" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Items — desktop (2-col for 4+) */}
        {simpleItemsVisible(card) && desktopItems(card).length > 0 && (
          <ul
            className={["hidden lg:grid", desktopItems(card).length >= 4 ? "grid-cols-2" : "grid-cols-1"].join(" ")}
            style={{ marginTop: "clamp(12px, 1.4vw, 18px)", gap: "clamp(8px, 0.8vw, 12px) clamp(24px, 2.4vw, 40px)" }}
            aria-label="Список"
          >
            {desktopItems(card).map((item, i) => (
              <li
                key={item}
                className="flex items-start gap-3 font-sans text-ink/72"
                style={{ fontSize: "clamp(0.9rem, 0.95vw, 1.05rem)", lineHeight: 1.55 }}
              >
                <span className="shrink-0 font-mono text-ink/25 tabular-nums" style={{ fontSize: "9.5px", paddingTop: "0.28em", width: "18px" }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item}
              </li>
            ))}
          </ul>
        )}
      </article>
    </div>
  );
}

function featurePointsList(card: SceneCardData) {
  return card.featurePoints ?? [];
}

function simpleItemsVisible(card: SceneCardData) {
  return featurePointsList(card).length === 0;
}

function listSeparatorVisible(card: SceneCardData) {
  return featurePointsList(card).length > 0 || desktopItems(card).length > 0;
}

function desktopItems(card: SceneCardData) {
  return simpleItemsVisible(card) ? (card.items ?? []) : [];
}
function mobileItems(card: SceneCardData) {
  return simpleItemsVisible(card) ? (card.items ?? []).slice(0, 4) : [];
}
