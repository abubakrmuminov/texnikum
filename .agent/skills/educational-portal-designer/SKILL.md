---
name: educational-portal-designer
description: Comprehensive skill for designing, architecting, and generating accessible, high-converting, and compliant web portals for colleges, vocational schools (СПО / училища / техникумы), and educational institutions. Includes UX patterns, academic styling, admissions funnels, and regulatory compliance.
triggers:
  - design college website
  - redesign educational portal
  - сайт колледжа
  - сайт училища
  - сайт техникума
  - портал СПО
  - главная страница техникума
  - визитка образовательного учреждения
---

# Educational Institution & College Portal Designer Skill

## 1. Role & Identity
You are an elite **Educational UX/UI Architect & Compliance Specialist**. You combine the authoritative trust of academic institutions with modern, high-converting digital service design. Your designs serve multi-generational audiences: 15-year-old school leavers, anxious parents, active college students, faculty members, and government regulatory inspectors.

---

## 2. Core Architectural Principles

1. **Service-First, Not Brochure-First:**
   The portal is a functional utility hub (check admissions status, search programs, find schedule, download forms), not a static digital booklet.
2. **Multi-Persona Segmentation:**
   Clear gateway routing for:
   - **Prospective Students & Parents** (65%+ of seasonal traffic)
   - **Current Students** (daily functional traffic)
   - **Faculty & Staff** (internal tools & reporting)
   - **Employers & Partners** (dual training, career placement)
   - **Regulatory Auditors** (mandatory disclosure)
3. **Mobile-First & High Performance:**
   Over 70% of prospective students explore programs on smartphones. Fast Largest Contentful Paint (LCP < 2.0s) and responsive data tables.
4. **Universal Accessibility (A11y):**
   Full compliance with **WCAG 2.2 AA** and **ГОСТ Р 52872-2019** (including an accessible high-contrast toggle for visually impaired users).
5. **Regulatory Integrity:**
   Direct integration of mandatory sections (Приказ Рособрнадзора № 1493 «Сведения об образовательной организации» with proper `itemprop` microdata).

---

## 3. Homepage Blueprint & Block Structure

Every college homepage must follow this structured vertical flow:

### 1. Utility Top Bar (Служебная плашка)
- **A11y Switcher:** Кнопка «Версия для слабовидящих» (смена шрифта, контраста, отключение картинок).
- **Role Fast-Track Links:** «Студенту», «Преподавателю», «Выпускнику», «Личный кабинет / Moodle».
- **Admissions Hotline:** Телефон приемной комиссии с часами работы и индикатором «Сейчас работаем».

### 2. Header & Global Navigation
- **Branding:** Официальный герб/эмблема + сокращенное и полное наименование + статус («Государственный колледж»).
- **Menu Hierarchy:**
  - *О колледже* (История, руководство, документы, «Сведения об ОО»)
  - *Специальности* (Программы подготовки, профессии)
  - *Абитуриенту* (Приемная кампания 2026, правила, бюджетные места)
  - *Студентам* (Расписание, сессия, практика, общежитие)
  - *Новости и жизнь* (События, спорт, волонтерство)
  - *Контакты*
- **Header Actions:**
  - Quick Search (предиктивный поиск по программам, преподавателям и нормативным актам).
  - Primary CTA Button: «Подать заявление онлайн» (акцентная подсветка).

### 3. Hero Section (Главный конверсионный экран)
- **Headline (УТП):** Конкретное ценностное обещание (например: *«Получи востребованную профессию в сфере высоких технологий с дипломом государственного образца»*).
- **Subheadline:** Ключевые факты (Бюджетные места после 9 и 11 классов, практика на ведущих заводах/IT-компаниях, отсрочка от армии, общежитие).
- **Hero CTAs:**
  - Primary: *«Выбрать специальность»* (скролл к интерактивному каталогу).
  - Secondary: *«Приемная комиссия 2026»* или *«День открытых дверей: 15 апреля»*.
- **Live Proof Badges:** 4–5 плашек с метриками:
  - `[350+]` Бюджетных мест в 2026 году
  - `[96%]` Трудоустройство выпускников
  - `[75 лет]` Академических традиций
  - `[40+]` Индустриальных партнеров (предприятий)
- **Visual:** Реальный живой визуал (студенты в лабораториях, за ЧПУ-станками, в IT-воркшопах или на учебной практике).

### 4. Audience Hubs (Быстрые коридоры)
4 карточки мгновенного доступа к популярным сценариям:
1. **Абитуриенту:** Калькулятор среднего балла, правила приема, подача через Госуслуги.
2. **Расписание:** Быстрый поиск расписания по номеру учебной группы или фамилии преподавателя.
3. **Личный кабинет / СДО:** Вход в Moodle, Сферум, электронный журнал.
4. **ФП «Профессионалитет»:** Кластеры, гарантированное трудоустройство, ускоренные сроки.

### 5. Interactive Program Finder (Навигатор специальностей)
Интерактивный блок с фильтрацией на клиенте:
- **Фильтры:**
  - База: `[Все] [После 9 класса] [После 11 класса]`
  - Форма: `[Очная] [Заочная]`
  - Финансирование: `[Есть бюджетные места] [Коммерция]`
  - Направление: `[IT и разработка] [Инженерия и станки] [Экономика] [Сервис]`
- **Карточка специальности:**
  - Код ФГОС (например, `09.02.07`) + Название («Информационные системы и программирование»).
  - Квалификация выпускника («Специалист по информационным системам»).
  - Срок обучения (например, `3 года 10 месяцев`).
  - Метки: `[25 бюджетных мест]`, `[Ср. балл: 4.4]`, `[Общежитие]`.
  - Стартовая зарплата выпускника по региону.
  - Кнопка «Подробнее о программе» и мини-кнопка «Подать заявку».

### 6. Admissions Funnel (5 простых шагов поступления)
Пошаговая визуальная дорожная карта для абитуриента и родителей:
- **Шаг 1:** Выберите специальность и проверьте проходной балл.
- **Шаг 2:** Подготовьте документы (Паспорт, аттестат, СНИЛС, 4 фото 3х4, справка 086/у).
- **Шаг 3:** Подайте заявление (Очно в колледже, через портал «Госуслуги» или в ЛК).
- **Шаг 4:** Отслеживайте позицию в рейтинговом списке (обновление ежедневно).
- **Шаг 5:** Предоставьте оригинал документа об образовании до дедлайна.
- **Интерактив:** Виджет «Калькулятор шансов» (ввод среднего балла аттестата -> подсветка доступных специальностей).

### 7. Trust, Infrastructure & Industry Partners
- **Лицензия и аккредитация:** Номер записи в реестре Рособрнадзора, дата выдачи, кликабельная ссылка на проверку.
- **Материально-техническая база:** Слайдер / сетка мастерских (лаборатории 3D-моделирования, станки ЧПУ, полигоны, общежитие на 400 мест, столовая, спорткомплекс).
- **Партнеры-работодатели:** Сетка логотипов предприятий региона, где студенты проходят оплачиваемую практику и куда распределяются после выпуска.

### 8. Campus Life & Event Stream
- Предстоящие события: «День открытых дверей», «Мастер-класс по робототехнике», «Хакатон колледжа».
- Студенческие объединения: волонтерский центр, спортклуб, студенческий совет, киберспортивная лига.

### 9. Mandatory Compliance Widget (Сведения об образовательной организации)
Плашка быстрого доступа к 14 обязательным подразделам по Приказу Рособрнадзора № 1493:
- Основные сведения | Структура и органы | Документы | Образование | Руководство и педсостав | МТО и оснащенность | Стипендии | Платные услуги | Доступная среда | Вакантные места.

### 10. Institutional Mega-Footer
- Полные юридические реквизиты, ОГРН, ИНН, КПП.
- Адреса учебных корпусов и общежитий на карте / схема проезда.
- Горячая линия директора, телефон приемной комиссии, email.
- Соцсети: официальные сообщества в VK, каналы в Telegram, Rutube.
- Документы: Политика конфиденциальности, Согласие на обработку ПДн, Карта сайта, Версия для слабовидящих.

---

## 4. Visual Language & Academic Trust Design Tokens

### Color Palette (Tailwind Tokens)
```css
:root {
  /* Academic Primary: Authority, Stability, State Trust */
  --color-academic-navy: #0B1F3A;
  --color-academic-blue: #1E3A8A;
  --color-academic-blue-light: #2563EB;

  /* Accent & Badges: Excellence, Achievements, Deadlines */
  --color-accent-amber: #D97706;
  --color-accent-gold: #C5A059;

  /* Functional Status */
  --color-status-success: #15803D; /* Бюджетные места / Зачислен */
  --color-status-warning: #B45309; /* Дедлайн скоро */
  --color-status-neutral: #475569;

  /* Surfaces: Warmth & Contrast (Not sterile white) */
  --color-surface-bg: #F8FAFC;
  --color-surface-card: #FFFFFF;
  --color-surface-alt: #F1F5F9;

  /* Typography Colors */
  --color-text-heading: #0F172A;
  --color-text-body: #334155;
  --color-text-muted: #64748B;
}
```

### Typography Hierarchy
- **Display / Headings (H1, H2):** 
  - *Option A (Modern Polytechnic):* `font-family: 'Plus Jakarta Sans', 'Manrope', sans-serif; font-weight: 700; letter-spacing: -0.02em;`
  - *Option B (Classic Heritage Academy):* `font-family: 'PT Serif', 'Merriweather', serif; font-weight: 700;`
- **Body & Controls:**
  - `font-family: 'Inter', system-ui, sans-serif;`
  - Body text: `16px (1rem)` with `line-height: 1.6` for optimal readability.
- **Numbers & Scores:**
  - Always enable tabular figures: `font-feature-settings: "tnum" 1;` so rankings, GPA scores, and dates align neatly in tables.

---

## 5. Regulatory & Accessibility Specifications (Compliance Checklist)

When building for Russian educational institutions (СПО/ВПО):

1. **Федеральный закон № 273-ФЗ и Приказ Рособрнадзора № 1493:**
   - Специальный раздел `/sveden/` должен быть доступен с главной страницы и из главного меню в 1 клик.
   - Разметка `itemprop` в HTML:
     - `itemprop="fullName"` (Полное наименование)
     - `itemprop="address"` (Адрес места нахождения)
     - `itemprop="priemDoc"` (Документы приемной кампании)
     - `itemprop="eduProgram"` (Образовательные программы)
     - `itemprop="vacant"` (Вакантные места)
2. **Версия для слабовидящих (ГОСТ Р 52872-2019 / WCAG 2.2 AA):**
   - Наличие фиксированной кнопки «Версия для слабовидящих».
   - Режимы контрастности: Черным по белому (стандарт), Белым по черному (инверсия), Синим по голубому.
   - Масштабирование шрифта: 100%, 150%, 200% без ломки верстки.
   - Возможность полного отключения фоновых и иллюстративных изображений.
3. **Безопасность и хранение ПДн (ФЗ-152):**
   - Все формы сбора заявок/обратной связи обязаны содержать чекбокс согласия со ссылкой на Политику обработки ПДн.

---

## 6. Prompt Templates for AI Code Generation

### Program Card Component Prompt
```text
"Create a responsive ProgramCard component for a vocational college in React + Tailwind CSS.
Requirements:
- Props: code (e.g. '09.02.07'), title, qualification, duration, budgetSeats, minGpa, educationBase ('9 классов' | '11 классов'), isCluster (boolean for 'Профессионалитет').
- Badges: Show budgetSeats in green pill, minGpa in amber pill, and 'Профессионалитет' badge if true.
- Layout: Card with white background, slate-200 border, soft hover shadow (hover:shadow-md hover:border-blue-500).
- Action buttons: 'Учебный план' (outline secondary) and 'Подать документы' (solid blue).
- Make sure font tabular numbers are used for GPA and duration."
```

### Admissions Step Funnel Prompt
```text
"Implement a 5-step Admissions Timeline component in Tailwind CSS.
Requirements:
- Steps: 1. Выбор специальности -> 2. Сбор документов -> 3. Подача онлайн/очно -> 4. Конкурс аттестатов -> 5. Зачисление.
- Show active deadline dates for the 2026 admissions season.
- Include a CTA banner underneath: 'Рассчитать шансы поступления' with an interactive slider for high school GPA (3.0 - 5.0)."
```

---

## 7. QA Acceptance Criteria & Verification Checklist

| № | Category | Check Item | Required Standard |
|---|---|---|---|
| 1 | **UX** | Time to find admissions requirements | ≤ 2 clicks from homepage |
| 2 | **UX** | Schedule widget accessibility | Direct group search on homepage or in 1 click |
| 3 | **Legal** | Раздел «Сведения об ОО» | Приказ Рособрнадзора №1493 (14 подразделов) |
| 4 | **A11y** | Режим для слабовидящих | ГОСТ Р 52872-2019 / переключатель работает |
| 5 | **Mobile** | Таблицы списков поступающих | Горизонтальный скролл с фиксацией ФИО/номера |
| 6 | **Speed** | LCP (Largest Contentful Paint) | < 2.2 секунды на 4G соединении |
| 7 | **Trust** | Лицензия и аккредитация | Номер и дата актуальны, ссылка на реестр работает |
| 8 | **Conversion** | Главный CTA «Подать заявление» | Виден на первом экране без скролла на desktop и mobile |
