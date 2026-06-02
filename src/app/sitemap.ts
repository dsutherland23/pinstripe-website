import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://pinstripesrentals.com";

  // Base routes
  const routes = ["", "/privacy-policy", "/terms-and-conditions", "/rental-agreement"];

  // Location landing pages
  const cities = [
    "norfolk",
    "virginia-beach",
    "chesapeake",
    "portsmouth",
    "suffolk",
    "newport-news",
    "hampton",
    "yorktown",
    "williamsburg",
  ];

  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Add base routes
  routes.forEach((route) => {
    sitemapEntries.push({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
      changeFrequency: route === "" ? "weekly" : "monthly",
      priority: route === "" ? 1.0 : 0.5,
    });
  });

  // Add city locations
  cities.forEach((city) => {
    sitemapEntries.push({
      url: `${baseUrl}/locations/${city}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    });
  });

  return sitemapEntries;
}
