"use client";

import { SITE_CONTENT } from "@/data/siteContent";
import {
  useNavScrollContacts,
  useNavScrollOpenRequestForm,
} from "@/components/landing/NavScrollContext";

const { turnkey } = SITE_CONTENT;

export function TurnkeySection() {
  const openRequestForm = useNavScrollOpenRequestForm();
  const goContacts = useNavScrollContacts();

  return (
    <section
      id="turnkey"
      aria-labelledby="turnkey-heading"
      className="premium-section turnkey-premium"
    >
      <div className="premium-split-layout">
        <div>
          <p className="premium-eyebrow">{turnkey.eyebrow}</p>
          <h2 id="turnkey-heading" className="premium-heading">
            {turnkey.heading}
          </h2>
          <p className="premium-text">{turnkey.lede}</p>
          <div className="premium-button-row">
            <button
              type="button"
              className="premium-button-primary"
              onClick={() => openRequestForm?.()}
            >
              {turnkey.ctaLabel}
            </button>
            <button
              type="button"
              className="premium-button-secondary"
              onClick={() => goContacts?.()}
            >
              {turnkey.ctaSecondaryLabel}
            </button>
          </div>
        </div>

        <ol className="premium-timeline">
          {turnkey.blocks.map((block) => (
            <li key={block.title} className="premium-timeline-item">
              <span className="premium-timeline-number tabular-nums" aria-hidden>
                {block.step}
              </span>
              <div>
                <h3 className="premium-timeline-title">{block.title}</h3>
                <p className="premium-timeline-text">{block.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
