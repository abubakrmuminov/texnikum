import { UserRole } from '../enums/role.enum';

export type AdminSectionKey =
  | 'dashboard'
  | 'news'
  | 'news-editor'
  | 'events'
  | 'teachers'
  | 'administration'
  | 'specialties'
  | 'pages'
  | 'contacts'
  | 'media'
  | 'users'
  | 'audit'
  | 'institution'
  | 'navigation'
  | 'theme'
  | 'page-builder';

export type OnboardingMainStatus = 'done' | 'skipped';

export interface OnboardingState {
  main?: OnboardingMainStatus;
  sections?: Partial<Record<AdminSectionKey, boolean>>;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  onboarding?: OnboardingState;
}

export const tourPending = (s?: OnboardingState | null): boolean =>
  !s || (s.main !== 'done' && s.main !== 'skipped');

export const sectionUnseen = (
  s: OnboardingState | null | undefined,
  k: AdminSectionKey,
): boolean => !s?.sections?.[k];
