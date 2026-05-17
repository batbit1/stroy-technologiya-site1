"use client";



import { useEffect, useId, useRef, useState } from "react";

import { ContactForm } from "@/components/landing/ContactForm";

import { PolicyModal } from "@/components/landing/PolicyModal";

import { CONTACT_OPEN_REQUEST_FORM_EVENT } from "@/lib/contact-form-events";

import {

  EASE_LUXURY_CSS,

  MOTION_DURATION_MS,

} from "@/lib/motion-system";

import { useInViewOnce } from "@/hooks/useInViewOnce";



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



export function ContactSection() {

  const formTitleId = useId();

  const phoneTitleId = useId();

  const formCloseBtnRef = useRef<HTMLButtonElement>(null);

  const phoneCloseBtnRef = useRef<HTMLButtonElement>(null);

  const policyCloseBtnRef = useRef<HTMLButtonElement>(null);



  const [phoneModalOpen, setPhoneModalOpen] = useState(false);

  const [formModalOpen, setFormModalOpen] = useState(false);

  const [policyModalOpen, setPolicyModalOpen] = useState(false);



  const { ref: leftRef, isInView: leftIn } = useInViewOnce<HTMLDivElement>({

    rootMargin: "0px 0px -8% 0px",

    threshold: 0,

  });



  const { ref: rightRef, isInView: rightIn } = useInViewOnce<HTMLDivElement>({

    rootMargin: "0px 0px -8% 0px",

    threshold: 0,

  });



  useEffect(() => {

    const open = () => setFormModalOpen(true);

    window.addEventListener(CONTACT_OPEN_REQUEST_FORM_EVENT, open);

    return () => window.removeEventListener(CONTACT_OPEN_REQUEST_FORM_EVENT, open);

  }, []);



  useEffect(() => {

    if (!formModalOpen && !phoneModalOpen && !policyModalOpen) return;

    const prev = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {

      document.body.style.overflow = prev;

    };

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



      <div className="contact-section-inner mx-auto max-w-[min(1240px,100%)] px-4 pb-px xs:px-5 sm:px-8 lg:px-14 xl:px-[4.35rem]">

        <div className="contact-section-grid grid">

          <div

            ref={leftRef}

            inert={!leftIn ? true : undefined}

            className="contact-section-col-left min-w-0"

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

            inert={!rightIn ? true : undefined}

            className="contact-section-col-right min-w-0"

            style={{

              opacity: rightIn ? 1 : 0,

              transform: rightIn ? "translateY(0)" : "translateY(22px)",

              transition: `opacity ${SHOW_MS}ms ${EASE_LUX}, transform ${SHOW_MS}ms ${EASE_LUX}`,

              pointerEvents: rightIn ? "auto" : "none",

            }}

          >

            <div

              className="contact-map-card w-full min-w-0"

              style={{

                borderRadius: 32,

                overflow: "hidden",

                border: "1px solid rgba(80, 60, 40, 0.12)",

                boxShadow: "0 24px 80px rgba(32, 24, 18, 0.18)",

              }}

            >

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

              <div className="contact-map-footer">

                <p className="contact-map-address">{CONTACT_ADDRESS}</p>

              </div>

            </div>

          </div>

        </div>

      </div>



      <div className="relative mx-auto mt-[clamp(3.25rem,6.5vw,5rem)] max-w-[min(1240px,100%)] border-t border-[rgba(105,82,58,0.085)] px-4 pt-[clamp(1.75rem,3.5vw,2.5rem)] xs:px-5 sm:px-8 lg:px-14 xl:px-[4.35rem]">

        <div className="contact-section-legal-footer flex flex-col items-center gap-3 text-center sm:items-start sm:text-left">

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



      {phoneModalOpen ? (

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

        </div>

      ) : null}



      {formModalOpen ? (

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

              onSubmit={(e) => {

                e.preventDefault();

              }}

              onPrivacyPolicyClick={() => setPolicyModalOpen(true)}

            />

          </div>

        </div>

      ) : null}



      <PolicyModal

        open={policyModalOpen}

        onClose={() => setPolicyModalOpen(false)}

        closeButtonRef={policyCloseBtnRef}

      />

    </section>

  );

}

