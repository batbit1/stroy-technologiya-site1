/** Количество кадров desktop-sequence (frame_0001 … frame_0122) */
export const DESKTOP_SEQUENCE_FRAMES = 122;

/** Количество кадров mobile-sequence (frame_0001 … frame_0122) */
export const MOBILE_SEQUENCE_FRAMES = 122;

/**
 * Высота scroll-spacer под sticky-сцену на узкой вёрстке (в vh), без единицы.
 * Должна совпадать с `SCROLL_LENGTH_VH_MOBILE` в `LandingScrollScene.tsx`
 * (сегменты глав = spacer / (STORY_STEPS.length + 1)).
 */
export const MOBILE_LANDING_SCROLL_SPACER_VH = 1250;

/** Микролиния преимуществ под hero-описанием (первый экран). */
export const HERO_MICRO_BENEFITS = [
  "Гарантия качества",
  "Соблюдение сроков",
  "Договор и смета",
  "Контроль работ",
] as const;

// ─── Legacy / unused ─────────────────────────────────────────────────────────

/** Kept for FeatureCard.tsx (not used in the active scroll scene). */
export interface LandingCardContent {
  title: string;
  body: string;
}

// ─── Luxury Story Card ────────────────────────────────────────────────────────

export type StoryVisualType =
  | "proofCard"
  | "blueprint"
  | "foundation"
  | "structure"
  | "envelope"
  | "interior"
  | "document-kit";

/** Пара title + description для story-блока без нумерации в вёрстке. */
export interface StoryFeaturePoint {
  title: string;
  description: string;
}

/** Компактные показатели под копией (например в proof-сценах). */
export interface StoryProofStat {
  value: string;
  label: string;
}

/** Стабильный ключ сюжетной сцены (mobile CSS `data-scene-key`, отладка). */
export type LandingStorySceneKey =
  | "about"
  | "services"
  | "guarantees"
  | "process"
  | "engineering"
  | "documents";

export interface StoryStep {
  sceneKey: LandingStorySceneKey;
  eyebrow: string;
  /** Заголовок; в `CinematicTitle` допускается `\n` для поручных переносов (2+ непустые строки). */
  title: string;
  text: string;
  bullets?: string[];
  /** Развёрнутые преимущества; при задании рендерятся вместо `bullets`, без счётчиков 01/02. */
  featurePoints?: StoryFeaturePoint[];
  /** Шапка правой proof-card при `visualType: "proofCard"`; по умолчанию «Надёжность в деталях». */
  proofCardHeader?: string;
  /** Компактные метрики слева (только если заданы; proof layout). */
  stats?: StoryProofStat[];
  /** Тип HUD-визуала для split-story (SplitCinematicStory). */
  visualType?: StoryVisualType;
  /** Второй абзац слева (спокойный supporting copy) только в proof-сценах, под `text`. */
  supportingParagraph?: string;
  /** Заголовок визуального плейсхолдера / будущего изображения */
  visualTitle?: string;
  /** Подпись под визуальным блоком */
  visualLabel?: string;
  /** Путь к реальному изображению (необязательно, пока не используется) */
  imageSrc?: string;
  /** Текст CTA-кнопки (ссылка на #contacts). Только для последнего шага. */
  cta?: string;
}

/**
 * Контент сюжетной линии лендинга (SplitCinematicStory; legacy: LuxuryStoryCard).
 * Разбиение по главам — `mapScrollToChapters` в LandingScrollScene (равные сегменты скролла).
 */
export const STORY_STEPS: StoryStep[] = [
  {
    sceneKey: "about",
    eyebrow: "О НАС",
    visualType: "proofCard",
    title: "Почему выбирают\nСТРОЙ ТЕХНОЛОГИЮ",
    text: "Строим дома, коммерческие и промышленные объекты в Оренбурге и Оренбургской области — там, где важны сроки, фиксированная смета, контроль качества и ответственность подрядчика.",
    featurePoints: [
      {
        title: "Работаем в Оренбурге и области",
        description:
          "Строим частные дома, коммерческие и промышленные объекты в Оренбурге и Оренбургской области.",
      },
      {
        title: "Аккредитация в ДОМ.РФ и Сбербанке",
        description:
          "Подтверждённая надёжность — прошли строгую проверку и включены в реестры аккредитованных подрядчиков.",
      },
      {
        title: "Лицензия СРО",
        description:
          "Лицензия на архитектурно-строительное проектирование. Работаем строго в рамках законодательства.",
      },
      {
        title: "Фиксируем стоимость и этапы",
        description:
          "Договор включает смету, график и ответственность сторон — никаких скрытых расходов и внезапных изменений.",
      },
      {
        title: "Более 50 реализованных объектов",
        description:
          "Частные дома, коммерческая и промышленная недвижимость — каждый объект сдан в срок с полным пакетом документов.",
      },
      {
        title: "Контроль качества материалов",
        description:
          "Используем сертифицированные материалы и технологии, контролируем качество на каждом этапе строительства.",
      },
    ],
  },
  {
    sceneKey: "services",
    eyebrow: "УСЛУГИ",
    visualType: "proofCard",
    proofCardHeader: "Направления работ",
    title: "Строительство и реконструкция под ключ",
    text: "Частные дома, коммерческие и промышленные объекты в Оренбурге и Оренбургской области. Берём на себя полный цикл: от расчёта стоимости и проекта до сдачи объекта с документами.",
    featurePoints: [
      {
        title: "Строительство домов под ключ",
        description: "",
      },
      {
        title: "Коммерческое строительство",
        description: "",
      },
      {
        title: "Промышленное строительство",
        description: "",
      },
      {
        title: "Дома из кирпича, газобетона и газоблока",
        description: "",
      },
      {
        title: "Реконструкция и модернизация",
        description: "",
      },
    ],
  },
  {
    sceneKey: "guarantees",
    eyebrow: "ГАРАНТИИ",
    visualType: "proofCard",
    proofCardHeader: "Контроль качества",
    title: "Гарантии и контроль качества",
    text:
      "Фиксируем договор, смету и этапы до начала строительства. Контролируем материалы и работы на каждом этапе — от закладки фундамента до сдачи объекта с документами.",
    cta: "Обсудить проект",
    stats: [
      { value: "10+", label: "лет опыта" },
      { value: "50+", label: "проектов" },
      { value: "СРО", label: "лицензия" },
    ],
    featurePoints: [
      {
        title: "Договор с фиксированной сметой",
        description: "",
      },
      {
        title: "Поэтапная оплата",
        description: "",
      },
      {
        title: "Сертифицированные материалы",
        description: "",
      },
      {
        title: "Технический надзор",
        description: "",
      },
      {
        title: "Проектная и исполнительная документация",
        description: "",
      },
      {
        title: "Ответственность за результат",
        description: "",
      },
    ],
  },
  {
    sceneKey: "process",
    eyebrow: "ПРОЦЕСС",
    visualType: "proofCard",
    proofCardHeader: "Этапы работы",
    title: "Как мы работаем",
    text: "Прозрачный процесс от первой консультации до сдачи дома или объекта. Фиксируем расчет стоимости, этапы и сроки — вы понимаете, что происходит на каждом шаге.",
    supportingParagraph:
      "Каждый этап строительства сопровождается контролем качества, согласованием решений и прозрачной коммуникацией с заказчиком — от первой встречи до передачи готового объекта.",
    cta: "Обсудить проект",
    featurePoints: [
      { title: "Заявка и консультация", description: "" },
      { title: "Анализ участка или объекта", description: "" },
      { title: "Предварительный расчет стоимости", description: "" },
      { title: "Договор и утверждение графика", description: "" },
      {
        title: "Строительство и контроль качества",
        description: "",
      },
      { title: "Сдача объекта и документы", description: "" },
    ],
  },
  {
    sceneKey: "engineering",
    eyebrow: "ИНЖЕНЕРИЯ И ОТДЕЛКА",
    visualType: "proofCard",
    proofCardHeader: "Внутренние работы",
    title: "Инженерия и отделка",
    text:
      "Берём на себя инженерные сети, внутренние работы и подготовку объекта к эксплуатации. Согласуем решения заранее, контролируем качество монтажа и доводим пространство до готового результата.",
    supportingParagraph:
      "Работаем комплексно: от коммуникаций и технических систем до чистовой отделки, чтобы дом, коммерческий или промышленный объект был готов к использованию без лишних подрядчиков.",
    cta: "Обсудить проект",
    featurePoints: [
      { title: "Инженерные сети", description: "" },
      { title: "Электрика и освещение", description: "" },
      {
        title: "Водоснабжение и канализация",
        description: "",
      },
      { title: "Отопление и вентиляция", description: "" },
      {
        title: "Черновая и чистовая отделка",
        description: "",
      },
      { title: "Подготовка объекта к сдаче", description: "" },
    ],
  },
  {
    sceneKey: "documents",
    eyebrow: "ДОКУМЕНТЫ",
    visualType: "proofCard",
    proofCardHeader: "Подтверждения",
    title: "Документы и подтверждения",
    text:
      "Работаем официально: лицензия СРО, аккредитации, договор с фиксированной сметой и полный пакет исполнительной документации по завершении строительства.",
    supportingParagraph:
      "Каждый объект сопровождается прозрачными условиями, подтверждённым статусом подрядчика и документами, которые фиксируют ответственность, сроки и результат.",
    cta: "Обсудить проект",
    featurePoints: [
      { title: "Лицензия СРО", description: "" },
      { title: "Аккредитация в Сбербанке", description: "" },
      { title: "Аккредитация в ДОМ.РФ", description: "" },
      {
        title: "Договор и исполнительная документация",
        description: "",
      },
    ],
  },
];