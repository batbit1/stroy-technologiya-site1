"use client";

import { SITE_CONTENT } from "@/data/siteContent";
import {
  useNavScrollContacts,
  useNavScrollOpenRequestForm,
} from "@/components/landing/NavScrollContext";
import { SectionReveal } from "@/components/landing/premium-sections/SectionReveal";

const { workStages } = SITE_CONTENT;

const HEADING_TEXT = "Каждый этап строительства — под контролем";

const TRUST_ICONS = [
  <svg key="0" className="work-control-pill-icon" viewBox="0 0 22 22" fill="none" aria-hidden>
    <path
      d="M4 6.5h14M4 11h10M4 15.5h14"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>,
  <svg key="1" className="work-control-pill-icon" viewBox="0 0 22 22" fill="none" aria-hidden>
    <path
      d="M11 3.5v15M6.5 8.5 11 5.5l4.5 3"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>,
  <svg key="2" className="work-control-pill-icon" viewBox="0 0 22 22" fill="none" aria-hidden>
    <rect x="3.5" y="4.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="11" cy="11" r="2.5" stroke="currentColor" strokeWidth="1.2" />
  </svg>,
  <svg key="3" className="work-control-pill-icon" viewBox="0 0 22 22" fill="none" aria-hidden>
    <path
      d="M3.5 11h15M11 3.5v15"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>,
];

export function WorkStagesSection() {
  const openRequestForm = useNavScrollOpenRequestForm();
  const goContacts = useNavScrollContacts();

  return (
    <section
      id="stages"
      aria-labelledby="stages-heading"
      className="work-control-panel"
    >
      <div className="work-control-bg" aria-hidden />

      <SectionReveal className="work-control-inner">
        <div className="work-control-left">
          <p className="work-control-eyebrow">{workStages.eyebrow}</p>
          <h2 id="stages-heading" className="work-control-title">
            {HEADING_TEXT}
          </h2>

          <SectionReveal delayMs={120}>
            <p className="work-control-text">{workStages.lede}</p>
          </SectionReveal>

          <div className="work-control-pills">
            {workStages.trustPills.map((pill, index) => (
              <SectionReveal key={pill} delayMs={200 + index * 80}>
                <div className="work-control-pill">
                  {TRUST_ICONS[index % TRUST_ICONS.length]}
                  <span className="work-control-pill-text">{pill}</span>
                </div>
              </SectionReveal>
            ))}
          </div>

          <SectionReveal delayMs={420}>
            <div className="work-control-actions">
              <button
                type="button"
                className="work-control-primary"
                onClick={() => openRequestForm?.()}
              >
                {workStages.ctaLabel}
              </button>
              <button
                type="button"
                className="work-control-secondary"
                onClick={() => goContacts?.()}
              >
                {workStages.ctaSecondaryLabel}
              </button>
            </div>
          </SectionReveal>
        </div>

        <div className="work-control-timeline">
          {workStages.stages.map((stage, index) => (
            <SectionReveal key={stage.number} delayMs={120 + index * 70}>
              <article className="work-control-step">
                <span className="work-control-step-number tabular-nums" aria-hidden>
                  {stage.number}
                </span>
                <div>
                  <h3 className="work-control-step-title">{stage.title}</h3>
                  <p className="work-control-step-text">{stage.description}</p>
                </div>
              </article>
            </SectionReveal>
          ))}
        </div>
      </SectionReveal>
    </section>
  );
}
