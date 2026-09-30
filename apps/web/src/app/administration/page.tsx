import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Building2,
  Clock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { collegeApi, AdministratorMember } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TtsButton } from '@/components/accessibility/tts-button';
import { AdministrationClientView } from './administration-client-view';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Texnikum maʼmuriyati va rahbariyati — Fargʻona 2-son texnikumi',
  description:
    'Fargʻona shahri 2-son texnikumi maʼmuriyati, rahbariyati, boʻlim boshliqlari, qabul kunlari va aloqa rekvizitlari.',
};

export default async function AdministrationPage(): Promise<JSX.Element> {
  const result = await collegeApi.getAdministrators({ limit: 100 });
  const administrators: AdministratorMember[] = result.items || [];

  const ttsText = `Fargʻona 2-son texnikumi maʼmuriyati va rahbariyati. Rahbariyat tarkibida ${administrators.length} nafar masʼul rahbar va boʻlim mudirlari faoliyat yuritadi. Direktor Karimov Jasur Alisherovich qabul kunlari: dushanba va payshanba soat 14 dan 17 gacha. Qoʻshimcha maʼlumot uchun direktor qabulxonasi telefoni: plyus 998 73 244 00 01.`;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
      {/* Хлебные крошки */}
      <nav aria-label="Xleb kırıntilari" className="text-xs text-muted-foreground flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-primary transition-colors">
          Bosh sahifa
        </Link>
        <span>/</span>
        <span className="text-foreground font-medium" aria-current="page">
          Texnikum maʼmuriyati va rahbariyati
        </span>
      </nav>

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-card via-card/90 to-primary/5 p-6 sm:p-10 shadow-sm">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs font-semibold px-2.5 py-0.5 border-primary/30 text-primary bg-primary/5">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              Boshqaruv va maʼmuriyat
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              Oʻzbekiston Respublikasi Vazirligi tizimi
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Texnikum maʼmuriyati va rahbariyati
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Fargʻona 2-son texnikumining boshqaruv organlari, tarkibiy boʻlinma rahbarlari, fuqarolar va talabalarni qabul qilish vaqtlari hamda bevosita aloqa vositalari.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <TtsButton textToSpeak={ttsText} />
            <Link href="/contacts#feedback">
              <Button size="sm" variant="default" className="text-xs">
                Rahbariyatga onlayn murojaat
              </Button>
            </Link>
            <a href="tel:+998732440001">
              <Button size="sm" variant="outline" className="text-xs">
                <Phone className="h-3.5 w-3.5 mr-1.5 text-primary" />
                Direktor qabulxonasi
              </Button>
            </a>
          </div>
        </div>

        {/* Декоративный фоновый акцент */}
        <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none hidden md:block">
          <Building2 className="w-80 h-80 text-primary" />
        </div>
      </section>

      {/* Интерактивный клиентский список с фильтрацией и поиском */}
      <AdministrationClientView initialAdministrators={administrators} />

      {/* Информационный блок по приему граждан */}
      <section className="rounded-xl border border-primary/20 bg-primary/5 p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
            <Clock className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">
              Jismoniy va yuridik shaxslarni qabul qilish tartibi
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Oʻzbekiston Respublikasining «Jismoniy va yuridik shaxslarning murojaatlari toʻgʻrisida»gi Qonuniga muvofiq, texnikum rahbariyati tomonidan fuqarolarni shaxsiy qabul qilish belgilangan jadval asosida amalga oshiriladi. Shuningdek, Siz oʻz arizangiz yoki taklifingizni saytimizdagi aloqa shakli orqali masofadan taqdim etishingiz mumkin.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-primary/10">
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span>Manzil: Al-Fargʻoniy koʻchasi, 42-uy (Bosh oʻquv binosi)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3.5 w-3.5 text-primary" />
            <span>Rasmiy xatlar: info@texnikum2.uz</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span>Ishonch telefoni: 1006 / +998 (73) 244-00-00</span>
          </div>
        </div>
      </section>
    </div>
  );
}
