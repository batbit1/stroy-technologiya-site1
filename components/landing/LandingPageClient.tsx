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

  const getHeaderOffset = () => {
    return window.innerWidth < 768 ? 84 : 96;
  };

  const getAbsoluteTop = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return rect.top + window.scrollY;
  };

  const scrollToAnchor = (anchor: HTMLDivElement | null) => {
    if (!anchor) {
      console.warn("[nav] anchor missing");
      return;
    }

    const top = getAbsoluteTop(anchor) - getHeaderOffset();

    console.log("[nav] target", anchor.dataset.navAnchor, {
      rectTop: anchor.getBoundingClientRect().top,
      scrollY: window.scrollY,
      absoluteTop: getAbsoluteTop(anchor),
      finalTop: top,
    });

    window.scrollTo({
      top,
      behavior: "auto",
    });
  };

  const goHome = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const goPortfolio = () => {
    scrollToAnchor(portfolioAnchorRef.current);
  };

  const goContacts = () => {
    scrollToAnchor(contactsAnchorRef.current);
  };

  const openRequestForm = useCallback(() => {
    scrollToAnchor(contactsAnchorRef.current);
    requestAnimationFrame(() => {
      dispatchOpenContactRequestForm();
    });
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
