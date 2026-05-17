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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const runAndClose = useCallback((fn: () => void) => {
    setMenuOpen(false);
    fn();
  }, []);

  return (
    <header className="site-header fixed left-0 top-0 z-[100] w-full border-b border-black/5 bg-[#f5efe6]/80 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-[1680px] items-center justify-between px-4 md:h-20 md:px-8">
        <button
          type="button"
          onClick={onGoHome}
          aria-label="СТРОЙ ТЕХНОЛОГИЯ — главная"
          className="min-w-0 cursor-pointer border-0 bg-transparent p-0 text-left leading-none outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/20 focus-visible:ring-offset-2"
        >
          <div className="text-[16px] font-medium leading-none tracking-[0.12em] text-neutral-900 md:text-[18px] md:tracking-[0.16em]">
            СТРОЙ ТЕХНОЛОГИЯ
          </div>
          <div className="mt-1 hidden text-[11px] leading-tight tracking-[0.08em] text-neutral-900/45 md:block">
            архитектурная студия под ключ
          </div>
        </button>

        <nav
          className="hidden items-center gap-10 lg:flex"
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
            className="site-header-cta-desktop premium-cta-button premium-cta-button--primary premium-cta-button--header group/hp relative hidden cursor-pointer items-center justify-center border-0 font-sans outline-none ring-offset-2 ring-offset-[var(--paper-soft)] focus-visible:ring-2 focus-visible:ring-neutral-900/30 lg:inline-flex"
          >
            <span className="premium-cta-button__label">Оставить заявку</span>
          </button>

          <button
            type="button"
            className="site-header-burger flex lg:hidden"
            aria-expanded={menuOpen}
            aria-controls="site-header-mobile-menu"
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span className="site-header-burger-line" />
            <span className="site-header-burger-line" />
            <span className="site-header-burger-line" />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            aria-label="Закрыть меню"
            className="site-header-mobile-backdrop lg:hidden"
            onClick={() => setMenuOpen(false)}
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
            <div className="site-header-mobile-cta-wrap">
              <button
                type="button"
                onClick={() => runAndClose(onOpenRequestForm)}
                className="premium-cta-button premium-cta-button--primary flex h-[52px] w-full cursor-pointer items-center justify-center border-0 px-[28px] font-sans text-[12px] font-semibold uppercase tracking-[0.14em] outline-none focus-visible:ring-2 focus-visible:ring-neutral-900/30 focus-visible:ring-offset-2"
              >
                <span className="premium-cta-button__label">Оставить заявку</span>
              </button>
            </div>
          </nav>
        </>
      ) : null}
    </header>
  );
}
