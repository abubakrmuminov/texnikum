'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  ChevronDown,
  GraduationCap,
  Info,
  Menu,
  Phone,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';
import { useAppLocale } from '@/components/i18n/locale-provider';
import { useInstitution } from '@/components/institution/institution-provider';
import { NavigationItem } from '@college/shared';

interface SubMenuItem {
  href: string;
  labelUz: string;
  labelRu: string;
  descUz: string;
  descRu: string;
  badge?: string;
}

interface NavMenuItem {
  id: string;
  href: string;
  labelUz: string;
  labelRu: string;
  icon: React.ElementType;
  children?: SubMenuItem[];
}

export function Header({ initialItems }: { initialItems?: NavigationItem[] } = {}): JSX.Element {
  const pathname = usePathname();
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Закрытие мобильного меню по нажатию клавиши Escape (WCAG Focus & Keyboard)
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  const {
    name,
    shortName,
    address,
    phone,
    admissionPhone,
    workHours,
    logoUrl,
  } = useInstitution();
  const displayPhone = admissionPhone || phone || '+998';

  const tCommon = useTranslations('common');

  const defaultNavMenuItems: NavMenuItem[] = [
    {
      id: 'home',
      href: '/',
      labelUz: 'Bosh sahifa',
      labelRu: 'Главная',
      icon: BookOpen,
    },
    {
      id: 'info',
      href: '/info',
      labelUz: 'Texnikum haqida',
      labelRu: 'О техникуме',
      icon: Info,
      children: [
        {
          href: '/info/info-common',
          labelUz: 'Asosiy maʼlumotlar',
          labelRu: 'Основные сведения',
          descUz: 'Tashkiliy maqom, filiallar va rekvizitlar',
          descRu: 'Официальный статус, реквизиты и история',
        },
        {
          href: '/info/info-struct',
          labelUz: 'Tuzilma va boshqaruv',
          labelRu: 'Структура и органы управления',
          descUz: 'Boʻlimlar, kafedralar va boshqaruv kengashlari',
          descRu: 'Отделения, службы и педагогический совет',
        },
        {
          href: '/info/info-documents',
          labelUz: 'Meʼyoriy hujjatlar',
          labelRu: 'Документы и лицензии',
          descUz: 'Ustav, davlat litsenziyasi va akkreditatsiya',
          descRu: 'Устав, лицензия на образовательную деятельность',
        },
        {
          href: '/info/info-material',
          labelUz: 'Moddiy-texnik taʼminot',
          labelRu: 'Материально-техническая база',
          descUz: 'Zamonaviy IT-laboratoriyalar va jihozlar',
          descRu: 'Лаборатории, учебные аудитории и оборудование',
        },
        {
          href: '/info/info-financial',
          labelUz: 'Moliyaviy faoliyat',
          labelRu: 'Финансовая деятельность',
          descUz: 'Byudjet daromadlari va xarajatlar smetasi',
          descRu: 'Бюджетные сметы и внебюджетные поступления',
        },
        {
          href: '/info/info-international',
          labelUz: 'Xalqaro hamkorlik',
          labelRu: 'Международное сотрудничество',
          descUz: 'Xorijiy kollejlar bilan qoʻshma dasturlar',
          descRu: 'Международные программы и стажировки',
        },
        {
          href: '/info',
          labelUz: 'Barcha 12 boʻlim (37-modda)',
          labelRu: 'Все 12 обязательных разделов',
          descUz: '«Taʼlim toʻgʻrisida»gi Qonun meʼyoriy reyestri',
          descRu: 'Полный реестр сведений по ст. 37 ЗРУ-637',
          badge: 'Qonun',
        },
      ],
    },
    {
      id: 'specialties',
      href: '/specialties',
      labelUz: 'Taʼlim yoʻnalishlari',
      labelRu: 'Специальности',
      icon: GraduationCap,
      children: [
        {
          href: '/specialties',
          labelUz: 'Barcha mutaxassisliklar',
          labelRu: 'Все специальности',
          descUz: '2026/2027 oʻquv yili uchun qabul dasturlari',
          descRu: 'Каталог направлений на 2026/2027 учебный год',
          badge: '2026',
        },
        {
          href: '/specialties/40610101-kompyuter-injiniringi-va-dasturiy-taminot',
          labelUz: 'Kompyuter injiniringi',
          labelRu: 'Компьютерный инжиниринг',
          descUz: '40610101 • Dasturiy taʼminot va veb-ishlab chiqish',
          descRu: '40610101 • Разработка ПО и веб-технологии',
        },
        {
          href: '/specialties/40610102-kompyuter-tarmoqlari-va-tizimlari-mamurligi',
          labelUz: 'Tarmoqlar maʼmurligi',
          labelRu: 'Сетевое администрирование',
          descUz: '40610102 • Klasterlar va kiberxavfsiz infratuzilma',
          descRu: '40610102 • Сетевые комплексы и инфраструктура',
        },
        {
          href: '/specialties/40610201-axborot-xavfsizligi-tizimlari-va-vositalari',
          labelUz: 'Axborot xavfsizligi',
          labelRu: 'Информационная безопасность',
          descUz: '40610201 • Maʼlumotlarni himoyalash vositalari',
          descRu: '40610201 • Защита конфиденциальных данных',
        },
        {
          href: '/info/info-education',
          labelUz: 'Oʻquv rejalari va standartlar',
          labelRu: 'Учебный процесс и планы',
          descUz: 'Malaka talablari, dars soatlari va amaliyot',
          descRu: 'Образовательные программы и учебные графики',
        },
      ],
    },
    {
      id: 'team',
      href: '/administration',
      labelUz: 'Jamoa va maʼmuriyat',
      labelRu: 'Коллектив',
      icon: ShieldCheck,
      children: [
        {
          href: '/administration',
          labelUz: 'Texnikum maʼmuriyati',
          labelRu: 'Руководство и администрация',
          descUz: 'Direktor, oʻrinbosarlar va boʻlim boshliqlari',
          descRu: 'Директор, заместители и руководители служб',
        },
        {
          href: '/teachers',
          labelUz: 'Pedagogik tarkib',
          labelRu: 'Педагогический состав',
          descUz: 'Malakali oʻqituvchilar va amaliyot ustalari',
          descRu: 'Преподаватели специальных дисциплин и мастера',
        },
        {
          href: '/info/info-leadership',
          labelUz: 'Fuqarolarni qabul qilish',
          labelRu: 'График приема граждан',
          descUz: 'Rahbariyat bilan shaxsiy uchrashuv kunlari',
          descRu: 'Приемные дни администрации техникума',
        },
        {
          href: '/info/info-vacant',
          labelUz: 'Boʻsh ish oʻrinlari',
          labelRu: 'Вакантные должности',
          descUz: 'Ustozlar va ilmiy mutaxassislar uchun vakansiyalar',
          descRu: 'Вакансии для педагогических работников',
        },
      ],
    },
    {
      id: 'news',
      href: '/news',
      labelUz: 'Matbuot xizmati',
      labelRu: 'Пресс-центр',
      icon: BookOpen,
      children: [
        {
          href: '/news',
          labelUz: 'Barcha yangiliklar',
          labelRu: 'Лента новостей',
          descUz: 'Rasmiy bayonotlar, gʻalabalar va yangilanishlar',
          descRu: 'Официальные заявления, победы и публикации',
        },
        {
          href: '/events',
          labelUz: 'Tadbirlar taqvimi',
          labelRu: 'Календарь событий',
          descUz: 'Konferensiyalar, olimpiadalar va ochiq darslar',
          descRu: 'Конференции, чемпионаты и мастер-классы',
        },
        {
          href: '/events/ochiq-eshiklar-kuni-aprel-2026',
          labelUz: 'Ochiq eshiklar kuni',
          labelRu: 'День открытых дверей',
          descUz: 'Maktab bitiruvchilari va ota-onalar uchun tadbir',
          descRu: 'Презентация техникума для школьников и родителей',
          badge: 'Tadbir',
        },
        {
          href: '/info/info-employment',
          labelUz: 'Bitiruvchilar yutuqlari',
          labelRu: 'Трудоустройство выпускников',
          descUz: 'Ishga joylashish va kasbiy muvaffaqiyatlar',
          descRu: 'Мониторинг трудоустройства и карьерный рост',
        },
      ],
    },
    {
      id: 'admissions',
      href: '/specialties',
      labelUz: 'Abituriyent 2026',
      labelRu: 'Абитуриенту',
      icon: GraduationCap,
      children: [
        {
          href: '/specialties',
          labelUz: 'Davlat granti va kvotalar',
          labelRu: 'Государственный грант и квоты',
          descUz: 'Grant va toʻlov-kontrakt oʻrinlari soni',
          descRu: 'Бюджетные места и договорная форма обучения',
          badge: 'Grant',
        },
        {
          href: '/news/qabul-2026-davlat-granti-va-hujjat-topshirish-tartibi',
          labelUz: 'Hujjat topshirish tartibi',
          labelRu: 'Порядок подачи документов',
          descUz: 'Abituriyentlar uchun qadam-baqadam yoʻriqnoma',
          descRu: 'Пошаговая инструкция для поступающих',
        },
        {
          href: '/info/info-grants',
          labelUz: 'Grantlar va stipendiyalar',
          labelRu: 'Стипендии и поддержка',
          descUz: 'Iqtidorli talabalar uchun ragʻbatlantirish tizimi',
          descRu: 'Меры социальной и академической поддержки',
        },
        {
          href: '/info/info-environment',
          labelUz: 'Inklyuziv va qulay muhit',
          labelRu: 'Доступная среда',
          descUz: 'Imkoniyati cheklangan shaxslar uchun sharoitlar',
          descRu: 'Условия для лиц с ограниченными возможностями',
        },
      ],
    },
    {
      id: 'contacts',
      href: '/contacts',
      labelUz: 'Aloqa',
      labelRu: 'Контакты',
      icon: Phone,
      children: [
        {
          href: '/contacts',
          labelUz: 'Manzil va rekvizitlar',
          labelRu: 'Адрес и контакты',
          descUz: address ? `${address.substring(0, 30)}... • Xarita` : 'Xarita va yoʻnalish',
          descRu: address ? `${address.substring(0, 30)}... • Карта` : 'Карта и маршрут',
        },
        {
          href: '/settings',
          labelUz: 'Maxsus imkoniyatlar',
          labelRu: 'Специальные возможности',
          descUz: 'Koʻzi ojizlar uchun rejim, shrift va fon sozlamalari',
          descRu: 'Настройки для слабовидящих, масштаб и контраст',
        },
      ],
    },
  ];

  const ICON_MAP: Record<string, React.ElementType> = {
    BookOpen,
    Info,
    GraduationCap,
    Phone,
    ShieldCheck,
  };

  const dynamicNavMenuItems: NavMenuItem[] = (initialItems || [])
    .filter((i) => i.isVisible && !i.deletedAt && i.parentId === null)
    .map((item) => {
      const IconComp = (item.iconName && ICON_MAP[item.iconName]) || BookOpen;
      const childList = (item.children || [])
        .filter((c) => c.isVisible && !c.deletedAt)
        .map((c) => ({
          href: c.path,
          labelUz: c.labelUz,
          labelRu: c.labelRu,
          descUz: c.badgeTextUz || '',
          descRu: c.badgeTextRu || '',
          badge: isUz ? (c.badgeTextUz || undefined) : (c.badgeTextRu || undefined),
        }));

      return {
        id: item.id,
        href: item.path,
        labelUz: item.labelUz,
        labelRu: item.labelRu,
        icon: IconComp,
        children: childList.length > 0 ? childList : undefined,
      };
    });

  const navMenuItems = initialItems && initialItems.length > 0
    ? dynamicNavMenuItems
    : defaultNavMenuItems;

  const handleMouseEnter = (menuId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setHoveredMenu(menuId);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMenu(null);
    }, 150);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      {/* Главный блок шапки: Бренд + Горячая линия + Переключатель языка */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Логотип и наименование техникума */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg p-1"
          aria-label={`${shortName || name} — Bosh sahifa`}
        >
          {logoUrl ? (
            <div className="size-11 rounded-lg bg-card border border-border flex items-center justify-center overflow-hidden p-1 shadow shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={shortName || name} className="size-full object-contain" />
            </div>
          ) : (
            <div className="size-11 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow font-bold text-xs tracking-wider shrink-0 uppercase">
              {(shortName || name || 'EDU').substring(0, 3)}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
              {isUz ? 'Davlat kasbiy taʼlim muassasasi' : 'Государственное образовательное учреждение'}
            </span>
            <span className="text-sm sm:text-base md:text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors leading-tight truncate">
              {shortName || name || tCommon('brandName')}
            </span>
            <span className="text-[11px] text-muted-foreground hidden xl:inline truncate max-w-sm">
              {name && name !== shortName ? name : tCommon('brandSubtitle')}
            </span>
          </div>
        </Link>

        {/* Телефон приемной комиссии, переключатель языка и быстрые кнопки */}
        <div className="hidden lg:flex items-center gap-5 text-sm">
          <div className="flex flex-col text-right">
            <span className="text-xs text-muted-foreground">
              {isUz ? 'Qabul komissiyasi ishonch telefoni:' : 'Телефон доверия приемной комиссии:'}
            </span>
            <a
              href={`tel:${displayPhone.replace(/[^0-9+]/g, '')}`}
              className="font-bold text-foreground hover:text-primary transition-colors flex items-center justify-end gap-1.5"
            >
              <Phone className="size-3.5 text-primary" aria-hidden="true" />
              <span>{displayPhone}</span>
            </a>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              {workHours}
            </span>
          </div>

          {/* Переключатель языка UZ / RU */}
          <LanguageSwitcher />

          <Link href="/specialties">
            <Button size="sm" className="font-semibold shadow">
              <GraduationCap className="size-4 mr-1.5" data-icon="inline-start" />
              Abituriyent 2026
            </Button>
          </Link>

          <Link href="/admin">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
              <ShieldCheck className="size-3.5" data-icon="inline-start" />
              <span>CMS / Kabinet</span>
            </Button>
          </Link>
        </div>

        {/* Кнопка мобильного меню и переключатель языка на мобильных */}
        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <Link href="/specialties">
            <Button size="sm" className="text-xs font-semibold">
              Qabul
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-md hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-expanded={mobileMenuOpen}
            aria-label="Navigatsiya menyusini ochish"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Навигационное меню с интерактивными подменю (Десктоп) */}
      <nav
        aria-label="Asosiy navigatsiya menyusi"
        className="hidden lg:block border-t border-border bg-muted/30 relative"
      >
        <div className="container mx-auto px-2 xl:px-4 flex items-center flex-wrap gap-0.5 xl:gap-1 py-1">
          {navMenuItems.map((item, index) => {
            const hasChildren = Boolean(item.children && item.children.length > 0);
            const isMenuOpen = hoveredMenu === item.id;
            const isSelfOrChildActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href) ||
                  Boolean(item.children?.some((c) => pathname === c.href || pathname.startsWith(c.href)));

            const isAlignRight = index >= navMenuItems.length - 2;

            return (
              <div
                key={item.id}
                className="relative shrink-0"
                onMouseEnter={() => handleMouseEnter(item.id)}
                onMouseLeave={handleMouseLeave}
                onFocus={() => handleMouseEnter(item.id)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    handleMouseLeave();
                  }
                }}
              >
                <Link
                  href={item.href}
                  className={`inline-flex items-center gap-1 xl:gap-1.5 px-2 xl:px-3 py-1.5 rounded-md text-xs xl:text-sm font-medium transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isSelfOrChildActive
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                  }`}
                  aria-haspopup={hasChildren ? 'menu' : undefined}
                  aria-expanded={hasChildren ? isMenuOpen : undefined}
                >
                  <span>{isUz ? item.labelUz : item.labelRu}</span>
                  {hasChildren && (
                    <ChevronDown
                      className={`size-3.5 opacity-60 transition-transform duration-200 ${
                        isMenuOpen ? 'rotate-180 opacity-100' : ''
                      }`}
                      aria-hidden="true"
                    />
                  )}
                </Link>

                {/* Выпадающее окно подменю при наведении */}
                {hasChildren && isMenuOpen && (
                  <div
                    className={`absolute top-full z-50 pt-1.5 animate-in fade-in-0 zoom-in-95 duration-150 ${
                      isAlignRight ? 'right-0 left-auto' : 'left-0'
                    }`}
                    role="menu"
                    aria-label={isUz ? item.labelUz : item.labelRu}
                  >
                    <div className="w-80 rounded-xl border border-border bg-popover/95 backdrop-blur-md p-2 shadow-2xl ring-1 ring-black/5 divide-y divide-border/40">
                      <div className="space-y-0.5 pb-1">
                        {item.children!.map((sub) => {
                          const isSubActive = pathname === sub.href;
                          return (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setHoveredMenu(null)}
                              className={`group/sub flex flex-col gap-0.5 p-2 rounded-lg transition-colors focus-visible:outline-none focus-visible:bg-accent ${
                                isSubActive
                                  ? 'bg-accent/90 text-accent-foreground font-semibold'
                                  : 'hover:bg-accent/70 text-foreground'
                              }`}
                              role="menuitem"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-xs font-semibold group-hover/sub:text-primary transition-colors">
                                  {isUz ? sub.labelUz : sub.labelRu}
                                </span>
                                {sub.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
                                    {sub.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-muted-foreground line-clamp-1">
                                {isUz ? sub.descUz : sub.descRu}
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </nav>

      {/* Меню для мобильных устройств с раскрывающимися списками (Accordion) */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200 max-h-[80vh] overflow-y-auto">
          <nav aria-label="Mobil navigatsiya" className="flex flex-col gap-1">
            {navMenuItems.map((item) => {
              const hasChildren = Boolean(item.children && item.children.length > 0);
              const isExpanded = expandedMobileMenu === item.id;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.href);

              return (
                <div key={item.id} className="border-b border-border/40 last:border-0 pb-1">
                  <div className="flex items-center justify-between">
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors flex-1 ${
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold'
                          : 'hover:bg-accent text-foreground'
                      }`}
                    >
                      <item.icon className="size-4 opacity-70" />
                      <span>{isUz ? item.labelUz : item.labelRu}</span>
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMobileMenu(isExpanded ? null : item.id)
                        }
                        className="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
                        aria-label={isExpanded ? 'Yopish' : 'Ochish'}
                      >
                        <ChevronDown
                          className={`size-4 transition-transform ${
                            isExpanded ? 'rotate-180 text-primary' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Раскрывающийся аккордеон на мобильных */}
                  {hasChildren && isExpanded && (
                    <div className="pl-6 pr-2 pt-1 pb-2 space-y-1 bg-muted/20 rounded-lg mt-1">
                      {item.children!.map((sub) => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block p-1.5 rounded-md hover:bg-accent/80 text-xs text-foreground"
                        >
                          <div className="font-semibold text-primary/90">
                            {isUz ? sub.labelUz : sub.labelRu}
                          </div>
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {isUz ? sub.descUz : sub.descRu}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground py-1">
              <span>{isUz ? 'Qabul komissiyasi:' : 'Приемная комиссия:'}</span>
              <a href={`tel:${displayPhone.replace(/[^0-9+]/g, '')}`} className="font-bold text-foreground">
                {displayPhone}
              </a>
            </div>
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 p-2 rounded bg-muted text-foreground font-medium"
            >
              <ShieldCheck className="size-4" />
              <span>Boshqaruv paneli (CMS)</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
