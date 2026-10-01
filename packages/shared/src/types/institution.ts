export interface InstitutionPublicSettings {
  id: number;
  nameUz: string;
  nameRu: string;
  shortNameUz: string;
  shortNameRu: string;
  institutionType: string;
  legalAddressUz: string;
  legalAddressRu: string;
  mainPhone: string;
  admissionPhone: string;
  trustPhone: string;
  contactEmail: string;
  admissionEmail: string;
  websiteDomain: string;
  geoLatitude: number;
  geoLongitude: number;
  logoUrl: string | null;
  faviconUrl: string | null;
  coatOfArmsUrl: string | null;
  brandPrimaryColor: string;
  socialTelegram: string | null;
  socialInstagram: string | null;
  socialFacebook: string | null;
  socialYoutube: string | null;
  stirInn: string;
  workHoursUz: string;
  workHoursRu: string;
  isConfigured: boolean;
  setupCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionPrivateSettings {
  id: number;
  bankName: string | null;
  bankAccount: string | null;
  mfoCode: string | null;
  jshshirPinfl: string | null;
  treasuryAccount: string | null;
  okedCode: string | null;
  directorNameUz: string | null;
  directorNameRu: string | null;
  directorPhone: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InstitutionFullSettings extends InstitutionPublicSettings {
  privateSettings: InstitutionPrivateSettings;
}

export interface SetupStatusResponse {
  configured: boolean;
}
