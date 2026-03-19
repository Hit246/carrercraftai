import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = "https://careercraftai.tech";

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/payment/',
          '/order-status/',
          '/profile/',
          '/api/',
          '/login',
          '/signup',
          '/dashboard/',
          '/team/',
          '/support/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
