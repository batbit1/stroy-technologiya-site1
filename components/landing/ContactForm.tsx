"use client";

import {
  useCallback,
  useState,
  type ChangeEvent,
  type FormEventHandler,
  type KeyboardEvent,
} from "react";

const PHONE_PREFIX = "+7 ";

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  let withoutCountry = digits;

  if (withoutCountry.startsWith("7")) {
    withoutCountry = withoutCountry.slice(1);
  }

  withoutCountry = withoutCountry.slice(0, 10);

  return PHONE_PREFIX + withoutCountry;
}

export type ContactFormProps = {
  idPrefix: string;
  className?: string;
  onSubmit?: FormEventHandler<HTMLFormElement>;
  onPrivacyPolicyClick?: () => void;
};

export function ContactForm({
  idPrefix,
  className,
  onSubmit,
  onPrivacyPolicyClick,
}: ContactFormProps) {
  const pid = (suffix: string) => `${idPrefix}-${suffix}`;
  const [phone, setPhone] = useState(PHONE_PREFIX);

  const onPhoneChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setPhone(normalizePhone(e.target.value));
  }, []);

  const onPhoneFocus = useCallback(() => {
    setPhone((p) => (p.startsWith(PHONE_PREFIX) ? p : normalizePhone(p)));
  }, []);

  const onPhoneKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    const el = e.currentTarget;
    const start = el.selectionStart ?? 0;
    const end = el.selectionEnd ?? 0;
    const pl = PHONE_PREFIX.length;

    if (e.key === "Backspace") {
      const cursorBlocksPrefix =
        start === end && start <= pl;
      const selectionTouchesPrefix = start < end && start < pl;
      if (cursorBlocksPrefix || selectionTouchesPrefix) {
        e.preventDefault();
      }
    }

    if (e.key === "Delete" && start < pl) {
      e.preventDefault();
    }
  }, []);

  return (
    <form
      className={["contact-request-form", className].filter(Boolean).join(" ")}
      onSubmit={onSubmit}
      aria-label="Форма заявки"
      noValidate
    >
      <fieldset className="contact-request-form-fieldset">
        <legend className="sr-only">
          Поля заявки: имя, телефон, тип объекта, комментарий
        </legend>

        <div className="contact-request-form-field">
          <label htmlFor={pid("name")} className="contact-request-form-label">
            Имя
          </label>
          <input
            id={pid("name")}
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Как к вам обращаться"
            className="contact-request-form-input"
          />
        </div>

        <div className="contact-request-form-field">
          <label htmlFor={pid("phone")} className="contact-request-form-label">
            Телефон
          </label>
          <input
            id={pid("phone")}
            name="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="+7 …"
            className="contact-request-form-input"
            value={phone}
            onChange={onPhoneChange}
            onFocus={onPhoneFocus}
            onKeyDown={onPhoneKeyDown}
          />
        </div>

        <div className="contact-request-form-field">
          <label htmlFor={pid("task")} className="contact-request-form-label">
            Тип объекта / задача
          </label>
          <div className="contact-request-form-select-wrap">
            <select
              id={pid("task")}
              name="taskType"
              defaultValue=""
              className="contact-request-form-select"
            >
              <option value="" disabled>
                Выберите вариант
              </option>
              <option value="house">Частный дом</option>
              <option value="commercial">Коммерческий объект</option>
              <option value="industrial">Промышленный объект</option>
              <option value="reconstruction">Реконструкция / пристройка</option>
              <option value="design">Проектирование и документация</option>
              <option value="other">Другое</option>
            </select>
            <span className="contact-request-form-select-caret" aria-hidden>
              ▼
            </span>
          </div>
        </div>

        <div className="contact-request-form-field">
          <label htmlFor={pid("comment")} className="contact-request-form-label">
            Комментарий
          </label>
          <textarea
            id={pid("comment")}
            name="comment"
            rows={4}
            placeholder="Кратко опишите задачу, участок или объект"
            className="contact-request-form-textarea"
          />
        </div>

        <div className="contact-request-form-submit-wrap">
          <button
            type="submit"
            className="contact-request-form-submit premium-cta-button premium-cta-button--primary"
          >
            <span className="premium-cta-button__label">Отправить заявку</span>
          </button>
          <p className="contact-request-form-consent">
            Нажимая кнопку, вы соглашаетесь с{" "}
            {onPrivacyPolicyClick ? (
              <button
                type="button"
                className="contact-request-form-consent-link"
                onClick={onPrivacyPolicyClick}
              >
                политикой обработки персональных данных
              </button>
            ) : (
              <>политикой обработки персональных данных</>
            )}
            .
          </p>
        </div>
      </fieldset>
    </form>
  );
}
