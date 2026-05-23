"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import {
  resolveMobileKeyframeLogicalIndex as resolveMobileKeyframeLogicalIndexMapped,
  resolveSequenceFrameIndex as resolveSequenceFrameIndexMapped,
} from "@/lib/sequence-frame-map";

const MOBILE_MQ = "(max-width: 767px)";
/** Совпадает с `lg:hidden` ленты mobile cinematic (Tailwind lg = 1024px). */
const CINEMATIC_SCROLL_MOBILE_MQ = "(max-width: 1023px)";
/** Реальный показ скрытых деревьев: desktop sticky активен только ≥lg; mobile cinematic — только <lg. */
const LG_SCROLL_MQ = "(min-width: 1024px)";
const DESKTOP_SEQUENCE_BASE = "/sequence/new-house/desktop";
const MOBILE_SEQUENCE_BASE = "/sequence/new-house/mobile";

/** Гарантированное время (мс) до показа canvas даже без загруженных кадров. */
const CANVAS_REVEAL_TIMEOUT_MS = 1500;

const IS_DEV = process.env.NODE_ENV === "development";

/** Max DPR — чёткость на retina без лишнего расхода памяти. */
const MAX_DPR = 3;

/** Stride через исходные mobile-файлы + потолок логических кадров (≤60). Desktop sticky не использует эти asset при lg+. */
const MOBILE_FRAME_STRIDE = 2;
const MOBILE_FRAME_LOGICAL_CAP = 60;
/** Сколько первых логических кадров ставим в очередь раньше остальных (desktop / не-keyframe mobile). */
const MOBILE_PRELOAD_PRIORITY_FRAMES = 10;

/** Mobile cinematic (≤1023px): ограниченное число логических кадров → меньше decode/draw при скролле. */
const MOBILE_KEYFRAME_COUNT = 9;
/** ~8–9 fps; не чаще одной отрисовки за интервал (гард внутри draw + throttle при постановке в очередь). */
const MOBILE_MIN_DRAW_INTERVAL_MS = 112;

export type SequencePlacement = "desktopSticky" | "mobileCinematic";

export type HouseSequenceCanvasProps = {
  desktopFrames: number;
  mobileFrames: number;
  progress01: number;
  className?: string;
  /**
   * `desktopSticky` — слой только для lg+ видимости; ниже lg не грузим sequence.
   * `mobileCinematic` — только <lg (`lg:hidden`).
   */
  sequencePlacement?: SequencePlacement;
};

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function clampFrameIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, index), total - 1);
}

/** Логический индекс ключевого кадра mobile cinematic [0 .. MOBILE_KEYFRAME_COUNT-1]. */
function resolveMobileKeyframeLogicalIndex(
  progress01: number,
  mobileFrameCount: number,
): number {
  return resolveMobileKeyframeLogicalIndexMapped(
    progress01,
    MOBILE_KEYFRAME_COUNT,
    mobileFrameCount,
  );
}

/** Индекс файла в `/sequence/new-house/mobile` для ключевого кадра. */
function resolveMobileKeyframePhysicalIndex(
  logicalKeyframeIdx: number,
  mobileFrameCount: number,
): number {
  const n = Math.max(1, mobileFrameCount);
  if (n <= 1) return 0;
  const lk = clampFrameIndex(logicalKeyframeIdx, MOBILE_KEYFRAME_COUNT);
  const denom = Math.max(1, MOBILE_KEYFRAME_COUNT - 1);
  return clampFrameIndex(
    Math.round((lk * (n - 1)) / denom),
    n,
  );
}

/** Индексы исходных mobile-фреймов для логических кадров canvas (subsampling по диску). */
function buildMobileLogicalToPhysical(sourceFrameCount: number): number[] {
  const n = Math.max(1, sourceFrameCount);
  if (n <= 1) return [0];
  const indices: number[] = [];
  for (let physical = 0; physical < n; physical += MOBILE_FRAME_STRIDE) {
    indices.push(physical);
  }
  while (indices.length > MOBILE_FRAME_LOGICAL_CAP) {
    indices.pop();
  }
  return indices.length > 0 ? indices : [0];
}

function resolveSequencePaused(
  placement: SequencePlacement,
  lgViewport: boolean,
): boolean {
  return (
    (placement === "desktopSticky" && !lgViewport) ||
    (placement === "mobileCinematic" && lgViewport)
  );
}

function resolveActiveMobileAssets(
  placement: SequencePlacement,
  paused: boolean,
  isMobileLayout767: boolean,
): boolean {
  if (paused) return false;
  if (placement === "mobileCinematic") return true;
  return isMobileLayout767;
}

function resolveLogicalFrameTotal(
  useMobileAssets: boolean,
  mobilePhysicalMapLength: number,
  desktopFrames: number,
): number {
  if (useMobileAssets) return Math.max(1, mobilePhysicalMapLength);
  return Math.max(1, desktopFrames);
}

function prependEarlyLogicalFrames(order: readonly number[], total: number): number[] {
  if (total <= 1) return Array.from(order);
  const headLen = Math.min(MOBILE_PRELOAD_PRIORITY_FRAMES, total);
  const head = Array.from({ length: headLen }, (_, i) => i);
  const seen = new Set(head);
  const tail = order.filter((i) => !seen.has(i));
  return [...head, ...tail];
}

/**
 * Выбор кадра для desktop sequence и mobile subsampled map (вне режима keyframes cinematic).
 * Hero-hold + delayed start — `lib/sequence-frame-map.ts`.
 */
function resolveSequenceFrameIndex(
  progress01: number,
  totalFrames: number,
  reducedMotion: boolean,
  useFloorSoftMobile: boolean,
): number {
  return resolveSequenceFrameIndexMapped(
    progress01,
    totalFrames,
    reducedMotion,
    useFloorSoftMobile,
  );
}

function frameFileName(frameIndexZeroBased: number): string {
  const n = String(frameIndexZeroBased + 1).padStart(4, "0");
  return `frame_${n}.webp`;
}

function sequenceUrl(
  variant: "desktop" | "mobile",
  frameIndexZeroBased: number,
): string {
  const base =
    variant === "desktop" ? DESKTOP_SEQUENCE_BASE : MOBILE_SEQUENCE_BASE;
  return `${base}/${frameFileName(frameIndexZeroBased)}`;
}

function buildPreloadOrder(center: number, total: number): number[] {
  const c = clampFrameIndex(center, total);
  const list: number[] = [];
  const seen = new Set<number>();
  const push = (i: number) => {
    const j = clampFrameIndex(i, total);
    if (seen.has(j)) return;
    seen.add(j);
    list.push(j);
  };

  push(0);
  push(c);
  push(c - 2);
  push(c + 2);
  push(c - 1);
  push(c + 1);

  for (let d = 3; d < total; d++) {
    push(c - d);
    push(c + d);
  }

  for (let i = 0; i < total; i++) push(i);
  return list;
}

function isImageRenderable(img: HTMLImageElement): boolean {
  return img.complete && img.naturalWidth > 0;
}

function pickDisplayImage(
  targetIdx: number,
  total: number,
  images: Map<number, HTMLImageElement>,
): { img: HTMLImageElement; sourceIndex: number } | null {
  const at = (i: number) => {
    const img = images.get(i);
    if (img && isImageRenderable(img)) return { img, sourceIndex: i };
    return null;
  };

  const direct = at(targetIdx);
  if (direct) return direct;

  for (let i = targetIdx - 1; i >= 0; i--) {
    const r = at(i);
    if (r) return r;
  }
  for (let i = targetIdx + 1; i < total; i++) {
    const r = at(i);
    if (r) return r;
  }
  return null;
}

function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
): void {
  const iw = img.naturalWidth;
  const ih = img.naturalHeight;
  if (iw <= 0 || ih <= 0) return;
  const scale = Math.max(cw / iw, ch / ih);
  const dw = iw * scale;
  const dh = ih * scale;
  const dx = (cw - dw) / 2;
  const dy = (ch - dh) / 2;
  ctx.drawImage(img, dx, dy, dw, dh);
}

function drawFallback(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  display: {
    frameLabel: string;
    totalFrames: number;
    progress01: number;
  },
): void {
  const g = ctx.createLinearGradient(0, 0, cw, ch);
  g.addColorStop(0, "#f5f1e8");
  g.addColorStop(0.45, "#ebe4d8");
  g.addColorStop(1, "#ddd4c4");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, cw, ch);

  ctx.save();
  ctx.strokeStyle = "rgba(80, 72, 64, 0.35)";
  ctx.lineWidth = Math.max(1, cw * 0.0025);
  ctx.lineJoin = "round";
  const cx = cw / 2;
  const roofH = ch * 0.12;
  const bodyW = cw * 0.38;
  const bodyH = ch * 0.28;
  const topY = ch * 0.34;
  ctx.beginPath();
  ctx.moveTo(cx, topY - roofH);
  ctx.lineTo(cx + bodyW * 0.62, topY + roofH * 0.15);
  ctx.lineTo(cx - bodyW * 0.62, topY + roofH * 0.15);
  ctx.closePath();
  ctx.stroke();
  ctx.strokeRect(cx - bodyW / 2, topY + roofH * 0.2, bodyW, bodyH);
  const doorW = bodyW * 0.2;
  ctx.strokeRect(
    cx - doorW / 2,
    topY + roofH * 0.2 + bodyH * 0.42,
    doorW,
    bodyH * 0.58,
  );
  ctx.restore();

  ctx.fillStyle = "rgba(44, 40, 36, 0.88)";
  ctx.font = `${Math.max(11, cw * 0.028)}px var(--font-manrope, ui-sans-serif, system-ui)`;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(
    `Frame ${display.frameLabel} / ${display.totalFrames}`,
    cx,
    ch * 0.72,
  );

  const barY = ch * 0.88;
  const barH = Math.max(3, ch * 0.012);
  const barPad = cw * 0.1;
  const barW = cw - barPad * 2;
  ctx.fillStyle = "rgba(80, 72, 64, 0.14)";
  ctx.fillRect(barPad, barY, barW, barH);
  ctx.fillStyle = "rgba(80, 72, 64, 0.38)";
  ctx.fillRect(barPad, barY, barW * clamp01(display.progress01), barH);
}

function subscribeReducedMotion(onChange: () => void): () => void {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getReducedMotionSnapshot(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot(): boolean {
  return false;
}

function subscribeMobileMq(onChange: () => void): () => void {
  const mq = window.matchMedia(MOBILE_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getMobileMqSnapshot(): boolean {
  return window.matchMedia(MOBILE_MQ).matches;
}

function getMobileMqServerSnapshot(): boolean {
  return false;
}

function subscribeCinematicScrollMobile(onChange: () => void): () => void {
  const mq = window.matchMedia(CINEMATIC_SCROLL_MOBILE_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getCinematicScrollMobileSnapshot(): boolean {
  return window.matchMedia(CINEMATIC_SCROLL_MOBILE_MQ).matches;
}

function getCinematicScrollMobileServerSnapshot(): boolean {
  return false;
}

function subscribeLgScrollMq(onChange: () => void): () => void {
  const mq = window.matchMedia(LG_SCROLL_MQ);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getLgScrollSnapshot(): boolean {
  return window.matchMedia(LG_SCROLL_MQ).matches;
}

function getLgScrollServerSnapshot(): boolean {
  return false;
}

export function HouseSequenceCanvas({
  desktopFrames,
  mobileFrames,
  progress01,
  className = "",
  sequencePlacement = "desktopSticky",
}: HouseSequenceCanvasProps) {
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );

  const isMobileLayout = useSyncExternalStore(
    subscribeMobileMq,
    getMobileMqSnapshot,
    getMobileMqServerSnapshot,
  );

  const isCinematicScrollMobile = useSyncExternalStore(
    subscribeCinematicScrollMobile,
    getCinematicScrollMobileSnapshot,
    getCinematicScrollMobileServerSnapshot,
  );

  const isLargeViewport = useSyncExternalStore(
    subscribeLgScrollMq,
    getLgScrollSnapshot,
    getLgScrollServerSnapshot,
  );

  const sequencePaused = resolveSequencePaused(
    sequencePlacement,
    isLargeViewport,
  );

  const mobilePhysMap = useMemo(
    () => buildMobileLogicalToPhysical(Math.max(1, mobileFrames)),
    [mobileFrames],
  );

  const useMobileAssetsActive = resolveActiveMobileAssets(
    sequencePlacement,
    sequencePaused,
    isMobileLayout,
  );

  const mobileKeyframeMode =
    sequencePlacement === "mobileCinematic" &&
    isCinematicScrollMobile &&
    !sequencePaused;

  const totalLive = mobileKeyframeMode
    ? MOBILE_KEYFRAME_COUNT
    : resolveLogicalFrameTotal(
        useMobileAssetsActive,
        mobilePhysMap.length,
        desktopFrames,
      );

  const scrollBlendActive =
    sequencePlacement === "mobileCinematic" &&
    isCinematicScrollMobile &&
    !reducedMotion &&
    !sequencePaused;

  const cinematicMobileFloor = scrollBlendActive;

  const effectiveIdx =
    mobileKeyframeMode && reducedMotion
      ? MOBILE_KEYFRAME_COUNT - 1
      : mobileKeyframeMode
        ? resolveMobileKeyframeLogicalIndex(progress01, mobileFrames)
        : resolveSequenceFrameIndex(
            progress01,
            totalLive,
            reducedMotion,
            cinematicMobileFloor,
          );

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const inFlightRef = useRef<Set<number>>(new Set());

  const variantRef = useRef<"desktop" | "mobile">("desktop");
  const useMobileAssetsRef = useRef(useMobileAssetsActive);
  const reducedMotionRef = useRef(reducedMotion);

  const desktopFramesRef = useRef(desktopFrames);
  const mobileFramesRef = useRef(mobileFrames);
  const progress01Ref = useRef(progress01);
  const totalFramesRef = useRef(1);
  const mobilePhysByLogicalRef = useRef(mobilePhysMap);
  mobilePhysByLogicalRef.current = mobilePhysMap;

  const sequencePausedRef = useRef(sequencePaused);
  const scrollBlendActiveRef = useRef(scrollBlendActive);
  const sequencePlacementRef = useRef(sequencePlacement);
  const mobileKeyframeModeRef = useRef(mobileKeyframeMode);

  sequencePausedRef.current = sequencePaused;
  scrollBlendActiveRef.current = scrollBlendActive;
  useMobileAssetsRef.current = useMobileAssetsActive;
  sequencePlacementRef.current = sequencePlacement;
  mobileKeyframeModeRef.current = mobileKeyframeMode;

  const lastDrawLogicalIdxRef = useRef(Number.NaN);
  const lastMobileDrawWallMsRef = useRef(0);
  const lastPaintWasFallbackRef = useRef(false);
  const mobileDrawThrottleTimerRef = useRef<number | null>(null);

  const preloadGenRef = useRef(0);
  const idleChainRef = useRef(0);
  const rafResizeRef = useRef(0);
  const drawRafRef = useRef(0);

  const canvasBufferRef = useRef({ cssW: 0, cssH: 0, dpr: 0 });
  /** Первая отрисовка (кадр или fallback) для мягкого появления. */
  const hasPaintedOnceRef = useRef(false);

  /** Меняет размер буфера canvas только при смене CSS-размеров или DPR. */
  const fitCanvasIfNeeded = useCallback((): {
    cw: number;
    ch: number;
    ctx: CanvasRenderingContext2D;
    resized: boolean;
  } | null => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;
    const rect = container.getBoundingClientRect();
    const cw = Math.max(1, rect.width);
    const ch = Math.max(1, rect.height);
    const dpr = Math.min(
      MAX_DPR,
      typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1,
    );

    const prev = canvasBufferRef.current;
    const resized =
      prev.cssW !== cw || prev.cssH !== ch || Math.abs(prev.dpr - dpr) > 0.001;

    if (resized) {
      const bw = Math.max(1, Math.round(cw * dpr));
      const bh = Math.max(1, Math.round(ch * dpr));
      canvas.width = bw;
      canvas.height = bh;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      canvasBufferRef.current = { cssW: cw, cssH: ch, dpr };
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    return { cw, ch, ctx, resized };
  }, []);

  const revealCanvas = useCallback(() => {
    const el = canvasLayerRef.current;
    if (!el) return;
    if (hasPaintedOnceRef.current) return;
    hasPaintedOnceRef.current = true;
    el.style.opacity = "1";
    if (IS_DEV) console.log("[HouseSequenceCanvas] canvas revealed");
  }, []);

  const drawScene = useCallback(() => {
    const fitted = fitCanvasIfNeeded();
    if (!fitted) {
      revealCanvas();
      return;
    }
    const { cw, ch, ctx, resized } = fitted;

    if (sequencePausedRef.current) {
      lastDrawLogicalIdxRef.current = Number.NaN;
      ctx.fillStyle = "#f4efe5";
      ctx.fillRect(0, 0, cw, ch);
      revealCanvas();
      return;
    }

    const desktop = desktopFramesRef.current;
    const phyMap = mobilePhysByLogicalRef.current;
    const useM = useMobileAssetsRef.current;
    const mobileKfDraw =
      mobileKeyframeModeRef.current && useM;

    const total = mobileKfDraw
      ? MOBILE_KEYFRAME_COUNT
      : Math.max(
          1,
          resolveLogicalFrameTotal(useM, phyMap.length, desktop),
        );
    totalFramesRef.current = total;

    const progDraw = progress01Ref.current;

    let targetIdx: number;
    if (mobileKfDraw) {
      targetIdx = reducedMotionRef.current
        ? MOBILE_KEYFRAME_COUNT - 1
        : resolveMobileKeyframeLogicalIndex(progDraw, mobileFramesRef.current);
    } else {
      const blendFloor =
        scrollBlendActiveRef.current && !reducedMotionRef.current;
      targetIdx = resolveSequenceFrameIndex(
        progDraw,
        total,
        reducedMotionRef.current,
        blendFloor,
      );
    }

    const mobileScrollLight =
      scrollBlendActiveRef.current &&
      !reducedMotionRef.current &&
      mobileKeyframeModeRef.current;

    let pickedDraw = pickDisplayImage(targetIdx, total, imagesRef.current);

    if (
      mobileScrollLight &&
      pickedDraw === null &&
      Number.isFinite(lastDrawLogicalIdxRef.current)
    ) {
      revealCanvas();
      return;
    }

    const upgradingFromFallback =
      pickedDraw !== null &&
      lastPaintWasFallbackRef.current &&
      lastDrawLogicalIdxRef.current === targetIdx;

    if (
      !resized &&
      lastDrawLogicalIdxRef.current === targetIdx &&
      !upgradingFromFallback
    ) {
      revealCanvas();
      return;
    }

    if (
      mobileScrollLight &&
      !resized &&
      performance.now() - lastMobileDrawWallMsRef.current <
        MOBILE_MIN_DRAW_INTERVAL_MS
    ) {
      revealCanvas();
      return;
    }

    lastDrawLogicalIdxRef.current = targetIdx;

    ctx.fillStyle = "#f4efe5";
    ctx.fillRect(0, 0, cw, ch);

    pickedDraw = pickDisplayImage(targetIdx, total, imagesRef.current);

    if (pickedDraw) {
      drawImageCover(ctx, pickedDraw.img, cw, ch);
      lastPaintWasFallbackRef.current = false;
    } else {
      const frameLabel = String(targetIdx + 1).padStart(4, "0");
      drawFallback(ctx, cw, ch, {
        frameLabel,
        totalFrames: total,
        progress01: progDraw,
      });
      lastPaintWasFallbackRef.current = true;
    }

    if (mobileScrollLight) {
      lastMobileDrawWallMsRef.current = performance.now();
    }

    revealCanvas();
  }, [fitCanvasIfNeeded, revealCanvas]);

  const scheduleMobileCinematicDraw = useCallback(() => {
    if (mobileDrawThrottleTimerRef.current !== null) return;

    const delay = Math.max(
      0,
      MOBILE_MIN_DRAW_INTERVAL_MS -
        (performance.now() - lastMobileDrawWallMsRef.current),
    );

    mobileDrawThrottleTimerRef.current = window.setTimeout(() => {
      mobileDrawThrottleTimerRef.current = null;
      drawScene();
    }, delay);
  }, [drawScene]);

  const scheduleDraw = useCallback(() => {
    if (
      scrollBlendActiveRef.current &&
      !reducedMotionRef.current &&
      mobileKeyframeModeRef.current
    ) {
      scheduleMobileCinematicDraw();
      return;
    }
    if (drawRafRef.current !== 0) return;
    drawRafRef.current = requestAnimationFrame(() => {
      drawRafRef.current = 0;
      drawScene();
    });
  }, [drawScene, scheduleMobileCinematicDraw]);

  const beginLoadFrame = useCallback(
    (i: number, generation: number) => {
      const total = Math.max(1, totalFramesRef.current);
      if (i < 0 || i >= total) return;
      if (imagesRef.current.has(i) || inFlightRef.current.has(i)) return;

      inFlightRef.current.add(i);
      const useM = useMobileAssetsRef.current;
      const map = mobilePhysByLogicalRef.current;
      const mobileKf = mobileKeyframeModeRef.current;
      let phys: number;
      if (useM && mobileKf) {
        phys = resolveMobileKeyframePhysicalIndex(i, mobileFramesRef.current);
      } else if (useM && map.length > 0) {
        phys = map[clampFrameIndex(i, map.length)]!;
      } else {
        phys = i;
      }
      const seqVariant: "desktop" | "mobile" = useM ? "mobile" : "desktop";
      const url = sequenceUrl(seqVariant, phys);
      if (IS_DEV && i === 0)
        console.log("[HouseSequenceCanvas] first frame url", url);
      const img = new Image();
      img.decoding = "async";

      const finish = () => {
        inFlightRef.current.delete(i);
        if (generation !== preloadGenRef.current) return;
        if (img.naturalWidth > 0) {
          imagesRef.current.set(i, img);
          if (IS_DEV && i === 0)
            console.log("[HouseSequenceCanvas] first frame loaded");
        }
        scheduleDraw();
      };

      img.onload = finish;
      img.onerror = () => {
        inFlightRef.current.delete(i);
        console.warn("[HouseSequenceCanvas] failed frame", url);
        if (generation !== preloadGenRef.current) return;
        scheduleDraw();
      };
      img.src = url;
    },
    [scheduleDraw],
  );

  const runPreloadIdle = useCallback(
    (indices: readonly number[], generation: number, startFrom: number) => {
      const chainId = ++idleChainRef.current;
      let pos = startFrom;

      const step = () => {
        if (chainId !== idleChainRef.current) return;
        if (generation !== preloadGenRef.current) return;

        let batch = 0;
        const batchMax =
          mobileKeyframeModeRef.current && scrollBlendActiveRef.current
            ? 1
            : scrollBlendActiveRef.current
              ? 2
              : 4;
        while (pos < indices.length && batch < batchMax) {
          const i = indices[pos]!;
          if (!imagesRef.current.has(i) && !inFlightRef.current.has(i)) {
            beginLoadFrame(i, generation);
            batch += 1;
          }
          pos += 1;
        }

        if (pos >= indices.length) return;

        if (typeof window.requestIdleCallback === "function") {
          window.requestIdleCallback(() => step(), { timeout: 800 });
        } else {
          window.setTimeout(step, 24);
        }
      };

      step();
    },
    [beginLoadFrame],
  );

  const kickPreload = useCallback(
    (center: number) => {
      if (sequencePausedRef.current) return;

      const generation = preloadGenRef.current;
      const total = Math.max(1, totalFramesRef.current);
      const c = clampFrameIndex(center, total);

      if (mobileKeyframeModeRef.current) {
        const order = Array.from({ length: MOBILE_KEYFRAME_COUNT }, (_, i) => i).sort(
          (a, b) => Math.abs(a - c) - Math.abs(b - c),
        );
        const priority = Math.min(MOBILE_PRELOAD_PRIORITY_FRAMES, order.length);
        for (let k = 0; k < priority; k++) {
          beginLoadFrame(order[k]!, generation);
        }
        runPreloadIdle(order, generation, priority);
        return;
      }

      let order = buildPreloadOrder(c, total);
      if (
        sequencePlacementRef.current === "mobileCinematic" &&
        total > 1
      ) {
        order = prependEarlyLogicalFrames(order, total);
      }

      const priority = Math.min(MOBILE_PRELOAD_PRIORITY_FRAMES, order.length);
      for (let k = 0; k < priority; k++) {
        beginLoadFrame(order[k]!, generation);
      }
      runPreloadIdle(order, generation, priority);
    },
    [beginLoadFrame, runPreloadIdle],
  );

  const clearCache = useCallback(() => {
    preloadGenRef.current += 1;
    idleChainRef.current += 1;
    imagesRef.current.clear();
    inFlightRef.current.clear();
    lastDrawLogicalIdxRef.current = Number.NaN;
    lastPaintWasFallbackRef.current = false;
    if (mobileDrawThrottleTimerRef.current !== null) {
      clearTimeout(mobileDrawThrottleTimerRef.current);
      mobileDrawThrottleTimerRef.current = null;
    }
  }, []);

  useLayoutEffect(() => {
    desktopFramesRef.current = desktopFrames;
    mobileFramesRef.current = mobileFrames;
    progress01Ref.current = progress01;
    reducedMotionRef.current = reducedMotion;

    mobilePhysByLogicalRef.current = mobilePhysMap;

    const useM = resolveActiveMobileAssets(
      sequencePlacement,
      sequencePaused,
      isMobileLayout,
    );
    useMobileAssetsRef.current = useM;
    variantRef.current = useM ? "mobile" : "desktop";

    const total = mobileKeyframeMode
      ? MOBILE_KEYFRAME_COUNT
      : resolveLogicalFrameTotal(
          useM,
          mobilePhysMap.length,
          desktopFrames,
        );
    totalFramesRef.current = total;

    if (scrollBlendActive && !reducedMotion) {
      if (!hasPaintedOnceRef.current) {
        drawScene();
      } else {
        scheduleMobileCinematicDraw();
      }
    } else {
      drawScene();
    }
  }, [
    desktopFrames,
    mobileFrames,
    progress01,
    reducedMotion,
    isMobileLayout,
    isCinematicScrollMobile,
    sequencePlacement,
    sequencePaused,
    scrollBlendActive,
    mobileKeyframeMode,
    drawScene,
    scheduleMobileCinematicDraw,
  ]);

  const configKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${sequencePlacement}:${Boolean(isLargeViewport)}:${useMobileAssetsActive}:${desktopFrames}:${mobileFrames}`;

    if (configKeyRef.current !== key) {
      if (configKeyRef.current !== null) {
        clearCache();
      }
      configKeyRef.current = key;
    }

    kickPreload(effectiveIdx);
    scheduleDraw();
  }, [
    sequencePlacement,
    isLargeViewport,
    useMobileAssetsActive,
    desktopFrames,
    mobileFrames,
    effectiveIdx,
    clearCache,
    kickPreload,
    scheduleDraw,
  ]);

  useEffect(() => {
    const onResize = () => {
      if (rafResizeRef.current !== 0) return;
      rafResizeRef.current = requestAnimationFrame(() => {
        rafResizeRef.current = 0;
        drawScene();
      });
    };
    window.addEventListener("resize", onResize, { passive: true });
    const el = containerRef.current;
    let ro: ResizeObserver | null = null;
    if (el && typeof ResizeObserver === "function") {
      ro = new ResizeObserver(() => onResize());
      ro.observe(el);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      ro?.disconnect();
      if (rafResizeRef.current !== 0) {
        cancelAnimationFrame(rafResizeRef.current);
        rafResizeRef.current = 0;
      }
      if (drawRafRef.current !== 0) {
        cancelAnimationFrame(drawRafRef.current);
        drawRafRef.current = 0;
      }
      if (mobileDrawThrottleTimerRef.current !== null) {
        clearTimeout(mobileDrawThrottleTimerRef.current);
        mobileDrawThrottleTimerRef.current = null;
      }
    };
  }, [drawScene]);

  // Timeout-fallback (1.5s): снять opacity-0 со слоя и перерисовать fallback/кадр,
  // даже если первый reveal застрял (ref null и т.п.).
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const el = canvasLayerRef.current;
      if (el) el.style.opacity = "1";
      if (IS_DEV && !hasPaintedOnceRef.current) {
        console.warn(
          "[HouseSequenceCanvas] reveal timeout — layer forced visible + redraw",
        );
      }
      scheduleDraw();
      revealCanvas();
    }, CANVAS_REVEAL_TIMEOUT_MS);

    return () => window.clearTimeout(timer);
  }, [revealCanvas, scheduleDraw]);

  useEffect(() => {
    return () => {
      if (drawRafRef.current !== 0) {
        cancelAnimationFrame(drawRafRef.current);
      }
      if (rafResizeRef.current !== 0) {
        cancelAnimationFrame(rafResizeRef.current);
      }
      clearCache();
    };
  }, [clearCache]);

  return (
    <div
      ref={containerRef}
      className={[
        "relative isolate h-full min-h-0 w-full overflow-hidden bg-[var(--sequence-scene-bg,#f3efe6)]",
        className,
      ].join(" ")}
      data-sequence-frame={effectiveIdx}
      data-sequence-total={totalLive}
    >
      <div
        ref={canvasLayerRef}
        className="absolute inset-0 motion-reduce:!opacity-100"
        style={{ opacity: 0, transition: "opacity 700ms cubic-bezier(0.22,1,0.36,1)" }}
        aria-hidden
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 block h-full w-full max-h-none max-w-none"
          aria-label={
            reducedMotion
              ? `Финальный статичный кадр последовательности (${totalLive} кадров)`
              : `Кадр последовательности дома: ${effectiveIdx + 1} из ${totalLive}`
          }
          role="img"
        />
      </div>
    </div>
  );
}
