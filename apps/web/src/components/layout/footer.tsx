import React from 'react';
import Link from 'next/link';
import { Eye, MapPin, Phone, ShieldCheck } from 'lucide-react';
import { ArchitectBadgeShadow } from './architect-badge-shadow';

export function Footer(): JSX.Element {
  return (
    <footer className="border-t border-border bg-muted/40 text-foreground text-sm mt-auto">
      {/* Верхний блок: Основная информация */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Колонка 1: Техникум */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="size-8 rounded bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                TEX
              </span>
              <span className="font-extrabold text-base tracking-tight">
                Fargʻona 2-son texnikumi
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi tasarrufidagi davlat professional taʼlim muassasasi.
            </p>
            <div className="text-[11px] text-muted-foreground flex flex-col gap-1 pt-2 border-t border-border/50">
              <span>Litsenziya № 039124 (muddatsiz)</span>
              <span>Davlat akkreditatsiyasi toʻgʻrisida sertifikat № 004812</span>
              <span>STIR (INN): 302987654 | JSHSHIR (PINFL): 31205851234567</span>
            </div>
          </div>

          {/* Колонка 2: Обязательные разделы по ст. 37 Закона «Об образовании» (ЗРУ-637) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-sm tracking-wide text-foreground">
              Rasmiy maʼlumotlar (OʻRQ-637)
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/info/info-common" className="hover:text-primary transition-colors">
                  Umumiy maʼlumotlar (37-modda)
                </Link>
              </li>
              <li>
                <Link href="/info/info-struct" className="hover:text-primary transition-colors">
                  Tuzilma va boshqaruv organlari
                </Link>
              </li>
              <li>
                <Link href="/info/info-documents" className="hover:text-primary transition-colors">
                  Rasmiy hujjatlar va litsenziyalar
                </Link>
              </li>
              <li>
                <Link href="/info/info-environment" className="hover:text-primary transition-colors">
                  Inklyuziv taʼlim va qulay muhit (OʻRQ-641)
                </Link>
              </li>
              <li>
                <Link href="/administration" className="hover:text-primary transition-colors">
                  Texnikum maʼmuriyati va rahbariyat
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 3: Поступающим и студентам */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-bold text-sm tracking-wide text-foreground">
              Abituriyentlar va talabalarga
            </h4>
            <ul className="flex flex-col gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/specialties" className="hover:text-primary transition-colors">
                  Mutaxassisliklar va davlat grantlari
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-primary transition-colors">
                  Ochiq eshiklar kuni va tadbirlar
                </Link>
              </li>
              <li>
                <Link href="/teachers" className="hover:text-primary transition-colors">
                  Pedagogik tarkib
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-primary transition-colors">
                  Yangiliklar va eʼlonlar
                </Link>
              </li>
              <li>
                <Link href="/settings" className="hover:text-primary transition-colors flex items-center gap-1">
                  <Eye className="size-3 text-primary" />
                  <span>Maxsus imkoniyatlar (WCAG 2.1 AA)</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Колонка 4: Контакты */}
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm tracking-wide text-foreground">
              Aloqa va manzil
            </h4>
            <div className="flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-start gap-2">
                <MapPin className="size-4 shrink-0 text-primary mt-0.5" />
                <span>150100, Fargʻona viloyati, Fargʻona sh., Al-Fargʻoniy koʻchasi, 42-uy</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-primary" />
                <a href="tel:+998732440000" className="hover:text-primary font-medium text-foreground">
                  +998 (73) 244-00-00
                </a>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-foreground">Email:</span>
                <a href="mailto:info@texnikum2.uz" className="hover:text-primary">
                  info@texnikum2.uz
                </a>
              </div>
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
            © 2026 Fargʻona shahri 2-son texnikumi. Barcha huquqlar himoyalangan. Rasmiy taʼlim portali.
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
