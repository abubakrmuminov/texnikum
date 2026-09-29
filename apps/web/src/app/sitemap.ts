import { MetadataRoute } from 'next';
import { FALLBACK_NEWS, FALLBACK_SPECIALTIES, FALLBACK_TEACHERS, FALLBACK_EVENTS, FALLBACK_PAGES } from '@/lib/api-client';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://texnikum2.uz';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${siteUrl}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/specialties`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${siteUrl}/schedule`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${siteUrl}/teachers`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/events`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${siteUrl}/info`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${siteUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/contacts`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/settings`, lastModified: new Date(), changeFrequency: 'yearly', priority: 0.3 },
  ];

  const newsRoutes: MetadataRoute.Sitemap = FALLBACK_NEWS.map((n) => ({
    url: `${siteUrl}/news/${n.slug}`,
    lastModified: new Date(n.updatedAt || n.publishedAt || n.createdAt),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const specialtyRoutes: MetadataRoute.Sitemap = FALLBACK_SPECIALTIES.map((s) => ({
    url: `${siteUrl}/specialties/${s.slug}`,
    lastModified: new Date(s.updatedAt || s.createdAt),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const teacherRoutes: MetadataRoute.Sitemap = FALLBACK_TEACHERS.map((t) => ({
    url: `${siteUrl}/teachers/${t.slug}`,
    lastModified: new Date(t.updatedAt || t.createdAt),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  const eventRoutes: MetadataRoute.Sitemap = FALLBACK_EVENTS.map((e) => ({
    url: `${siteUrl}/events/${e.slug}`,
    lastModified: new Date(e.updatedAt || e.createdAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  const infoRoutes: MetadataRoute.Sitemap = FALLBACK_PAGES.filter((p) => p.section === 'info').map((p) => ({
    url: `${siteUrl}/info/${p.slug}`,
    lastModified: new Date(p.updatedAt || p.createdAt),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...newsRoutes,
    ...specialtyRoutes,
    ...teacherRoutes,
    ...eventRoutes,
    ...infoRoutes,
  ];
}
