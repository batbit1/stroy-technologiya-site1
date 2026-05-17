/** Событие для открытия модалки заявки из ContactSection (слушатель монтируется в секции). */
export const CONTACT_OPEN_REQUEST_FORM_EVENT = "stry-open-request-form";

export function dispatchOpenContactRequestForm() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONTACT_OPEN_REQUEST_FORM_EVENT));
}
