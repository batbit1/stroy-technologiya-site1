"use client";



import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ContactForm } from "@/components/landing/ContactForm";

import { PolicyModal } from "@/components/landing/PolicyModal";

import { lockBodyScroll, unlockBodyScroll } from "@/lib/body-scroll-lock";
import { CONTACT_OPEN_REQUEST_FORM_EVENT } from "@/lib/contact-form-events";

import {

  EASE_LUXURY_CSS,

  MOTION_DURATION_MS,

} from "@/lib/motion-system";

import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useMediaQuery } from "@/hooks/useMediaQuery";



const EASE_LUX = EASE_LUXURY_CSS;

const SHOW_MS = MOTION_DURATION_MS.section;



const CONTACT_EYEBROW = "СВЯЗАТЬСЯ С НАМИ";

const CONTACT_TITLE = "Обсудим ваш проект?";

const CONTACT_DESCRIPTION =

  "Оставьте заявку или позвоните — подскажем оптимальный формат работ и подготовим предварительный расчёт.";

const CONTACT_ADDRESS = "Оренбург, Просторная, 19";

const CONTACT_SCHEDULE = "Пн–Пт · 09:00–18:00";



/** Яндекс.Карты: офис (lat, lon). */

const MAP_LAT = 51.837881;

const MAP_LON = 55.157681;

const YANDEX_MAP_IFRAME_SRC = `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(`${MAP_LON},${MAP_LAT}`)}&z=16&pt=${MAP_LON},${MAP_LAT},pm2rdm`;

const YANDEX_ROUTE_HREF = `https://yandex.ru/maps/?rtext=~${MAP_LAT},${MAP_LON}`;



const PHONE_OPTIONS = [

  {

    label: "Мобильный",

    display: "+7 (961) 944-00-00",

    href: "tel:+79619440000",

  },

  {

    label: "Офис",

    display: "+7 (353) 260-56-56",

    href: "tel:+73532605656",

  },

] as const;

const CONTACT_EMAIL = "info@stroytech56.ru";

const CONTACT_EMAIL_HREF = "mailto:info@stroytech56.ru";

const MOBILE_FOOTER_NAV = [
  { label: "О компании", sceneKey: "about" },
  { label: "Услуги", sceneKey: "services" },
  { label: "Портфолио", anchor: "portfolio" as const },
  { label: "Технологии", sceneKey: "engineering" },
  { label: "Процесс работы", sceneKey: "process" },
  { label: "Документы", sceneKey: "documents" },
  { label: "Контакты", anchor: "contacts" as const },
] as const;

function scrollMobileToAnchor(anchor: "portfolio" | "contacts") {
  const el = document.querySelector(`[data-nav-anchor="${anchor}"]`);
  if (!el) return;
  const headerOffset = window.innerWidth < 768 ? 84 : 96;
  const top =
    el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: "auto" });
}

function scrollMobileToScene(sceneKey: string) {
  const el = document.querySelector(
    `.mobile-cinematic-flow [data-scene-key="${sceneKey}"], .mobile-story-flow [data-scene-key="${sceneKey}"]`,
  );
  if (!el) return;
  const headerOffset = window.innerWidth < 768 ? 84 : 96;
  const top =
    el.getBoundingClientRect().top + window.scrollY - headerOffset;
  window.scrollTo({ top, behavior: "auto" });
}

function ContactFooterIcon({ kind }: { kind: "pin" | "clock" | "mail" | "phone" }) {
  const paths = {
    pin: (
      <path
        d="M8 1.5a4 4 0 0 1 4 4c0 2.8-4 8.5-4 8.5S4 8.3 4 5.5a4 4 0 0 1 4-4Z"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    ),
    clock: (
      <>
        <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 5v3.2l2 1.2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
      </>
    ),
    mail: (
      <path
        d="M2.5 4.5h11L8 9 2.5 4.5Zm0 0 5.5 4.5L13.5 4.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    ),
    phone: (
      <path
        d="M5.2 2.8c.4 2.1 2.3 4 4.4 4.4l1.2-1.2a1 1 0 0 1 1-.2c1 .4 2.1.9 3 1.6a1 1 0 0 1 .3 1.1l-.9 2a1 1 0 0 1-.9.6c-1.6.2-4.6-2.8-4.8-4.4a1 1 0 0 1 .6-.9l2-.9a1 1 0 0 1 1.1.3c.7.9 1.2 2 1.6 3a1 1 0 0 1-.2 1L5.2 2.8Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    ),
  };
  return (
    <span className="contact-mobile-footer__icon" aria-hidden>
      <svg viewBox="0 0 16 16" width="20" height="20" fill="none">
        {paths[kind]}
      </svg>
    </span>
  );
}



export function ContactSection() {

  const formTitleId = useId();

  const phoneTitleId = useId();

  const formCloseBtnRef = useRef<HTMLButtonElement>(null);

  const phoneCloseBtnRef = useRef<HTMLButtonElement>(null);

  const policyCloseBtnRef = useRef<HTMLButtonElement>(null);



  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);

  const [policyModalOpen, setPolicyModalOpen] = useState(false);

  const [modalPortal, setModalPortal] = useState<HTMLElement | null>(null);

  const { ref: leftRef, isInView: leftIn } = useInViewOnce<HTMLDivElement>({

    rootMargin: "0px 0px -8% 0px",

    threshold: 0,

  });



  const { ref: rightRef, isInView: rightIn } = useInViewOnce<HTMLDivElement>({

    rootMargin: "0px 0px -8% 0px",

    threshold: 0,

  });

  const isMobileContactLayout = useMediaQuery("(max-width: 1023px)");



  useEffect(() => {

    const open = () => setFormModalOpen(true);

    window.addEventListener(CONTACT_OPEN_REQUEST_FORM_EVENT, open);

    return () => window.removeEventListener(CONTACT_OPEN_REQUEST_FORM_EVENT, open);

  }, []);



  useEffect(() => {
    setModalPortal(document.body);
  }, []);

  useEffect(() => {
    const anyOpen = formModalOpen || phoneModalOpen || policyModalOpen;
    if (!anyOpen) return;

    lockBodyScroll();
    return () => unlockBodyScroll();
  }, [formModalOpen, phoneModalOpen, policyModalOpen]);



  useEffect(() => {

    if (!formModalOpen || policyModalOpen) return;

    formCloseBtnRef.current?.focus();

  }, [formModalOpen, policyModalOpen]);



  useEffect(() => {

    if (!phoneModalOpen) return;

    phoneCloseBtnRef.current?.focus();

  }, [phoneModalOpen]);



  useEffect(() => {

    if (!policyModalOpen) return;

    policyCloseBtnRef.current?.focus();

  }, [policyModalOpen]);



  useEffect(() => {

    if (!phoneModalOpen && !formModalOpen && !policyModalOpen) return;

    const onKey = (e: KeyboardEvent) => {

      if (e.key !== "Escape") return;

      e.stopPropagation();

      if (policyModalOpen) {

        setPolicyModalOpen(false);

        return;

      }

      if (formModalOpen) setFormModalOpen(false);

      else setPhoneModalOpen(false);

    };

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);

  }, [phoneModalOpen, formModalOpen, policyModalOpen]);



  const togglePhoneModal = () => {

    setPhoneModalOpen((v) => !v);

  };



  return (

    <section

      className="contact-section-root relative overflow-hidden"

      aria-labelledby="contacts-heading"

    >

      <div className="contact-section-atmosphere" aria-hidden />



      <div className="contact-section-inner ds-container pb-px">

        <div className="contact-section-grid grid">

          <div

            ref={leftRef}

            inert={!leftIn ? true : undefined}

            className="contact-section-col-left contact-section-col-left--desktop min-w-0 max-lg:hidden"

            style={{

              opacity: leftIn ? 1 : 0,

              transform: leftIn ? "translateY(0)" : "translateY(20px)",

              transition: `opacity ${SHOW_MS}ms ${EASE_LUX}, transform ${SHOW_MS}ms ${EASE_LUX}`,

              pointerEvents: leftIn ? "auto" : "none",

            }}

          >

            <div className="contact-left-card">

              <p className="contact-section-eyebrow">{CONTACT_EYEBROW}</p>

              <h2

                id="contacts-heading"

                className="contact-section-title font-display"

              >

                {CONTACT_TITLE}

              </h2>

              <p className="contact-section-lede">{CONTACT_DESCRIPTION}</p>



              <p className="contact-section-meta contact-section-meta--address">

                {CONTACT_ADDRESS}

              </p>

              <p className="contact-section-meta contact-section-meta--schedule">

                {CONTACT_SCHEDULE}

              </p>



              <div className="contact-section-actions">

                <div className="contact-section-phone-slot">

                  <button

                    type="button"

                    className="premium-cta-button premium-cta-button--secondary contact-section-btn-call"

                    aria-expanded={phoneModalOpen}

                    aria-haspopup="dialog"

                    aria-controls="contact-phone-choice-dialog"

                    onClick={togglePhoneModal}

                  >

                    <span className="premium-cta-button__label">Позвонить</span>

                  </button>

                </div>



                <button

                  type="button"

                  className="premium-cta-button premium-cta-button--primary contact-section-btn-request"

                  onClick={() => setFormModalOpen(true)}

                >

                  <span className="premium-cta-button__label">

                    Оставить заявку

                  </span>

                </button>

              </div>

            </div>

          </div>



          <div

            ref={rightRef}

            inert={!isMobileContactLayout && !rightIn ? true : undefined}

            className="contact-section-col-right min-w-0"

            style={

              isMobileContactLayout

                ? undefined

                : {

                    opacity: rightIn ? 1 : 0,

                    transform: rightIn ? "translateY(0)" : "translateY(22px)",

                    transition: `opacity ${SHOW_MS}ms ${EASE_LUX}, transform ${SHOW_MS}ms ${EASE_LUX}`,

                    pointerEvents: rightIn ? "auto" : "none",

                  }

            }

          >

            <div className="contact-map-card w-full min-w-0">

              <div className="contact-map-card__frame-wrap">

              <div

                className="contact-map-frame relative h-[320px] w-full overflow-hidden lg:h-auto lg:min-h-0 lg:flex-1"

                style={{ aspectRatio: "auto", minHeight: 0 }}

              >

                <iframe

                  src={YANDEX_MAP_IFRAME_SRC}

                  title="Офис компании на Яндекс.Картах"

                  width="100%"

                  height="100%"

                  className="absolute inset-0 block h-full w-full border-0"

                  frameBorder={0}

                  allowFullScreen

                  loading="lazy"

                  referrerPolicy="no-referrer-when-downgrade"

                />

                <a

                  href={YANDEX_ROUTE_HREF}

                  target="_blank"

                  rel="noreferrer"

                  className="premium-cta-button premium-cta-button--primary pointer-events-auto absolute bottom-3 right-3 z-10 max-w-[calc(100%-1.5rem)] shadow-[0_12px_40px_rgba(32,24,18,0.22)]"

                >

                  <span className="premium-cta-button__label">

                    Открыть маршрут

                  </span>

                </a>

              </div>

              </div>

              <div className="contact-map-footer">

                <p className="contact-map-address">{CONTACT_ADDRESS}</p>

              </div>

            </div>

          </div>

        </div>

        <div className="contact-mobile-footer-glass lg:hidden">
          <div className="contact-mobile-footer-glass__grid">
            <nav className="contact-mobile-footer__col" aria-label="Навигация по сайту">
              <p className="contact-mobile-footer__label">Навигация</p>
              <ul className="contact-mobile-footer__nav-list">
                {MOBILE_FOOTER_NAV.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      className="contact-mobile-footer__nav-link"
                      onClick={() => {
                        if ("anchor" in item) {
                          scrollMobileToAnchor(item.anchor);
                          return;
                        }
                        scrollMobileToScene(item.sceneKey);
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="contact-mobile-footer__col">
              <p className="contact-mobile-footer__label">Контакты</p>
              <ul className="contact-mobile-footer__contact-list">
                <li className="contact-mobile-footer__contact-row">
                  <ContactFooterIcon kind="pin" />
                  <span>{CONTACT_ADDRESS}</span>
                </li>
                <li className="contact-mobile-footer__contact-row">
                  <ContactFooterIcon kind="clock" />
                  <span>{CONTACT_SCHEDULE}</span>
                </li>
                <li className="contact-mobile-footer__contact-row">
                  <ContactFooterIcon kind="mail" />
                  <a href={CONTACT_EMAIL_HREF} className="contact-mobile-footer__text-link">
                    {CONTACT_EMAIL}
                  </a>
                </li>
              </ul>
              <button
                type="button"
                className="premium-cta-button premium-cta-button--primary contact-mobile-footer__cta"
                onClick={() => setFormModalOpen(true)}
              >
                <span className="premium-cta-button__label">Оставить заявку</span>
              </button>
            </div>

            <div className="contact-mobile-footer__col contact-mobile-footer__col--call">
              <p className="contact-mobile-footer__label">Позвоните нам</p>
              <a
                href={PHONE_OPTIONS[1].href}
                className="contact-mobile-footer__phone"
              >
                {PHONE_OPTIONS[1].display}
              </a>
              <button
                type="button"
                className="contact-mobile-footer__phone-btn"
                aria-label="Позвонить — выбор номера"
                onClick={togglePhoneModal}
              >
                <ContactFooterIcon kind="phone" />
                <span className="contact-mobile-footer__phone-btn-label">Позвонить</span>
              </button>
            </div>
          </div>

          <div className="contact-mobile-footer-glass__legal">
            <p className="contact-mobile-footer__copyright m-0">
              © 2025 СТРОЙ ТЕХНОЛОГИЯ
            </p>
            <button
              type="button"
              className="contact-mobile-footer__policy"
              onClick={() => setPolicyModalOpen(true)}
            >
              Политика конфиденциальности
            </button>
          </div>
        </div>

      </div>



      <div className="contact-section-legal-footer contact-section-legal-footer--desktop ds-container relative mt-[clamp(3.25rem,6.5vw,5rem)] border-t border-[rgba(105,82,58,0.085)] pt-[clamp(1.75rem,3.5vw,2.5rem)] max-lg:hidden">

        <div className="flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">

          <p className="contact-section-legal-copy m-0 font-sans text-[0.98rem] font-semibold tracking-[0.04em] text-ink/[0.82]">

            © СТРОЙ ТЕХНОЛОГИЯ

          </p>

          <button

            type="button"

            className="contact-section-policy-trigger"

            onClick={() => setPolicyModalOpen(true)}

          >

            Политика компании

          </button>

        </div>

      </div>



      {modalPortal && phoneModalOpen
        ? createPortal(
            <div className="contact-phone-modal-root" role="presentation">
              <button
                type="button"
                className="contact-modal-shared-backdrop"
                aria-label="Закрыть выбор номера"
                onClick={() => setPhoneModalOpen(false)}
              />
              <div
                id="contact-phone-choice-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={phoneTitleId}
                className="contact-phone-modal-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="contact-phone-modal-header">
                  <h3 id={phoneTitleId} className="contact-phone-modal-title">
                    Выберите номер для звонка
                  </h3>
                  <button
                    ref={phoneCloseBtnRef}
                    type="button"
                    className="contact-request-modal-close"
                    aria-label="Закрыть"
                    onClick={() => setPhoneModalOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <div className="contact-phone-modal-body">
                  <ul className="contact-phone-choice-list">
                    {PHONE_OPTIONS.map((row) => (
                      <li key={row.href} className="contact-phone-choice-item">
                        <a
                          href={row.href}
                          className="contact-phone-choice-link"
                          onClick={() => setPhoneModalOpen(false)}
                        >
                          <span className="contact-phone-choice-label">
                            {row.label}
                          </span>
                          <span className="contact-phone-choice-number">
                            {row.display}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>,
            modalPortal,
          )
        : null}

      {modalPortal && formModalOpen
        ? createPortal(
            <div className="contact-request-modal-root" role="presentation">
              <button
                type="button"
                className="contact-modal-shared-backdrop"
                aria-label="Закрыть форму заявки"
                onClick={() => setFormModalOpen(false)}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby={formTitleId}
                className="contact-request-modal-dialog"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="contact-request-modal-header">
                  <h3 id={formTitleId} className="contact-request-modal-title">
                    Оставить заявку
                  </h3>
                  <button
                    ref={formCloseBtnRef}
                    type="button"
                    className="contact-request-modal-close"
                    aria-label="Закрыть"
                    onClick={() => setFormModalOpen(false)}
                  >
                    ×
                  </button>
                </div>
                <ContactForm
                  idPrefix="contact-modal"
                  onPrivacyPolicyClick={() => setPolicyModalOpen(true)}
                />
              </div>
            </div>,
            modalPortal,
          )
        : null}

      <PolicyModal
        open={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        closeButtonRef={policyCloseBtnRef}
        portalTarget={modalPortal}
      />

    </section>

  );

}

