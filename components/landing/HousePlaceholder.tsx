"use client";

import { useId } from "react";

type Props = {
  /** Текущий кадр 0..totalFrames-1 — передайте в `drawImage` после загрузки spritesheet / отдельных файлов */
  frameIndex: number;
  totalFrames: number;
  frameLabel: string;
  progress01: number;
  className?: string;
};

/**
 * Placeholder для будущей последовательности: замените содержимое на `<canvas />`
 * и отрисовку `frameIndex` (см. пропсы).
 */
export function HousePlaceholder({
  frameIndex,
  totalFrames,
  frameLabel,
  progress01,
  className = "",
}: Props) {
  const uid = useId().replace(/:/g, "");
  const hueShift = progress01 * 18;
  const gid = (name: string) => `${name}-${uid}`;

  return (
    <div
      className={[
        "relative flex aspect-[4/5] w-full max-w-[min(100%,420px)] flex-col items-center justify-center",
        className,
      ].join(" ")}
      data-sequence-frame={frameIndex}
      data-sequence-total={totalFrames}
    >
      <div
        className="absolute inset-6 rounded-[28px] bg-gradient-to-br from-[#f3efe6] via-[#e8e2d6] to-[#ddd4c4] opacity-90 shadow-inner"
        style={{ filter: `hue-rotate(${hueShift}deg)` }}
        aria-hidden
      />
      <div className="absolute inset-0 rounded-[32px] ring-1 ring-ink/10" aria-hidden />

      <div className="relative z-10 flex w-full flex-col items-center px-8">
        <p className="font-sans text-[11px] font-medium uppercase tracking-[0.35em] text-muted">
          Sequence
        </p>
        <p className="mt-3 font-display text-5xl font-medium tabular-nums tracking-tight text-ink sm:text-6xl">
          Frame {frameLabel}
        </p>

        <svg
          viewBox="0 0 240 280"
          className="mt-8 w-[72%] max-w-[280px] drop-shadow-[0_12px_32px_rgba(44,40,36,0.15)]"
          role="img"
          aria-label="Схематичный силуэт дома — заглушка под анимацию"
        >
          <defs>
            <linearGradient id={gid("roof")} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#c4b8a8" />
              <stop offset="100%" stopColor="#9a8b7a" />
            </linearGradient>
            <linearGradient id={gid("wall")} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#faf6ef" />
              <stop offset="100%" stopColor="#ded6ca" />
            </linearGradient>
            <linearGradient id={gid("accent")} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#b8a999" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8c7f72" stopOpacity="0.55" />
            </linearGradient>
          </defs>
          <polygon
            points="120,28 200,98 40,98"
            fill={`url(#${gid("roof")})`}
            style={{ transform: `translateY(${progress01 * 4}px)` }}
          />
          <rect
            x="52"
            y="98"
            width="136"
            height="132"
            rx="4"
            fill={`url(#${gid("wall")})`}
          />
          <rect
            x="108"
            y="158"
            width="36"
            height="72"
            rx="2"
            fill={`url(#${gid("accent")})`}
          />
          <rect
            x="68"
            y="124"
            width="36"
            height="36"
            rx="3"
            fill={`url(#${gid("accent")})`}
            opacity="0.65"
          />
          <rect
            x="148"
            y="124"
            width="36"
            height="36"
            rx="3"
            fill={`url(#${gid("accent")})`}
            opacity="0.65"
          />
          <rect x="90" y="232" width="60" height="8" rx="2" fill="#a99b8c" />
        </svg>
      </div>
    </div>
  );
}
