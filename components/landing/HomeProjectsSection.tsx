"use client";

import Image from "next/image";
import { SITE_CONTENT } from "@/data/siteContent";
import { PORTFOLIO_IMAGE_BLUR_DATA_URL } from "@/data/portfolioMedia";
import {
  useNavScrollContacts,
  useNavScrollOpenRequestForm,
} from "@/components/landing/NavScrollContext";
import { SectionReveal } from "@/components/landing/premium-sections/SectionReveal";

const { homeProjects } = SITE_CONTENT;

const HOUSE_CARDS = [
  {
    number: "01",
    image: "/images/projects/project-house-01.webp",
    title: "Современный одноэтажный дом",
    specs: "от 110 м² • 1 этаж • Минимализм",
  },
  {
    number: "02",
    image: "/images/projects/project-house-02.webp",
    title: "Дом с мансардой",
    specs: "от 140 м² • 1 этаж + мансарда • Классика",
  },
  {
    number: "03",
    image: "/images/projects/project-house-03.webp",
    title: "Просторный семейный коттедж",
    specs: "от 160 м² • 2 этажа • Премиум",
  },
  {
    number: "04",
    image: "/images/projects/project-house-04.webp",
    title: "Индивидуальная резиденция",
    specs: "от 220 м² • Индивидуальный • Luxury",
  },
] as const;

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

export function HomeProjectsSection() {
  const openRequestForm = useNavScrollOpenRequestForm();
  const goContacts = useNavScrollContacts();

  return (
    <section
      id="home-projects"
      aria-labelledby="home-projects-heading"
      className="home-projects-panel"
    >
      <div className="home-projects-inner">
        <SectionReveal className="home-projects-copy">
          <p className="home-projects-eyebrow">{homeProjects.eyebrow}</p>
          <h2 id="home-projects-heading" className="home-projects-title">
            {homeProjects.heading}
          </h2>
          <p className="home-projects-text">{homeProjects.lede}</p>
          <div className="home-projects-actions">
            <button
              type="button"
              className="home-projects-primary"
              onClick={() => openRequestForm?.()}
            >
              <span>{homeProjects.ctaLabel}</span>
              <span className="home-projects-cta-arrow" aria-hidden>
                <CtaArrowIcon />
              </span>
            </button>
            <button
              type="button"
              className="home-projects-secondary"
              onClick={() => goContacts?.()}
            >
              <span>{homeProjects.ctaSecondaryLabel}</span>
              <span className="home-projects-cta-arrow" aria-hidden>
                <CtaArrowIcon />
              </span>
            </button>
          </div>
        </SectionReveal>

        <div className="home-projects-grid">
          {HOUSE_CARDS.map((card, index) => (
            <SectionReveal key={card.number} delayMs={120 + index * 80}>
              <button
                type="button"
                className="home-project-card"
                onClick={() => openRequestForm?.()}
              >
                <div className="home-project-image">
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    sizes="(max-width: 767px) 100vw, (max-width: 1199px) 50vw, 420px"
                    quality={88}
                    placeholder="blur"
                    blurDataURL={PORTFOLIO_IMAGE_BLUR_DATA_URL}
                  />
                </div>
                <div className="home-project-content">
                  <h3 className="home-project-card-title">{card.title}</h3>
                  <p className="home-project-specs">{card.specs}</p>
                </div>
              </button>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
