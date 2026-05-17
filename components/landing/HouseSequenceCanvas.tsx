"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useSyncExternalStore,
} from "react";

const MOBILE_MQ = "(max-width: 767px)";
const DESKTOP_SEQUENCE_BASE = "/sequence/new-house/desktop";
const MOBILE_SEQUENCE_BASE = "/sequence/new-house/mobile";

/** Гарантированное время (мс) до показа canvas даже без загруженных кадров. */
const CANVAS_REVEAL_TIMEOUT_MS = 1500;

const IS_DEV = process.env.NODE_ENV === "development";

/** Max DPR — чёткость на retina без лишнего расхода памяти. */
const MAX_DPR = 3;

export type HouseSequenceCanvasProps = {
  desktopFrames: number;
  mobileFrames: number;
  progress01: number;
  className?: string;
};

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function clampFrameIndex(index: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(0, index), total - 1);
}

function resolveTotal(
  isMobile: boolean,
  desktopFrames: number,
  mobileFrames: number,
): number {
  return Math.max(1, isMobile ? mobileFrames : desktopFrames);
}

/** Целевой кадр из progress; индекс 0..total-1 */
function targetFrameFromProgress(
  progress01: number,
  totalFrames: number,
  reducedMotion: boolean,
): number {
  const total = Math.max(1, totalFrames);
  if (reducedMotion) return total - 1;
  if (total <= 1) return 0;
  return Math.round(clamp01(progress01) * (total - 1));
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

export function HouseSequenceCanvas({
  desktopFrames,
  mobileFrames,
  progress01,
  className = "",
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

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasLayerRef = useRef<HTMLDivElement>(null);

  const imagesRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const inFlightRef = useRef<Set<number>>(new Set());

  const variantRef = useRef<"desktop" | "mobile">("desktop");
  const reducedMotionRef = useRef(reducedMotion);

  const desktopFramesRef = useRef(desktopFrames);
  const mobileFramesRef = useRef(mobileFrames);
  const progress01Ref = useRef(progress01);
  const totalFramesRef = useRef(1);

  const totalLive = resolveTotal(isMobileLayout, desktopFrames, mobileFrames);

  const effectiveIdx = targetFrameFromProgress(
    progress01,
    totalLive,
    reducedMotion,
  );

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

    return { cw, ch, ctx };
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
      // Контейнер ещё не получил размеры — показываем фон и раскрываем canvas.
      revealCanvas();
      return;
    }
    const { cw, ch, ctx } = fitted;

    const total = Math.max(
      1,
      resolveTotal(
        isMobileLayout,
        desktopFramesRef.current,
        mobileFramesRef.current,
      ),
    );
    totalFramesRef.current = total;

    const targetIdx = targetFrameFromProgress(
      progress01Ref.current,
      total,
      reducedMotionRef.current,
    );

    ctx.fillStyle = "#f4efe5";
    ctx.fillRect(0, 0, cw, ch);

    const picked = pickDisplayImage(targetIdx, total, imagesRef.current);

    if (picked) {
      drawImageCover(ctx, picked.img, cw, ch);
    } else {
      const frameLabel = String(targetIdx + 1).padStart(4, "0");
      drawFallback(ctx, cw, ch, {
        frameLabel,
        totalFrames: total,
        progress01: progress01Ref.current,
      });
    }

    revealCanvas();
  }, [fitCanvasIfNeeded, isMobileLayout, revealCanvas]);

  const scheduleDraw = useCallback(() => {
    if (drawRafRef.current !== 0) return;
    drawRafRef.current = requestAnimationFrame(() => {
      drawRafRef.current = 0;
      drawScene();
    });
  }, [drawScene]);

  const beginLoadFrame = useCallback(
    (i: number, generation: number) => {
      const total = Math.max(1, totalFramesRef.current);
      if (i < 0 || i >= total) return;
      if (imagesRef.current.has(i) || inFlightRef.current.has(i)) return;

      inFlightRef.current.add(i);
      const url = sequenceUrl(variantRef.current, i);
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
        while (pos < indices.length && batch < 4) {
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
      const generation = preloadGenRef.current;
      const total = Math.max(1, totalFramesRef.current);
      const c = clampFrameIndex(center, total);
      const order = buildPreloadOrder(c, total);

      const priority = 6;
      for (let k = 0; k < Math.min(priority, order.length); k++) {
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
  }, []);

  useLayoutEffect(() => {
    desktopFramesRef.current = desktopFrames;
    mobileFramesRef.current = mobileFrames;
    progress01Ref.current = progress01;
    reducedMotionRef.current = reducedMotion;
    variantRef.current = isMobileLayout ? "mobile" : "desktop";
    totalFramesRef.current = resolveTotal(
      isMobileLayout,
      desktopFrames,
      mobileFrames,
    );
    drawScene();
  }, [
    desktopFrames,
    mobileFrames,
    progress01,
    reducedMotion,
    isMobileLayout,
    drawScene,
  ]);

  const configKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const key = `${isMobileLayout}:${desktopFrames}:${mobileFrames}`;

    if (configKeyRef.current !== key) {
      if (configKeyRef.current !== null) {
        clearCache();
      }
      configKeyRef.current = key;
    }

    kickPreload(effectiveIdx);
    scheduleDraw();
  }, [
    isMobileLayout,
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
