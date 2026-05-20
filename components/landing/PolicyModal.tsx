"use client";

import { useId, useMemo, type RefObject } from "react";
import { createPortal } from "react-dom";

import { PRIVACY_POLICY_BODY } from "@/data/privacyPolicyBody";

export type PolicyModalProps = {
  open: boolean;
  onClose: () => void;
  closeButtonRef?: RefObject<HTMLButtonElement | null>;
  /** Portal target (document.body) — modal above sticky hero/sections */
  portalTarget?: HTMLElement | null;
};

function paragraphClassName(block: string): string {
  const t = block.trim();
  if (/^\d+\.\d+\.\s/.test(t)) return "policy-modal__subsection";
  if (/^\d+\.\s+[А-ЯЁа-я«—]/.test(t)) return "policy-modal__section";
  return "policy-modal__p";
}

function splitPolicyBlocks(source: string): string[] {
  return source
    .trim()
    .split(/\n\n+/)
    .map((b) => b.trim())
    .filter(Boolean);
}

function renderParagraph(key: string, text: string) {
  const urlSplit = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <p key={key} className={paragraphClassName(text)}>
      {urlSplit.map((part, i) =>
        /^https?:\/\//.test(part) ? (
          <a
            key={`${key}-${i}`}
            href={part}
            target="_blank"
            rel="noreferrer"
            className="policy-modal__link"
          >
            {part}
          </a>
        ) : (
          <span key={`${key}-${i}`}>{part}</span>
        ),
      )}
    </p>
  );
}

export function PolicyModal({
  open,
  onClose,
  closeButtonRef,
  portalTarget = null,
}: PolicyModalProps) {
  const titleId = useId();

  const blocks = useMemo(() => {
    const parts = splitPolicyBlocks(PRIVACY_POLICY_BODY);
    if (
      parts[0]?.startsWith("Политика в отношении обработки персональных данных")
    ) {
      return parts.slice(1);
    }
    return parts;
  }, []);

  if (!open || !portalTarget) return null;

  return createPortal(
    <div className="policy-modal-root" role="presentation">
      <button
        type="button"
        className="policy-modal-backdrop"
        aria-label="Закрыть политику компании"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="policy-modal-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="policy-modal-close"
          aria-label="Закрыть"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id={titleId} className="policy-modal-title">
          Политика компании
        </h2>
        <p className="policy-modal-subtitle">
          Политика в отношении обработки персональных данных
        </p>
        <div className="policy-modal-body">
          {blocks.map((block, i) => renderParagraph(`b-${i}`, block))}
        </div>
      </div>
    </div>,
    portalTarget,
  );
}
