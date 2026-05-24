import {
  SITE_ADDRESS,
  SITE_EMAIL,
  SITE_MAP_LAT,
  SITE_MAP_LON,
  SITE_PHONE_HREF,
} from "@/data/siteContacts";

export function SiteContactJsonLd() {
  const telephone = SITE_PHONE_HREF.replace(/^tel:/, "");

  const data = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "СК ТЕХНОЛОГИЯ",
    telephone,
    email: SITE_EMAIL,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Оренбург",
      streetAddress: "ул. Автомобилистов 37/1",
      addressCountry: "RU",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: SITE_MAP_LAT,
      longitude: SITE_MAP_LON,
    },
    areaServed: SITE_ADDRESS,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
