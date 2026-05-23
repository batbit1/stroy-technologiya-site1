/**
 * Showcase-портфолио и case-study проекты.
 * Файлы изображений: `public/portfolio/projects/project-0X.webp`.
 */

export const PORTFOLIO_IMAGE_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PgO6pQAAAABJRU5ErkJggg==";

export type PortfolioShowcaseProject = {
  id: string;
  category: string;
  title: string;
  client: string;
  description: string;
  image?: string;
  blurDataURL?: string;
};

export type PortfolioCaseStudy = {
  id: string;
  title: string;
  category: string;
  location: string;
  area: string;
  format: string;
  scope: string;
  duration: string;
  challenge: string;
  result: string;
  image?: string;
  blurDataURL?: string;
};

export const PORTFOLIO_SHOWCASE_PROJECTS: PortfolioShowcaseProject[] = [
  {
    id: "modern-cottage-nezhinka",
    category: "Загородный дом",
    title: "Современный одноэтажный дом с террасой",
    client: "Частный заказчик",
    description:
      "Индивидуальный проект загородного дома: панорамное остекление, открытая планировка, инженерные системы и чистовая отделка под ключ.",
    image: "/portfolio/projects/project-04.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "family-house-forshtadt",
    category: "Коттедж",
    title: "Двухэтажный дом для семьи",
    client: "Частный заказчик",
    description:
      "Строительство коттеджа из газобетона: архитектурный проект, коробка, кровля, фасад, инженерия и отделка — полный цикл.",
    image: "/portfolio/project-06-house-forshtadt.jpg",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "scandi-house-outskirts",
    category: "Загородный дом",
    title: "Дом в скандинавском стиле",
    client: "Частный заказчик",
    description:
      "Современный загородный дом с акцентом на естественные материалы, большие окна и продуманную инженерную инфраструктуру.",
    image: "/portfolio/projects/project-03.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "brick-residence-transportnaya",
    category: "Частный дом",
    title: "Кирпичный дом с мансардой",
    client: "Частный заказчик",
    description:
      "Архитектурное проектирование и строительство дома из кирпича: фундамент, коробка, кровля, инженерные системы и сдача объекта.",
    image: "/portfolio/projects/project-01.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "minimal-pavilion-letnaya",
    category: "Современный дом",
    title: "Минималистичный дом с плоской кровлей",
    client: "Частный заказчик",
    description:
      "Проектирование и строительство современного дома: лаконичная архитектура, инженерные решения и отделка под ключ.",
    image: "/portfolio/projects/project-02.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
];

export const PORTFOLIO_CASE_STUDIES: PortfolioCaseStudy[] = [
  {
    id: "country-house-turnkey",
    title: "Загородный дом под ключ",
    category: "Частный дом",
    location: "Оренбургская область",
    area: "180 м²",
    format: "1 этаж",
    scope: "Проектирование + строительство",
    duration: "от 6 месяцев",
    challenge:
      "Современный семейный дом с продуманной планировкой, инженерией и зоной отдыха.",
    result:
      "Проект доведён от концепции до строительства с контролем ключевых решений.",
    image: "/portfolio/projects/project-04.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "modern-cottage",
    title: "Современный коттедж",
    category: "Коттедж",
    location: "Оренбург",
    area: "220 м²",
    format: "2 этажа",
    scope: "Архитектура + коробка + инженерия",
    duration: "от 8 месяцев",
    challenge:
      "Выразительная архитектура, энергоэффективность и практичная планировка для постоянного проживания.",
    result:
      "Дом с цельным образом, удобной структурой помещений и подготовкой под инженерию.",
    image: "/portfolio/projects/project-02.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "commercial-office",
    title: "Коммерческий интерьер / офис",
    category: "Коммерческий объект",
    location: "Оренбург",
    area: "индивидуально",
    format: "open space",
    scope: "Реконструкция + отделка",
    duration: "по проекту",
    challenge:
      "Современное рабочее пространство с аккуратной отделкой и высоким уровнем исполнения.",
    result:
      "Завершённый объект с удобной структурой и premium-восприятием бренда.",
    image: "/portfolio/projects/project-05.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "individual-house-project",
    title: "Индивидуальный проект дома",
    category: "Индивидуальное строительство",
    location: "Оренбургская область",
    area: "от 150 м²",
    format: "индивидуально",
    scope: "Концепция + проект + сопровождение",
    duration: "по проекту",
    challenge:
      "Адаптировать архитектурную идею под участок, сценарии семьи и инженерные решения.",
    result:
      "Понятная концепция дома, готовая к последовательной реализации в строительстве.",
    image: "/portfolio/projects/project-01.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
];

/** @deprecated Используйте PORTFOLIO_CASE_STUDIES */
export type PopularHouseProject = PortfolioCaseStudy;

/** @deprecated Используйте PORTFOLIO_CASE_STUDIES */
export const POPULAR_HOUSE_PROJECTS = PORTFOLIO_CASE_STUDIES;
