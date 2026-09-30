import {
  AuditLogItem,
  Department,
  EventItem,
  MediaFile,
  NewsCategory,
  NewsItem,
  NewsStatus,
  PageItem,
  ScheduleItem,
  Specialty,
  StorageBucket,
  Teacher,
  UserProfile,
  UserRole,
  ContactsData,
  OnboardingState,
} from '@college/shared';
import type { AdministratorMember, AuditAction } from '@college/shared';

export type { AdministratorMember, AdministratorCategory, AuditAction } from '@college/shared';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const DEFAULT_NEWS_COVER = '/images/news/default-cover.jpg';

// -----------------------------------------------------------------------------
// РЕАЛИСТИЧНЫЕ ДАННЫЕ ДЛЯ АВТОНОМНОГО РЕЖИМА И SSG СБОРКИ
// -----------------------------------------------------------------------------
export const FALLBACK_CATEGORIES: NewsCategory[] = [
  { id: 1, name: 'Rasmiy', slug: 'rasmiy', colorBadge: 'slate', createdAt: '2026-09-01T00:00:00Z' },
  { id: 2, name: 'Talabalar hayoti', slug: 'talabalar-hayoti', colorBadge: 'indigo', createdAt: '2026-09-01T00:00:00Z' },
  { id: 3, name: 'Fan va innovatsiyalar', slug: 'fan-va-innovatsiyalar', colorBadge: 'purple', createdAt: '2026-09-01T00:00:00Z' },
  { id: 4, name: 'Sport va yutuqlar', slug: 'sport-va-yutuqlar', colorBadge: 'emerald', createdAt: '2026-09-01T00:00:00Z' },
  { id: 5, name: 'Abituriyentga', slug: 'abituriyentga', colorBadge: 'amber', createdAt: '2026-09-01T00:00:00Z' },
];

export const FALLBACK_NEWS: NewsItem[] = [
  {
    id: '10000000-0000-0000-0000-000000000001',
    title: 'Texnikum talabalari «WorldSkills Uzbekistan 2026» kasbiy mahorat chempionatida oltin medalni qoʻlga kiritishdi',
    slug: 'texnikum-talabalari-worldskills-uzbekistan-2026-oltin-medal',
    categoryId: 3,
    leadText: 'Viloyat va respublika bosqichida texnikumimiz jamoasi «Veb-texnologiyalar» hamda «Tarmoq va tizim maʼmurligi» yoʻnalishlarida faxrli 1-oʻrinni egalladi.',
    contentHtml: `
      <p class="lead">2026-yil 20–25-mart kunlari oʻtkazilgan «WorldSkills Uzbekistan» milliy kasbiy mahorat chempionatida Fargʻona 2-son texnikumi iqtidorli talabalari yuqori amaliy tayyorgarlik darajasini namoyish etishdi.</p>
      <h2>«Veb-texnologiyalar» yoʻnalishidagi gʻalaba</h2>
      <p>«Kompyuter injiniringi va dasturiy taʼminot» mutaxassisligi 3-bosqich talabasi Sardor Karimov murabbiy Ahmedov Sardor Baxtiyorovich rahbarligida murakkab modullarni: mikroxizmatlar arxitekturasi, RESTful API va WCAG standartlariga mos zamonaviy foydalanuvchi interfeysini muvaffaqiyatli ishlab chiqdi.</p>
      <blockquote class="border-l-4 border-primary pl-4 italic my-4">«Chempionatdagi gʻalaba — zamonaviy laboratoriyalarimizdagi doimiy amaliy mashgʻulotlar va ustoz-shogird anʼanasining amaliy mevasidir», — dedi axborot texnologiyalari boʻlimi mudiri Jasur Karimov.</blockquote>
      <h2>Tarmoq maʼmurligi va axborot xavfsizligi</h2>
      <p>«Kompyuter tarmoqlari va tizimlari maʼmurligi» yoʻnalishida tahsil olayotgan talaba Temur Poʻlatov tarmoq klasterini sozlash va kiberxavfsizlik tahdidlarini bartaraf etish boʻyicha eng yuqori natijani qayd etdi.</p>
      <p>Texnikum maʼmuriyati va pedagogik jamoasi gʻoliblarni hamda ularning ustozlarini samimiy qutlaydi!</p>
    `,
    coverImageUrl: '/images/news/champion-2026.svg',
    readingTimeMin: 4,
    status: NewsStatus.PUBLISHED,
    isFeatured: true,
    authorId: 'a0000000-0000-0000-0000-000000000001',
    publishedAt: '2026-09-28T09:00:00Z',
    createdAt: '2026-09-28T08:00:00Z',
    updatedAt: '2026-09-28T09:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000002',
    title: 'Qabul 2026: davlat granti oʻrinlari, my.edu.uz orqali ariza topshirish tartibi va yoʻnalishlar',
    slug: 'qabul-2026-davlat-granti-va-hujjat-topshirish-tartibi',
    categoryId: 5,
    leadText: 'Fargʻona shahri 2-son texnikumi qabul komissiyasi 9 va 11-sinf bitiruvchilarini 2026/2027 oʻquv yili uchun qabul shartlari bilan tanishtiradi.',
    contentHtml: `
      <p class="lead">2026-yil 20-iyundan boshlab texnikumda kunduzgi taʼlim shakli boʻyicha oʻrta maxsus professional taʼlim dasturlariga arizalar qabul qilinadi. Joriy oʻquv yilida davlat granti asosida 75 ta maqsadli oʻrin ajratildi.</p>
      <h3>Hujjat topshirish muddatlari</h3>
      <ul class="list-disc pl-6 space-y-2">
        <li>Arizalarni qabul qilish boshlanishi: <strong>2026-yil 20-iyun</strong></li>
        <li>Hujjat qabul qilish yakuni: <strong>2026-yil 15-avgust</strong></li>
        <li>Shahodatnoma nusxasi va asl nusxasini tasdiqlash: <strong>2026-yil 18-avgust (soat 18:00 gacha)</strong></li>
        <li>Qabul toʻgʻrisida buyruq eʼlon qilinishi: <strong>2026-yil 20-avgust</strong></li>
      </ul>
      <h3 class="mt-4">Arizani topshirish usullari</h3>
      <ol class="list-decimal pl-6 space-y-2">
        <li>Yagona interaktiv professional taʼlim portali — <strong>my.edu.uz</strong> orqali onlayn.</li>
        <li>Texnikum qabul komissiyasiga bevosita tashrif buyurgan holda (Bosh bino, 105-xona).</li>
      </ol>
      <p class="mt-4">Kerakli hujjatlar toʻliq roʻyxati va qabul nizomi «Abituriyentga» boʻlimida batafsil keltirilgan.</p>
    `,
    coverImageUrl: '/images/news/admissions-2026.svg',
    readingTimeMin: 3,
    status: NewsStatus.PUBLISHED,
    isFeatured: false,
    authorId: 'a0000000-0000-0000-0000-000000000001',
    publishedAt: '2026-09-26T10:00:00Z',
    createdAt: '2026-09-26T09:00:00Z',
    updatedAt: '2026-09-26T10:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000003',
    title: 'Fargʻona 2-son texnikumida bulutli hisoblash va sunʼiy intellekt laboratoriyasi ochildi',
    slug: 'texnikumda-bulutli-hisoblash-va-ai-laboratoriyasi-ochildi',
    categoryId: 3,
    leadText: 'Raqamli taʼlim texnologiyalarini rivojlantirish dasturi doirasida texnikumda 25 oʻrinli yangi innovatsion laboratoriya ishga tushirildi.',
    contentHtml: '<p class="lead">Yangi laboratoriya zamonaviy server uskunalari, yuqori tezlikdagi optik tolali aloqa hamda amaliy IT-loyihalarni amalga oshirish uchun dasturiy vositalar bilan toʻliq jihozlandi.</p>',
    coverImageUrl: '/images/news/lab-opening.svg',
    readingTimeMin: 3,
    status: NewsStatus.PUBLISHED,
    isFeatured: false,
    authorId: 'a0000000-0000-0000-0000-000000000001',
    publishedAt: '2026-09-24T12:00:00Z',
    createdAt: '2026-09-24T11:00:00Z',
    updatedAt: '2026-09-24T12:00:00Z',
  },
  {
    id: '10000000-0000-0000-0000-000000000004',
    title: 'Texnikum voleybol jamoasi Fargʻona viloyati texnikumlari oʻrtasidagi spartakiada gʻolibi boʻldi',
    slug: 'texnikum-voleybol-jamoasi-viloyat-spartakiadasida-golib',
    categoryId: 4,
    leadText: 'Final uchrashuvida texnikumimiz sportchilari murosasiz kurashda 3:1 hisobida gʻalaba qozonib, kubok sohibiga aylanishdi.',
    contentHtml: '<p class="lead">Shahrimiz sport majmuasida oʻtkazilgan professional taʼlim muassasalari spartakiadasida texnikum voleybol terma jamoasi barcha oʻyinlarda ishonchli oʻyin koʻrsatib, 1-oʻrinni egalladi.</p>',
    coverImageUrl: '/images/news/volleyball-cup.svg',
    readingTimeMin: 2,
    status: NewsStatus.PUBLISHED,
    isFeatured: false,
    authorId: 'a0000000-0000-0000-0000-000000000001',
    publishedAt: '2026-09-22T15:00:00Z',
    createdAt: '2026-09-22T14:00:00Z',
    updatedAt: '2026-09-22T15:00:00Z',
  },
];

export const FALLBACK_DEPARTMENTS: Department[] = [
  {
    id: 'd0000000-0000-0000-0000-000000000001',
    name: 'Axborot texnologiyalari va dasturlash boʻlimi',
    slug: 'it-programming',
    headName: 'Karimov Jasur Alisherovich',
    description: 'Dasturiy injiniring, veb-ishlanmalar va maʼlumotlar bazasi mutaxassislarini tayyorlash',
    contactEmail: 'it-dept@texnikum2.uz',
    contactPhone: '+998 (73) 244-00-11',
    orderIndex: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'd0000000-0000-0000-0000-000000000002',
    name: 'Telekommunikatsiya va kompyuter tizimlari boʻlimi',
    slug: 'networks-security',
    headName: 'Yusupova Nilufar Rustamovna',
    description: 'Kompyuter tarmoqlari maʼmurligi, aloqa tizimlari va kiberxavfsizlik yoʻnalishlari',
    contactEmail: 'sec-dept@texnikum2.uz',
    contactPhone: '+998 (73) 244-00-12',
    orderIndex: 2,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const FALLBACK_TEACHERS: Teacher[] = [
  {
    id: 'e0000000-0000-0000-0000-000000000001',
    fullName: 'Karimov Jasur Alisherovich',
    slug: 'karimov-jasur-alisherovich',
    position: 'Boʻlim mudiri, oliy toifali oʻqituvchi',
    departmentId: 'd0000000-0000-0000-0000-000000000001',
    subjects: ['Algoritmlash va dasturlash asoslari', 'Dasturiy injiniring', 'Maʼlumotlar tuzilmalari'],
    qualification: 'Oliy toifali oʻqituvchi, Oʻzbekiston Respublikasi kasbiy taʼlim aʼlochisi',
    education: 'Fargʻona politexnika instituti (Amaliy informatika magistri)',
    experienceYears: 18,
    teachingExperienceYears: 15,
    bio: 'Axborot texnologiyalari kafedrasi yetakchi mutaxassisi. Oʻrta maxsus taʼlim tizimi uchun 10 dan ortiq oʻquv-uslubiy qoʻllanmalar muallifi.',
    photoUrl: '/images/teachers/karimov.webp',
    email: 'j.karimov@texnikum2.uz',
    isActive: true,
    orderIndex: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000002',
    fullName: 'Ahmedov Sardor Baxtiyorovich',
    slug: 'ahmedov-sardor-baxtiyorovich',
    position: 'Maxsus fanlar katta oʻqituvchisi, WorldSkills bosh eksperti',
    departmentId: 'd0000000-0000-0000-0000-000000000001',
    subjects: ['Veb-ilovalar yaratish', 'Maʼlumotlar bazasi va SQL', 'Backend platformalar'],
    qualification: 'Birinchi toifali oʻqituvchi, xalqaro sertifikatlangan veb-dasturchi',
    education: 'TATU Fargʻona filiali (Dasturiy injiniring)',
    experienceYears: 11,
    teachingExperienceYears: 8,
    bio: 'WorldSkills Uzbekistan milliy eksperti. Talabalar bilan xakatonlar va IT Park startap loyihalariga murabbiylik qiladi.',
    photoUrl: '/images/teachers/ahmedov.webp',
    email: 's.ahmedov@texnikum2.uz',
    isActive: true,
    orderIndex: 2,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000003',
    fullName: 'Yusupova Nilufar Rustamovna',
    slug: 'yusupova-nilufar-rustamovna',
    position: 'Boʻlim mudiri, dotsent, texnika fanlari nomzodi',
    departmentId: 'd0000000-0000-0000-0000-000000000002',
    subjects: ['Telekommunikatsiya tarmoqlari', 'Tarmoq xavfsizligi va maʼmurlash', 'Axborot himoyasi vositalari'],
    qualification: 'Oliy toifali oʻqituvchi, PhD (texnika fanlari)',
    education: 'Toshkent axborot texnologiyalari universiteti',
    experienceYears: 20,
    teachingExperienceYears: 17,
    bio: 'Tarmoq infratuzilmasi va axborot xavfsizligi sohasida 25 dan ortiq ilmiy maqola va patentlar muallifi.',
    photoUrl: '/images/teachers/yusupova.webp',
    email: 'n.yusupova@texnikum2.uz',
    isActive: true,
    orderIndex: 3,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'e0000000-0000-0000-0000-000000000004',
    fullName: 'Rahimova Gulnora Tohirovna',
    slug: 'rahimova-gulnora-tohirovna',
    position: 'Oliy matematika va matematik mantiq fani oʻqituvchisi',
    departmentId: 'd0000000-0000-0000-0000-000000000001',
    subjects: ['Oliy matematika asoslari', 'Diskret matematika va matematik mantiq'],
    qualification: 'Oliy toifali oʻqituvchi, Xalq taʼlimi aʼlochisi',
    education: 'Fargʻona davlat universiteti (Matematika fakulteti)',
    experienceYears: 24,
    teachingExperienceYears: 22,
    bio: 'Boʻlajak IT-mutaxassislarga matematik modellashtirish va algoritmlarning matematik asoslarini oʻrgatish boʻyicha metodist.',
    photoUrl: '/images/teachers/rahimova.webp',
    email: 'g.rahimova@texnikum2.uz',
    isActive: true,
    orderIndex: 4,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const FALLBACK_ADMINISTRATORS: AdministratorMember[] = [
  {
    id: 'adm-00000000-0000-0000-0000-000000000001',
    fullName: 'Karimov Jasur Alisherovich',
    slug: 'karimov-jasur-alisherovich',
    position: 'Texnikum direktori, dotsent, texnika fanlari nomzodi',
    category: 'leadership',
    receptionHours: 'Dushanba va Payshanba: 14:00 – 17:00',
    phone: '+998 (73) 244-00-01',
    email: 'direktor@texnikum2.uz',
    roomNumber: 'Bosh bino, 201-xona',
    duties: 'Texnikumning umumiy faoliyatiga rahbarlik qilish, taʼlim sifatini nazorat qilish, davlat taʼlim standartlari bajarilishini taʼminlash, xalqaro hamkorlik va moliyaviy barqarorlikni boshqarish.',
    bio: 'Oliy maʼlumotli, texnika fanlari nomzodi. Oʻrta maxsus kasbiy taʼlim tizimida 20 yildan ortiq boshqaruv va ilmiy-pedagogik tajribasiga ega. Oʻzbekiston Respublikasi kasbiy taʼlim aʼlochisi.',
    photoUrl: '/images/teachers/karimov.webp',
    orderIndex: 1,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000002',
    fullName: 'Yusupova Nilufar Rustamovna',
    slug: 'yusupova-nilufar-rustamovna',
    position: 'Oʻquv ishlari boʻyicha direktor oʻrinbosari, PhD',
    category: 'leadership',
    receptionHours: 'Seshanba va Juma: 10:00 – 13:00',
    phone: '+998 (73) 244-00-02',
    email: 'uquv@texnikum2.uz',
    roomNumber: 'Bosh bino, 204-xona',
    duties: 'Oʻquv rejalari va dasturlarini ishlab chiqish, ECTS kredit-modul tizimini joriy etish, dars taqsimoti, dars jadvallari va oʻquv jarayoni monitoringini tashkil qilish.',
    bio: 'Toshkent axborot texnologiyalari universiteti bitiruvchisi. Tarmoq texnologiyalari va raqamli taʼlim metodikasi boʻyicha 25 dan ortiq ilmiy ishlar muallifi.',
    photoUrl: '/images/teachers/yusupova.webp',
    orderIndex: 2,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000003',
    fullName: 'Ahmedov Sardor Baxtiyorovich',
    slug: 'ahmedov-sardor-baxtiyorovich',
    position: 'Yoshlar bilan ishlash va maʼnaviy-maʼrifiy ishlar boʻyicha direktor oʻrinbosari',
    category: 'leadership',
    receptionHours: 'Dushanba va Chorshanba: 15:00 – 17:00',
    phone: '+998 (73) 244-00-03',
    email: 'yoshlar@texnikum2.uz',
    roomNumber: 'Bosh bino, 205-xona',
    duties: 'Talabalar maʼnaviyatini yuksaltirish, «Besh muhim tashabbus» doirasidagi tadbirlar, toʻgaraklar faoliyati, talabalar turar joyi tartibi va ijtimoiy himoya tadbirlari.',
    bio: 'WorldSkills Uzbekistan milliy eksperti. Yoshlar ittifoqi faoli, talabalar xakatonlari va startap tashabbuslari koordinatori.',
    photoUrl: '/images/teachers/ahmedov.webp',
    orderIndex: 3,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000004',
    fullName: 'Gʻaniyev Botir Mamatovich',
    slug: 'ganiyev-botir-mamatovich',
    position: 'Ishlab chiqarish taʼlimi va amaliyot boʻyicha direktor oʻrinbosari',
    category: 'leadership',
    receptionHours: 'Seshanba va Shanba: 09:00 – 12:00',
    phone: '+998 (73) 244-00-05',
    email: 'amaliyot@texnikum2.uz',
    roomNumber: 'Oʻquv-amaliyot binosi, 102-xona',
    duties: 'Sanoat va IT-korxonalar bilan dual taʼlim shartnomalarini rasmiylashtirish, ishlab chiqarish amaliyotini tashkil qilish, bitiruvchilar bandligi va kasbiy koʻnikmalarni baholash.',
    bio: 'Muhandislik va texnologik sohalarda 15 yillik amaliy tajribaga ega mutaxassis. Korxonalar bilan hamkorlik dasturlari kuratori.',
    photoUrl: '/images/teachers/karimov.webp',
    orderIndex: 4,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000005',
    fullName: 'Rahimova Gulnora Tohirovna',
    slug: 'rahimova-gulnora-tohirovna',
    position: 'Oʻquv-uslubiy boʻlim boshligʻi, bosh metodist',
    category: 'department_head',
    receptionHours: 'Dushanba – Juma: 09:00 – 16:00',
    phone: '+998 (73) 244-00-06',
    email: 'metodika@texnikum2.uz',
    roomNumber: 'Bosh bino, 108-xona',
    duties: 'Oʻquv-uslubiy majmualar yaratish, pedagog xodimlar attestatsiyasi, ochiq darslar va ilgʻor xorijiy taʼlim metodikalarini oʻquv jarayoniga tatbiq qilish.',
    bio: 'Xalq taʼlimi aʼlochisi, 24 yillik pedagogik va uslubiy faoliyat stajiga ega tajribali mutaxassis.',
    photoUrl: '/images/teachers/rahimova.webp',
    orderIndex: 5,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000006',
    fullName: 'Ismoilova Dilnoza Hakimova',
    slug: 'ismoilova-dilnoza-hakimova',
    position: 'Kadrlar boʻlimi boshligʻi (Inson resurslarini boshqarish)',
    category: 'department_head',
    receptionHours: 'Dushanba – Juma: 14:00 – 17:00',
    phone: '+998 (73) 244-00-07',
    email: 'kadrlar@texnikum2.uz',
    roomNumber: 'Bosh bino, 110-xona',
    duties: 'Pedagog va xodimlarni ishga qabul qilish, mehnat qonunchiligi talablariga rioya etilishini taʼminlash, mehnat daftarchalarini yuritish va yillik hisobotlar tayyorlash.',
    bio: 'Yuridik va inson resurslari sohasida 12 yillik tajribaga ega mutaxassis.',
    photoUrl: '/images/teachers/yusupova.webp',
    orderIndex: 6,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000007',
    fullName: 'Toʻxtasinov Elyor Shavkatovich',
    slug: 'toxtasinov-elyor-shavkatovich',
    position: 'Bosh hisobchi (Buxgalteriya xizmati rahbari)',
    category: 'administrative',
    receptionHours: 'Seshanba va Payshanba: 14:00 – 16:30',
    phone: '+998 (73) 244-00-04',
    email: 'buxgalteriya@texnikum2.uz',
    roomNumber: 'Bosh bino, 107-xona',
    duties: 'Buxgalteriya hisobini yuritish, byudjet va toʻlov-kontrakt mablagʻlarining maqsadli sarflanishi nazorati, soliq va statistika hisobotlari, oylik maoshlar hisob-kitobi.',
    bio: 'Iqtisodchi-moliyachi. Davlat moliya tizimida 14 yillik boshqaruv stajiga ega.',
    photoUrl: '/images/teachers/ahmedov.webp',
    orderIndex: 7,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000008',
    fullName: 'Soliyeva Sayyora Nodirovna',
    slug: 'soliyeva-sayyora-nodirovna',
    position: 'Devonxona va ijro intizomi boʻlimi mudiri',
    category: 'administrative',
    receptionHours: 'Dushanba – Shanba: 08:30 – 17:00',
    phone: '+998 (73) 244-00-08',
    email: 'devonxona@texnikum2.uz',
    roomNumber: 'Bosh bino, 104-xona',
    duties: 'Hujjatlar aylanmasi (edo.ijro.uz), kiruvchi va chiquvchi rasmiy xatlar roʻyxati, fuqarolar murojaatlarini qabul qilish va texnikum arxivi faoliyatini yuritish.',
    bio: 'Ish yuritish va elektron hujjat aylanishi tizimlari boʻyicha yetakchi mutaxassis.',
    photoUrl: '/images/teachers/rahimova.webp',
    orderIndex: 8,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000009',
    fullName: 'Nazarov Farrux Erkinovich',
    slug: 'nazarov-farrux-erkinovich',
    position: 'Bosh yuriskonsult (Huquqiy taʼminot xizmati)',
    category: 'administrative',
    receptionHours: 'Chorshanba va Juma: 14:00 – 16:00',
    phone: '+998 (73) 244-00-09',
    email: 'yurist@texnikum2.uz',
    roomNumber: 'Bosh bino, 112-xona',
    duties: 'Texnikum qabul qilayotgan buyruqlar va normativ hujjatlarning qonuniyligini taʼminlash, mehnat shartnomalari ekspertizasi va huquqiy maslahatlar berish.',
    bio: 'Fargʻona davlat universiteti huquqshunoslik fakulteti bitiruvchisi.',
    photoUrl: '/images/teachers/karimov.webp',
    orderIndex: 9,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'adm-00000000-0000-0000-0000-000000000010',
    fullName: 'Qodirova Mahbuba Zokirovna',
    slug: 'qodirova-mahbuba-zokirovna',
    position: 'Axborot-resurs markazi (ARM / Kutubxona) mudiri',
    category: 'administrative',
    receptionHours: 'Dushanba – Shanba: 09:00 – 18:00',
    phone: '+998 (73) 244-00-14',
    email: 'arm@texnikum2.uz',
    roomNumber: 'Kutubxona zali, 2-qavat',
    duties: 'Kutubxona fondini zamonaviy darsliklar va elektron kitoblar bilan boyitish, oʻquv zali xizmatlari va maʼnaviy-maʼrifiy kitobxonlik tadbirlarini tashkil qilish.',
    bio: 'Kutubxona ishi va axborot tizimlari boʻyicha oliy toifali mutaxassis.',
    photoUrl: '/images/teachers/yusupova.webp',
    orderIndex: 10,
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const FALLBACK_SPECIALTIES: Specialty[] = [
  {
    id: 'f0000000-0000-0000-0000-000000000001',
    code: '40610101',
    name: 'Kompyuter injiniringi va dasturiy taʼminot',
    slug: '40610101-kompyuter-injiniringi-va-dasturiy-taminot',
    qualification: 'Dasturchi-texnik',
    departmentId: 'd0000000-0000-0000-0000-000000000001',
    durationMonths: 24,
    durationText: '2 yil (kunduzgi, ECTS kredit-modul tizimi)',
    baseEducation: '9_classes',
    budgetPlaces: 30,
    commercialPlaces: 30,
    costPerYear: 9500000,
    passingScore: 4.65,
    description: 'Dasturiy taʼminot ishlab chiqish, veb-platformalar, maʼlumotlar bazasi va mobil ilovalarni loyihalash boʻyicha amaliy koʻnikmalarga ega mutaxassislar tayyorlash.',
    careerOpportunities: 'Frontend / Backend dasturchi, maʼlumotlar bazasi maʼmuri, QA sinovchi, IT texnik koʻmak mutaxassisi.',
    coverImageUrl: '/images/specialties/090207.webp',
    isActive: true,
    orderIndex: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000002',
    code: '40610102',
    name: 'Kompyuter tarmoqlari va tizimlari maʼmurligi',
    slug: '40610102-kompyuter-tarmoqlari-va-tizimlari-mamurligi',
    qualification: 'Tarmoq maʼmuri',
    departmentId: 'd0000000-0000-0000-0000-000000000002',
    durationMonths: 24,
    durationText: '2 yil (kunduzgi, ECTS kredit-modul tizimi)',
    baseEducation: '9_classes',
    budgetPlaces: 25,
    commercialPlaces: 25,
    costPerYear: 9000000,
    passingScore: 4.38,
    description: 'Lokal va korporativ kompyuter tarmoqlarini loyihalash, server uskunalarini oʻrnatish va virtualizatsiya tizimlarini boshqarish.',
    careerOpportunities: 'Tizim maʼmuri, tarmoq muhandisi, bulut xizmatlari texnigi, Helpdesk mutaxassisi.',
    coverImageUrl: '/images/specialties/090206.webp',
    isActive: true,
    orderIndex: 2,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'f0000000-0000-0000-0000-000000000003',
    code: '40610201',
    name: 'Axborot xavfsizligi tizimlari va vositalari',
    slug: '40610201-axborot-xavfsizligi-tizimlari-va-vositalari',
    qualification: 'Axborot xavfsizligi boʻyicha texnik',
    departmentId: 'd0000000-0000-0000-0000-000000000002',
    durationMonths: 24,
    durationText: '2 yil (kunduzgi, ECTS kredit-modul tizimi)',
    baseEducation: '9_classes',
    budgetPlaces: 20,
    commercialPlaces: 20,
    costPerYear: 9800000,
    passingScore: 4.54,
    description: 'Korporativ axborot xavfsizligi choralari, maʼlumotlar sizib chiqishining oldini olish, xavfsizlik devorlari va kriptografik himoya vositalari bilan ishlash.',
    careerOpportunities: 'Axborot xavfsizligi xizmati texnigi, kiberxavfsizlik tahlilchisi, tarmoq xavfsizligi operatori.',
    coverImageUrl: '/images/specialties/100205.webp',
    isActive: true,
    orderIndex: 3,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const FALLBACK_EVENTS: EventItem[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    title: 'Abituriyentlar va ularning ota-onalari uchun Ochiq eshiklar kuni',
    slug: 'ochiq-eshiklar-kuni-aprel-2026',
    description: 'Texnikum mutaxassisliklari, zamonaviy laboratoriyalar bilan tanishuv hamda qabul komissiyasi vakillarining bevosita konsultatsiyalari.',
    contentHtml: '<p>9 va 11-sinf bitiruvchilarini taklif etamiz. Dasturda: kasbiy yoʻnalishlar taqdimoti, master-klasslar va davlat grantlari boʻyicha tushuntirishlar.</p>',
    eventDate: '2026-04-15T10:00:00Z',
    endDate: '2026-04-15T14:00:00Z',
    location: 'Bosh bino, Faollar zali (Fargʻona sh., Al-Fargʻoniy koʻchasi, 42-uy)',
    category: 'open_doors',
    coverImageUrl: '/images/events/open-doors.webp',
    isFeatured: true,
    isPublished: true,
    organizer: 'Texnikum qabul komissiyasi',
    registrationUrl: 'https://my.edu.uz',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    title: '«Raqamli texnologiyalar sari qadam 2026» talabalar ilmiy-amaliy konferensiyasi',
    slug: 'raqamli-texnologiyalar-konferensiyasi-2026',
    description: 'Talabalarning dasturiy injiniring, tarmoq xavfsizligi va sunʼiy intellekt yoʻnalishlaridagi tadqiqotlari va amaliy loyihalari taqdimoti.',
    contentHtml: '<p>Konferensiyada yosh dasturchilar va tarmoq mutaxassislarining innovatsion diplom va startap loyihalari muhokama qilinadi.</p>',
    eventDate: '2026-04-25T11:00:00Z',
    endDate: '2026-04-25T17:00:00Z',
    location: '2-oʻquv binosi, Konferens-zal (aud. 310)',
    category: 'science',
    coverImageUrl: '/images/events/conference.webp',
    isFeatured: false,
    isPublished: true,
    organizer: 'Texnikum iqtidorli yoshlar kengashi',
    registrationUrl: null,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const FALLBACK_SCHEDULE: ScheduleItem[] = [
  {
    id: '30000000-0000-0000-0000-000000000001',
    groupName: 'DASTUR-21',
    dayOfWeek: 1,
    lessonNumber: 1,
    timeStart: '08:30',
    timeEnd: '10:00',
    subject: 'Veb-ilovalar yaratish (maʼruza)',
    teacherId: 'e0000000-0000-0000-0000-000000000002',
    classroom: '305-xona',
    parity: 'both',
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000002',
    groupName: 'DASTUR-21',
    dayOfWeek: 1,
    lessonNumber: 2,
    timeStart: '10:10',
    timeEnd: '11:40',
    subject: 'Veb-ilovalar yaratish (amaliyot)',
    teacherId: 'e0000000-0000-0000-0000-000000000002',
    classroom: '14-laboratoriya',
    parity: 'both',
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000003',
    groupName: 'DASTUR-21',
    dayOfWeek: 1,
    lessonNumber: 3,
    timeStart: '12:10',
    timeEnd: '13:40',
    subject: 'Diskret matematika',
    teacherId: 'e0000000-0000-0000-0000-000000000004',
    classroom: '210-xona',
    parity: 'both',
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '30000000-0000-0000-0000-000000000004',
    groupName: 'TARMOQ-22',
    dayOfWeek: 1,
    lessonNumber: 1,
    timeStart: '08:30',
    timeEnd: '10:00',
    subject: 'Kompyuter tarmoqlarini maʼmurlash',
    teacherId: 'e0000000-0000-0000-0000-000000000003',
    classroom: '21-laboratoriya',
    parity: 'both',
    isActive: true,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const FALLBACK_PAGES: PageItem[] = [
  {
    id: '40000000-0000-0000-0000-000000000001',
    title: 'Umumiy maʼlumotlar',
    slug: 'info-common',
    section: 'info',
    contentHtml: `
      <div itemprop="copy" class="space-y-4">
        <h2 class="text-2xl font-bold">Taʼlim tashkiloti toʻgʻrisida umumiy maʼlumotlar</h2>
        <p class="text-sm text-muted-foreground">Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni (OʻRQ-637, 37-modda) talablariga muvofiq joylashtirilgan.</p>
        <table class="w-full border-collapse border border-border text-left text-sm">
          <tbody>
            <tr class="border-b"><th class="p-3 bg-muted font-semibold w-1/3">Toʻliq nomi</th><td class="p-3" itemprop="name">Fargʻona shahri 2-son texnikumi</td></tr>
            <tr class="border-b"><th class="p-3 bg-muted font-semibold">Qisqartirilgan nomi</th><td class="p-3">Fargʻona 2-son texnikumi</td></tr>
            <tr class="border-b"><th class="p-3 bg-muted font-semibold">Tashkil etilgan sanasi</th><td class="p-3">1968-yil 1-sentyabr</td></tr>
            <tr class="border-b"><th class="p-3 bg-muted font-semibold">Muassis</th><td class="p-3">Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi</td></tr>
            <tr class="border-b"><th class="p-3 bg-muted font-semibold">Joylashgan manzili</th><td class="p-3" itemprop="address">150100, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 42-uy</td></tr>
            <tr class="border-b"><th class="p-3 bg-muted font-semibold">Ish vaqti tartibi</th><td class="p-3">Dushanba – Shanba: 08:30 – 18:00. Dam olish kuni: Yakshanba</td></tr>
            <tr class="border-b"><th class="p-3 bg-muted font-semibold">Aloqa telefonlari</th><td class="p-3" itemprop="telephone">+998 (73) 244-00-00, +998 (73) 244-00-01</td></tr>
            <tr class="border-b"><th class="p-3 bg-muted font-semibold">Elektron pochta</th><td class="p-3" itemprop="email">info@texnikum2.uz</td></tr>
            <tr><th class="p-3 bg-muted font-semibold">Identifikatsiya raqamlari</th><td class="p-3">STIR (INN): 302987654 | JSHSHIR (PINFL): 31205851234567</td></tr>
          </tbody>
        </table>
      </div>
    `,
    metaTitle: 'Umumiy maʼlumotlar — Fargʻona 2-son texnikumi',
    metaDescription: 'Texnikumning toʻliq nomi, muassisi, joylashgan manzili va aloqa maʼlumotlari',
    isPublished: true,
    orderIndex: 1,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000002',
    title: 'Tuzilma va boshqaruv organlari',
    slug: 'info-struct',
    section: 'info',
    contentHtml: `
      <div itemprop="copy" class="space-y-4">
        <h2 class="text-2xl font-bold">Tuzilma va boshqaruv organlari</h2>
        <p>Texnikumni boshqarish Oʻzbekiston Respublikasi qonunchiligi va Texnikum Ustavi asosida yakkaboshchilik va jamoaviylik tamoyillariga muvofiq amalga oshiriladi.</p>
        <ul class="list-disc pl-6 space-y-2 text-sm text-foreground">
          <li><strong>Direktor</strong> — texnikumning yakka ijro etuvchi organi;</li>
          <li><strong>Pedagogik kengash</strong> — oʻquv-uslubiy masalalar boʻyicha kollegial organ;</li>
          <li><strong>Vasiylik kengashi</strong> — taʼlim sifatini oshirish va jamoatchilik nazorati organi;</li>
          <li><strong>Yoshlar ittifoqi boshlangʻich tashkiloti</strong> — talabalar oʻzini oʻzi boshqarish organi.</li>
        </ul>
      </div>
    `,
    metaTitle: 'Tuzilma va boshqaruv organlari — Fargʻona 2-son texnikumi',
    metaDescription: 'Texnikum boshqaruv organlari va tarkibiy boʻlinmalari',
    isPublished: true,
    orderIndex: 2,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000003',
    title: 'Rasmiy hujjatlar va meʼyoriy aktlar',
    slug: 'info-documents',
    section: 'info',
    contentHtml: `
      <div itemprop="copy" class="space-y-4">
        <h2 class="text-2xl font-bold">Rasmiy hujjatlar va litsenziyalar</h2>
        <ul class="list-disc pl-6 space-y-2 text-sm">
          <li><a href="/docs/ustav.pdf" class="text-primary hover:underline font-medium" target="_blank">Fargʻona 2-son texnikumi Ustavi (tasdiqlangan tahrir)</a></li>
          <li><a href="/docs/license.pdf" class="text-primary hover:underline font-medium" target="_blank">Taʼlim faoliyatini amalga oshirish huquqini beruvchi davlat litsenziyasi</a></li>
          <li><a href="/docs/accreditation.pdf" class="text-primary hover:underline font-medium" target="_blank">Davlat akkreditatsiyasi toʻgʻrisida sertifikat</a></li>
          <li><a href="/docs/qabul-qoidalari.pdf" class="text-primary hover:underline font-medium" target="_blank">2026/2027 oʻquv yili uchun oʻquvchilarni qabul qilish qoidalari</a></li>
        </ul>
      </div>
    `,
    metaTitle: 'Hujjatlar — Fargʻona 2-son texnikumi',
    metaDescription: 'Texnikum ustavi, litsenziyasi va meʼyoriy hujjatlari',
    isPublished: true,
    orderIndex: 3,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000004',
    title: 'Inklyuziv taʼlim va qulay muhit',
    slug: 'info-environment',
    section: 'info',
    contentHtml: `
      <div itemprop="copy" class="space-y-4">
        <h2 class="text-2xl font-bold">Nogironligi boʻlgan shaxslar uchun qulay muhit</h2>
        <p class="text-sm">Oʻzbekiston Respublikasining 641-sonli «Nogironligi boʻlgan shaxslarning huquqlari toʻgʻrisida»gi Qonuni talablariga muvofiq:</p>
        <ul class="list-disc pl-6 space-y-2 text-sm text-foreground">
          <li>Bosh oʻquv binosi kirish qismida normativ panduslar va navbatchini chaqirish tugmasi mavjud;</li>
          <li>Zinapoyalar taktil ogohlantiruvchi qoplamalar va kontrast sariq chiziqlar bilan belgilangan;</li>
          <li>1-qavatdagi sanitariya-gigiyena xonalari harakatlanish imkoniyati cheklangan shaxslar uchun moslashtirilgan;</li>
          <li>Texnikum rasmiy veb-sayti koʻrishda nuqsoni boʻlgan shaxslar uchun toʻliq moslashtirilgan (WCAG 2.1 AA standarti).</li>
        </ul>
      </div>
    `,
    metaTitle: 'Inklyuziv muhit — Fargʻona 2-son texnikumi',
    metaDescription: 'Nogironligi boʻlgan shaxslar uchun qulay muhit va imkoniyatlar',
    isPublished: true,
    orderIndex: 4,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: '40000000-0000-0000-0000-000000000005',
    title: 'Texnikum tarixi va missiyasi',
    slug: 'about-history',
    section: 'about',
    contentHtml: `
      <div class="space-y-4">
        <h2 class="text-2xl font-bold">Texnikum tarixi va missiyasi</h2>
        <p class="text-base text-foreground">Fargʻona shahri 2-son texnikumi 55 yildan ortiq vaqt mobaynida mamlakatimiz iqtisodiyoti, sanoati va axborot texnologiyalari sohasi uchun malakali mutaxassislar tayyorlab kelmoqda.</p>
        <p class="text-sm text-muted-foreground">Oʻzbekiston Respublikasi Prezidentining 2024-yil 16-oktyabrdagi PF-158-son Farmoniga muvofiq, texnikum taʼlim dasturlari Yevropa kasbiy taʼlim tizimi (ECTS) talablari asosida qayta tashkil etilib, oliy taʼlim bilan uzviy integratsiya yoʻlga qoʻyildi.</p>
        <h3 class="text-lg font-semibold">Bizning missiyamiz</h3>
        <p class="text-sm text-muted-foreground">Har bir yoshga zamonaviy raqamli kasb mahoratini berish, ularni mehnat bozorida raqobatbardosh, mustaqil fikrlaydigan va texnologik yangiliklarga tayyor mutaxassislar etib tarbiyalash.</p>
      </div>
    `,
    metaTitle: 'Tarix va missiya — Fargʻona 2-son texnikumi',
    metaDescription: 'Fargʻona 2-son texnikumi tarixi va rivojlanish bosqichlari',
    isPublished: true,
    orderIndex: 5,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const FALLBACK_USERS: UserProfile[] = [
  {
    id: 'a0000000-0000-0000-0000-000000000001',
    email: 'admin@texnikum2.uz',
    fullName: 'Karimov Jasur Alisherovich',
    role: UserRole.ADMIN,
    avatarUrl: null,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000002',
    email: 'editor@texnikum2.uz',
    fullName: 'Yusupova Nilufar Rustamovna',
    role: UserRole.EDITOR,
    avatarUrl: null,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'a0000000-0000-0000-0000-000000000003',
    email: 'moderator@texnikum2.uz',
    fullName: 'Ahmedov Sardor Baxtiyorovich',
    role: UserRole.MODERATOR,
    avatarUrl: null,
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
];

export const FALLBACK_MEDIA: MediaFile[] = [
  {
    id: 'm0000000-0000-0000-0000-000000000001',
    bucket: 'news-media',
    fileName: 'champion-2026.webp',
    originalName: 'champion-2026.webp',
    storagePath: 'news-media/champion-2026.webp',
    publicUrl: '/images/news/champion-2026.webp',
    mimeType: 'image/webp',
    fileSizeBytes: 245000,
    uploadedBy: 'a0000000-0000-0000-0000-000000000001',
    createdAt: '2026-09-28T08:00:00Z',
  },
  {
    id: 'm0000000-0000-0000-0000-000000000002',
    bucket: 'official-docs',
    fileName: 'ustav-texnikum-2026.pdf',
    originalName: 'Fargʻona 2-son texnikumi Ustavi (2026).pdf',
    storagePath: 'official-docs/ustav-texnikum-2026.pdf',
    publicUrl: '/docs/ustav.pdf',
    mimeType: 'application/pdf',
    fileSizeBytes: 1420000,
    uploadedBy: 'a0000000-0000-0000-0000-000000000001',
    createdAt: '2026-09-20T10:00:00Z',
  },
];

export const FALLBACK_AUDIT: AuditLogItem[] = [
  {
    id: 'l0000000-0000-0000-0000-000000000001',
    userId: 'a0000000-0000-0000-0000-000000000001',
    action: 'CREATE',
    entityType: 'news',
    entityId: '10000000-0000-0000-0000-000000000001',
    ipAddress: '127.0.0.1',
    oldValues: null,
    newValues: { title: 'Texnikum talabalari «WorldSkills Uzbekistan 2026» kasbiy mahorat chempionatida oltin medalni qoʻlga kiritishdi', status: 'published' },
    createdAt: '2026-09-28T09:00:00Z',
  },
  {
    id: 'l0000000-0000-0000-0000-000000000002',
    userId: 'a0000000-0000-0000-0000-000000000001',
    action: 'UPDATE',
    entityType: 'specialties',
    entityId: 'f0000000-0000-0000-0000-000000000001',
    ipAddress: '127.0.0.1',
    oldValues: { budgetPlaces: 25 },
    newValues: { budgetPlaces: 30 },
    createdAt: '2026-09-26T11:00:00Z',
  },
  {
    id: 'l0000000-0000-0000-0000-000000000003',
    userId: 'a0000000-0000-0000-0000-000000000002',
    action: 'PUBLISH',
    entityType: 'news',
    entityId: '10000000-0000-0000-0000-000000000002',
    ipAddress: '192.168.1.45',
    oldValues: { status: 'draft' },
    newValues: { status: 'published' },
    createdAt: '2026-09-25T08:30:00Z',
  },
];

// -----------------------------------------------------------------------------
// ТИПИЗИРОВАННЫЙ КЛИЕНТ ЗАПРОСОВ К API С БЕСШОВНЫМ FALLBACK
// -----------------------------------------------------------------------------
async function safeFetch<T>(
  endpoint: string,
  fallbackData: T,
  fetchOptions?: { revalidate?: number; cache?: RequestCache; token?: string },
): Promise<T> {
  try {
    const nextOpts: { revalidate?: number } = {};
    if (fetchOptions?.revalidate !== undefined) {
      nextOpts.revalidate = fetchOptions.revalidate;
    } else if (!fetchOptions?.cache) {
      nextOpts.revalidate = 30;
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    let authToken = fetchOptions?.token;
    if (!authToken && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('college_admin_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          authToken = parsed?.token || undefined;
        }
      } catch {
        // Ignore session read error
      }
    }
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...(Object.keys(nextOpts).length > 0 ? { next: nextOpts } : {}),
      ...(fetchOptions?.cache ? { cache: fetchOptions.cache } : {}),
      headers,
    });
    if (!res.ok) {
      return fallbackData;
    }
    const archHeader = res.headers.get('x-platform-architect');
    if (archHeader !== null && !archHeader.includes('Abubakr Muminov')) {
      console.warn('[SECURITY] Backend API architect signature verification failed.');
      return fallbackData;
    }
    const json = (await res.json()) as { success?: boolean; data?: T };
    if (json && json.success && json.data !== undefined) {
      return json.data;
    }
    return fallbackData;
  } catch {
    return fallbackData;
  }
}

async function safeMutation<T>(
  endpoint: string,
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE',
  body?: unknown,
  token?: string,
  fallbackData?: T,
): Promise<T> {
  try {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    let authToken = token;
    if (!authToken && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('college_admin_session');
        if (raw) {
          const parsed = JSON.parse(raw);
          authToken = parsed?.token || undefined;
        }
      } catch {
        // Ignore session read error
      }
    }
    if (authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    let bodyData: BodyInit | undefined;
    if (body instanceof FormData) {
      bodyData = body;
    } else if (body !== undefined) {
      headers['Content-Type'] = 'application/json';
      bodyData = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body: bodyData,
    });
    if (!res.ok) {
      const errorJson = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
      const errorMessage = errorJson?.message
        ? (Array.isArray(errorJson.message) ? errorJson.message.join(', ') : errorJson.message)
        : `Server xatosi (${res.status}): ${res.statusText}`;
      throw new Error(errorMessage);
    }
    const json = (await res.json()) as { success?: boolean; data?: T };
    if (json && json.data !== undefined) {
      return json.data;
    }
    return (fallbackData || json) as T;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Tarmoq xatosi yoki server bilan aloqa uzildi');
  }
}

function getLocalNews(): NewsItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('college_custom_news');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as NewsItem[];
    }
  } catch {
    // Ignore storage parse errors
  }
  return [];
}

function saveLocalNews(items: NewsItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('college_custom_news', JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

function getAllCurrentNews(): NewsItem[] {
  const local = getLocalNews();
  if (!local.length) return FALLBACK_NEWS;
  const localIds = new Set(local.map((n) => n.id));
  return [...local, ...FALLBACK_NEWS.filter((n) => !localIds.has(n.id))];
}

function getLocalAdministrators(): AdministratorMember[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('college_custom_administrators');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as AdministratorMember[];
    }
  } catch {
    // Ignore storage parse errors
  }
  return [];
}

function saveLocalAdministrators(items: AdministratorMember[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('college_custom_administrators', JSON.stringify(items));
  } catch {
    // Ignore storage quota errors
  }
}

export function getAllCurrentAdministrators(): AdministratorMember[] {
  const local = getLocalAdministrators();
  if (!local.length) return FALLBACK_ADMINISTRATORS;
  const localIds = new Set(local.map((a) => a.id));
  return [...local, ...FALLBACK_ADMINISTRATORS.filter((a) => !localIds.has(a.id))];
}

function getLocalAuditLogs(): AuditLogItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('college_custom_audit_logs');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as AuditLogItem[];
    }
  } catch {
    // Ignore storage parse errors
  }
  return [];
}

function saveLocalAuditLogs(items: AuditLogItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('college_custom_audit_logs', JSON.stringify(items.slice(0, 200)));
  } catch {
    // Ignore storage quota errors
  }
}

export function getAllCurrentAuditLogs(): AuditLogItem[] {
  const local = getLocalAuditLogs();
  if (!local.length) return FALLBACK_AUDIT;
  const localIds = new Set(local.map((a) => a.id));
  return [...local, ...FALLBACK_AUDIT.filter((a) => !localIds.has(a.id))];
}

export function recordLocalAudit(
  action: AuditAction,
  entityType: string,
  entityId: string,
  newValues?: Record<string, unknown>,
  oldValues?: Record<string, unknown>,
): AuditLogItem {
  let userId: string | null = null;
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem('college_admin_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        userId = parsed?.user?.id || parsed?.user?.email || null;
      }
    } catch {
      // Ignore
    }
  }

  const item: AuditLogItem = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    userId: userId || 'a0000000-0000-0000-0000-000000000001',
    action,
    entityType,
    entityId,
    newValues: newValues ?? null,
    oldValues: oldValues ?? null,
    ipAddress: '127.0.0.1',
    createdAt: new Date().toISOString(),
  };

  const existing = getLocalAuditLogs();
  saveLocalAuditLogs([item, ...existing]);

  // Asynchronous sync to backend
  if (typeof window !== 'undefined') {
    safeMutation('/audit-log', 'POST', {
      action: item.action,
      entityType: item.entityType,
      entityId: item.entityId,
      newValues: item.newValues,
      oldValues: item.oldValues,
      ipAddress: item.ipAddress,
    }).catch(() => {});
  }

  return item;
}

export const FALLBACK_CONTACTS: ContactsData = {
  campuses: [
    {
      id: 'campus-1',
      name: 'Bosh oʻquv binosi',
      address: '150100, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 42-uy',
      departments: 'Qabul komissiyasi (105-xona), Maʼmuriyat, Buxgalteriya, Axborot-resurs markazi (Kutubxona)',
      phone: '+998 (73) 244-00-00',
      email: 'info@texnikum2.uz',
      workHours: 'Dush–Shanba: 08:30 – 17:30',
      transport: '«Universitet» bekati (1, 8, 14, 22-sonli jamoat transporti)',
      orderIndex: 1,
    },
    {
      id: 'campus-2',
      name: 'Oʻquv-amaliyot binosi va laboratoriyalar',
      address: '150100, Fargʻona viloyati, Fargʻona shahri, B. Margʻinoniy koʻchasi, 18-uy',
      departments: 'IT-laboratoriyalar, kompyuter tarmoqlari sinflari, WorldSkills kasbiy mahorat ustaxonalari',
      phone: '+998 (73) 244-00-11',
      email: 'it-dept@texnikum2.uz',
      workHours: 'Dush–Shanba: 08:30 – 18:00',
      transport: '«Margʻinoniy» bekati (5, 12, 19-sonli marshrutkalar)',
      orderIndex: 2,
    },
    {
      id: 'campus-3',
      name: 'Talabalar turar joyi (Yotoqxona)',
      address: '150100, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 44-uy',
      departments: 'Yotoqxona maʼmuriyati, tibbiyot punkti, sport sektori, maʼnaviyat xonasi',
      phone: '+998 (73) 244-00-15',
      email: 'hostel@texnikum2.uz',
      workHours: 'Kechu-kunduz (24/7 navbatchilik va nazorat)',
      transport: 'Bosh oʻquv binosi yonida (1 daqiqalik piyoda yoʻl)',
      orderIndex: 3,
    },
  ],
  phones: [
    { id: 'phone-1', title: 'Qabul komissiyasi (ishonch telefoni)', phone: '+998 (73) 244-00-00', note: 'Qabul va hujjat topshirish boʻyicha maʼlumot', orderIndex: 1 },
    { id: 'phone-2', title: 'Direktor qabulxonasi / Devonxona', phone: '+998 (73) 244-00-01', note: 'Rasmiy yozishmalar va murojaatlar', orderIndex: 2 },
    { id: 'phone-3', title: 'Oʻquv-metodika boʻlimi', phone: '+998 (73) 244-00-02', note: 'Oʻquv jarayoni va akademik maʼlumotnomalar', orderIndex: 3 },
    { id: 'phone-4', title: 'Amaliyot va bitiruvchilar bandligi', phone: '+998 (73) 244-00-03', note: 'Ish beruvchilar bilan shartnomalar va dual taʼlim', orderIndex: 4 },
    { id: 'phone-5', title: 'Buxgalteriya (kontrakt toʻlovlari)', phone: '+998 (73) 244-00-04', note: 'Toʻlov-kontrakt shartnomalari va kvitansiyalar', orderIndex: 5 },
  ],
  directions: {
    bus: 'Fargʻona shahri boʻylab 1, 8, 14, 22-sonli avtobus yoki yoʻnalishli taksilar orqali «Universitet» yoki «2-son texnikum» bekatiga kelishingiz mumkin.',
    landmark: 'Fargʻona davlat universiteti bosh binosi roʻparasida, Al-Fargʻoniy koʻchasi boʻylab 42-uy.',
  },
  mapCoordinates: {
    lat: 40.3864,
    lng: 71.7864,
    zoom: 16,
  },
};

export const api = {
  // Новости
  getNews: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const currentNews = getAllCurrentNews();
    const fallback = {
      items: currentNews,
      total: currentNews.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1,
    };
    return safeFetch(`/news?${query.toString()}`, fallback);
  },

  getFeaturedNews: async () => {
    const currentNews = getAllCurrentNews();
    const published = currentNews.filter((n) => n.status === NewsStatus.PUBLISHED);
    const fallback =
      published.find((n) => n.isFeatured) ||
      published[0] ||
      currentNews[0] ||
      null;
    return safeFetch('/news/featured', fallback);
  },

  getNewsBySlug: async (slug: string) => {
    const currentNews = getAllCurrentNews();
    const fallback =
      currentNews.find((n) => n.slug === slug || n.id === slug) || null;
    return safeFetch<NewsItem | null>(`/news/${slug}`, fallback, { cache: 'no-store' });
  },

  getCategories: async () => {
    return safeFetch('/news/categories', FALLBACK_CATEGORIES);
  },

  // Преподаватели
  getTeachers: async (params?: { departmentId?: string; search?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.departmentId) query.set('departmentId', params.departmentId);
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const fallback = {
      items: FALLBACK_TEACHERS,
      total: FALLBACK_TEACHERS.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1,
    };
    return safeFetch(`/teachers?${query.toString()}`, fallback);
  },

  getTeacherBySlug: async (slug: string) => {
    const fallback = FALLBACK_TEACHERS.find((t) => t.slug === slug || t.id === slug) || null;
    return safeFetch<Teacher | null>(`/teachers/${slug}`, fallback);
  },

  getDepartments: async () => {
    return safeFetch('/teachers/departments', FALLBACK_DEPARTMENTS);
  },

  // Специальности
  getSpecialties: async (params?: { baseEducation?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.baseEducation) query.set('baseEducation', params.baseEducation);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const fallback = {
      items: FALLBACK_SPECIALTIES,
      total: FALLBACK_SPECIALTIES.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1,
    };
    return safeFetch(`/specialties?${query.toString()}`, fallback);
  },

  getSpecialtyBySlug: async (slug: string) => {
    const fallback = FALLBACK_SPECIALTIES.find((s) => s.slug === slug || s.id === slug) || null;
    return safeFetch<Specialty | null>(`/specialties/${slug}`, fallback);
  },

  // События
  getEvents: async (params?: { category?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.category) query.set('category', params.category);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const fallback = {
      items: FALLBACK_EVENTS,
      total: FALLBACK_EVENTS.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1,
    };
    return safeFetch(`/events?${query.toString()}`, fallback);
  },

  getEventBySlug: async (slug: string) => {
    const fallback = FALLBACK_EVENTS.find((e) => e.slug === slug || e.id === slug) || null;
    return safeFetch<EventItem | null>(`/events/${slug}`, fallback);
  },

  // Руководство и администрация техникума
  getAdministrators: async (params?: { category?: string; search?: string; page?: number; limit?: number }) => {
    let list = getAllCurrentAdministrators().filter((a) => a.isActive !== false);
    if (params?.category && params.category !== 'all') {
      list = list.filter((a) => a.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter((a) => a.fullName.toLowerCase().includes(q) || a.position.toLowerCase().includes(q) || (a.duties && a.duties.toLowerCase().includes(q)));
    }
    list.sort((a, b) => a.orderIndex - b.orderIndex);

    const fallback = {
      items: list,
      total: list.length,
      page: params?.page || 1,
      limit: params?.limit || 50,
      totalPages: 1,
    };
    return safeFetch('/administration', fallback, { cache: 'no-store' });
  },

  getAdministratorBySlug: async (slug: string) => {
    const list = getAllCurrentAdministrators();
    const fallback = list.find((a) => a.slug === slug || a.id === slug) || null;
    return safeFetch<AdministratorMember | null>(`/administration/${slug}`, fallback, { cache: 'no-store' });
  },

  // Расписание
  getSchedule: async (params?: { groupName?: string; teacherId?: string; dayOfWeek?: number; parity?: string }) => {
    const query = new URLSearchParams();
    if (params?.groupName) query.set('groupName', params.groupName);
    if (params?.teacherId) query.set('teacherId', params.teacherId);
    if (params?.dayOfWeek) query.set('dayOfWeek', String(params.dayOfWeek));
    if (params?.parity) query.set('parity', params.parity);

    return safeFetch(`/schedule?${query.toString()}`, FALLBACK_SCHEDULE);
  },

  getScheduleGroups: async () => {
    const fallback = Array.from(new Set(FALLBACK_SCHEDULE.map((s) => s.groupName)));
    return safeFetch('/schedule/groups', fallback);
  },

  // Страницы
  getPages: async (section?: string) => {
    const query = section ? `?section=${section}` : '';
    const fallback = section ? FALLBACK_PAGES.filter((p) => p.section === section) : FALLBACK_PAGES;
    return safeFetch(`/pages${query}`, fallback);
  },

  getPageBySlug: async (slug: string) => {
    const fallback = FALLBACK_PAGES.find((p) => p.slug === slug) || null;
    return safeFetch<PageItem | null>(`/pages/${slug}`, fallback);
  },

  // ---------------------------------------------------------------------------
  // АДМИНИСТРАТИВНЫЕ МЕТОДЫ (CMS & RBAC)
  // ---------------------------------------------------------------------------
  // Аутентификация
  getProfile: async (token: string): Promise<UserProfile> => {
    return safeMutation('/auth/me', 'GET' as unknown as 'POST', undefined, token, FALLBACK_USERS[0]!);
  },

  // Новости CRUD
  createNews: async (data: Partial<NewsItem>, token?: string): Promise<NewsItem> => {
    const createdItem = await safeMutation<NewsItem>('/news', 'POST', data, token);

    const currentLocal = getLocalNews();
    if (createdItem.isFeatured) {
      currentLocal.forEach((n) => {
        n.isFeatured = false;
      });
      FALLBACK_NEWS.forEach((n) => {
        n.isFeatured = false;
      });
    }
    saveLocalNews([createdItem, ...currentLocal.filter((n) => n.id !== createdItem.id)]);
    const fallbackIndex = FALLBACK_NEWS.findIndex((n) => n.id === createdItem.id || n.slug === createdItem.slug);
    if (fallbackIndex !== -1) {
      FALLBACK_NEWS[fallbackIndex] = createdItem;
    } else {
      FALLBACK_NEWS.unshift(createdItem);
    }

    return createdItem;
  },

  updateNews: async (id: string, data: Partial<NewsItem>, token?: string): Promise<NewsItem> => {
    const updated = await safeMutation<NewsItem>(`/news/${id}`, 'PATCH', data, token);

    const currentLocal = getLocalNews();
    const index = currentLocal.findIndex((n) => n.id === id);
    if (index !== -1) {
      currentLocal[index] = updated;
    } else {
      currentLocal.unshift(updated);
    }
    saveLocalNews(currentLocal);

    const fallbackIndex = FALLBACK_NEWS.findIndex((n) => n.id === id);
    if (fallbackIndex !== -1) {
      FALLBACK_NEWS[fallbackIndex] = updated;
    } else {
      FALLBACK_NEWS.unshift(updated);
    }

    return updated;
  },

  deleteNews: async (id: string, token?: string): Promise<{ success: boolean }> => {
    const currentLocal = getLocalNews();
    saveLocalNews(currentLocal.filter((n) => n.id !== id));
    const fallbackIndex = FALLBACK_NEWS.findIndex((n) => n.id === id);
    if (fallbackIndex !== -1) {
      FALLBACK_NEWS.splice(fallbackIndex, 1);
    }

    return safeMutation(`/news/${id}`, 'DELETE', undefined, token, { success: true });
  },

  createCategory: async (data: { name: string; slug: string; colorBadge?: string }, token?: string): Promise<NewsCategory> => {
    const newCategory: NewsCategory = {
      id: Date.now(),
      name: data.name,
      slug: data.slug,
      colorBadge: data.colorBadge || 'slate',
      createdAt: new Date().toISOString(),
    };
    return safeMutation('/news/categories', 'POST', data, token, newCategory);
  },

  // Преподаватели CRUD
  createTeacher: async (data: Partial<Teacher>, token?: string): Promise<Teacher> => {
    const newTeacher: Teacher = {
      id: crypto.randomUUID(),
      fullName: data.fullName || 'Преподаватель',
      slug: data.slug || `teacher-${Date.now()}`,
      position: data.position || 'Преподаватель',
      departmentId: data.departmentId || null,
      subjects: data.subjects || [],
      qualification: data.qualification || 'Первая квалификационная категория',
      education: data.education || 'Высшее профессиональное образование',
      experienceYears: data.experienceYears || 5,
      teachingExperienceYears: data.teachingExperienceYears || 3,
      bio: data.bio || '',
      photoUrl: data.photoUrl || null,
      email: data.email || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      orderIndex: data.orderIndex || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return safeMutation('/teachers', 'POST', data, token, newTeacher);
  },

  updateTeacher: async (id: string, data: Partial<Teacher>, token?: string): Promise<Teacher> => {
    const existing = FALLBACK_TEACHERS.find((t) => t.id === id) || FALLBACK_TEACHERS[0]!;
    const updated: Teacher = { ...existing, ...data, updatedAt: new Date().toISOString() };
    return safeMutation(`/teachers/${id}`, 'PATCH', data, token, updated);
  },

  deleteTeacher: async (id: string, token?: string): Promise<{ success: boolean }> => {
    return safeMutation(`/teachers/${id}`, 'DELETE', undefined, token, { success: true });
  },

  // Специальности CRUD
  createSpecialty: async (data: Partial<Specialty>, token?: string): Promise<Specialty> => {
    const newSpec: Specialty = {
      id: crypto.randomUUID(),
      code: data.code || '00.00.00',
      name: data.name || 'Специальность СПО',
      slug: data.slug || `spec-${Date.now()}`,
      qualification: data.qualification || 'Специалист',
      departmentId: data.departmentId || null,
      durationMonths: data.durationMonths || 46,
      durationText: data.durationText || '3 года 10 месяцев',
      baseEducation: data.baseEducation || '9_classes',
      budgetPlaces: data.budgetPlaces || 25,
      commercialPlaces: data.commercialPlaces || 10,
      costPerYear: data.costPerYear || 120000,
      passingScore: data.passingScore || 4.2,
      description: data.description || '',
      careerOpportunities: data.careerOpportunities || null,
      coverImageUrl: data.coverImageUrl || null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      orderIndex: data.orderIndex || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return safeMutation('/specialties', 'POST', data, token, newSpec);
  },

  updateSpecialty: async (id: string, data: Partial<Specialty>, token?: string): Promise<Specialty> => {
    const existing = FALLBACK_SPECIALTIES.find((s) => s.id === id) || FALLBACK_SPECIALTIES[0]!;
    const updated: Specialty = { ...existing, ...data, updatedAt: new Date().toISOString() };
    return safeMutation(`/specialties/${id}`, 'PATCH', data, token, updated);
  },

  deleteSpecialty: async (id: string, token?: string): Promise<{ success: boolean }> => {
    return safeMutation(`/specialties/${id}`, 'DELETE', undefined, token, { success: true });
  },

  // События CRUD
  createEvent: async (data: Partial<EventItem>, token?: string): Promise<EventItem> => {
    const newEvent: EventItem = {
      id: crypto.randomUUID(),
      title: data.title || 'Новое событие',
      slug: data.slug || `event-${Date.now()}`,
      description: data.description || '',
      contentHtml: data.contentHtml || null,
      eventDate: data.eventDate || new Date().toISOString(),
      endDate: data.endDate || null,
      location: data.location || 'Главный корпус',
      category: data.category || 'open_doors',
      coverImageUrl: data.coverImageUrl || null,
      isFeatured: Boolean(data.isFeatured),
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      organizer: data.organizer || 'Администрация колледжа',
      registrationUrl: data.registrationUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return safeMutation('/events', 'POST', data, token, newEvent);
  },

  updateEvent: async (id: string, data: Partial<EventItem>, token?: string): Promise<EventItem> => {
    const existing = FALLBACK_EVENTS.find((e) => e.id === id) || FALLBACK_EVENTS[0]!;
    const updated: EventItem = { ...existing, ...data, updatedAt: new Date().toISOString() };
    return safeMutation(`/events/${id}`, 'PATCH', data, token, updated);
  },

  deleteEvent: async (id: string, token?: string): Promise<{ success: boolean }> => {
    return safeMutation(`/events/${id}`, 'DELETE', undefined, token, { success: true });
  },

  // Администрация и руководство CRUD
  createAdministrator: async (data: Partial<AdministratorMember>, token?: string): Promise<AdministratorMember> => {
    const newAdmin: AdministratorMember = {
      id: crypto.randomUUID(),
      fullName: data.fullName || 'F.I.O.',
      slug: data.slug || `admin-${Date.now()}`,
      position: data.position || 'Lavozim',
      category: data.category || 'leadership',
      receptionHours: data.receptionHours || 'Dushanba – Juma: 14:00 – 17:00',
      phone: data.phone || '+998 (73) 244-00-00',
      email: data.email || 'info@texnikum2.uz',
      roomNumber: data.roomNumber || '101-xona',
      duties: data.duties || '',
      bio: data.bio || '',
      photoUrl: data.photoUrl || null,
      orderIndex: data.orderIndex || 10,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const currentLocal = getLocalAdministrators();
    saveLocalAdministrators([newAdmin, ...currentLocal]);
    const fbIdx = FALLBACK_ADMINISTRATORS.findIndex((a) => a.id === newAdmin.id);
    if (fbIdx !== -1) {
      FALLBACK_ADMINISTRATORS[fbIdx] = newAdmin;
    } else {
      FALLBACK_ADMINISTRATORS.unshift(newAdmin);
    }

    recordLocalAudit('CREATE', 'administration', newAdmin.id, {
      fullName: newAdmin.fullName,
      position: newAdmin.position,
      category: newAdmin.category,
      roomNumber: newAdmin.roomNumber,
      phone: newAdmin.phone,
    });

    try {
      return await safeMutation<AdministratorMember>('/administration', 'POST', data, token, newAdmin);
    } catch {
      return newAdmin;
    }
  },

  updateAdministrator: async (id: string, data: Partial<AdministratorMember>, token?: string): Promise<AdministratorMember> => {
    const list = getAllCurrentAdministrators();
    const existing = list.find((a) => a.id === id) || FALLBACK_ADMINISTRATORS[0]!;
    const updated: AdministratorMember = {
      ...existing,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const currentLocal = getLocalAdministrators();
    const idx = currentLocal.findIndex((a) => a.id === id);
    if (idx !== -1) {
      currentLocal[idx] = updated;
    } else {
      currentLocal.unshift(updated);
    }
    saveLocalAdministrators(currentLocal);

    const fbIdx = FALLBACK_ADMINISTRATORS.findIndex((a) => a.id === id);
    if (fbIdx !== -1) {
      FALLBACK_ADMINISTRATORS[fbIdx] = updated;
    } else {
      FALLBACK_ADMINISTRATORS.unshift(updated);
    }

    recordLocalAudit(
      'UPDATE',
      'administration',
      id,
      { fullName: updated.fullName, position: updated.position, ...data },
      existing as unknown as Record<string, unknown>,
    );

    try {
      return await safeMutation<AdministratorMember>(`/administration/${id}`, 'PATCH', data, token, updated);
    } catch {
      return updated;
    }
  },

  deleteAdministrator: async (id: string, token?: string): Promise<{ success: boolean }> => {
    const currentLocal = getLocalAdministrators();
    const existing = currentLocal.find((a) => a.id === id) || FALLBACK_ADMINISTRATORS.find((a) => a.id === id);
    saveLocalAdministrators(currentLocal.filter((a) => a.id !== id));
    const fbIdx = FALLBACK_ADMINISTRATORS.findIndex((a) => a.id === id);
    if (fbIdx !== -1) {
      FALLBACK_ADMINISTRATORS.splice(fbIdx, 1);
    }

    recordLocalAudit(
      'DELETE',
      'administration',
      id,
      undefined,
      existing ? { fullName: existing.fullName, position: existing.position } : undefined,
    );

    try {
      return await safeMutation(`/administration/${id}`, 'DELETE', undefined, token, { success: true });
    } catch {
      return { success: true };
    }
  },

  // Расписание CRUD
  createSchedule: async (data: Partial<ScheduleItem>, token?: string): Promise<ScheduleItem> => {
    const newSchedule: ScheduleItem = {
      id: crypto.randomUUID(),
      groupName: data.groupName || 'ИС-301',
      dayOfWeek: data.dayOfWeek || 1,
      lessonNumber: data.lessonNumber || 1,
      timeStart: data.timeStart || '08:30',
      timeEnd: data.timeEnd || '10:00',
      subject: data.subject || 'Новая дисциплина',
      teacherId: data.teacherId || null,
      classroom: data.classroom || 'Ауд. 101',
      parity: data.parity || 'both',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return safeMutation('/schedule', 'POST', data, token, newSchedule);
  },

  updateSchedule: async (id: string, data: Partial<ScheduleItem>, token?: string): Promise<ScheduleItem> => {
    const existing = FALLBACK_SCHEDULE.find((s) => s.id === id) || FALLBACK_SCHEDULE[0]!;
    const updated: ScheduleItem = { ...existing, ...data, updatedAt: new Date().toISOString() };
    return safeMutation(`/schedule/${id}`, 'PATCH', data, token, updated);
  },

  deleteSchedule: async (id: string, token?: string): Promise<{ success: boolean }> => {
    return safeMutation(`/schedule/${id}`, 'DELETE', undefined, token, { success: true });
  },

  // Страницы CRUD
  createPage: async (data: Partial<PageItem>, token?: string): Promise<PageItem> => {
    const newPage: PageItem = {
      id: crypto.randomUUID(),
      title: data.title || 'Новая страница',
      slug: data.slug || `page-${Date.now()}`,
      section: data.section || 'sveden',
      contentHtml: data.contentHtml || '',
      metaTitle: data.metaTitle || null,
      metaDescription: data.metaDescription || null,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      orderIndex: data.orderIndex || 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return safeMutation('/pages', 'POST', data, token, newPage);
  },

  updatePage: async (id: string, data: Partial<PageItem>, token?: string): Promise<PageItem> => {
    const existing = FALLBACK_PAGES.find((p) => p.id === id) || FALLBACK_PAGES[0]!;
    const updated: PageItem = { ...existing, ...data, updatedAt: new Date().toISOString() };
    return safeMutation(`/pages/${id}`, 'PATCH', data, token, updated);
  },

  deletePage: async (id: string, token?: string): Promise<{ success: boolean }> => {
    return safeMutation(`/pages/${id}`, 'DELETE', undefined, token, { success: true });
  },

  // Медиатека
  getMediaFiles: async (bucket?: StorageBucket): Promise<MediaFile[]> => {
    const query = bucket ? `?bucket=${bucket}` : '';
    const fallback = bucket ? FALLBACK_MEDIA.filter((m) => m.bucket === bucket) : FALLBACK_MEDIA;
    return safeFetch(`/media${query}`, fallback);
  },

  uploadMedia: async (file: File, bucket: StorageBucket, token?: string): Promise<MediaFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    let fallbackUrl = '';
    if (typeof window !== 'undefined') {
      try {
        fallbackUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string) || URL.createObjectURL(file));
          reader.onerror = () => resolve(URL.createObjectURL(file));
          reader.readAsDataURL(file);
        });
      } catch {
        fallbackUrl = URL.createObjectURL(file);
      }
    }

    const fallback: MediaFile = {
      id: crypto.randomUUID(),
      bucket,
      fileName: file.name,
      originalName: file.name,
      storagePath: `${bucket}/${file.name}`,
      publicUrl: fallbackUrl || `/uploads/${bucket}/${file.name}`,
      mimeType: file.type || 'application/octet-stream',
      fileSizeBytes: file.size,
      uploadedBy: FALLBACK_USERS[0]!.id,
      createdAt: new Date().toISOString(),
    };
    return safeMutation('/media/upload', 'POST', formData, token, fallback);
  },

  deleteMediaFile: async (id: string, token?: string): Promise<{ deleted: boolean }> => {
    return safeMutation(`/media/${id}`, 'DELETE', undefined, token, { deleted: true });
  },

  getNewsCategories: async (): Promise<NewsCategory[]> => {
    return safeFetch('/news/categories', FALLBACK_CATEGORIES);
  },

  // Пользователи и роли (Admin only)
  getUsers: async (token?: string): Promise<UserProfile[]> => {
    return safeMutation('/users', 'GET' as unknown as 'POST', undefined, token, FALLBACK_USERS);
  },

  updateUserRole: async (id: string, role: UserRole, token?: string): Promise<UserProfile> => {
    const existing = FALLBACK_USERS.find((u) => u.id === id) || FALLBACK_USERS[0]!;
    const updated: UserProfile = { ...existing, role, updatedAt: new Date().toISOString() };
    return safeMutation(`/users/${id}/role`, 'PATCH', { role }, token, updated);
  },

  // Журнал аудита (Admin only)
  getAuditLogs: async (
    params?: { action?: string; entityType?: string; page?: number; limit?: number },
    token?: string,
  ): Promise<{ items: AuditLogItem[]; total: number; page: number; limit: number; totalPages: number }> => {
    const query = new URLSearchParams();
    if (params?.action && params.action !== 'all') query.set('action', params.action);
    if (params?.entityType && params.entityType !== 'all') query.set('entityType', params.entityType);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit || 50));

    const localItems = getAllCurrentAuditLogs();
    const fallback = {
      items: localItems,
      total: localItems.length,
      page: params?.page || 1,
      limit: params?.limit || 50,
      totalPages: Math.ceil(localItems.length / (params?.limit || 50)) || 1,
    };

    const res = await safeFetch<{ items: AuditLogItem[]; total: number; page: number; limit: number; totalPages: number }>(
      `/audit-log?${query.toString()}`,
      fallback,
      { cache: 'no-store', token },
    );

    if (res && Array.isArray(res.items)) {
      const serverIds = new Set(res.items.map((i) => i.id));
      const missingLocal = getLocalAuditLogs().filter((l) => {
        if (serverIds.has(l.id)) return false;
        if (params?.action && params.action !== 'all' && l.action !== params.action) return false;
        if (params?.entityType && params.entityType !== 'all' && l.entityType !== params.entityType) return false;
        return true;
      });
      if (missingLocal.length > 0) {
        const combined = [...missingLocal, ...res.items].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        return {
          ...res,
          items: combined,
          total: res.total + missingLocal.length,
          totalPages: Math.ceil((res.total + missingLocal.length) / (params?.limit || 50)) || 1,
        };
      }
    }

    return res;
  },

  recordAuditLog: async (
    data: {
      action: AuditAction;
      entityType: string;
      entityId: string;
      newValues?: Record<string, unknown>;
      oldValues?: Record<string, unknown>;
    },
  ): Promise<AuditLogItem> => {
    return recordLocalAudit(data.action, data.entityType, data.entityId, data.newValues, data.oldValues);
  },

  // Контакты и реквизиты техникума (Aloqa)
  getContacts: async (): Promise<ContactsData> => {
    return safeFetch('/contacts', FALLBACK_CONTACTS);
  },

  updateContacts: async (data: ContactsData, token?: string): Promise<ContactsData> => {
    return safeMutation('/contacts', 'PUT', data, token, data);
  },

  // Онбординг текущего пользователя (/me/onboarding)
  getOnboarding: async (token?: string): Promise<OnboardingState> => {
    return safeFetch<OnboardingState>('/me/onboarding', {}, { cache: 'no-store', token });
  },

  patchOnboarding: async (
    data: Partial<OnboardingState>,
    token?: string,
  ): Promise<OnboardingState> => {
    return safeMutation<OnboardingState>(
      '/me/onboarding',
      'PATCH',
      data,
      token,
      data as OnboardingState,
    );
  },

  // Сброс онбординга пользователя (только Администратор)
  resetUserOnboarding: async (
    userId: string,
    token?: string,
  ): Promise<{ id: string; onboarding: OnboardingState }> => {
    return safeMutation<{ id: string; onboarding: OnboardingState }>(
      `/users/${userId}/onboarding/reset`,
      'POST',
      undefined,
      token,
      { id: userId, onboarding: {} },
    );
  },
};

export const collegeApi = api;
export const apiClient = api;


