"use client";

import Image from "next/image";
import { SITE_CONTENT } from "@/data/siteContent";
import { PORTFOLIO_IMAGE_BLUR_DATA_URL } from "@/data/portfolioMedia";
import { useNavScrollOpenRequestForm } from "@/components/landing/NavScrollContext";

const { design } = SITE_CONTENT;
const designItems = design.items.slice(0, 4);

export function DesignSection() {
  const openRequestForm = useNavScrollOpenRequestForm();

  return (
    <section
      id="design"
      aria-labelledby="design-heading"
      className="premium-section design-premium"
    >
      <div className="design-premium-layout">
        <div className="design-premium-copy">
          <p className="premium-eyebrow">{design.eyebrow}</p>
          <h2 id="design-heading" className="premium-heading">
            {design.heading}
          </h2>
          <p className="premium-text">{design.lede}</p>
          <div className="premium-button-row">
            <button
              type="button"
              className="premium-button-primary"
              onClick={() => openRequestForm?.()}
            >
              {design.ctaLabel}
            </button>
          </div>
          {design.footnote ? (
            <p className="design-premium-footnote">{design.footnote}</p>
          ) : null}
        </div>

        <div className="design-premium-cards">
          {designItems.map((item) => (
            <article key={item.title} className="design-service-card">
              <div className="design-service-image">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    width={320}
                    height={155}
                    quality={85}
                    placeholder="blur"
                    blurDataURL={PORTFOLIO_IMAGE_BLUR_DATA_URL}
                  />
                ) : null}
              </div>
              <div className="design-service-content">
                <h3 className="design-service-title">{item.title}</h3>
                <p className="design-service-desc">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
