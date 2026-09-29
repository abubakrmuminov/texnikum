'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Info,
  Menu,
  Phone,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LanguageSwitcher } from './language-switcher';

export function Header(): JSX.Element {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');

  const navLinks = [
    { href: '/', label: tNav('home'), icon: BookOpen },
    { href: '/news', label: tNav('news'), icon: BookOpen },
    { href: '/specialties', label: tNav('specialties'), icon: GraduationCap },
    { href: '/schedule', label: tNav('schedule'), icon: Calendar },
    { href: '/teachers', label: tNav('teachers'), icon: UserCheck },
    { href: '/events', label: tNav('events'), icon: Calendar },
    { href: '/info', label: tNav('about'), icon: Info },
    { href: '/contacts', label: tNav('contacts'), icon: Phone },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-sm">
      {/* Главный блок шапки: Бренд + Горячая линия + Переключатель языка */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Логотип и наименование техникума */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-1"
          aria-label="Fargʻona 2-son texnikumi — Bosh sahifa"
        >
          <div className="size-11 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow font-bold text-sm tracking-wider">
            TEX
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Davlat kasbiy taʼlim muassasasi
            </span>
            <span className="text-base sm:text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors leading-tight">
              {tCommon('brandName')}
            </span>
            <span className="text-[11px] text-muted-foreground hidden md:inline truncate max-w-sm">
              {tCommon('brandSubtitle')}
            </span>
          </div>
        </Link>

        {/* Телефон приемной комиссии, переключатель языка и быстрые кнопки */}
        <div className="hidden lg:flex items-center gap-5 text-sm">
          <div className="flex flex-col text-right">
            <span className="text-xs text-muted-foreground">Qabul komissiyasi ishonch telefoni:</span>
            <a
              href="tel:+998732440000"
              className="font-bold text-foreground hover:text-primary transition-colors flex items-center justify-end gap-1.5"
            >
              <Phone className="size-3.5 text-primary" aria-hidden="true" />
              <span>+998 (73) 244-00-00</span>
            </a>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
              Dush–Shanba: 08:30 – 17:30 (Qabul davom etmoqda)
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
            className="p-2 rounded-md hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring"
            aria-expanded={mobileMenuOpen}
            aria-label="Navigatsiya menyusini ochish"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Навигационное меню (Десктоп) */}
      <nav
        aria-label="Asosiy navigatsiya menyusi"
        className="hidden lg:block border-t border-border bg-muted/30"
      >
        <div className="container mx-auto px-4 flex items-center gap-1 overflow-x-auto py-1">
          {navLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-ring ${
                  isActive
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-foreground/80 hover:text-foreground hover:bg-accent'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Выпадающее меню для мобильных устройств */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background px-4 py-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
          <nav aria-label="Mobil navigatsiya" className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const isActive =
                link.href === '/'
                  ? pathname === '/'
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-accent text-foreground'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <link.icon className="size-4 opacity-70" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border pt-4 flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between text-muted-foreground py-1">
              <span>Qabul komissiyasi:</span>
              <a href="tel:+998732440000" className="font-bold text-foreground">
                +998 (73) 244-00-00
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
