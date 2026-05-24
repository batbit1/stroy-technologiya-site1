/**
 * siteContent.ts — единственный источник всех текстовых данных лендинга.
 * Замените placeholder-значения на реальный контент клиента.
 *
 * Механика scroll-sequence и canvas управляется через lib/landing-data.ts.
 */

import { PORTFOLIO_IMAGE_BLUR_DATA_URL } from "./portfolioMedia";
import { HERO_MICRO_BENEFITS } from "@/lib/landing-data";

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface SiteMeta {
  title: string;
  description: string;
}

export interface SiteHero {
  brand: string;
  /** Строки заголовка; поддерживается `\n` внутри строки для ручного переноса */
  headlineLines: string[];
  /** Верхняя meta-строка обложки (uppercase в вёрстке) */
  coverEyebrow: string;
  tagline: string;
  /** Подзаголовок hero-секции */
  subheadline: string;
  /** Текст основной CTA-кнопки */
  ctaPrimary: string;
  /** Текст второстепенной CTA-ссылки */
  ctaSecondary: string;
  /** Короткие пункты под описанием hero (без карточек) */
  microBenefits: string[];
}

/** Пункт списка преимуществ (title + description, без нумерации в вёрстке). */
export interface SceneFeaturePoint {
  title: string;
  description: string;
}

/**
 * Карточка cinematic scroll-sequence.
 * startProgress / endProgress — доля скролла 0..1, когда карточка видима.
 * На desktop и mobile используется progress-driven анимация.
 */
export interface SceneCard {
  id: string;
  eyebrow: string;
  title: string;
  text: string;
  /** Простые строки-буллеты (с нумерацией в вёрстке, если заданы без featurePoints). */
  items?: string[];
  /** Развёрнутые пункты с подзаголовком и текстом; при наличии заменяют отображение items. */
  featurePoints?: SceneFeaturePoint[];
  side: "left" | "right";
  /** Вертикальная позиция карточки внутри слота (только desktop) */
  align?: "top" | "middle" | "bottom";
  /** Доля прогресса, с которой карточка начинает появляться (0..1) */
  startProgress: number;
  /** Доля прогресса, после которой карточка исчезает (0..1) */
  endProgress: number;
}

export interface PortfolioItem {
  title: string;
  location: string;
  area: string;
  year: string;
  /** Тип/категория объекта */
  tag: string;
  /** Описание объекта */
  caption: string;
  /** Статус («Сдано», «В эксплуатации»); год остаётся отдельным полем */
  status?: string;
  /** Имя заказчика — отображается в featured-карточке */
  client?: string;
  /** Путь в `/public` — при наличии показывается вместо плейсхолдера */
  imageSrc?: string;
  /** Крошечный data URL для `next/image` `placeholder="blur"` при заданном `imageSrc` */
  blurDataURL?: string;
}

export interface SitePortfolio {
  /** Редакционная meta над заголовком */
  eyebrowLine: string;
  heading: string;
  /** Короткое описание каталога секции */
  description: string;
  items: PortfolioItem[];
}

export interface PremiumServiceItem {
  title: string;
  description: string;
  image?: string;
}

export interface SiteDesignSection {
  eyebrow: string;
  heading: string;
  lede: string;
  items: PremiumServiceItem[];
  footnote?: string;
  ctaLabel: string;
}

export interface TurnkeyProcessBlock {
  step: string;
  title: string;
  description: string;
}

export interface SiteTurnkeySection {
  eyebrow: string;
  heading: string;
  lede: string;
  blocks: TurnkeyProcessBlock[];
  ctaLabel: string;
  ctaSecondaryLabel: string;
}

export interface HomeProjectCard {
  title: string;
  label: string;
  area: string;
  format: string;
  style: string;
  description: string;
  image?: string;
}

export interface SiteHomeProjectsSection {
  eyebrow: string;
  heading: string;
  lede: string;
  cards: HomeProjectCard[];
  ctaLabel: string;
  ctaSecondaryLabel: string;
}

export interface WorkStageItem {
  number: string;
  title: string;
  description: string;
}

export interface SiteWorkStagesSection {
  eyebrow: string;
  heading: string;
  lede: string;
  stages: WorkStageItem[];
  trustPills: string[];
  ctaLabel: string;
  ctaSecondaryLabel: string;
}

export interface SitePopularProjectsSection {
  eyebrow: string;
  heading: string;
  lede: string;
  headerAsideTitle: string;
  headerAsideSubtext: string;
  featuredEyebrow: string;
  ctaLabel: string;
  ctaSecondaryLabel: string;
  cardHint: string;
}

export interface SiteContacts {
  /** Редакционная строка над заголовком секции контактов */
  sectionLabel: string;
  /** Крупный заголовок (serif на стороне дизайна) */
  heading: string;
  /** Уверенное короткое описание приглашения */
  subheading: string;
  /** Телефон для набора tel: */
  phone: string;
  /** Контакт мессенджера — подпись */
  messengerLabel: string;
  /** Ссылка мессенджера (tg / wa.me и т.д.) */
  messengerHref: string;
  /** Короткая строка email */
  email: string;
  /** Город / регион работы */
  locality: string;
  /** При необходимости — офисный адрес (одна строка) */
  address?: string;
  /** Режим работы строкой */
  workingHours: string;
  /** Подпись основной кнопки формы */
  ctaLabel: string;
  /** Микродоверительный текст под кнопкой */
  trustNote: string;
  /** Шаги «как после заявки» — короткие фразы */
  processSteps: string[];
}

export interface SiteContent {
  meta: SiteMeta;
  hero: SiteHero;
  /** 5 карточек поверх cinematic scroll-сцены */
  sceneCards: SceneCard[];
  portfolio: SitePortfolio;
  design: SiteDesignSection;
  turnkey: SiteTurnkeySection;
  homeProjects: SiteHomeProjectsSection;
  workStages: SiteWorkStagesSection;
  popularProjects: SitePopularProjectsSection;
  contacts: SiteContacts;
}

// ─── Контент ─────────────────────────────────────────────────────────────────

export const SITE_CONTENT: SiteContent = {
  // ── Мета ──────────────────────────────────────────────────────────────────
  meta: {
    title:
      "СК ТЕХНОЛОГИЯ — проектирование и строительство домов под ключ | Оренбург",
    description:
      "Архитектурное проектирование и строительство современных загородных домов под ключ в Оренбурге и области. Индивидуальные проекты, инженерные системы, полный цикл — от идеи до сдачи. СРО, ДОМ.РФ, Сбербанк.",
  },

  // ── Hero ──────────────────────────────────────────────────────────────────
  hero: {
    brand: "СК ТЕХНОЛОГИЯ",
    headlineLines: [
      "Проектируем\nи строим современные\nзагородные дома",
    ],
    coverEyebrow: "ОРЕНБУРГ И ОБЛАСТЬ",
    tagline: "Оренбург и область · архитектурная студия и застройщик",
    subheadline:
      "Индивидуальное проектирование, строительство домов под ключ и инженерные системы — в одной команде с контролем сроков, сметы и качества.",
    ctaPrimary: "Запросить расчёт дома",
    ctaSecondary: "Смотреть проекты",
    microBenefits: [...HERO_MICRO_BENEFITS],
  },

  // ── Карточки cinematic scroll-сцены ───────────────────────────────────────
  //
  // Scroll distance: 800vh (spacer h-[800vh] + section h-screen = 900vh total).
  // FADE_RATIO = 0.125 → 12.5% вход / 75% стабильно / 12.5% выход.
  //
  // Все карточки — единая позиция: bottom-left editorial panel.
  // Hero растворяется к progress 0.15. Первая карточка появляется с 0.16.
  // Окна строго НЕ ПЕРЕСЕКАЮТСЯ (gap = 0.01 между слотами).
  // В любой момент видна только одна карточка.
  //
  // Прогрессовые окна (window = 0.16, gap = 0.01, range = 800vh):
  //   why-us:     0.16 – 0.32   stable ≈ 96vh   fade ≈ 16vh
  //   services:   0.33 – 0.49   stable ≈ 96vh   fade ≈ 16vh
  //   guarantees: 0.50 – 0.66   stable ≈ 96vh   fade ≈ 16vh
  //   process:    0.67 – 0.83   stable ≈ 96vh   fade ≈ 16vh
  //   documents:  0.84 – 1.00   stable ≈ 102vh  fade ≈ 17vh
  sceneCards: [
    {
      id: "why-us",
      eyebrow: "О нас",
      title: "Почему выбирают СК ТЕХНОЛОГИЮ",
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
      side: "left",
      startProgress: 0.16,
      endProgress: 0.32,
    },
    {
      id: "services",
      eyebrow: "СПЕКТР РАБОТ",
      title: "От чертежа до передачи",
      text: "Берём на себя проектирование, новое строительство и реконструкцию: коробка, кровля, фасад, инженерия и отделка в согласованном графике.",
      items: [
        "Новые частные дома и коттеджи",
        "Реконструкция и пристройки",
        "Кирпич, газобетон, газоблок",
        "Коммерческие объекты по запросу",
      ],
      side: "left",
      startProgress: 0.33,
      endProgress: 0.49,
    },
    {
      id: "guarantees",
      eyebrow: "ДИСЦИПЛИНА",
      title: "Условия зафиксированы заранее",
      text: "Смета, этапы и объём работ записываем в договор до выхода на площадку. Приёмка — по регламенту, с документами на каждый значимый слой.",
      items: [
        "Смета и календарь в контракте",
        "Оплата по факту этапов",
        "Материалы с подтверждённым происхождением",
        "Технический надзор на площадке",
      ],
      side: "left",
      startProgress: 0.5,
      endProgress: 0.66,
    },
    {
      id: "process",
      eyebrow: "КАК МЫ ВЕДЁМ ДОМ",
      title: "Шесть понятных глав",
      text: "От проекта до передачи ключей — последовательность, в которой видно, что сделано сегодня и что открывается завтра.",
      items: [
        "Встреча и разбор участка или дома",
        "Эскиз сметы и договор",
        "Строительство по утверждённым этапам",
        "Сдача с актами и комплектом документов",
      ],
      side: "left",
      startProgress: 0.67,
      endProgress: 0.83,
    },
    {
      id: "documents",
      eyebrow: "ОФОРМЛЕНИЕ",
      title: "Готово для банка и эксплуатации",
      text: "Работаем в легальном поле: членство в СРО, аккредитации, исполнительная документация — без «серых» схем и дыр в пакете.",
      items: [
        "Документы СРО",
        "Аккредитации ДОМ.РФ и Сбербанка",
        "Договор и закрывающая отчётность",
        "Исполнительная документация объекта",
      ],
      side: "left",
      startProgress: 0.84,
      endProgress: 1.0,
    },
  ],

  // ── Портфолио ─────────────────────────────────────────────────────────────
  portfolio: {
    eyebrowLine: "РЕАЛИЗОВАННЫЕ ДОМА",
    heading: "Построенные загородные дома",
    description:
      "Частные дома и коттеджи в Оренбурге и области — от архитектурной концепции до сдачи с инженерией и отделкой.",
    items: [
      {
        title: "Работы по перепланировке дополнительного офиса",
        client: "СБЕР",
        location: "г. Гай, Оренбургская область",
        area: "",
        year: "2024",
        tag: "Коммерческий объект",
        status: "Завершён",
        caption:
          "Компания «СК ТЕХНОЛОГИЯ» выполнила работы по перепланировке дополнительного офиса ПАО СБЕРБАНК в Оренбургской области, г. Гай, ул. Ленина 23.",
        imageSrc: "/portfolio/project-01-residence-transportnaya.jpg",
        blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
      },
      {
        title: "Работы по перепланировке дополнительного офиса",
        location: "Оренбургская область",
        area: "",
        year: "2024",
        tag: "Коммерческий объект",
        status: "Завершён",
        caption:
          "Реализованный коммерческий объект с комплексом строительных и организационных работ.",
        imageSrc: "/portfolio/project-02-pavilion-letnaya.jpg",
        blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
      },
      {
        title: "Работы по перепланировке структурного подразделения",
        location: "Оренбургская область",
        area: "",
        year: "2023",
        tag: "Коммерческий объект",
        status: "Завершён",
        caption:
          "Работы по адаптации и перепланировке помещений под задачи действующего подразделения.",
        imageSrc: "/portfolio/project-03-workshop-outskirts.jpg",
        blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
      },
      {
        title: "Строительство административно-производственного комплекса",
        location: "Оренбургская область",
        area: "",
        year: "2023",
        tag: "Промышленный объект",
        status: "Завершён",
        caption:
          "Строительство объекта промышленного назначения с учётом требований эксплуатации и документации.",
        imageSrc: "/portfolio/project-04-cottage-nezhinka.jpg",
        blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
      },
      {
        title: "Строительство торгово-офисного комплекса с гостиницей",
        location: "Оренбург",
        area: "",
        year: "2022",
        tag: "Коммерческая недвижимость",
        status: "Завершён",
        caption:
          "Комплексный объект коммерческой недвижимости с несколькими функциональными зонами.",
        imageSrc: "/portfolio/project-05-office-center.jpg",
        blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
      },
      {
        title: "Строительство административно-производственного комплекса",
        location: "Оренбургская область",
        area: "",
        year: "2022",
        tag: "Промышленный объект",
        status: "Завершён",
        caption:
          "Реализованный административно-производственный объект с контролем качества и сроков.",
        imageSrc: "/portfolio/project-06-house-forshtadt.jpg",
        blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
      },
    ],
  },

  // ── Проектирование домов ────────────────────────────────────────────────────
  design: {
    eyebrow: "АРХИТЕКТУРА И ПРОЕКТИРОВАНИЕ",
    heading: "Проектирование\nдомов",
    lede:
      "Архитектурная студия полного цикла — от концепции участка до рабочей документации и сопровождения на стройке.",
    items: [
      {
        title: "Индивидуальное проектирование",
        description:
          "Дом под ваш участок, образ жизни и бюджет — без типовых решений и компромиссов в планировке.",
        image: "/portfolio/projects/project-04.webp",
      },
      {
        title: "Архитектурная концепция",
        description:
          "Фасады, объёмы, материалы и остекление — в единой авторской идее современного загородного дома.",
        image: "/portfolio/projects/project-02.webp",
      },
      {
        title: "Адаптация планировок",
        description:
          "Корректируем решения под рельеф, ориентацию и сценарий проживания — зонирование и связь с участком.",
        image: "/portfolio/projects/project-03.webp",
      },
      {
        title: "Рабочая документация",
        description:
          "Комплект чертежей и спецификаций для стройки — конструктив, инженерия и узлы без сюрпризов на объекте.",
        image: "/portfolio/projects/project-01.webp",
      },
    ],
    footnote: "Авторское сопровождение включается по запросу.",
    ctaLabel: "Обсудить проектирование",
  },

  // ── Строительство под ключ ────────────────────────────────────────────────
  turnkey: {
    eyebrow: "СТРОИТЕЛЬСТВО ПОД КЛЮЧ",
    heading: "Берём на себя весь путь — от проекта до готового дома",
    lede:
      "Организуем строительство частных домов под ключ: подбираем технологии, контролируем этапы, ведём инженерные решения и доводим объект до результата, готового к жизни.",
    blocks: [
      {
        step: "01",
        title: "Подготовка и смета",
        description:
          "Анализируем участок, задачи семьи, бюджет и подбираем оптимальную технологию строительства.",
      },
      {
        step: "02",
        title: "Проект и конструктив",
        description:
          "Связываем архитектурную концепцию с реальными строительными решениями, чтобы дом был красивым, надежным и удобным.",
      },
      {
        step: "03",
        title: "Коробка дома",
        description:
          "Возводим фундамент, стены, перекрытия и кровлю с контролем геометрии, узлов и качества материалов.",
      },
      {
        step: "04",
        title: "Инженерные системы",
        description:
          "Прорабатываем отопление, электрику, водоснабжение, вентиляцию и другие системы до начала отделочных работ.",
      },
      {
        step: "05",
        title: "Фасад и отделка",
        description:
          "Доводим внешний облик и внутренние пространства до цельного, аккуратного и современного результата.",
      },
      {
        step: "06",
        title: "Сдача объекта",
        description:
          "Передаём готовый дом с понятной логикой эксплуатации и завершёнными ключевыми этапами работ.",
      },
    ],
    ctaLabel: "Рассчитать строительство дома",
    ctaSecondaryLabel: "Получить консультацию по проекту",
  },

  // ── Проекты домов ─────────────────────────────────────────────────────────
  homeProjects: {
    eyebrow: "АРХИТЕКТУРНЫЕ РЕШЕНИЯ",
    heading:
      "Дома, которые можно адаптировать под ваш участок, стиль жизни и бюджет",
    lede:
      "Мы можем разработать индивидуальный проект дома или адаптировать готовую концепцию: от компактного современного дома до просторной загородной резиденции для семьи.",
    cards: [
      {
        title: "Современный одноэтажный дом",
        label: "Современная архитектура",
        area: "от 110 м²",
        format: "1 этаж",
        style: "Минимализм",
        description:
          "Рациональная планировка, кухня-гостиная, мастер-спальня и терраса.",
        image: "/images/projects/project-house-01.webp",
      },
      {
        title: "Дом с мансардой",
        label: "Современная классика",
        area: "от 140 м²",
        format: "1 этаж + мансарда",
        style: "Классика",
        description:
          "Компактное решение с приватной мансардной зоной для спален и кабинета.",
        image: "/images/projects/project-house-02.webp",
      },
      {
        title: "Просторный семейный коттедж",
        label: "Загородная архитектура",
        area: "от 160 м²",
        format: "2 этажа",
        style: "Премиум",
        description:
          "Коттедж для большой семьи с разделением общественных и приватных зон.",
        image: "/images/projects/project-house-03.webp",
      },
      {
        title: "Индивидуальная резиденция",
        label: "Архитектурный проект",
        area: "от 220 м²",
        format: "Индивидуальный",
        style: "Luxury",
        description:
          "Проект под участок и сценарии семьи — архитектура, инженерия и планировка как единая система.",
        image: "/images/projects/project-house-04.webp",
      },
    ],
    ctaLabel: "Подобрать проект дома",
    ctaSecondaryLabel: "Обсудить индивидуальное решение",
  },

  // ── Этапы работы ───────────────────────────────────────────────────────────
  workStages: {
    eyebrow: "ПРОЦЕСС И КОНТРОЛЬ",
    heading: "Каждый этап\nстроительства —\nпод контролем",
    lede:
      "Мы ведём проект последовательно: от первой консультации и сметы до сдачи дома. Клиент понимает, что происходит на объекте, какие работы выполнены и за что он платит.",
    trustPills: [
      "Договор и понятная смета",
      "Контроль качества на этапах",
      "Фотоотчёты по ходу работ",
      "Сопровождение до сдачи",
    ],
    stages: [
      {
        number: "01",
        title: "Знакомство и задача",
        description:
          "Обсуждаем участок, формат дома, бюджет, сроки и сценарии жизни семьи. Формируем понятное техническое задание.",
      },
      {
        number: "02",
        title: "Концепция и проект",
        description:
          "Разрабатываем архитектурную идею, планировки, конструктив и инженерную логику будущего дома.",
      },
      {
        number: "03",
        title: "Смета и договор",
        description:
          "Фиксируем состав работ, материалы, этапы и финансовую логику проекта до старта строительства.",
      },
      {
        number: "04",
        title: "Подготовка и старт работ",
        description:
          "Организуем участок, закупки, график работ и запускаем строительство без хаотичных решений на месте.",
      },
      {
        number: "05",
        title: "Контроль строительства",
        description:
          "Проверяем ключевые узлы, геометрию, качество материалов и соответствие работ проекту.",
      },
      {
        number: "06",
        title: "Инженерия и отделка",
        description:
          "Интегрируем отопление, электрику, водоснабжение, вентиляцию и доводим дом до нужной степени готовности.",
      },
      {
        number: "07",
        title: "Сдача дома",
        description:
          "Передаём объект с завершёнными этапами, понятной эксплуатацией и финальной проверкой качества.",
      },
    ],
    ctaLabel: "Получить план строительства",
    ctaSecondaryLabel: "Обсудить этапы работ",
  },

  // ── Портфолио / реализованные проекты ─────────────────────────────────────
  popularProjects: {
    eyebrow: "ПОРТФОЛИО И ОПЫТ",
    heading: "Реализованные проекты",
    lede:
      "Показываем объекты, где проектирование, строительство и отделка превращаются в понятный результат.",
    headerAsideTitle: "Архитектура. Инженерия. Строительство.",
    headerAsideSubtext:
      "Комплексный подход к созданию домов, которые служат поколениям.",
    featuredEyebrow: "КОММЕРЧЕСКИЕ ПРОЕКТЫ",
    cardHint: "Обсудить похожий проект",
    ctaLabel: "Обсудить похожий проект",
    ctaSecondaryLabel: "Получить консультацию",
  },

  // ── Контакты ──────────────────────────────────────────────────────────────
  contacts: {
    sectionLabel: "Консультация архитектурной студии",
    heading: "Обсудим ваш будущий дом",
    subheading:
      "Расскажите, какой дом вы хотите построить. Мы уточним задачу, участок, формат работ и предложим следующий шаг.",
    phone: "+7 (961) 944-00-00",
    messengerLabel: "WhatsApp или Telegram — как удобнее",
    messengerHref: "https://wa.me/79619440000",
    email: "skt-remont56@mail.ru",
    locality: "Оренбург и Оренбургская область",
    address: "г. Оренбург, ул. Автомобилистов 37/1",
    workingHours: "Будни · 10:00–18:00 по предварительной записи",
    ctaLabel: "Получить консультацию",
    trustNote:
      "Ответим, уточним задачу и предложим следующий шаг без навязчивых звонков.",
    processSteps: [
      "Вы оставляете контур задачи — мы отвечаем в том же ключе спокойного разговора.",
      "При необходимости уточняем участок, текущий дом и формат ведения: проектирование, стройка или реконструкция.",
      "Согласуем слот звонка или встречи и фиксируем, каким будет разумный следующий шаг.",
    ],
  },
};
