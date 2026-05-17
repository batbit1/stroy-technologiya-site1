/**
 * Showcase-портфолио: единый источник проектов для `PortfolioSection`.
 * Файлы изображений: `public/portfolio/projects/project-0X.webp`.
 *
 * `blurDataURL` — опционально для `next/image` placeholder="blur".
 */export const PORTFOLIO_IMAGE_BLUR_DATA_URL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PgO6pQAAAABJRU5ErkJggg==";

export type PortfolioShowcaseProject = {
  id: string;
  category: string;
  title: string;
  client: string;
  description: string;
  /** Путь в `/public` или omit — покажется premium fallback */
  image?: string;
  blurDataURL?: string;
};

export const PORTFOLIO_SHOWCASE_PROJECTS: PortfolioShowcaseProject[] = [
  {
    id: "sbergai-office",
    category: "Коммерческий объект",
    title: "Работы по перепланировке дополнительного офиса",
    client: "СБЕР",
    description:
      "Компания «СТРОЙ ТЕХНОЛОГИЯ» выполнила работы по перепланировке дополнительного офиса ПАО СБЕРБАНК в Оренбургской области, г. Гай, ул. Ленина 23.",
    image: "/portfolio/projects/project-01.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "sber-orsk-structural",
    category: "Коммерческий объект",
    title: "Работы по перепланировке структурного подразделения",
    client: "СБЕР",
    description:
      "Выполнен комплекс работ по перепланировке структурного подразделения ПАО СБЕРБАНК в Оренбургской области, г. Орск, Советская 63.",
    image: "/portfolio/projects/project-02.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "admin-production-kd",
    category: "Промышленный объект",
    title: "Строительство административно-производственного комплекса",
    client: "КД",
    description:
      "Двухэтажный административно-производственный комплекс. Выполнены строительные работы, фундамент, наружные стены и подготовка объекта к дальнейшей эксплуатации.",
    image: "/portfolio/projects/project-03.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "trade-office-ssk",
    category: "Коммерческая недвижимость",
    title: "Строительство торгово-офисного комплекса с гостиницей",
    client: "ССК",
    description:
      "Многофункциональный торгово-офисный комплекс с гостиницей в Оренбурге. Работы выполнены с учетом требований коммерческой эксплуатации объекта.",
    image: "/portfolio/projects/project-04.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
  {
    id: "admin-production-kd-2",
    category: "Промышленный объект",
    title: "Строительство административно-производственного комплекса",
    client: "КД",
    description:
      "Комплекс строительных работ для административно-производственного объекта: коробка здания, наружные стены, конструктивные элементы и подготовка к сдаче.",
    image: "/portfolio/projects/project-05.webp",
    blurDataURL: PORTFOLIO_IMAGE_BLUR_DATA_URL,
  },
];
