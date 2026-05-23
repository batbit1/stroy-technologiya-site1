"use client";

import { SectionReveal } from "@/components/landing/premium-sections/SectionReveal";
import "./design-premium-section.css";

const DESIGN_CARDS = [
  {
    number: "01",
    image: "/images/design/design-card-01.webp",
    title: "Индивидуальный проект",
    text: "Создаём дом под участок, сценарии жизни семьи и бюджет.",
  },
  {
    number: "02",
    image: "/images/design/design-card-02.webp",
    title: "Архитектурная концепция",
    text: "Формируем фасады, объёмы, материалы и общий образ дома.",
  },
  {
    number: "03",
    image: "/images/design/design-card-03.webp",
    title: "Адаптация планировок",
    text: "Подстраиваем планировки под рельеф, стороны света и привычки семьи.",
  },
  {
    number: "04",
    image: "/images/design/design-card-04.webp",
    title: "Рабочая документация",
    text: "Готовим чертежи, конструктив и инженерные решения для стройки.",
  },
] as const;

export function DesignPremiumSection() {
  return (
    <section
      id="design"
      aria-labelledby="design-premium-heading"
      className="design-premium-section"
    >
      <div className="design-premium-inner">
        <SectionReveal className="design-premium-copy">
          <p className="design-premium-eyebrow">АРХИТЕКТУРА И ПРОЕКТИРОВАНИЕ</p>
          <h2 id="design-premium-heading" className="design-premium-title">
            Проектирование
            <br />
            домов
          </h2>
          <p className="design-premium-text">
            Проектируем дома под участок, образ жизни и бюджет — от архитектурной
            концепции до рабочей документации.
          </p>
        </SectionReveal>

        <div className="design-premium-cards">
          {DESIGN_CARDS.map((card, index) => (
            <SectionReveal
              key={card.number}
              as="article"
              className="design-premium-card"
              delayMs={120 + index * 80}
            >
              <div className="design-premium-image">
                <img src={card.image} alt={card.title} loading="lazy" />
              </div>
              <div className="design-premium-content">
                <p className="design-premium-number tabular-nums" aria-hidden>
                  {card.number}
                </p>
                <h3 className="design-premium-card-title">{card.title}</h3>
                <p className="design-premium-card-text">{card.text}</p>
              </div>
            </SectionReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
