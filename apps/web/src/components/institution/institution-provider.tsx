'use client';

import React, { createContext, useContext } from 'react';
import { InstitutionPublicSettings } from '@college/shared';
import { useAppLocale } from '@/components/i18n/locale-provider';

export interface InstitutionContextValue {
  institution: InstitutionPublicSettings | null;
  name: string;
  shortName: string;
  address: string;
  workHours: string;
  phone: string;
  admissionPhone: string;
  trustPhone: string;
  email: string;
  admissionEmail: string;
  domain: string;
  brandColor: string;
  logoUrl: string | null;
  coatOfArmsUrl: string | null;
  faviconUrl: string | null;
  coordinates: { lat: number; lng: number };
  social: {
    telegram: string | null;
    instagram: string | null;
    facebook: string | null;
    youtube: string | null;
  };
  stirInn: string;
  institutionType: string;
  isConfigured: boolean;
}

const InstitutionContext = createContext<InstitutionContextValue | null>(null);

export function InstitutionProvider({
  initialSettings,
  children,
}: {
  initialSettings: InstitutionPublicSettings | null;
  children: React.ReactNode;
}): JSX.Element {
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const name = isUz
    ? initialSettings?.nameUz || 'Taʼlim muassasasi'
    : initialSettings?.nameRu || 'Образовательное учреждение';

  const shortName = isUz
    ? initialSettings?.shortNameUz || 'Texnikum'
    : initialSettings?.shortNameRu || 'Техникум';

  const address = isUz
    ? initialSettings?.legalAddressUz || ''
    : initialSettings?.legalAddressRu || '';

  const workHours = isUz
    ? initialSettings?.workHoursUz || 'Dushanba – Shanba: 08:30 – 17:30'
    : initialSettings?.workHoursRu || 'Понедельник – Суббота: 08:30 – 17:30';

  const phone = initialSettings?.mainPhone || '';
  const admissionPhone = initialSettings?.admissionPhone || initialSettings?.mainPhone || '';
  const trustPhone = initialSettings?.trustPhone || '1006';
  const email = initialSettings?.contactEmail || '';
  const admissionEmail = initialSettings?.admissionEmail || initialSettings?.contactEmail || '';
  const domain = initialSettings?.websiteDomain || '';
  const brandColor = initialSettings?.brandPrimaryColor || '#1e3a8a';

  const coordinates = {
    lat: initialSettings?.geoLatitude ?? 40.3864,
    lng: initialSettings?.geoLongitude ?? 71.7864,
  };

  const social = {
    telegram: initialSettings?.socialTelegram || null,
    instagram: initialSettings?.socialInstagram || null,
    facebook: initialSettings?.socialFacebook || null,
    youtube: initialSettings?.socialYoutube || null,
  };

  const value: InstitutionContextValue = {
    institution: initialSettings,
    name,
    shortName,
    address,
    workHours,
    phone,
    admissionPhone,
    trustPhone,
    email,
    admissionEmail,
    domain,
    brandColor,
    logoUrl: initialSettings?.logoUrl || null,
    coatOfArmsUrl: initialSettings?.coatOfArmsUrl || null,
    faviconUrl: initialSettings?.faviconUrl || null,
    coordinates,
    social,
    stirInn: initialSettings?.stirInn || '',
    institutionType: initialSettings?.institutionType || 'texnikum',
    isConfigured: Boolean(initialSettings?.isConfigured),
  };

  return (
    <InstitutionContext.Provider value={value}>
      {children}
    </InstitutionContext.Provider>
  );
}

export function useInstitution(): InstitutionContextValue {
  const ctx = useContext(InstitutionContext);
  if (!ctx) {
    throw new Error('useInstitution must be used within an InstitutionProvider');
  }
  return ctx;
}
