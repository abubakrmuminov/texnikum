---
name: news-and-events-layout
description: Specialized skill for designing, architecting, and generating news feeds, editorial articles, press releases, event calendars, and media galleries for colleges, vocational schools, and academic portals.
triggers:
  - news layout
  - college news
  - event calendar
  - новости училища
  - лента новостей колледжа
  - карточки новостей
  - медиагалерея колледжа
  - календарь мероприятий
---

# News, Blog & Events Layout Designer Skill

## 1. Scope & Objective
This skill provides complete architectural patterns, layouts, editorial typography, and production-ready Tailwind CSS / HTML components for building the news and media sections of an educational institution (колледж, училище, техникум, вуз).

---

## 2. Information Architecture & Semantic Hierarchy

1. **Semantic HTML5:**
   - Articles and cards: `<article itemscope itemtype="https://schema.org/NewsArticle">`.
   - Publication date/time: `<time datetime="2026-09-29T10:00:00+05:00">`.
   - Media with captions: `<figure>` and `<figcaption>`.
   - Event calendar: `<article itemscope itemtype="https://schema.org/Event">`.
2. **Category Taxonomy:**
   - `Все` (All)
   - `Студенческая жизнь` (Student Life - Indigo/Blue)
   - `Наука и инновации` (Science & Tech - Purple)
   - `Официально` (Official / Directives - Slate)
   - `Спорт и достижения` (Sports & Awards - Emerald)
   - `Абитуриенту` (Admissions & Open Days - Amber)

---

## 3. Editorial Typography & Layout Standards

- **Article Content Width:** Maximum `max-w-3xl` (680–740px) ensuring 65–75 characters per line for optimal reading ergonomics.
- **Body Font Size & Line Height:** `18px (1.125rem)` with `line-height: 1.75` for high readability.
- **Lead Paragraph:** 20px, medium weight, high-contrast dark slate (`text-slate-800`).
- **Color Contrast:** Minimum 4.5:1 on background; 3:1 for large display elements (WCAG 2.2 AA).

---

## 4. Production Components (Tailwind CSS)

### 4.1. Featured News Bento / Magazine Hero Card
```html
<article class="group relative grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 lg:p-8 transition-all hover:shadow-xl">
  <div class="lg:col-span-7 overflow-hidden rounded-xl aspect-[16/10] bg-slate-100 relative">
    <img 
      src="/images/news-hero.jpg" 
      alt="Студенты колледжа на чемпионате Профессионалы" 
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="eager"
    />
    <span class="absolute top-4 left-4 px-3 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white shadow-sm">
      Главная новость
    </span>
  </div>

  <div class="lg:col-span-5 flex flex-col justify-between">
    <div>
      <div class="flex items-center gap-3 text-xs font-medium text-slate-500 mb-3">
        <span class="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
          Спорт и победы
        </span>
        <time datetime="2026-09-28">28 сентября 2026</time>
        <span>•</span>
        <span>4 мин чтения</span>
      </div>

      <h2 class="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors">
        <a href="/news/worldskills-triumph" class="focus:outline-none focus:ring-2 focus:ring-blue-500 rounded">
          Сборная колледжа завоевала 5 золотых медалей на всероссийском чемпионате
        </a>
      </h2>

      <p class="text-slate-600 text-base leading-relaxed line-clamp-3 mb-6">
        В финале соревнований наши студенты компетенций «Сетевое администрирование» и «Веб-технологии» обошли более 40 команд со всей страны.
      </p>
    </div>

    <div class="flex items-center justify-between pt-4 border-t border-slate-100">
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-500">Пресс-служба колледжа</span>
      </div>
      <span class="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:translate-x-1 transition-transform">
        Читать полностью →
      </span>
    </div>
  </div>
</article>
```

### 4.2. Standard News Card Grid
```html
<article class="group flex flex-col bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
  <div class="aspect-video w-full overflow-hidden bg-slate-100 relative">
    <img 
      src="/images/event-thumb.jpg" 
      alt="Практика на ведущем ИТ-предприятии" 
      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
    />
    <span class="absolute top-3 left-3 px-2.5 py-0.5 text-xs font-medium rounded-md bg-purple-100 text-purple-800">
      Наука и инновации
    </span>
  </div>

  <div class="p-5 flex flex-col flex-grow">
    <div class="flex items-center gap-2 text-xs text-slate-500 mb-2.5">
      <time datetime="2026-09-27">27 сентября 2026</time>
      <span>•</span>
      <span>2 мин</span>
    </div>

    <h3 class="text-lg font-bold text-slate-900 leading-snug mb-2.5 line-clamp-2 group-hover:text-blue-600 transition-colors">
      <a href="/news/tech-day-2026">
        Открытие новой учебно-производственной лаборатории робототехники
      </a>
    </h3>

    <p class="text-sm text-slate-600 line-clamp-3 mb-4 flex-grow">
      Лаборатория оснащена современными манипуляторами и микроконтроллерными стендами при поддержке индустриального партнера.
    </p>

    <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
      <span>Отделение информационных технологий</span>
      <span class="text-blue-600 font-semibold group-hover:underline">Подробнее →</span>
    </div>
  </div>
</article>
```

### 4.3. Event Calendar Card with Tear-Off Date Badge
```html
<article class="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 bg-white border border-slate-200 rounded-xl gap-4 hover:border-blue-400 transition-colors">
  <div class="flex items-start gap-4">
    <!-- Date Badge -->
    <div class="flex-shrink-0 w-16 h-16 rounded-lg border border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-center shadow-sm">
      <span class="text-[11px] font-bold uppercase tracking-wider text-rose-600">ОКТ</span>
      <span class="text-2xl font-extrabold text-slate-900 leading-none">12</span>
    </div>

    <div>
      <div class="flex flex-wrap items-center gap-2 mb-1.5">
        <span class="px-2 py-0.5 text-xs font-semibold rounded bg-amber-100 text-amber-800">
          Абитуриенту
        </span>
        <span class="text-xs text-slate-500 flex items-center gap-1">
          🕒 11:00 – 14:00
        </span>
        <span class="text-xs text-slate-500 flex items-center gap-1">
          📍 Актовый зал (Корпус 1)
        </span>
      </div>

      <h4 class="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors">
        <a href="/events/open-doors-october">День открытых дверей: Знакомство со специальностями 2027</a>
      </h4>
      <p class="text-sm text-slate-600 line-clamp-1 mt-0.5">
        Экскурсии по мастерским, мастер-классы от преподавателей и встреча с приемной комиссией.
      </p>
    </div>
  </div>

  <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-shrink-0">
    <button class="px-3.5 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors">
      + Календарь
    </button>
    <a href="/events/open-doors-october/register" class="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-center">
      Записаться
    </a>
  </div>
</article>
```

### 4.4. Official Attachment / Directive Download Box
```html
<div class="my-6 p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs uppercase">
      PDF
    </div>
    <div>
      <div class="text-sm font-semibold text-slate-900">Приказ об утверждении расписания сессии.pdf</div>
      <div class="text-xs text-slate-500">Документ подписан ЭЦП • 840 КБ • Опубликован 25.09.2026</div>
    </div>
  </div>
  <a href="/docs/prikaz-142.pdf" download class="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors">
    Скачать
  </a>
</div>
```

---

## 5. Verification Checklist

- [ ] Breadcrumbs on all article and category views.
- [ ] Category pill filters have horizontal scroll on mobile (`overflow-x-auto`).
- [ ] All images have descriptive `alt` texts.
- [ ] Downloadable documents state file format, file size, and digital signature status (ЭЦП).
- [ ] Responsive grid: 1 column on mobile (<640px), 2 columns on tablet (640-1024px), 3 columns on desktop (>1024px).
