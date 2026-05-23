"use client";

import Image from "next/image";
import {
  PORTFOLIO_CASE_STUDIES,
  PORTFOLIO_IMAGE_BLUR_DATA_URL,
  type PortfolioCaseStudy,
} from "@/data/portfolioMedia";
import { SITE_CONTENT } from "@/data/siteContent";
import {
  useNavScrollContacts,
  useNavScrollOpenRequestForm,
} from "@/components/landing/NavScrollContext";

const { popularProjects } = SITE_CONTENT;

const PORTFOLIO_CARD_IMAGE_FALLBACK = "/portfolio/projects/project-01.webp";

function CtaArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path
        d="M3 7h8M8.5 4.5 11 7l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CaseStudyCard({ project, index }: { project: PortfolioCaseStudy; index: number }) {
  const openRequestForm = useNavScrollOpenRequestForm();
  const imageSrc = project.image || PORTFOLIO_CARD_IMAGE_FALLBACK;
  const imageAlt = project.title || "Реализованный проект";

  return (
    <li className="portfolio-panel__case">
      <article className="portfolio-panel__case-inner">
        <div className="portfolio-panel__case-visual">
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            sizes="(max-width: 767px) 100vw, (max-width: 1439px) 50vw, 360px"
            quality={75}
            className="portfolio-panel__case-image object-cover object-center"
            placeholder="blur"
            blurDataURL={project.blurDataURL ?? PORTFOLIO_IMAGE_BLUR_DATA_URL}
          />
          <div className="portfolio-panel__case-scrim" aria-hidden />
        </div>

        <div className="portfolio-panel__case-content">
          <span className="portfolio-panel__case-category">{project.category}</span>
          <h3 className="portfolio-panel__case-title">{project.title}</h3>

          <ul className="portfolio-panel__case-meta">
            <li>
              <span>Площадь</span>
              <span className="portfolio-panel__case-meta-val">{project.area}</span>
            </li>
            <li>
              <span>Формат</span>
              <span className="portfolio-panel__case-meta-val">{project.format}</span>
            </li>
            <li>
              <span>Срок</span>
              <span className="portfolio-panel__case-meta-val">{project.duration}</span>
            </li>
          </ul>

          <div className="portfolio-panel__case-story">
            <div>
              <p className="portfolio-panel__case-label">Задача</p>
              <p className="portfolio-panel__case-text">{project.challenge}</p>
            </div>
            <div>
              <p className="portfolio-panel__case-label">Результат</p>
              <p className="portfolio-panel__case-text">{project.result}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => openRequestForm?.()}
            className="premium-button-secondary portfolio-panel__case-cta"
          >
            <span>{popularProjects.cardHint}</span>
            <span className="portfolio-panel__case-arrow" aria-hidden>
              <CtaArrowIcon />
            </span>
          </button>
        </div>
      </article>
    </li>
  );
}

export function PopularProjectsSection() {
  const openRequestForm = useNavScrollOpenRequestForm();
  const goContacts = useNavScrollContacts();

  return (
    <section
      id="projects"
      aria-labelledby="projects-heading"
      className="premium-section popular-projects-premium"
    >
      <div className="popular-projects-header">
        <div>
          <p className="premium-eyebrow">{popularProjects.eyebrow}</p>
          <h2 id="projects-heading" className="premium-heading">
            {popularProjects.heading}
          </h2>
          <p className="premium-text">{popularProjects.lede}</p>
        </div>

        <aside className="popular-projects-aside">
          <p className="popular-projects-aside-title">{popularProjects.headerAsideTitle}</p>
          <p className="popular-projects-aside-subtext">{popularProjects.headerAsideSubtext}</p>
        </aside>
      </div>

      <ul className="popular-projects-grid">
        {PORTFOLIO_CASE_STUDIES.map((project, index) => (
          <CaseStudyCard key={project.id} project={project} index={index} />
        ))}
      </ul>

      <div className="premium-button-row popular-projects-bottom-cta">
        <button
          type="button"
          className="premium-button-primary"
          onClick={() => openRequestForm?.()}
        >
          {popularProjects.ctaLabel}
        </button>
        <button
          type="button"
          className="premium-button-secondary"
          onClick={() => goContacts?.()}
        >
          {popularProjects.ctaSecondaryLabel}
        </button>
      </div>
    </section>
  );
}
