"use client";

import SplitType from "split-type";
import { motion } from "framer-motion";
import {
  Fragment,
  useCallback,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export const EASE_PREMIUM: [number, number, number, number] = [
  0.16, 1, 0.3, 1,
];

function filterRevealInitial(blurPx: number): string {
  return `blur(${blurPx}px) contrast(0.82) brightness(1.08)`;
}

const FILTER_FINAL = "blur(0px) contrast(1.04) brightness(1)";

/** Поручные переносы строк заголовка; иначе null → SplitType по ширине. */
function manualTitleLines(raw: string): string[] | null {
  if (!/\r?\n/.test(raw)) return null;
  const parts = raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length >= 2 ? parts : null;
}

function accessibilityTitle(t: string) {
  return t.replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim();
}

export type CinematicTitleProps = {
  text: string;
  className?: string;
  id?: string;
  delay?: number;
  once?: boolean;
  active?: boolean;
  narrow?: boolean;
  reduceFx?: boolean;
  /** Hero: семантический уровень заголовка (по умолчанию h3 — как в сценах). */
  as?: "h1" | "h2" | "h3";
};

export function CinematicTitle(props: CinematicTitleProps) {
  const {
    text,
    className = "",
    id,
    delay = 0,
    active = true,
    narrow = false,
    reduceFx = false,
    as = "h3",
  } = props;
  const ghostRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<SplitType | null>(null);
  const widthRef = useRef<number>(NaN);

  const manualChunks = useMemo(() => manualTitleLines(text), [text]);
  const usesManualLines =
    manualChunks !== null && manualChunks.length >= 2;

  const [autoLines, setAutoLines] = useState<string[]>(() => [
    text.replace(/\s+/g, " ").trim(),
  ]);

  const lines = usesManualLines && manualChunks ? manualChunks : autoLines;

  // Short, time-based reveal: завершается за 0.22–0.32 c. независимо от scroll.
  // Длинных enter'ов и exit'ов нет — пользователь не должен ловить blur/полупрозрачность.
  const motionParams = narrow
    ? {
        blur: 6,
        y: 14,
        enterDuration: 0.24,
        enterStagger: 0.03,
        scale: 0.992,
      }
    : {
        blur: 8,
        y: 18,
        enterDuration: 0.28,
        enterStagger: 0.04,
        scale: 0.992,
      };

  const inkInitial = "rgba(44, 40, 36, 0.4)";
  const inkFinal = "#171411";

  const extractLines = useCallback(() => {
    const el = ghostRef.current;
    if (!el || reduceFx || !text) return;

    try {
      splitRef.current?.revert();
      splitRef.current = null;

      const st = new SplitType(el, {
        types: "lines",
        tagName: "span",
        lineClass: "ct-split-line-surface",
      });

      const parts =
        st.lines?.map((line) =>
          typeof line?.textContent === "string"
            ? line.textContent.replace(/\r/g, "").replace(/\u00ad/g, "")
            : "",
        ) ?? [];

      st.revert();

      const cleaned = parts.filter((ln) => ln.length > 0);
      setAutoLines(
        cleaned.length > 0 ? cleaned : [text.replace(/\s+/g, " ").trim()],
      );
    } catch {
      setAutoLines([text.replace(/\s+/g, " ").trim()]);
    }
  }, [reduceFx, text]);

  useLayoutEffect(() => {
    splitRef.current?.revert();
    splitRef.current = null;

    if (reduceFx) return;

    if (usesManualLines) {
      return;
    }

    extractLines();

    const el = ghostRef.current;
    if (!el) return;

    let resplitTimeout = 0;

    const queueResplit = () => {
      window.clearTimeout(resplitTimeout);
      resplitTimeout = window.setTimeout(() => {
        extractLines();
      }, 140);
    };

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (!Number.isFinite(w) || w <= 0) return;
      if (Math.abs(w - widthRef.current) < 2) return;
      widthRef.current = w;
      queueResplit();
    });

    widthRef.current = el.getBoundingClientRect().width;
    ro.observe(el);

    return () => {
      window.clearTimeout(resplitTimeout);
      ro.disconnect();
      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, [extractLines, reduceFx, text, usesManualLines]);

  const hidden = useMemo(
    () => ({
      opacity: 0,
      y: motionParams.y,
      x: 0,
      scale: motionParams.scale,
      filter: filterRevealInitial(motionParams.blur),
      color: inkInitial,
    }),
    [motionParams.blur, motionParams.scale, motionParams.y],
  );

  const visible = useMemo(
    () => ({
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: FILTER_FINAL,
      color: inkFinal,
    }),
    [],
  );

  // exit-фаза не используется: при смене сцены родитель демонтирует
  // CinematicTitle через смену key — никакого долгого fade-out'а нет.
  // active=false теперь визуально эквивалентен active=true (всё равно
  // показываем итоговый «visible»-кадр; реальная смена сцен происходит
  // через remount). Это исключает зависание в blur при остановке скролла.
  void active;

  const reduceFxChunks =
    manualChunks ?? [accessibilityTitle(text)];

  const MotionHeading =
    as === "h1" ? motion.h1 : as === "h2" ? motion.h2 : motion.h3;

  if (reduceFx) {
    const StaticTag = as === "h1" ? "h1" : as === "h2" ? "h2" : "h3";
    return (
      <StaticTag
        id={id}
        className={`cinematic-text-render premium-engraved-title cinematic-title-static pointer-events-none m-0 max-w-none text-left antialiased ${className}`}
      >
        {reduceFxChunks.map((chunk, mi) => (
          <Fragment key={`rf-${chunk}-${mi}`}>
            {mi > 0 ? <br /> : null}
            {chunk}
          </Fragment>
        ))}
      </StaticTag>
    );
  }

  const srText = accessibilityTitle(text);

  return (
    <MotionHeading
      id={id}
      className={`pointer-events-none m-0 w-full max-w-none text-left ${className}`}
    >
      <span className="sr-only">{srText}</span>
      <span aria-hidden className="grid grid-cols-1 grid-rows-1 [&>*]:col-start-1 [&>*]:row-start-1">
        <span
          className={`cinematic-text-render col-start-1 row-start-1 w-full opacity-0 select-none [transform:translateZ(0)] ${className}`}
          ref={ghostRef}
        >
          {usesManualLines && manualChunks
            ? manualChunks.map((chunk, mi) => (
                <span
                  key={`g-${mi}-${chunk.slice(0, 16)}`}
                  className="block"
                >
                  {chunk}
                </span>
              ))
            : text}
        </span>

        <span
          className={`cinematic-text-render col-start-1 row-start-1 block w-full text-balance antialiased [transform:translateZ(0)] ${className}`}
        >
          {lines.map((line, index) => {
            const enterDelay = delay + index * motionParams.enterStagger;
            const lineTransition = {
              duration: motionParams.enterDuration,
              ease: EASE_PREMIUM,
              delay: enterDelay,
            } as const;

            return (
              <span
                key={`${text}-line-${index}-${lines.length}-${line.slice(0, 12)}`}
                className="premium-title-line block leading-[inherit]"
              >
                <motion.span
                  className="block leading-[inherit] [transform-origin:50%_0%]"
                  initial={hidden}
                  animate={visible}
                  transition={lineTransition}
                >
                  {line.length > 0 ? line : "\u00a0"}
                </motion.span>
              </span>
            );
          })}
        </span>
      </span>
    </MotionHeading>
  );
}

/** Letter-level mist reveal for editorial eyebrow (SplitType.chars). */
export type CinematicEyebrowProps = {
  text: string;
  className?: string;
  delay?: number;
  once?: boolean;
  active?: boolean;
  narrow?: boolean;
  reduceFx?: boolean;
};

export function CinematicEyebrow(props: CinematicEyebrowProps) {
  const {
    text,
    className = "",
    delay = 0,
    active = true,
    narrow = false,
    reduceFx = false,
  } = props;
  const ghostRef = useRef<HTMLSpanElement>(null);
  const splitRef = useRef<SplitType | null>(null);
  const widthRef = useRef<number>(NaN);

  const [chars, setChars] = useState<string[]>(() => Array.from(text));

  // Time-based reveal (≈ 0.22 c., короткий character stagger). exit'а нет —
  // active=false теперь не запускает долгий выход (смена сцен делается через
  // remount родителем). См. CinematicTitle для общей мотивации.
  const blur = narrow ? 4 : 6;
  const enterDuration = narrow ? 0.2 : 0.22;
  const stagger = narrow ? 0.008 : 0.01;

  const extractChars = useCallback(() => {
    const el = ghostRef.current;
    if (!el || reduceFx || !text) return;
    try {
      splitRef.current?.revert();
      splitRef.current = null;

      const st = new SplitType(el, {
        types: "chars",
        tagName: "span",
        charClass: "ct-split-char-surface",
      });

      const parts = st.chars?.map((c) => c.textContent ?? "") ?? [];
      st.revert();

      // SplitType иногда схлопывает пробелы в `chars` — тогда слова сливаются
      // (например «ИНЖЕНЕРИЯ И ОТДЕЛКА» → «ИНЖЕНЕРИЯИОТДЕЛКА»). Берём chars только
      // если реконструкция совпадает с исходной строкой.
      if (parts.length > 0 && parts.join("") === text) {
        setChars(parts);
      } else {
        setChars(Array.from(text));
      }
    } catch {
      setChars(Array.from(text));
    }
  }, [reduceFx, text]);

  useLayoutEffect(() => {
    if (reduceFx) {
      splitRef.current?.revert();
      splitRef.current = null;
      return;
    }

    extractChars();

    const el = ghostRef.current;
    if (!el) return;

    let resplitTimeout = 0;

    const queueResplit = () => {
      window.clearTimeout(resplitTimeout);
      resplitTimeout = window.setTimeout(() => {
        extractChars();
      }, 120);
    };

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (!Number.isFinite(w) || w <= 0) return;
      if (Math.abs(w - widthRef.current) < 2) return;
      widthRef.current = w;
      queueResplit();
    });

    widthRef.current = el.getBoundingClientRect().width;
    ro.observe(el);

    return () => {
      window.clearTimeout(resplitTimeout);
      ro.disconnect();
      splitRef.current?.revert();
      splitRef.current = null;
    };
  }, [extractChars, reduceFx, text]);

  const hidden = useMemo(
    () => ({
      opacity: 0,
      y: narrow ? 3 : 5,
      filter: filterRevealInitial(blur),
      letterSpacing: "0.285em",
    }),
    [blur, narrow],
  );

  const visible = useMemo(
    () => ({
      opacity: 1,
      y: 0,
      filter: FILTER_FINAL,
      letterSpacing: "0.22em",
    }),
    [],
  );

  void active;

  if (reduceFx) {
    return (
      <p
        className={`cinematic-text-render pointer-events-none m-0 max-w-[620px] ${className}`}
      >
        {text}
      </p>
    );
  }

  return (
    <p
      className={`cinematic-text-render pointer-events-none m-0 max-w-[620px] ${className}`}
    >
      <span className="sr-only">{text}</span>
      <span
        aria-hidden
        className="inline-grid grid-cols-1 grid-rows-1 [&>*]:col-start-1 [&>*]:row-start-1"
      >
        <span
          className={`col-start-1 row-start-1 inline-block w-max max-w-full opacity-0 select-none [transform:translateZ(0)] ${className}`}
          ref={ghostRef}
        >
          {text}
        </span>
        <span className="col-start-1 row-start-1 inline-block w-max max-w-full whitespace-normal">
          {chars.map((ch, i) => {
            const isSpace = /\s/u.test(ch);
            if (isSpace) {
              const sp = ch === " " ? " " : ch;
              return (
                <span key={`eyebrow-sp-${i}-${sp.codePointAt(0) ?? 0}`} className="inline">
                  {sp}
                </span>
              );
            }

            const enterDelay = delay + i * stagger;

            return (
              <motion.span
                key={`eyebrow-ch-${i}-${ch.codePointAt(0) ?? 0}`}
                className="inline-block [transform:translateZ(0)]"
                initial={hidden}
                animate={visible}
                transition={{
                  duration: enterDuration,
                  ease: EASE_PREMIUM,
                  delay: enterDelay,
                }}
              >
                {ch}
              </motion.span>
            );
          })}
        </span>
      </span>
    </p>
  );
}
