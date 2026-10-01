'use client';

import React from 'react';
import Link from 'next/link';
import { Eye, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { ArchitectBadgeShadow } from './architect-badge-shadow';
import { useInstitution } from '@/components/institution/institution-provider';
import { useAppLocale } from '@/components/i18n/locale-provider';

import { NavigationItem } from '@college/shared';

interface FooterProps {
  regulatoryItems?: NavigationItem[];
  studentItems?: NavigationItem[];
}

export function Footer({ regulatoryItems, studentItems }: FooterProps = {}): JSX.Element {
  const {
    name,
    shortName,
    address,
    phone,
    email,
    logoUrl,
    stirInn,
  } = useInstitution();
  const { locale } = useAppLocale();
  const isUz = locale === 'uz';

  const defaultRegItems: Array<{ id: string; path: string; labelUz: string; labelRu: string; openInNewTab?: boolean }> = [
    { id: '1', path: '/info/info-common', labelUz: 'Umumiy maʼlumotlar (37-modda)', labelRu: 'Основные сведения' },
    { id: '2', path: '/info/info-struct', labelUz: 'Tuzilma va boshqaruv organlari', labelRu: 'Структура и органы управления' },
    { id: '3', path: '/info/info-documents', labelUz: 'Rasmiy hujjatlar va litsenziyalar', labelRu: 'Документы и лицензии' },
    { id: '4', path: '/info/info-environment', labelUz: 'Inklyuziv taʼlim va qulay muhit (OʻRQ-641)', labelRu: 'Доступная среда' },
    { id: '5', path: '/administration', labelUz: 'Texnikum maʼmuriyati va rahbariyat', labelRu: 'Руководство и администрация' },
  ];

  const defaultStudentItems: Array<{ id: string; path: string; labelUz: string; labelRu: string; openInNewTab?: boolean }> = [
    { id: 's1', path: '/specialties', labelUz: 'Mutaxassisliklar va davlat grantlari', labelRu: 'Специальности колледжа' },
    { id: 's2', path: '/events', labelUz: 'Ochiq eshiklar kuni va tadbirlar', labelRu: 'Мероприятия' },
    { id: 's3', path: '/teachers', labelUz: 'Pedagogik tarkib', labelRu: 'Педагогический состав' },
    { id: 's4', path: '/news', labelUz: 'Yangiliklar va eʼlonlar', labelRu: 'Новости и анонсы' },
    { id: 's5', path: '/settings', labelUz: 'Maxsus imkoniyatlar (WCAG 2.1 AA)', labelRu: 'Версия для слабовидящих' },
  ];

  const regList = (regulatoryItems && regulatoryItems.length > 0)
    ? regulatoryItems.filter((i) => i.isVisible && !i.deletedAt)
    : defaultRegItems;

  const stuList = (studentItems && studentItems.length > 0)
    ? studentItems.filter((i) => i.isVisible && !i.deletedAt)
    : defaultStudentItems;

  return (
    <footer className="border-t border-border bg-muted/40 text-foreground text-sm mt-auto">
      {/* Верхний блок: Основная информация */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Колонка 1: Техникум */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              {logoUrl ? (
                <div className="size-8 rounded border border-border bg-card flex items-center justify-center overflow-hidden p-0.5 shadow-sm shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoUrl} alt={shortName || name} className="size-full object-contain" />
                </div>
              ) : (
                <span className="size-8 rounded bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs shrink-0 uppercase">
                  {(shortName || name || 'EDU').substring(0, 3)}
                </span>
              )}
              <span className="font-extrabold text-base tracking-tight">
                {shortName || name}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {isUz
                ? 'Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi tasarrufidagi davlat professional taʼlim muassasasi.'
                : 'Государственное профессиональное образовательное учреждение Министерства высшего образования, науки и инноваций Республики Узбекистан.'}
            </p>
            <div className="text-[11px] text-muted-foreground flex flex-col gap-1 pt-2 border-t border-border/50">
              {stirInn && <span>STIR (INN): {stirInn}</span>}
              <span>{isUz ? 'Davlat taʼlim portali' : 'Официальный образовательный портал'}</span>
            </div>
          </div>

          {/* Колонка 2: Обязательные разделы по ст. 37 Закона «Об образовании» (ЗРУ-637) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-sm tracking-wide text-foreground">
              {isUz ? 'Rasmiy maʼlumotlar (OʻRQ-637)' : 'Официальные сведения (ст. 37)'}
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              {regList.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="hover:text-primary transition-colors"
                  >
                    {isUz ? item.labelUz : item.labelRu}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 3: Поступающим и студентам */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-sm tracking-wide text-foreground">
              {isUz ? 'Abituriyentlar va talabalarga' : 'Абитуриентам и студентам'}
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              {stuList.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.path}
                    target={item.openInNewTab ? '_blank' : undefined}
                    rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                    className="hover:text-primary transition-colors flex items-center gap-1"
                  >
                    {item.path === '/settings' && <Eye className="size-3 text-primary shrink-0" />}
                    <span>{isUz ? item.labelUz : item.labelRu}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Колонка 4: Контакты */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-wide text-foreground">
              {isUz ? 'Aloqa va manzil' : 'Контакты и адрес'}
            </h4>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              {address && (
                <div className="flex items-start gap-2">
                  <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                  <span>{address}</span>
                </div>
              )}
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0 text-primary" />
                  <a href={`tel:${phone.replace(/[^0-9+]/g, '')}`} className="hover:text-primary font-medium text-foreground">
                    {phone}
                  </a>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">Email:</span>
                  <a href={`mailto:${email}`} className="hover:text-primary">
                    {email}
                  </a>
                </div>
              )}
            </div>
            <div className="pt-2">
              <Link href="/admin">
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded border border-border bg-background hover:bg-accent transition-colors text-muted-foreground">
                  <ShieldCheck className="size-3" />
                  Boshqaruv paneli (CMS)
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Нижняя строчка копирайта */}
      <div className="border-t border-border bg-muted/70 py-4 text-xs text-muted-foreground">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <span>
            © {new Date().getFullYear()} {name || shortName}. {isUz ? 'Barcha huquqlar himoyalangan. Rasmiy taʼlim portali.' : 'Все права защищены. Официальный образовательный портал.'}
          </span>
          <div className="flex items-center gap-3 text-[11px] flex-wrap justify-center sm:justify-end">
            <span>OʻRQ-641 Qonuni va WCAG 2.1 AA talablariga mos</span>
            <span className="text-border" aria-hidden="true">•</span>
            {/* Architect attribution badge: Abubakr Muminov (platform-architect-badge) */}
            <ArchitectBadgeShadow />
          </div>
        </div>
      </div>
    </footer>
  );
}
