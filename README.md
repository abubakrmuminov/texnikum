# Taʼlim muassasasi (Texnikum) rasmiy veb-portali — Fargʻona 2-son texnikumi

Oʻzbekiston Respublikasi kasb-hunar taʼlimi muassasasi (Fargʻona 2-son axborot texnologiyalari texnikumi) uchun rasmiy zamonaviy veb-portal va maʼmuriyat boshqaruv paneli (CMS). Loyiha monorepozitoriy arxitekturasida Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni (OʻRQ-637, 37-modda), Oʻzbekiston Respublikasi Prezidentining PF-158-son Farmoni, «Nogironligi boʻlgan shaxslarning huquqlari toʻgʻrisida»gi Qonuni (OʻRQ-641), «Shaxsga doir maʼlumotlar toʻgʻrisida»gi Qonuni (OʻRQ-547) va WCAG 2.1 AA xalqaro raqamli qulaylik standartlariga toʻliq mos holda ishlab chiqilgan.

---

## 1. Texnologiyalar steki va arxitektura

Monorepozitoriy **pnpm workspaces** asosida tashkil etilgan:

- **`apps/web`**: **Next.js 14 (App Router)**, React 18, TypeScript (strict mode), Tailwind CSS, `shadcn/ui` komponentlari, Lucide Icons, `next-intl` (ikki tilli interfeys: Oʻzbekcha / Ruscha). Gibrid SSG/SSR renderlash, inklyuziv koʻrish rejimlarini qoʻllab-quvvatlaydi.
- **`apps/api`**: **NestJS 10**, TypeScript, `class-validator` orqali DTO validatsiyasi, OpenAPI / Swagger interaktiv hujjatlari, soʻrovlarni cheklash (Rate Limiting 120 req/min), Supabase JWT tokenlarini tekshirish.
- **`packages/shared`**: Umumiy tiplar va enumlar toʻplami (`UserRole`, `NewsStatus`, entiti interfeyslari, marshrutlar konstantalari).
- **`supabase`**: Maʼlumotlar bazasi **PostgreSQL 15**, Row Level Security (RLS) xavfsizlik siyosatlari, audit tranzaksiyalari, toʻliq matnli qidiruv indekslari, **Supabase Storage** fayl omborlari (`news-media` va `official-docs`).

---

## 2. Dastlabki talablar

- **Node.js**: versiya 18.18.0 yoki undan yuqori (tavsiya etiladi: LTS 20.x).
- **Paket menejeri**: `pnpm` 8.x yoki 9.x (`npm install -g pnpm`).
- *(Ixtiyoriy)*: Docker Desktop va Supabase CLI (lokal Supabase uchun).

---

## 3. Loyihani oʻrnatish va ishga tushirish

### 1-qadam. Repozitoriyni ochish va bogʻliqliklarni oʻrnatish
```bash
# Loyiha papkasiga oʻtish
cd c:/Users/Intel/Desktop/site

# Barcha paketlar bogʻliqliklarini oʻrnatish
pnpm install
```

### 2-qadam. Muhit parametrlarini sozlash (.env)
```bash
# Monorepozitoriy ildizi uchun
cp .env.example .env

# Server API uchun
cp apps/api/.env.example apps/api/.env

# Klient veb-ilovasi uchun
cp apps/web/.env.example apps/web/.env
```

> **Eslatma:** Loyiha avtonom ish rejimiga ega (`api-client.ts`). Maʼlumotlar bazasi ulanmagan taqdirda ham, tizim Fargʻona 2-son texnikumining toʻliq test maʼlumotlari (seed) bilan uzluksiz ishlaydi.

### 3-qadam. Maʼlumotlar bazasini sozlash (Supabase mavjud boʻlsa)
```bash
# Migratsiyalarni qoʻllash va Oʻzbekiston texnikumi seed maʼlumotlarini yuklash
supabase start
supabase db reset
```

### 4-qadam. Dasturchi rejimida ishga tushirish
```bash
# Frontend va API-ni birgalikda ishga tushirish
pnpm dev
```
Ishga tushgach quyidagi manzillar ochiladi:
- **Rasmiy ommaviy portal**: [http://localhost:3000](http://localhost:3000)
- **Boshqaruv paneli (Admin CMS)**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Server REST API**: [http://localhost:4000/api/v1](http://localhost:4000/api/v1)
- **Interaktiv Swagger API hujjatlari**: [http://localhost:4000/api/docs](http://localhost:4000/api/docs)
  - `GET /api/v1/me/onboarding` — joriy foydalanuvchi onbording holati
  - `PATCH /api/v1/me/onboarding` — onbording holatini yangilash (merge)
  - `POST /api/v1/users/:id/onboarding/reset` — foydalanuvchi onbordingini qayta tiklash (faqat Admin)
  - `POST /api/v1/audit-log` — audit hodisalarini qayd qilish

---

## 4. Kod sifatini tekshirish va yigʻish (Build & Lint)

Har bir reliz yoki oʻzgarishdan oldin:

```bash
# 1. Barcha paketlarda TypeScript va ESLint tekshiruvi
pnpm lint

# 2. Toʻliq production yigʻish (Shared -> API -> Next.js SSG 79 ta sahifa)
pnpm build
```

---

## 5. Sinov uchun hisoblar (RBAC & Dev Auth)

Boshqaruv paneliga kirish sahifasi: **`/admin/login`**. Tezkor kirish tugmalari yoki quyidagi hisoblar orqali kirish mumkin:

| Rol | Email | Parol | Ruxsat darajasi |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@texnikum2.uz` | `admin123` | Toʻliq huquq: yangiliklar, tadbirlar, dars jadvali, pedagoglar, mutaxassisliklar (grant/kontrakt), 37-modda boʻlimlari, foydalanuvchilar va audit jurnali |
| **Muharrir (Editor)** | `editor@texnikum2.uz` | `editor123` | Nashr qilish, dars jadvali, tadbirlar va mediafayllarni boshqarish |
| **Moderator** | `moderator@texnikum2.uz` | `moderator123` | Qoralamalarni yaratish va tahrirlash |

---

## 6. Foydalanuvchi ssenariysini tekshirish (End-to-End Flow)

1. **Kirish**: `http://localhost:3000/admin/login` sahifasini oching va «Администратор» tugmasini bosing (yoki `admin@texnikum2.uz` / `admin123`).
2. **Boshqaruv paneli**: Texnikum KPI koʻrsatkichlari, oxirgi yangiliklar va xavfsizlik audit jurnali ochiladi.
3. **Yangilik yaratish**:
   - «+ Создать новость» tugmasini bosing yoki `/admin/news/new` ga oʻting.
   - Sarlavha: `Fargʻona 2-son texnikumida sunʼiy intellekt laboratoriyasi ochildi`.
   - Matnni WYSIWYG muharririda toʻldiring.
   - Holatni «Опубликовано (na saytda)» ga oʻtkazing.
   - «Asosiy yangilik (Hero)» belgisini qoʻying va saqlang.
4. **Saytda koʻrish**:
   - «На сайт →» tugmasini bosing yoki `http://localhost:3000/` ni oching.
   - Yangilik bosh sahifadagi Bento Hero blokida birinchi boʻlib aks etadi.
   - `/news` boʻlimida maqolani ochib, oʻzbek yoki rus tilida ovozli eshitish (TTS) mumkin.

---

## 7. Raqamli qulaylik (a11y) va inklyuzivlik

Portal nogironligi boʻlgan va koʻrish imkoniyati cheklangan shaxslar uchun OʻRQ-641 hamda WCAG 2.1 AA talablariga moslashtirilgan:

1. **Maxsus imkoniyatlar paneli (Accessibility Toolbar)**:
   - Saytning yuqori qismida doimiy qulaylik paneli mavjud.
   - **6 ta yuqori kontrastli rang sxemasi**: Standart, Qorongʻi, «Oq fonda qora», «Qora fonda oq», «Koʻk fonda sariq», «Sarkash rang (Sepiya)».
   - **Shrift oʻlchamini masshtablash**: 100%, 150%, 200%.
   - **Tasvirlarni boshqarish**: rangli, oq-qora yoki rasmlarni butunlay oʻchirish.
   - **Nutq sintezi (Text-to-Speech)**: sahifa va hujjatlar matnini ovozli oʻqib berish (`TtsButton`).
   - Barcha parametrlar `localStorage` da saqlanadi va qayta yuklamasdan qoʻllaniladi.
2. **Klaviatura orqali boshqaruv**:
   - `Tab` tugmasi barcha interaktiv elementlarni aniq fokus halqasi bilan aylanib chiqadi.
   - Birinchi bosishda «Asosiy kontentga oʻtish» (`#main-content`) havolasi paydo boʻladi.
   - Barcha modal oynalar `Escape` orqali yopiladi.
3. **Dars jadvali jadvallari**:
   - Skrinriderlar (NVDA, JAWS) uchun `<caption>`, `<th scope="col">`, `<th scope="row">` toʻliq semantik teglari bilan taʼminlangan.

---

## 8. Loyiha tuzilmasi

```
site/
├── apps/
│   ├── api/                     # NestJS server REST API
│   │   ├── src/
│   │   │   ├── auth/            # Supabase JWT, RBAC Guards
│   │   │   ├── news/            # Yangiliklar, ruknlar, moderatsiya
│   │   │   ├── teachers/        # Oʻqituvchilar tarkibi, kafedralar
│   │   │   ├── specialties/     # Mutaxassisliklar (grant / kontrakt)
│   │   │   ├── events/          # Tadbirlar taqvimi
│   │   │   ├── schedule/        # Qoʻngʻiroqlar va dars jadvali
│   │   │   ├── pages/           # 37-modda boʻyicha ommaviy sahifalar
│   │   │   ├── media/           # Mediafayllar va yuklash
│   │   │   ├── users/           # Foydalanuvchilar va rollar
│   │   │   └── audit/           # Oʻzgarmas audit jurnali
│   └── web/                     # Next.js 14 App Router klient portali
│       ├── src/
│       │   ├── app/             # Next.js sahifalari va yoʻnalishlari
│       │   │   ├── info/        # OʻRQ-637 37-moddasi boʻyicha 12 ta majburiy boʻlim
│       │   │   ├── sveden/      # /info ga yoʻnaltiruvchi qulay redirect
│       │   │   ├── admin/       # Boshqaruv paneli (/admin)
│       │   │   ├── robots.ts    # robots.txt generatori
│       │   │   └── sitemap.ts   # sitemap.xml generatori
│       │   ├── components/      # UI komponentlar, a11y, til oʻzgartirgich, formalar
│       │   ├── messages/        # uz.json va ru.json lokalizatsiya lugʻatlari
│       │   └── lib/             # API klient va yordamchi modullar
├── packages/
│   └── shared/                  # Umumiy interfeyslar, konstantalar va DTO
├── supabase/
│   ├── migrations/              # SQL migratsiyalari va RLS siyosatlari
│   └── seed.sql                 # Fargʻona 2-son texnikumi boshlangʻich maʼlumotlari
├── docs/
│   ├── SPEC.md                  # Texnik spetsifikatsiya
│   ├── UZ_COMPLIANCE.md         # Oʻzbekiston qonunchiligi talablari maʼlumotnomasi
│   └── LOCALIZATION_AUDIT.md    # Lokalizatsiya auditi hisoboti
├── PROGRESS.md                  # Bosqichlar va bajarilgan ishlar nazorat roʻyxati
└── README.md                    # Foydalanish boʻyicha ushbu qoʻllanma
```

---

## 9. Qonunchilik va muvofiqlik

Loyiha Oʻzbekiston Respublikasining quyidagi qonun hujjatlariga muvofiq ishlab chiqilgan:
1. Oʻzbekiston Respublikasining 2020-yil 23-sentabrdagi OʻRQ-637-son «Taʼlim toʻgʻrisida»gi Qonuni (37-modda).
2. Oʻzbekiston Respublikasi Prezidentining 2024-yil 16-oktabrdagi PF-158-son Farmoni («Kasbiy taʼlimda malakali kadrlar tayyorlash tizimini yanada takomillashtirish chora-tadbirlari toʻgʻrisida»).
3. Oʻzbekiston Respublikasining «Nogironligi boʻlgan shaxslarning huquqlari toʻgʻrisida»gi Qonuni (OʻRQ-641) va WCAG 2.1 AA.
4. Oʻzbekiston Respublikasining «Shaxsga doir maʼlumotlar toʻgʻrisida»gi Qonuni (OʻRQ-547).
