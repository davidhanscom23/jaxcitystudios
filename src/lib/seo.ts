import type { Metadata } from "next";

export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://jaxcitystudios.com";

export function pageMeta({
  title,
  description,
  path = "/",
}: {
  title: string;
  description: string;
  path?: string;
}): Metadata {
  const fullTitle = title.includes("JaxCity")
    ? title
    : `${title} | JaxCity Studios`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: `${siteUrl}${path}` },
    openGraph: {
      title: fullTitle,
      description,
      url: `${siteUrl}${path}`,
      siteName: "JaxCity Studios",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "RecordingStudio",
  name: "JaxCity Studios",
  description:
    "Professional recording studio and podcast studio in Jacksonville, Florida — music tracking, mixing, podcast production, and multi-camera video for Jacksonville, the Beaches, and Northeast Florida.",
  url: siteUrl,
  email: "jaxcitystudios@gmail.com",
  telephone: "+1-904-536-7211",
  areaServed: [
    "Jacksonville, FL",
    "Jacksonville Beach, FL",
    "Ponte Vedra, FL",
    "Northeast Florida",
  ],
  sameAs: ["https://www.instagram.com/jaxcity.studios/"],
  priceRange: "$25–$65/hr room-only; engineered sessions from $50–$60/hr",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Jacksonville",
    addressRegion: "FL",
    addressCountry: "US",
  },
};
