export const SITE_ORIGIN = "https://tarcinyemek.com";
export const HOME_URL = `${SITE_ORIGIN}/`;
export const SOCIAL_IMAGE_URL = `${SITE_ORIGIN}/logo.jpg`;

export const HOME_TITLE = "TARÇIN Ev Yemekleri | Antalya Kurumsal Tabldot";
export const HOME_DESCRIPTION =
  "Antalya'da ofis, fabrika ve iş yerlerine günlük taze ev yemekleri, kurumsal tabldot ve catering hizmeti. Menü ve ücretsiz tadım için TARÇIN'a ulaşın.";
export const HOME_KEYWORDS =
  "Antalya ev yemekleri, kurumsal tabldot, Antalya catering, toplu yemek, iş yeri yemek servisi, günlük taze yemek";

export const LOCAL_BUSINESS_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "@id": `${HOME_URL}#business`,
  name: "TARÇIN Ev Yemekleri & Catering",
  url: HOME_URL,
  image: SOCIAL_IMAGE_URL,
  description: HOME_DESCRIPTION,
  telephone: "+905354187432",
  servesCuisine: "Türk mutfağı",
  areaServed: {
    "@type": "City",
    name: "Antalya",
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "Gebizli Mah. Aşık Veysel Cad. 4/A",
    addressLocality: "Muratpaşa",
    addressRegion: "Antalya",
    addressCountry: "TR",
  },
} as const;
