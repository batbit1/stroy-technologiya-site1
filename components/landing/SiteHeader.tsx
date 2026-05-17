"use client";

import { useCallback, useEffect, useState } from "react";

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
      <div className="site-header-inner mx-auto flex max-w-[1680px] items-center justify-between gap-3 px-4 lg:px-8">
        <button
          type="button"
          onClick={onGoHome}
          aria-label="СТРОЙ ТЕХНОЛОГИЯ — главная"
          className="site-header-brand min-w-0 flex-1 cursor-pointer border-0 bg-transparent p-0 text-left leading-none outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2 lg:flex-none"
        >
          <div className="text-[16px] font-medium leading-none tracking-[0.12em] text-neutral-900 md:text-[18px] md:tracking-[0.16em]">
            СТРОЙ ТЕХНОЛОГИЯ
          </div>
          <div className="mt-1 hidden text-[11px] leading-tight tracking-[0.08em] text-neutral-900/45 lg:block">
            архитектурная студия под ключ
          </div>
        </button>

        <nav
          className="site-header-nav-desktop hidden items-center gap-10 lg:flex"
          aria-label="Основная навигация"
        >
          <button
            type="button"
            onClick={onGoHome}
            className="cursor-pointer border-0 bg-transparent p-0 text-[12px] uppercase tracking-[0.18em] text-neutral-900/70 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2"
          >
            Главная
          </button>
          <button
            type="button"
            onClick={onGoPortfolio}
            className="cursor-pointer border-0 bg-transparent p-0 text-[12px] uppercase tracking-[0.18em] text-neutral-900/70 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2"
          >
            Наши работы
          </button>
          <button
            type="button"
            onClick={onGoContacts}
            className="cursor-pointer border-0 bg-transparent p-0 text-[12px] uppercase tracking-[0.18em] text-neutral-900/70 outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2"
          >
            Контакты
          </button>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <button
            type="button"
            onClick={onOpenRequestForm}
            className="site-header-cta-desktop premium-cta-button premium-cta-button--primary premium-cta-button--header group/hp relative hidden h-11 cursor-pointer items-center justify-center border-0 px-5 font-sans outline-none ring-offset-2 ring-offset-[var(--paper-soft)] focus-visible:ring-2 focus-visible:ring-neutral-900/30 lg:flex"
          >
            <span className="premium-cta-button__label">Оставить заявку</span>
          </button>

          <button
            type="button"
            className="mobile-menu-trigger flex items-center gap-2 rounded-full lg:hidden"
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
