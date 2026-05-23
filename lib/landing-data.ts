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
  "Архитектурное проектирование",
  "Строительство под ключ",
  "Инженерные системы",
  "Контроль качества",
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
    title: "Архитектурная студия\nи застройщик домов",
    text: "Проектируем и строим современные загородные дома в Оренбурге и области — с фиксированной сметой, контролем качества и полным циклом от идеи до сдачи.",
    featurePoints: [
      {
        title: "Проектирование и строительство домов",
        description:
          "Архитектурное проектирование, инженерия и строительство под ключ — одна команда, одна ответственность.",
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
          "Договор включает смету, график и ответственность сторон — без скрытых расходов и внезапных изменений.",
      },
      {
        title: "Более 50 реализованных домов",
        description:
          "Загородные дома и коттеджи — каждый объект сдан в срок с полным пакетом документов.",
      },
      {
        title: "Современные материалы и технологии",
        description:
          "Кирпич, газобетон, монолит — сертифицированные материалы и контроль на каждом этапе.",
      },
    ],
  },
  {
    sceneKey: "services",
    eyebrow: "УСЛУГИ",
    visualType: "proofCard",
    proofCardHeader: "НАПРАВЛЕНИЯ",
    title: "Проектирование и строительство домов",
    text: "Полный цикл для загородного дома: архитектурный проект, инженерные системы, строительство коробки, отделка и сдача объекта с документами.",
    featurePoints: [
      {
        title: "Архитектурное проектирование",
        description: "",
      },
      {
        title: "Строительство домов под ключ",
        description: "",
      },
      {
        title: "Индивидуальные и адаптируемые проекты",
        description: "",
      },
      {
        title: "Дома из кирпича, газобетона и газоблока",
        description: "",
      },
      {
        title: "Инженерные системы и отделка",
        description: "",
      },
    ],
  },
  {
    sceneKey: "guarantees",
    eyebrow: "ГАРАНТИИ",
    visualType: "proofCard",
    proofCardHeader: "КОНТРОЛЬ КАЧЕСТВА",
    title: "Качество на каждом этапе",
    text:
      "Фиксируем договор, смету и график до начала строительства. Контролируем материалы и работы — от фундамента до сдачи дома с документами.",
    cta: "Обсудить проект дома",
    stats: [
      { value: "10+", label: "лет опыта" },
      { value: "50+", label: "домов" },
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
        title: "Технический надзор на площадке",
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
    proofCardHeader: "Этапы строительства",
    title: "Как мы строим дом",
    text: "Прозрачный процесс от консультации до передачи ключей. Фиксируем смету, этапы и сроки — вы понимаете, что происходит на каждом шаге.",
    supportingParagraph:
      "Каждый этап строительства сопровождается контролем качества, согласованием решений и прозрачной коммуникацией — от проектирования до сдачи готового дома.",
    cta: "Обсудить проект дома",
    featurePoints: [
      { title: "Консультация и анализ участка", description: "" },
      { title: "Архитектурное проектирование", description: "" },
      { title: "Смета и договор", description: "" },
      { title: "Строительство коробки", description: "" },
      { title: "Инженерия и отделка", description: "" },
      { title: "Сдача дома и документы", description: "" },
    ],
  },
  {
    sceneKey: "engineering",
    eyebrow: "ИНЖЕНЕРИЯ",
    visualType: "proofCard",
    proofCardHeader: "Инженерные системы",
    title: "Инженерия загородного дома",
    text:
      "Проектируем и монтируем все инженерные системы — отопление, вентиляция, электрика, водоснабжение. Согласуем решения с архитектурой до начала строительства.",
    supportingParagraph:
      "Комплексный подход: коммуникации, технические системы и отделка — чтобы дом был готов к эксплуатации без привлечения дополнительных подрядчиков.",
    cta: "Обсудить инженерию",
    featurePoints: [
      { title: "Отопление и тёплые полы", description: "" },
      { title: "Электрика и умный дом", description: "" },
      {
        title: "Водоснабжение и канализация",
        description: "",
      },
      { title: "Вентиляция и кондиционирование", description: "" },
      {
        title: "Черновая и чистовая отделка",
        description: "",
      },
      { title: "Подготовка дома к заселению", description: "" },
    ],
  },
  {
    sceneKey: "documents",
    eyebrow: "ДОКУМЕНТЫ",
    visualType: "proofCard",
    proofCardHeader: "Подтверждения",
    title: "Официально и прозрачно",
    text:
      "Лицензия СРО, аккредитации, договор с фиксированной сметой и полный пакет исполнительной документации — для банка, эксплуатации и вашего спокойствия.",
    supportingParagraph:
      "Каждый дом сопровождается прозрачными условиями, подтверждённым статусом подрядчика и документами, которые фиксируют ответственность, сроки и результат.",
    cta: "Обсудить проект дома",
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