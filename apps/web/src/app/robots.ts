import { MetadataRoute } from 'next';
import { apiClient } from '@/lib/api-client';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const institution = await apiClient.getPublicInstitution().catch(() => null);
  const domain = institution?.websiteDomain;
  const siteUrl = domain
    ? domain.startsWith('http')
      ? domain
      : `https://${domain}`
    : process.env.NEXT_PUBLIC_SITE_URL || 'https://edu.uz';

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/', '/setup/'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
