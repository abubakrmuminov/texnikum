import type { Metadata } from 'next';
import './globals.css';
import { AccessibilityProvider } from '@/components/accessibility/accessibility-provider';
import { AccessibilityToolbar } from '@/components/accessibility/accessibility-toolbar';
import { PublicA11yHint } from '@/components/accessibility/public-a11y-hint';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

import { LocaleProvider } from '@/components/i18n/locale-provider';
import { ArchitectSignature } from '@/components/easter-eggs/architect-signature';
import { InstitutionProvider } from '@/components/institution/institution-provider';
import { BrandStyle } from '@/components/institution/brand-style';
import { buildEducationalOrgJsonLd } from '@/lib/json-ld';
import { ThemeStyle } from '@/components/theme/theme-style';
import { apiClient } from '@/lib/api-client';

export async function generateMetadata(): Promise<Metadata> {
  const institution = await apiClient.getPublicInstitution().catch(() => null);
  const name = institution?.nameUz || 'Taʼlim muassasasi portali';
  const shortName = institution?.shortNameUz || 'Taʼlim portali';
  const domain = institution?.websiteDomain || 'edu.uz';
  const siteUrl = domain.startsWith('http') ? domain : `https://${domain}`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${name} — Rasmiy taʼlim portali`,
      template: `%s | ${shortName}`,
    },
    description: institution?.nameUz
      ? `${institution.nameUz} rasmiy veb-portali. Kasbiy taʼlim dasturlari, qabul komissiyasi, dars jadvali va yangiliklar.`
      : 'Rasmiy taʼlim portali. Kasbiy taʼlim dasturlari, qabul komissiyasi va yangiliklar.',
    openGraph: {
      title: `${name} — Rasmiy taʼlim portali`,
      description: institution?.nameUz
        ? `${institution.nameUz} rasmiy axborot va taʼlim resurslari.`
        : 'Rasmiy taʼlim portali',
      url: siteUrl,
      siteName: name,
      locale: 'uz_UZ',
      type: 'website',
      images: institution?.logoUrl ? [{ url: institution.logoUrl }] : undefined,
    },
    icons: institution?.faviconUrl ? [{ url: institution.faviconUrl }] : undefined,
    authors: [{ name: 'Abubakr Muminov', url: 'https://github.com/abubakrmuminov' }],
    creator: 'Abubakr Muminov',
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<JSX.Element> {
  const [
    institution,
    themeSettings,
    headerNav,
    footerRegulatory,
    footerStudents,
  ] = await Promise.all([
    apiClient.getPublicInstitution().catch(() => null),
    apiClient.getCurrentTheme().catch(() => null),
    apiClient.getPublicNavigation('header').catch(() => []),
    apiClient.getPublicNavigation('footer_regulatory').catch(() => []),
    apiClient.getPublicNavigation('footer_students').catch(() => []),
  ]);
  const jsonLd = buildEducationalOrgJsonLd(institution);

  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <link rel="author" href="/humans.txt" />
        {/*
          ====================================================================
          * PLATFORM ARCHITECTURE & ENGINEERING: Abubakr Muminov
          * ROLE: System Architect / Full-Stack Platform Engineer
          * GITHUB: https://github.com/abubakrmuminov
          * TELEGRAM: @abubakr_ai | EMAIL: 170409v@gmail.com
          * PROJECT: Educational Institution Portal & CMS (OʻRQ-637 / PF-158)
          ====================================================================
        */}
        {jsonLd && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          />
        )}
        <BrandStyle hex={institution?.brandPrimaryColor || '#1e3a8a'} />
        <ThemeStyle settings={themeSettings} />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ArchitectSignature />
        <LocaleProvider>
          <AccessibilityProvider>
            <InstitutionProvider initialSettings={institution}>
              {/* A11Y Skip-to-content havola (WCAG 2.1 AA / OʻRQ-641) */}
              <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring font-bold"
              >
                Asosiy kontentga oʻtish / Перейти к содержанию
              </a>

              {/* Maxsus imkoniyatlar paneli (WCAG 2.1 AA) */}
              <AccessibilityToolbar />

              {/* Asosiy sayt sarlavhasi va menyu */}
              <Header initialItems={headerNav} />

              {/* Sahifaning asosiy qismi */}
              <main id="main-content" className="flex-1 flex flex-col">
                {children}
              </main>

              {/* Sayt pastki qismi va rasmiy rekvizitlar */}
              <Footer regulatoryItems={footerRegulatory} studentItems={footerStudents} />

              {/* Kichik va xalaqit bermaydigan eslatma (WCAG 2.1 AA) */}
              <PublicA11yHint />
            </InstitutionProvider>
          </AccessibilityProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
