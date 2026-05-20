"use client";

import { useCallback, useRef } from "react";
import { ContactSection } from "@/components/landing/ContactSection";
import { LandingScrollScene } from "@/components/landing/LandingScrollScene";
import { NavScrollProvider } from "@/components/landing/NavScrollContext";
import { PortfolioSection } from "@/components/landing/PortfolioSection";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { dispatchOpenContactRequestForm } from "@/lib/contact-form-events";

export function LandingPageClient() {
  const portfolioAnchorRef = useRef<HTMLDivElement | null>(null);
  const contactsAnchorRef = useRef<HTMLDivElement | null>(null);

  const scrollToAnchor = useCallback((anchor: HTMLDivElement | null) => {
    if (!anchor) {
      console.warn("[nav] anchor missing");
      return;
    }

    const headerOffset = window.innerWidth < 768 ? 84 : 96;
    const rect = anchor.getBoundingClientRect();
    const absoluteTop = rect.top + window.scrollY;
    const top = absoluteTop - headerOffset;

    console.log("[nav] target", anchor.dataset.navAnchor, {
      rectTop: anchor.getBoundingClientRect().top,
      scrollY: window.scrollY,
      absoluteTop,
      finalTop: top,
    });

    window.scrollTo({
      top,
      behavior: "auto",
    });
  }, []);

  const goHome = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  const goPortfolio = useCallback(() => {
    scrollToAnchor(portfolioAnchorRef.current);
  }, [scrollToAnchor]);

  const goContacts = useCallback(() => {
    scrollToAnchor(contactsAnchorRef.current);
  }, [scrollToAnchor]);

  const openRequestForm = useCallback(() => {
    dispatchOpenContactRequestForm();
  }, []);

  return (
    <NavScrollProvider goContacts={goContacts} openRequestForm={openRequestForm}>
      <>
        <SiteHeader
          onGoHome={goHome}
          onGoPortfolio={goPortfolio}
          onGoContacts={goContacts}
          onOpenRequestForm={openRequestForm}
        />

        <main>
          <LandingScrollScene
            onGoPortfolio={goPortfolio}
            onOpenRequestForm={openRequestForm}
          />

          <div
            ref={portfolioAnchorRef}
            data-nav-anchor="portfolio"
            aria-hidden="true"
            style={{
              height: 1,
              width: "100%",
              pointerEvents: "none",
            }}
          />

          <PortfolioSection />

          <div
            ref={contactsAnchorRef}
            data-nav-anchor="contacts"
            aria-hidden="true"
            style={{
              height: 1,
              width: "100%",
              pointerEvents: "none",
            }}
          />

          <ContactSection />
        </main>
      </>
    </NavScrollProvider>
  );
}
