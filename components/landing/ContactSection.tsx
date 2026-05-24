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

import {
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_EMAIL_HREF,
  SITE_PHONE_OPTIONS,
  SITE_YANDEX_MAP_IFRAME_SRC,
  SITE_YANDEX_ROUTE_HREF,
} from "@/data/siteContacts";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useMediaQuery } from "@/hooks/useMediaQuery";



const EASE_LUX = EASE_LUXURY_CSS;

const SHOW_MS = MOTION_DURATION_MS.section;



const CONTACT_EYEBROW = "СВЯЗАТЬСЯ С НАМИ";

const CONTACT_TITLE = "Обсудим ваш проект?";

const CONTACT_DESCRIPTION =

  "Оставьте заявку или позвоните — подскажем оптимальный формат работ и подготовим предварительный расчёт.";

const CONTACT_SCHEDULE = "Пн–Пт · 09:00–18:00";

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

function ContactMetaIcon({ kind }: { kind: "pin" | "clock" | "mail" | "phone" }) {
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
        <path
          d="M8 5v3.2l2 1.2"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="square"
        />
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
    <span className="contact-section-meta__icon" aria-hidden>
      <svg viewBox="0 0 16 16" width="18" height="18" fill="none">
        {paths[kind]}
      </svg>
    </span>
  );
}

function ContactMapPin() {
  return (
    <span className="contact-map-pin" aria-hidden>
      <svg viewBox="0 0 32 44" width="36" height="50" fill="none">
        <path
          d="M16 1.5c7.18 0 13 5.82 13 13 0 9.75-13 28.5-13 28.5S3 24.25 3 14.5c0-7.18 5.82-13 13-13Z"
          fill="#caa15f"
          stroke="rgba(255,248,236,0.35)"
          strokeWidth="1"
        />
        <circle cx="16" cy="14.5" r="4.5" fill="rgba(12,10,8,0.88)" />
      </svg>
    </span>
  );
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



      <div className="contact-section-inner contact-section-inner--cinematic ds-container pb-px">

        <div className="contact-section-grid grid">

          <div

            ref={leftRef}

            inert={!leftIn && !isMobileContactLayout ? true : undefined}

            className="contact-section-col-left min-w-0"

            style={

              isMobileContactLayout

                ? undefined

                : {

                    opacity: leftIn ? 1 : 0,

                    transform: leftIn ? "translateY(0)" : "translateY(20px)",

                    transition: `opacity ${SHOW_MS}ms ${EASE_LUX}, transform ${SHOW_MS}ms ${EASE_LUX}`,

                    pointerEvents: leftIn ? "auto" : "none",

                  }

            }

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

              <ul className="contact-section-meta-list">

                <li className="contact-section-meta-row">

                  <ContactMetaIcon kind="pin" />

                  <span>{SITE_ADDRESS}</span>

                </li>

                <li className="contact-section-meta-row">

                  <ContactMetaIcon kind="clock" />

                  <span>{CONTACT_SCHEDULE}</span>

                </li>

                <li className="contact-section-meta-row">

                  <ContactMetaIcon kind="mail" />

                  <a href={SITE_EMAIL_HREF}>{SITE_EMAIL}</a>

                </li>

              </ul>

              <div className="contact-section-actions">

                <div className="contact-section-phone-slot">

                  <button

                    type="button"

                    className="contact-section-btn contact-section-btn-call"

                    aria-expanded={phoneModalOpen}

                    aria-haspopup="dialog"

                    aria-controls="contact-phone-choice-dialog"

                    onClick={togglePhoneModal}

                  >

                    <span className="contact-section-btn__label">

                      <ContactMetaIcon kind="phone" />

                      Позвонить

                    </span>

                  </button>

                </div>

                <button

                  type="button"

                  className="contact-section-btn contact-section-btn-request"

                  onClick={() => setFormModalOpen(true)}

                >

                  <span className="contact-section-btn__label contact-section-btn__label--arrow">

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

              <div className="contact-map-frame">

                <iframe

                  src={SITE_YANDEX_MAP_IFRAME_SRC}

                  title="Офис компании на Яндекс.Картах"

                  width="100%"

                  height="100%"

                  className="contact-map-iframe"

                  frameBorder={0}

                  allowFullScreen

                  loading="lazy"

                  referrerPolicy="no-referrer-when-downgrade"

                />

                <div className="contact-map-overlay" aria-hidden />

                <ContactMapPin />

                <p className="contact-map-chip">{SITE_ADDRESS}</p>

                <a

                  href={SITE_YANDEX_ROUTE_HREF}

                  target="_blank"

                  rel="noreferrer"

                  className="contact-map-route-link"

                >

                  Маршрут

                </a>

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
                  <span>{SITE_ADDRESS}</span>
                </li>
                <li className="contact-mobile-footer__contact-row">
                  <ContactFooterIcon kind="clock" />
                  <span>{CONTACT_SCHEDULE}</span>
                </li>
                <li className="contact-mobile-footer__contact-row">
                  <ContactFooterIcon kind="mail" />
                  <a href={SITE_EMAIL_HREF} className="contact-mobile-footer__text-link">
                    {SITE_EMAIL}
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
                href={SITE_PHONE_OPTIONS[0].href}
                className="contact-mobile-footer__phone"
              >
                {SITE_PHONE_OPTIONS[0].display}
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
              © 2025 СК ТЕХНОЛОГИЯ
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



      <div className="contact-section-legal-footer contact-section-legal-footer--desktop ds-container contact-section-inner--cinematic max-lg:hidden">

        <p className="contact-section-legal-copy m-0">© СК ТЕХНОЛОГИЯ</p>

        <button

          type="button"

          className="contact-section-policy-trigger"

          onClick={() => setPolicyModalOpen(true)}

        >

          Политика компании

        </button>

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
                    {SITE_PHONE_OPTIONS.map((row) => (
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

