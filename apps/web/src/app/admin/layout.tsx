'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar,
  Compass,
  ExternalLink,
  FileText,
  GraduationCap,
  History,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MapPin,
  Menu,
  Newspaper,
  Shield,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import {
  AdminSectionKey,
  OnboardingState,
  sectionUnseen,
  tourPending,
  UserRole,
} from '@college/shared';
import { AdminAuthProvider, useAdminAuth } from '@/components/admin/admin-auth-context';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { LanguageSwitcher } from '@/components/layout/language-switcher';
import { apiClient } from '@/lib/api-client';
import {
  getSectionByPath,
  getSectionsForRole,
} from '@/components/admin/onboarding/onboarding-data';
import { AnchoredTour } from '@/components/admin/onboarding/anchored-tour';
import { SectionPromptCard } from '@/components/admin/onboarding/section-prompt-card';

const NAV_ITEMS_MAP: Record<
  'uz' | 'ru',
  Array<{ href: string; label: string; icon: React.ElementType; exact?: boolean; adminOnly?: boolean }>
> = {
  uz: [
    { href: '/admin', label: 'Boshqaruv paneli', icon: LayoutDashboard, exact: true },
    { href: '/admin/news', label: 'Yangiliklar va maqolalar', icon: Newspaper },
    { href: '/admin/events', label: 'Tadbirlar va taqvim', icon: Calendar },
    { href: '/admin/teachers', label: 'Oʻqituvchilar tarkibi', icon: UserCheck },
    { href: '/admin/administration', label: 'Rahbariyat va maʼmuriyat', icon: ShieldCheck },
    { href: '/admin/specialties', label: 'Mutaxassisliklar', icon: GraduationCap },
    { href: '/admin/pages', label: 'Muassasa haqida (37-modda)', icon: FileText },
    { href: '/admin/contacts', label: 'Bogʻlanish va aloqa (Aloqa)', icon: MapPin },
    { href: '/admin/media', label: 'Mediateka / Fayllar', icon: ImageIcon },
    { href: '/admin/users', label: 'Foydalanuvchilar va rollar', icon: Shield, adminOnly: true },
    { href: '/admin/audit', label: 'Audit jurnali', icon: History, adminOnly: true },
  ],
  ru: [
    { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
    { href: '/admin/news', label: 'Новости и статьи', icon: Newspaper },
    { href: '/admin/events', label: 'События и календарь', icon: Calendar },
    { href: '/admin/teachers', label: 'Педагогический состав', icon: UserCheck },
    { href: '/admin/administration', label: 'Руководство и администрация', icon: ShieldCheck },
    { href: '/admin/specialties', label: 'Специальности техникума', icon: GraduationCap },
    { href: '/admin/pages', label: 'Сведения об ОО (37-модда)', icon: FileText },
    { href: '/admin/contacts', label: 'Контакты и реквизиты (Aloqa)', icon: MapPin },
    { href: '/admin/media', label: 'Медиатека / Файлы', icon: ImageIcon },
    { href: '/admin/users', label: 'Пользователи и роли', icon: Shield, adminOnly: true },
    { href: '/admin/audit', label: 'Журнал аудита', icon: History, adminOnly: true },
  ],
};

const ROLE_LABELS_MAP: Record<'uz' | 'ru', Record<UserRole, { label: string; color: string }>> = {
  uz: {
    [UserRole.ADMIN]: { label: 'Administrator', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    [UserRole.EDITOR]: { label: 'Muharrir', color: 'bg-primary/10 text-primary border-primary/20' },
    [UserRole.MODERATOR]: { label: 'Moderator', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  },
  ru: {
    [UserRole.ADMIN]: { label: 'Администратор', color: 'bg-destructive/10 text-destructive border-destructive/20' },
    [UserRole.EDITOR]: { label: 'Редактор', color: 'bg-primary/10 text-primary border-primary/20' },
    [UserRole.MODERATOR]: { label: 'Модератор', color: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20' },
  },
};

function AdminLayoutInner({ children }: { children: React.ReactNode }): JSX.Element {
  const pathname = usePathname();
  const { user, token, logout, hasRole, isLoading } = useAdminAuth();
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Состояние онбординга
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null);
  const [sessionDismissedTour, setSessionDismissedTour] = useState(false);
  const [sessionDismissedSections, setSessionDismissedSections] = useState<Set<AdminSectionKey>>(
    new Set(),
  );
  const [tourModalOpen, setTourModalOpen] = useState(false);
  const [tourMode, setTourMode] = useState<'welcome' | 'section'>('welcome');
  const [tourSectionKey, setTourSectionKey] = useState<AdminSectionKey | undefined>(undefined);

  const navItems = NAV_ITEMS_MAP[locale] || NAV_ITEMS_MAP.uz;
  const roleLabels = ROLE_LABELS_MAP[locale] || ROLE_LABELS_MAP.uz;

  // Загрузка состояния онбординга при входе пользователя
  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    apiClient
      .getOnboarding(token || undefined)
      .then((data) => {
        if (!isMounted) return;
        setOnboardingState(data || {});
        // Открываем тур, если он еще не завершен и не пропущен навсегда
        if (tourPending(data) && !sessionDismissedTour) {
          setTourMode('welcome');
          setTourSectionKey(undefined);
          setTourModalOpen(true);
        }
      })
      .catch(() => {
        if (!isMounted) return;
        setOnboardingState({});
      });

    return () => {
      isMounted = false;
    };
  }, [user, token, sessionDismissedTour]);

  // Для страницы входа не рендерим административный сайдбар и онбординг
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Защита: если сессия загружается или пользователь не авторизован
  if (isLoading || !user) {
    return (
      <div className="flex-1 py-20 flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-muted-foreground font-medium">
            {isLoading ? (isUz ? 'Yuklanmoqda...' : 'Загрузка...') : (isUz ? 'Yoʻnaltirilmoqda...' : 'Перенаправление...')}
          </span>
        </div>
      </div>
    );
  }

  const currentRole = roleLabels[user.role] ?? roleLabels[UserRole.ADMIN];

  // Обработчики действий онбординга
  const handleCompleteTour = async () => {
    setTourModalOpen(false);
    if (tourMode === 'welcome') {
      const roleSections = getSectionsForRole(user.role);
      const sectionsSeen: Partial<Record<AdminSectionKey, boolean>> = {};
      roleSections.forEach((s) => {
        sectionsSeen[s.key] = true;
      });

      const nextState: OnboardingState = {
        ...(onboardingState || {}),
        main: 'done',
        sections: {
          ...(onboardingState?.sections || {}),
          ...sectionsSeen,
        },
      };
      setOnboardingState(nextState);

      try {
        await apiClient.patchOnboarding(
          { main: 'done', sections: sectionsSeen },
          token || undefined,
        );
      } catch {
        // Оптимистичное обновление уже выполнено
      }
    } else if (tourSectionKey) {
      const nextState: OnboardingState = {
        ...(onboardingState || {}),
        sections: {
          ...(onboardingState?.sections || {}),
          [tourSectionKey]: true,
        },
      };
      setOnboardingState(nextState);

      try {
        await apiClient.patchOnboarding(
          { sections: { [tourSectionKey]: true } },
          token || undefined,
        );
      } catch {
        // Оптимистичное обновление уже выполнено
      }
    }
  };

  const handleSkipTour = async () => {
    setTourModalOpen(false);
    if (tourMode === 'welcome') {
      const nextState: OnboardingState = {
        ...(onboardingState || {}),
        main: 'skipped',
      };
      setOnboardingState(nextState);

      try {
        await apiClient.patchOnboarding({ main: 'skipped' }, token || undefined);
      } catch {
        // Оптимистичное обновление уже выполнено
      }
    } else if (tourSectionKey) {
      const nextState: OnboardingState = {
        ...(onboardingState || {}),
        sections: {
          ...(onboardingState?.sections || {}),
          [tourSectionKey]: true,
        },
      };
      setOnboardingState(nextState);

      try {
        await apiClient.patchOnboarding(
          { sections: { [tourSectionKey]: true } },
          token || undefined,
        );
      } catch {
        // Оптимистичное обновление уже выполнено
      }
    }
  };

  const handleLaterTour = () => {
    setSessionDismissedTour(true);
    setTourModalOpen(false);
  };

  const handleRestartTour = (startSectionKey?: AdminSectionKey) => {
    if (startSectionKey) {
      setTourMode('section');
      setTourSectionKey(startSectionKey);
    } else {
      setTourMode('welcome');
      setTourSectionKey(undefined);
    }
    setSessionDismissedTour(false);
    setTourModalOpen(true);
  };

  // Определение текущего раздела для неблокирующей карточки
  const currentSection = getSectionByPath(pathname);
  const showSectionPrompt =
    !tourModalOpen &&
    currentSection &&
    currentSection.roles.includes(user.role) &&
    sectionUnseen(onboardingState, currentSection.key) &&
    !sessionDismissedSections.has(currentSection.key);

  const handlePromptShow = () => {
    if (currentSection) {
      setTourMode('section');
      setTourSectionKey(currentSection.key);
      setSessionDismissedTour(false);
      setTourModalOpen(true);
    }
  };

  const handlePromptSkip = async () => {
    if (!currentSection) return;
    const key = currentSection.key;
    const nextState: OnboardingState = {
      ...(onboardingState || {}),
      sections: {
        ...(onboardingState?.sections || {}),
        [key]: true,
      },
    };
    setOnboardingState(nextState);

    try {
      await apiClient.patchOnboarding(
        { sections: { [key]: true } },
        token || undefined,
      );
    } catch {
      // Оптимистичное обновление уже выполнено
    }
  };

  const handlePromptLater = () => {
    if (!currentSection) return;
    setSessionDismissedSections((prev) => new Set(prev).add(currentSection.key));
  };

  return (
    <div className="min-h-screen bg-muted/20 flex flex-col lg:flex-row">
      {/* Боковая панель для десктопа */}
      <aside className="hidden lg:flex w-64 flex-col justify-between border-r border-border bg-card p-4 shrink-0 h-screen sticky top-0 overflow-y-auto">
        <div className="space-y-6">
          {/* Бренд админки */}
          <div className="flex items-center gap-3 px-2">
            <div className="size-9 rounded-lg bg-primary text-primary-foreground font-black flex items-center justify-center text-sm shadow">
              CMS
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight block text-foreground">
                Texnikum № 2 • CMS
              </span>
              <span className="text-[11px] text-muted-foreground block">
                {isUz ? 'Portalni boshqarish' : 'Управление порталом'}
              </span>
            </div>
          </div>

          {/* Навигационное меню */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.adminOnly && !hasRole(UserRole.ADMIN)) {
                return null;
              }

              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);

              const Icon = item.icon;
              const tourId = item.href === '/admin'
                ? 'sidebar.dashboard'
                : `sidebar.${item.href.replace('/admin/', '')}`;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={tourId}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Профиль, ссылка на тур и выход */}
        <div className="pt-4 border-t border-border space-y-3">
          {user && (
            <div data-tour="sidebar.user-profile" className="px-2 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-foreground truncate max-w-[130px]">
                  {user.fullName}
                </span>
                <Badge variant="outline" className={`text-[10px] font-bold ${currentRole.color}`}>
                  {currentRole.label}
                </Badge>
              </div>
              <span className="text-[11px] text-muted-foreground block truncate">
                {user.email}
              </span>
            </div>
          )}

          {/* Кнопка повторного прохождения тура («Take the tour again») */}
          <Button
            variant="outline"
            size="sm"
            data-tour="sidebar.tour-restart"
            onClick={() => handleRestartTour(currentSection?.key)}
            className="w-full text-xs gap-1.5 h-8 font-semibold bg-primary/5 hover:bg-primary/10 text-primary border-primary/20"
            title={isUz ? 'Boshqaruv paneli boʻyicha ekskursiyani qayta boshlash' : 'Пройти ознакомительный тур заново'}
          >
            <Compass className="size-3.5 shrink-0" aria-hidden="true" />
            <span>{isUz ? 'Ekskursiyani boshlash' : 'Пройти тур заново'}</span>
          </Button>

          {/* Переключатель языка прямо в боковой панели */}
          <div data-tour="sidebar.language" className="flex items-center justify-between px-2 pt-2 border-t border-border">
            <span className="text-[11px] text-muted-foreground font-semibold">
              {isUz ? 'Tizim tili:' : 'Язык панели:'}
            </span>
            <LanguageSwitcher />
          </div>

          <div className="flex items-center gap-2">
            <Link href="/" className="flex-1">
              <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 h-8">
                <span>{isUz ? 'Saytga oʻtish' : 'На сайт'}</span>
                <ExternalLink className="size-3" aria-hidden="true" />
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-xs text-destructive hover:text-destructive h-8 px-2"
              title={isUz ? 'Tizimdan chiqish' : 'Выйти из системы'}
            >
              <LogOut className="size-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="px-1 text-[10px] text-muted-foreground/70 flex items-center justify-between border-t border-border/40 pt-2">
            <span>Architect:</span>
            <a
              href="https://github.com/abubakrmuminov"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-primary font-medium transition-colors"
            >
              Abubakr Muminov
            </a>
          </div>
        </div>
      </aside>

      {/* Верхняя панель для мобильных устройств */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between p-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <button
            type="button"
            data-tour="header.mobile-menu-btn"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg border border-border text-foreground hover:bg-muted"
            aria-label={isUz ? 'Boshqaruv menyusini ochish' : 'Открыть меню управления'}
          >
            {mobileSidebarOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <span className="font-bold text-sm">
            {isUz ? 'CMS Boshqaruv paneli' : 'Панель управления CMS'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRestartTour(currentSection?.key)}
            className="text-xs h-7 px-2 gap-1 text-primary"
            title={isUz ? 'Ekskursiya' : 'Тур'}
          >
            <Compass className="size-3.5" aria-hidden="true" />
            <span className="hidden sm:inline">{isUz ? 'Tur' : 'Тур'}</span>
          </Button>
          <LanguageSwitcher />
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-xs h-7">
              {isUz ? 'Saytga →' : 'На сайт →'}
            </Button>
          </Link>
        </div>
      </header>

      {/* Мобильное выпадающее меню */}
      {mobileSidebarOpen && (
        <div className="lg:hidden border-b border-border bg-card p-4 space-y-3 shadow-lg">
          <nav className="space-y-1">
            {navItems.map((item) => {
              if (item.adminOnly && !hasRole(UserRole.ADMIN)) {
                return null;
              }
              const isActive = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="pt-3 border-t border-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground truncate">
                {user.fullName}
              </span>
              <Badge variant="outline" className={`text-[10px] font-bold ${currentRole.color}`}>
                {currentRole.label}
              </Badge>
            </div>
            <span className="text-[11px] text-muted-foreground block truncate">
              {user.email}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMobileSidebarOpen(false);
                handleRestartTour(currentSection?.key);
              }}
              className="w-full text-xs gap-1.5 h-8 font-semibold text-primary border-primary/20"
            >
              <Compass className="size-3.5" aria-hidden="true" />
              <span>{isUz ? 'Ekskursiyani qayta boshlash' : 'Пройти тур заново'}</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="w-full text-xs text-destructive hover:text-destructive gap-2 h-8"
            >
              <LogOut className="size-4" aria-hidden="true" />
              <span>{isUz ? 'Tizimdan chiqish' : 'Выйти из системы'}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Основная рабочая область */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full relative">
        {children}

        {/* Неблокирующая карточка-подсказка для первого посещения раздела */}
        {showSectionPrompt && currentSection && (
          <SectionPromptCard
            section={currentSection}
            onShow={handlePromptShow}
            onSkip={handlePromptSkip}
            onLater={handlePromptLater}
          />
        )}
      </main>

      {/* Интерактивный закрепленный ознакомительный тур (Anchored Guided Tour) */}
      <AnchoredTour
        isOpen={tourModalOpen}
        role={user.role}
        mode={tourMode}
        sectionKey={tourSectionKey}
        onComplete={handleCompleteTour}
        onSkip={handleSkipTour}
        onLater={handleLaterTour}
        onOpenMobileSidebar={() => setMobileSidebarOpen(true)}
      />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <AdminAuthProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </AdminAuthProvider>
  );
}
