import { UserRole } from '../enums/role.enum';

export type AdminSectionKey =
  | 'news'
  | 'events'
  | 'teachers'
  | 'administration'
  | 'specialties'
  | 'pages'
  | 'contacts'
  | 'media'
  | 'users'
  | 'audit';

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
