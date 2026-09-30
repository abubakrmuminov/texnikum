import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Accessibility,
  Award,
  BookOpen,
  Building,
  Coins,
  Compass,
  FileSpreadsheet,
  FileText,
  FolderLock,
  Globe2,
  GraduationCap,
  History,
  Users,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'Taʼlim tashkiloti toʻgʻrisida maʼlumotlar — Fargʻona 2-son texnikumi',
  description:
    'Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni (OʻRQ-637, 37-modda) va PF-158-son Farmoniga muvofiq rasmiy axborotlar.',
};

const INFO_SECTIONS = [
  {
    slug: 'info-common',
    title: 'Umumiy maʼlumotlar',
    desc: 'Texnikumning toʻliq va qisqartirilgan nomi, tashkil etilgan sanasi, muassis, ish tartibi, manzillar va aloqa maʼlumotlari.',
    icon: Building,
  },
  {
    slug: 'info-struct',
    title: 'Tuzilma va boshqaruv organlari',
    desc: 'Boshqaruv tizimi, direktor, pedagogik kengash, vasiylik kengashi, tarkibiy boʻlimlar.',
    icon: Compass,
  },
  {
    slug: 'info-documents',
    title: 'Rasmiy hujjatlar va litsenziyalar',
    desc: 'Texnikum ustavi, faoliyat litsenziyasi, davlat akkreditatsiyasi sertifikati, ichki tartib-qoidalar.',
    icon: FileText,
  },
  {
    slug: 'info-education',
    title: 'Taʼlim faoliyati va oʻquv rejalari',
    desc: 'Amalga oshiriladigan kasbiy taʼlim dasturlari, ECTS kredit-modul tizimi, oʻquv rejalari va taqvim jadvallari.',
    icon: BookOpen,
    href: '/specialties',
  },
  {
    slug: 'info-leadership',
    title: 'Rahbariyat va pedagogik tarkib',
    desc: 'Direktor, oʻrinbosarlar, boʻlim mudirlari, oʻqituvchilarning malaka toifalari va ish staji.',
    icon: Users,
    href: '/teachers',
  },
  {
    slug: 'info-environment',
    title: 'Inklyuziv taʼlim va qulay muhit',
    desc: 'Nogironligi boʻlgan shaxslar uchun binolar qulayligi, panduslar, taktil belgilar, veb-saytning maxsus versiyasi (OʻRQ-641).',
    icon: Accessibility,
  },
  {
    slug: 'info-material',
    title: 'Moddiy-texnik taʼminot',
    desc: 'Oʻquv xonalari, kompyuter laboratoriyalari, axborot-resurs markazi (ARM), sport majmuasi va yotoqxona.',
    icon: FolderLock,
  },
  {
    slug: 'info-grants',
    title: 'Davlat grantlari va toʻlov-kontrakt shartlari',
    desc: 'Davlat granti asosida oʻrinlar, toʻlov-kontrakt summasi, toʻlov shartlari va namunaviy shartnomalar.',
    icon: Coins,
  },
  {
    slug: 'info-financial',
    title: 'Moliyaviy-xoʻjalik faoliyati',
    desc: 'Yillik daromadlar va xarajatlar smetasi, byudjet mablagʻlarining sarflanishi toʻgʻrisidagi ochiq hisobotlar.',
    icon: FileSpreadsheet,
  },
  {
    slug: 'info-vacant',
    title: 'Qabul va koʻchirish uchun boʻsh oʻrinlar',
    desc: 'Har bir taʼlim yoʻnalishi boʻyicha oʻquvchilarni qabul qilish va oʻqishni koʻchirish uchun vakant oʻrinlar soni.',
    icon: GraduationCap,
  },
  {
    slug: 'info-international',
    title: 'Xalqaro hamkorlik',
    desc: 'Xorijiy taʼlim muassasalari va xalqaro tashkilotlar bilan tuzilgan shartnomalar va qoʻshma loyihalar.',
    icon: Globe2,
  },
  {
    slug: 'info-employment',
    title: 'Bitiruvchilar bandligi va amaliyot',
    desc: 'Bitiruvchilar bandligini monitoring qilish, IT-kompaniyalar va sanoat korxonalari bilan hamkorlik shartnomalari.',
    icon: Award,
  },
];

export default function InfoIndexPage(): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl space-y-12">
      {/* Хлебные крошки и заголовок */}
      <div>
        <nav aria-label="Xleb kırıntilari" className="mb-3 text-xs text-muted-foreground flex items-center gap-1.5">
          <Link href="/" className="hover:text-primary transition-colors">
            Bosh sahifa
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium" aria-current="page">
            Texnikum haqida
          </span>
        </nav>
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <Badge variant="outline" className="text-xs font-semibold border-primary/30 text-primary">
            Oʻzbekiston Respublikasi «Taʼlim toʻgʻrisida»gi Qonuni (OʻRQ-637, 37-modda)
          </Badge>
          <Badge variant="secondary" className="text-xs font-medium">
            Prezident Farmoni № PF-158
          </Badge>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Taʼlim tashkiloti toʻgʻrisida maʼlumotlar
        </h1>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
          Fargʻona shahri 2-son texnikumi faoliyati, normativ hujjatlari, taʼlim dasturlari, pedagogik tarkib va moddiy-texnik taʼminotiga oid rasmiy axborotlar.
        </p>
      </div>

      {/* Краткая визитка колледжа и правовой статус */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 rounded-2xl border border-border bg-card shadow-sm">
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Muassis
          </span>
          <p className="text-base font-bold text-foreground">
            Oliy taʼlim, fan va innovatsiyalar vazirligi
          </p>
          <p className="text-xs text-muted-foreground">
            Texnikum davlat professional taʼlim muassasasi hisoblanadi.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Faoliyat litsenziyasi
          </span>
          <p className="text-base font-bold text-foreground">
            № 039124 (muddatsiz)
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Vazirlik davlat reyestrida roʻyxatdan oʻtgan
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Davlat akkreditatsiyasi
          </span>
          <p className="text-base font-bold text-foreground">
            Sertifikat № 004812
          </p>
          <p className="text-xs text-muted-foreground">
            Davlat namunasidagi kasbiy diplom berish huquqi.
          </p>
        </div>
      </div>

      {/* Обязательные подразделы по ст. 37 ЗРУ-637 (12 разделов) */}
      <section className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">
            «Taʼlim toʻgʻrisida»gi Qonunning 37-moddasi boʻyicha rasmiy boʻlimlar
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Rasmiy maʼlumotlar va elektron hujjatlar bilan tanishish uchun tegishli boʻlimga oʻting.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {INFO_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const targetUrl = sec.href || `/info/${sec.slug}`;

            return (
              <Link
                key={sec.slug}
                href={targetUrl}
                className="group flex flex-col justify-between p-5 rounded-xl border border-border bg-card shadow-sm hover:shadow-md hover:border-primary/40 transition-all focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <div>
                  <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                    <Icon className="size-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1.5">
                    {sec.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {sec.desc}
                  </p>
                </div>
                <div className="pt-4 mt-3 border-t border-border flex items-center justify-between text-xs font-semibold text-primary">
                  <span>Boʻlimga oʻtish</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* История и академические традиции */}
      <section className="p-6 sm:p-8 rounded-2xl border border-border bg-muted/30 space-y-4">
        <div className="flex items-center gap-2">
          <History className="size-5 text-primary" aria-hidden="true" />
          <h2 className="text-xl font-bold text-foreground">
            Fargʻona 2-son texnikumi tarixi va rivojlanish bosqichlari
          </h2>
        </div>
        <div className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm text-muted-foreground leading-relaxed space-y-3">
          <p>
            1968-yilda tashkil etilgan Fargʻona texnikumi oʻzining 55 yildan ziyod faoliyati davomida viloyat va mamlakatimiz iqtisodiyoti, axborot-kommunikatsiya sohalari uchun 30 000 dan ortiq yetuk mutaxassislarni tarbiyalab chiqardi.
          </p>
          <p>
            Bugungi kunda texnikum — innovatsion laboratoriyalari, xalqaro ECTS kredit-modul dasturlari, «WorldSkills» kasbiy mahorat standartlari hamda IT Park bilan mustahkam hamkorlikka ega zamonaviy raqamli taʼlim maskanidir.
          </p>
        </div>
      </section>
    </div>
  );
}
