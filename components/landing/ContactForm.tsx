"use client";

import {
  useCallback,
  useState,
  type ChangeEvent,
  type FormEventHandler,
  type KeyboardEvent,
} from "react";

import { CONTACT_FORM_SUBMIT_URL } from "@/lib/contact-form-endpoint";

const PHONE_PREFIX = "+7 ";

const TASK_TYPE_LABELS: Record<string, string> = {
  house: "Частный дом",
  commercial: "Коммерческий объект",
  industrial: "Промышленный объект",
  reconstruction: "Реконструкция / пристройка",
  design: "Проектирование и документация",
  other: "Другое",
};

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
  onPrivacyPolicyClick?: () => void;
  /** После успешной отправки (например закрыть модальное окно). */
  onSent?: () => void;
};

export function ContactForm({
  idPrefix,
  className,
  onPrivacyPolicyClick,
  onSent,
}: ContactFormProps) {
  const pid = (suffix: string) => `${idPrefix}-${suffix}`;
  const [phone, setPhone] = useState(PHONE_PREFIX);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    | null
    | { type: "success" | "error"; text: string }
  >(null);

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
      const cursorBlocksPrefix = start === end && start <= pl;
      const selectionTouchesPrefix = start < end && start < pl;
      if (cursorBlocksPrefix || selectionTouchesPrefix) {
        e.preventDefault();
      }
    }

    if (e.key === "Delete" && start < pl) {
      e.preventDefault();
    }
  }, []);

  const handleSubmit = useCallback<FormEventHandler<HTMLFormElement>>(
    async (event) => {
      event.preventDefault();
      console.log("[ContactForm] submit clicked");

      const form = event.currentTarget;
      const fd = new FormData(form);
      const name = String(fd.get("name") ?? "").trim();
      const taskRaw = String(fd.get("taskType") ?? "").trim();
      const comment = String(fd.get("comment") ?? "").trim();
      const phoneTrim = phone.trim();
      const digits = phoneTrim.replace(/\D/g, "");

      setFeedback(null);

      if (!name) {
        setFeedback({
          type: "error",
          text: "Укажите, пожалуйста, имя.",
        });
        return;
      }

      if (digits.length < 11) {
        setFeedback({
          type: "error",
          text: "Укажите корректный номер телефона.",
        });
        return;
      }

      const projectType =
        taskRaw && TASK_TYPE_LABELS[taskRaw]
          ? TASK_TYPE_LABELS[taskRaw]
          : taskRaw || "Не указано";

      setIsSubmitting(true);

      try {
        const response = await fetch(CONTACT_FORM_SUBMIT_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name,
            phone: phoneTrim,
            projectType,
            comment,
          }),
        });

        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;

        if (!response.ok) {
          throw new Error(data?.error ?? "Не удалось отправить заявку");
        }

        setFeedback({
          type: "success",
          text: "Заявка отправлена. Мы свяжемся с вами.",
        });
        form.reset();
        setPhone(PHONE_PREFIX);
        onSent?.();
      } catch (err) {
        console.error("[ContactForm] submit error", err);
        setFeedback({
          type: "error",
          text:
            "Не удалось отправить заявку. Попробуйте ещё раз или позвоните.",
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSent, phone],
  );

  return (
    <form
      className={["contact-request-form", className].filter(Boolean).join(" ")}
      onSubmit={handleSubmit}
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
            disabled={isSubmitting}
            className="contact-request-form-submit premium-cta-button premium-cta-button--primary"
          >
            <span className="premium-cta-button__label">
              {isSubmitting ? "Отправляем..." : "Отправить заявку"}
            </span>
          </button>

          {feedback ? (
            <p
              className={`contact-request-form-feedback contact-request-form-feedback--${feedback.type}`}
              role="status"
              aria-live="polite"
            >
              {feedback.text}
            </p>
          ) : null}

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
