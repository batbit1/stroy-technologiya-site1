"use client";

import { useCallback, useEffect, useState } from "react";
import { BrandLogo } from "@/components/landing/BrandLogo";

/** Телефон только в desktop header (контакты на странице — отдельно в siteContent). */
const DESKTOP_HEADER_PHONE_DISPLAY = "+7 (353) 260-56-56";
const DESKTOP_HEADER_PHONE_HREF = "tel:+73532605656";

export type SiteHeaderProps = {
  onGoHome: () => void;
  onGoPortfolio: () => void;
  onGoContacts: () => void;
  onOpenRequestForm: () => void;
};

export function SiteHeader({
  onGoHome,
  onGoPortfolio,
  onGoContacts,
  onOpenRequestForm,
}: SiteHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobileMenuOpen]);

  const runAndClose = useCallback((fn: () => void) => {
    setIsMobileMenuOpen(false);
    fn();
  }, []);

  return (
    <header className="site-header">
      <div className="site-header-inner ds-container--wide mx-auto flex items-center gap-3 pr-[clamp(14px,3.6vw,18px)] lg:grid lg:grid-cols-[1fr_auto_1fr] lg:items-center lg:gap-x-6 lg:pl-[clamp(20px,2vw,28px)] lg:pr-[clamp(24px,2.5vw,32px)]">
        <button
          type="button"
          onClick={onGoHome}
          aria-label="СК Технология — главная"
          className="site-header-brand site-logo flex min-w-0 flex-none cursor-pointer items-center overflow-visible border-0 bg-transparent py-0 pr-0 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 lg:col-start-1 lg:row-start-1 lg:shrink-0 lg:justify-self-start"
        >
          <BrandLogo className="site-header-brand-logo" />
        </button>

        <nav
          className="site-header-nav-desktop hidden min-w-0 flex-1 items-center justify-center lg:col-start-2 lg:row-start-1 lg:flex lg:w-max lg:flex-none lg:justify-self-center"
          aria-label="Основная навигация"
        >
          <div className="site-header-nav-desktop__item">
            <button
              type="button"
              onClick={onGoHome}
              className="site-header-nav-desktop__link cursor-pointer border-0 bg-transparent p-0 outline-none"
            >
              Главная
            </button>
          </div>
          <div className="site-header-nav-desktop__item">
            <button
              type="button"
              onClick={onGoPortfolio}
              className="site-header-nav-desktop__link cursor-pointer border-0 bg-transparent p-0 outline-none"
            >
              Наши работы
            </button>
          </div>
          <div className="site-header-nav-desktop__item">
            <button
              type="button"
              onClick={onGoContacts}
              className="site-header-nav-desktop__link cursor-pointer border-0 bg-transparent p-0 outline-none"
            >
              Контакты
            </button>
          </div>
        </nav>

        <div className="site-header-actions flex shrink-0 items-center ml-auto lg:col-start-3 lg:row-start-1 lg:ml-0 lg:justify-self-end">
          <a
            href={DESKTOP_HEADER_PHONE_HREF}
            className="site-header-phone hidden lg:inline"
            aria-label={`Позвонить: ${DESKTOP_HEADER_PHONE_DISPLAY}`}
          >
            {DESKTOP_HEADER_PHONE_DISPLAY}
          </a>
          <button
            type="button"
            onClick={onOpenRequestForm}
            className="site-header-cta premium-cta-button premium-cta-button--primary premium-cta-button--header relative hidden cursor-pointer items-center justify-center border-0 font-sans outline-none ring-offset-2 ring-offset-[var(--paper-soft)] focus-visible:ring-2 focus-visible:ring-neutral-900/30 lg:flex"
          >
            <span className="premium-cta-button__label">Оставить заявку</span>
          </button>

          <button
            type="button"
            className="mobile-menu-trigger mobile-menu-trigger--capsule flex items-center justify-center gap-2.5 lg:hidden"
            aria-label={isMobileMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMobileMenuOpen}
            aria-controls="site-header-mobile-menu"
            onClick={() => setIsMobileMenuOpen((v) => !v)}
          >
            <span className="mobile-menu-trigger__label">Меню</span>
            <span className="mobile-burger-lines" aria-hidden>
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <>
          <button
            type="button"
            aria-label="Закрыть меню"
            className="site-header-mobile-backdrop lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav
            id="site-header-mobile-menu"
            className="site-header-mobile-panel lg:hidden"
            aria-label="Мобильное меню"
          >
            <button
              type="button"
              className="site-header-mobile-link"
              onClick={() => runAndClose(onGoHome)}
            >
              Главная
            </button>
            <button
              type="button"
              className="site-header-mobile-link"
              onClick={() => runAndClose(onGoPortfolio)}
            >
              Наши работы
            </button>
            <button
              type="button"
              className="site-header-mobile-link"
              onClick={() => runAndClose(onGoContacts)}
            >
              Контакты
            </button>
            <button
              type="button"
              className="site-header-mobile-link site-header-mobile-link--cta"
              onClick={() => runAndClose(onOpenRequestForm)}
            >
              Оставить заявку
            </button>
          </nav>
        </>
      ) : null}
    </header>
  );
}
