/** Единый источник контактных данных сайта. */

export const SITE_PHONE_DISPLAY = "+7 (961) 944-00-00";
export const SITE_PHONE_HREF = "tel:+79619440000";

export const SITE_EMAIL = "skt-remont56@mail.ru";
export const SITE_EMAIL_HREF = "mailto:skt-remont56@mail.ru";

export const SITE_ADDRESS = "г. Оренбург, ул. Автомобилистов 37/1";

/** Координаты офиса: широта, долгота. */
export const SITE_MAP_LAT = 51.843078;
export const SITE_MAP_LON = 55.182322;

/** WhatsApp — тот же номер, что и основной телефон. */
export const SITE_WHATSAPP_HREF = "https://wa.me/79619440000";

const MAP_QUERY = encodeURIComponent(SITE_ADDRESS);
/** Яндекс.Карты: долгота, широта. */
const YANDEX_LL = `${SITE_MAP_LON},${SITE_MAP_LAT}`;
const YANDEX_PT = `${YANDEX_LL},pm2rdm`;

export const SITE_YANDEX_MAP_IFRAME_SRC = `https://yandex.ru/map-widget/v1/?ll=${encodeURIComponent(YANDEX_LL)}&z=16&pt=${encodeURIComponent(YANDEX_PT)}`;
export const SITE_YANDEX_ROUTE_HREF = `https://yandex.ru/maps/?text=${MAP_QUERY}&ll=${encodeURIComponent(YANDEX_LL)}&z=16&pt=${encodeURIComponent(YANDEX_PT)}`;
export const SITE_GOOGLE_MAP_HREF = `https://www.google.com/maps?q=${SITE_MAP_LAT},${SITE_MAP_LON}`;

export const SITE_PHONE_OPTIONS = [
  {
    label: "Телефон",
    display: SITE_PHONE_DISPLAY,
    href: SITE_PHONE_HREF,
  },
] as const;
