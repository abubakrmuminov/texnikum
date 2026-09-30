import type { Metadata } from 'next';
import './globals.css';
import { AccessibilityProvider } from '@/components/accessibility/accessibility-provider';
import { AccessibilityToolbar } from '@/components/accessibility/accessibility-toolbar';
import { PublicA11yHint } from '@/components/accessibility/public-a11y-hint';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

import { LocaleProvider } from '@/components/i18n/locale-provider';
import { ArchitectSignature } from '@/components/easter-eggs/architect-signature';

export const metadata: Metadata = {
  title: 'Fargʻona 2-son texnikumi — Rasmiy taʼlim portali',
  description:
    'Fargʻona viloyati Fargʻona shahri 2-son texnikumi rasmiy veb-portali. Kasbiy taʼlim dasturlari, qabul komissiyasi 2026, dars jadvali va yangiliklar.',
  authors: [{ name: 'Abubakr Muminov', url: 'https://github.com/abubakrmuminov' }],
  creator: 'Abubakr Muminov',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
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
          * PROJECT: Fargʻona 2-son texnikumi Portal & CMS (OʻRQ-637 / PF-158)
          ====================================================================
        */}
      </head>
      <body className="min-h-screen bg-background font-sans antialiased flex flex-col">
        <ArchitectSignature />
        <LocaleProvider>
          <AccessibilityProvider>
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
            <Header />

            {/* Sahifaning asosiy qismi */}
            <main id="main-content" className="flex-1 flex flex-col">
              {children}
            </main>

            {/* Sayt pastki qismi va rasmiy rekvizitlar */}
            <Footer />

            {/* Kichik va xalaqit bermaydigan eslatma (WCAG 2.1 AA) */}
            <PublicA11yHint />
          </AccessibilityProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
