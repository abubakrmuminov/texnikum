# Taʼlim muassasasi (SPO / Texnikum / Kollej) rasmiy veb-portali (White-Label Portal & CMS)

Oʻzbekiston Respublikasi kasb-hunar taʼlimi muassasalari (texnikumlar, kollejlar, litseylar) uchun koʻp maqsadli rasmiy veb-portal va maʼmuriyat boshqaruv paneli (White-Label CMS). Loyiha monorepozitoriy arxitekturasida Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni (OʻRQ-637, 37-modda), Oʻzbekiston Respublikasi Prezidentining PF-158-son Farmoni, «Nogironligi boʻlgan shaxslarning huquqlari toʻgʻrisida»gi Qonuni (OʻRQ-641), «Shaxsga doir maʼlumotlar toʻgʻrisida»gi Qonuni (OʻRQ-547) va WCAG 2.1 AA xalqaro raqamli qulaylik standartlariga toʻliq mos holda ishlab chiqilgan. Tizim istalgan taʼlim muassasasiga kodni oʻzgartirmasdan, birinchi ishga tushirish ustasi (/setup) orqali sozlanadi.

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

#### SETUP_TOKEN (Tizimni dastlabki sozlash master-kodi)
Tizimni yangi taʼlim muassasasiga (texnikum, kollej, litsey) moslab sozlash uchun `.env` faylida `SETUP_TOKEN` kalitini oʻrnating:
```bash
# Yangi xavfsiz kalit yaratish (32 bayt):
openssl rand -hex 32
# yoki
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Bu kod `POST /api/v1/setup/complete` orqali muassasa rekvizitlarini birinchi marta saqlash va birinchi bosh administratorni yaratish uchun talab qilinadi. Sozlash tugagach, `/setup/*` xizmati butunlay oʻchiriladi (404 Not Found qaytaradi).

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

---

## 10. Yangi muassasa uchun oʻrnatish (Deploy for a new institution)

Ushbu loyiha istalgan kasb-hunar taʼlimi muassasasiga (texnikum, kollej, kasb-hunar maktabi yoki litsey) toʻliq moslashtirilgan. Standart toza oʻrnatishda hech qanday qattiq kodlangan tashkilot maʼlumotlari mavjud emas.

### 10.1. Dastlabki talablar (Prerequisites)
- **Node.js** 18.18+ (yoki 20+ LTS).
- **pnpm** 8+ / 9+ / 11+ (`npm i -g pnpm`).
- Toza **Supabase** loyihasi yoki **PostgreSQL 15+** maʼlumotlar bazasi.

### 10.2. Muhit oʻzgaruvchilarini sozlash (.env)
1. Namunaviy fayldan `.env` nusxasini yarating:
   ```bash
   cp .env.example .env
   ```
2. Yangi taʼlim muassasasi uchun bir martalik xavfsiz `SETUP_TOKEN` yarating:
   ```bash
   # Linux / macOS / Git Bash:
   openssl rand -hex 32

   # Windows PowerShell / Node:
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Olingan 64 belgili heks-satrni `.env` faylidagi `SETUP_TOKEN=` qatoriga yozing:
   ```env
   SETUP_TOKEN=a1b2c3d4...64_characters_here...
   ```
4. Supabase ulanish parametrlarini toʻldiring (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL`).

### 10.3. Maʼlumotlar bazasi migratsiyalari (Migrations)
Toza oʻrnatishda barcha jadvallar boʻsh yaratiladi, singleton `institution_settings` jadvalida `is_configured = false` belgisi oʻrnatiladi:
```bash
# Supabase CLI orqali:
supabase db reset

# Yoki psql orqali toʻgʻridan-toʻgʻri:
psql "$DATABASE_URL" -f supabase/migrations/20261001_whitelabel_settings.sql
```
*(Eʼtibor bering: toza oʻrnatishda hech qanday demo kontent yoki tashkilot maʼlumotlari yuklanmaydi).*

### 10.4. Ilovani ishga tushirish (Start)
```bash
pnpm dev
# Yoki ishlab chiqarish rejimida:
pnpm build && pnpm dev
```

### 10.5. Sozlash ustasi (First-run Setup Wizard)
1. Brauzerda istalgan sahifani oching: `http://localhost:3000/`.
2. Tizim sozlanmaganligini aniqlaydi (`is_configured = false`) va barcha soʻrovlarni avtomatik tarzda `http://localhost:3000/setup` manziliga yoʻnaltiradi.
3. Sozlash ustasida qadam-baqadam maʼlumotlarni kiriting:
   - **0-qadam**: Yuqorida yaratilgan `SETUP_TOKEN` kodini kiriting.
   - **1-qadam (Identifikatsiya)**: Muassasa toʻliq va qisqa nomlari (Oʻzbekcha va Ruscha), tashkiliy turi.
   - **2-qadam (Brending)**: Logotip, sayt faviconi, gerb yuklang; brend rangini tanlang — tizim WCAG AA (kamida 4.5:1) kontrast nisbatini jonli hisoblaydi va tugma matni rangini avtomatik moslaydi.
   - **3-qadam (Aloqa va xarita)**: Bosh bino manzili, telefonlar (+998), elektron pochtalar, ish tartibi va xarita koordinatalari (kenglik/uzunlik).
   - **4-qadam (Yuridik rekvizitlar)**: STIR/INN (9 ta raqam), xizmat koʻrsatuvchi bank, hisob raqami, MFO, JSHSHIR (ixtiyoriy).
   - **5-qadam (Administrator hisobi)**: Yangi taʼlim muassasasi bosh administratorining elektron pochtasi va xavfsiz paroli.
   - **6-qadam (Tekshirish va yakunlash)**: Barcha kiritilgan parametrlarni koʻrib chiqing va «Sozlashni yakunlash» tugmasini bosing.
4. Tizim bir martalik atomik tranzaksiya orqali administratorni roʻyxatdan oʻtkazadi, sozlamalarni saqlaydi va `is_configured = true` qiladi.

### 10.6. Natijani tekshirish (Verification)
1. **Ommaviy sahifa**: `http://localhost:3000/` sahifasini oching.
   - Header, Footer, Kontaktlar, 37-modda boʻlimi, HTML sarlavhalari (`<title>`), Open Graph va JSON-LD mikromarkirovkasi yangi muassasa nomlari va rekvizitlari bilan toʻliq yangilangan boʻladi.
2. **Setup blokirovkasi**: `http://localhost:3000/setup` sahifasiga oʻtishga urinib koʻring — u toʻgʻridan-toʻgʻri `404 Not Found` qaytaradi.
3. **Boshqaruv paneli**: `http://localhost:3000/admin/login` orqali yangi administrator hisobi bilan kiring.
   - Chap menyuda **«Muassasa sozlamalari»** (`/admin/settings/institution`) boʻlimi mavjud boʻlib, u orqali barcha parametrlarni, ranglarni va rekvizitlarni istalgan paytda tahrirlash mumkin.

### 10.7. Sinov uchun namunaviy maʼlumotlar (Optional Demo Seed Data)
Agar ishlab chiqish yoki sinov maqsadida namunaviy demo maʼlumotlarini yuklamoqchi boʻlsangiz, alohida buyruqdan foydalaning:
```bash
# Demo maʼlumotlarni yuklash buyrugʻi:
pnpm db:seed:demo

# Yoki toʻgʻridan-toʻgʻri psql orqali:
psql "$DATABASE_URL" -f supabase/seed_demo_institution.sql
```
Normal ishlab chiqarish oʻrnatishida bu buyruqni ishga tushirish shart emas.

---

## 11. Sayt konstruktori va vizual sahifa muharriri (Site Builder & Super Page Editor)

Loyiha maʼmuriyatga saytning tuzilishi, ierarxiyasi, sahifalari va dizaynini dasturiy kodni oʻzgartirmasdan boshqarish imkoniyatini taqdim etuvchi zamonaviy CMS va vizual blokli konstruktor bilan toʻliq jihozlangan:

### 11.1. Asosiy imkoniyatlar
1. **Dinamik menyu va sayt tuzilmasi (`/admin/navigation`)**:
   - Shablon menyulari (Header, Footer) maʼlumotlar bazasida saqlanadi va boshqariladi.
   - Boshqaruv darajasi qatʼiy 1 darajali ichma-ichlik bilan cheklangan (Ildiz + bevosita ichki havolalar), bu mobil qurilmalar va ekran oʻquvchi dasturlar (WCAG 2.1 AA) uchun maksimal qulaylikni taʼminlaydi.
   - Qonunchilikka binoan majburiy boʻlgan 12 ta ustav boʻlimi (37-modda) jismonan oʻchirilishdan himoyalangan (`is_required = true`); ularni yashirish faqat administrator tomonidan tasdiqlash (`confirm: true`) bilan amalga oshiriladi.
   - Elementlarni sichqoncha (Drag & Drop `@dnd-kit/sortable`) va klaviatura yordamida tartiblash («Tepaga» / «Pastga» tugmalari) `aria-live="polite"` diktor ovozi bilan integratsiya qilingan.
   - «Boshlangʻich holatga qaytarish» (`POST /admin/navigation/restore-defaults`) tizim navigatsiyasini tiklaydi.
2. **Super-konstruktor va blokli sahifalar muharriri (`/admin/pages`, `/admin/pages/[id]`)**:
   - Sahifa mazmuni 14 ta tayyor bloklardan iborat: `heading`, `rich_text`, `image` (dekorativ boʻlmagan rasm uchun alt-matn talab qilinadi), `gallery`, `file_list`, `table`, `accordion`, `button`, `columns`, `video_embed`, `contact_card`, `divider`, `latest_news_list`, `teachers_list`.
   - Rich-text va HTML kontenti `sanitize-html` orqali toʻliq tozalanadi (scriptlar va xavfli hodisa handerlari butunlay yoʻqotiladi).
   - Video havolalari faqat ruxsat berilgan xavfsiz oqim domenlaridan (YouTube, Rutube, Mover.uz) qabul qilinadi.
   - Har 30 soniyada avtosaqlash (Autosave) va sahifadan chiqishda ogohlantirish (`beforeunload`).
   - Tahrirlash sessiyasida Undo/Redo (`Ctrl+Z`, `Ctrl+Y`).
   - Ikki tilli kontent: Oʻzbekcha va Ruscha, bloklar strukturasini boshqa tilga bir marta bosishda nusxalash imkoniyati.
   - Nashr qilishdan oldin avtomatik a11y tekshiruvi: Alt-matnsiz rasm sahifani eʼlon qilishni **BLOKLAYDI**.
   - Har bir sahifa uchun oxirgi 20 ta versiya (revisions) saqlanadi va istalgan paytda bitta soʻrov bilan tiklanadi.
   - Yangi yorliqda xavfsiz qoralama koʻrish (Draft Preview).
3. **Mavzular va dizayn-presetlari (`/admin/settings/theme`)**:
   - 5 ta akademik uslub: `classic_academic`, `modern_tech`, `emerald_oasis`, `traditional_navy`, `clean_slate`.
   - Jonli WCAG AA kontrast tekshiruvi (masalan, 7.8:1) va past kontrastli kombinatsiyalarni saqlashni blokirovka qilish.
   - Koʻrish imkoniyati cheklanganlar paneli (`data-a11y-theme`) dizayn-presetlardan ustun turadi va ularni avtomatik chetlab oʻtadi.
4. **Haqiqiy moslashuvchanlik va ekran oʻlchamlarini boshqarish (Responsive Visual Builder & Viewport Switcher)**:
   - 6 ta standart oʻlchamda sinovdan oʻtgan: 320px, 375px, 768px, 1024px, 1280px, 1536px (WCAG 2.1 Reflow SC 1.4.10 boʻyicha gorizontal siljish 0px).
   - Konstruktorda jonli oʻlcham oʻzgartirish (Viewport Switcher: 1280px Desktop, 768px Tablet, 375px Mobile, 320px Small Mobile va 320–1536px slayderi) real oʻlchamli konteyner soʻrovlari (`@container`, `inline-size`) orqali ishlaydi.
   - Qurilmalar boʻyicha elementlarni yashirish (`hideOnMobile`, `hideOnTablet`, `hideOnDesktop`) va qonunchilik bilan majburiy boʻlgan 37-modda ustav maʼlumotlarini yashirishdan himoya.
   - Tasvirlar uchun fokus nuqtasi (`focalPoint: {x, y}`) va tomonlar nisbati (`aspectRatioPreset: original, 16:9, 4:3, 1:1, 3:4`) sozlamalari.
   - Interaktiv elementlar oʻlchami WCAG 2.2 SC 2.5.8 standartiga koʻra kamida 24x24px va asosiy tugmalar uchun 44x44px.


