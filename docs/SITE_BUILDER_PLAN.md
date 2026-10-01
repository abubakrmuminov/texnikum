# Архитектурный план конструктора сайта и управления структурой (docs/SITE_BUILDER_PLAN.md)

*Версия:* 1.0.0  
*Дата создания:* 01.10.2026  
*Юрисдикция:* Республика Узбекистан (ЗРУ-637, УП-158, ЗРУ-641, ЗРУ-547)  
*Статус:* Phase S0 Planning Document (Архитектурное проектирование без внесения изменений в код)

---

## 1. Введение и цели (Executive Summary)

### 1.1. Проблема
В текущей кодовой базе структура публичного сайта, пункты шапки (`header.tsx`), ссылки подвала (`footer.tsx`), перечень 12 уставных разделов ст. 37 ЗРУ-637 (`info/page.tsx`), а также порядок их следования жестко закодированы в TypeScript-файлах. При тиражировании платформы (White-Label) для различных техникумов, колледжей и лицеев Узбекистана администраторы лишены возможности:
1. Скрыть или переименовать пункт меню (например, изменить название раздела или скрыть модуль мероприятий, если учреждение их пока не ведет);
2. Изменить порядок следования разделов в навигации шапки и подвала;
3. Создать новую произвольную страницу (например, «Ассоциация выпускников», «Кружки и секции», «Партнерство с предприятиями») без привлечения разработчиков;
4. Собрать посадочную страницу из готовых адаптивных и доступных (WCAG 2.1 AA) блоков;
5. Выбрать визуальную тему оформления (пресет) из панели управления.

### 1.2. Цель решения
Предоставить администратору образовательного учреждения полный визуальный контроль над структурой, навигацией, контентом и оформлением портала через веб-интерфейс панели управления `/admin`, сохранив при этом 100% соответствие законодательству Республики Узбекистан, стандарту цифровой доступности WCAG 2.1 AA и защиту от случайного удаления юридически обязательных данных.

---

## 2. Анализ текущего состояния (Current State Audit)

### 2.1. Где элементы навигации и структуры определены сегодня
1. **Шапка сайта (`apps/web/src/components/layout/header.tsx`)**:
   - Массив `navMenuItems` (строки 63–311): жестко зафиксированы 7 основных пунктов (`home`, `info`, `specialties`, `administration`, `teachers`, `news`, `contacts`) и их выпадающие подпункты (`children`).
   - Иконки Lucide (`BookOpen`, `Info`, `GraduationCap`, `Users`, `Newspaper`, `Phone`, `Compass`, `FileText` и др.) жестко сопоставлены в коде.
   - Мобильное меню (`mobileNavOpen`, строки 400–560) дублирует ту же статическую структуру.
2. **Подвал сайта (`apps/web/src/components/layout/footer.tsx`)**:
   - Колонка 2 («Rasmiy maʼlumotlar / Обязательные разделы ст. 37»): жесткие ссылки на `/info/info-common`, `/info/info-struct`, `/info/info-documents`, `/info/info-environment`, `/administration`.
   - Колонка 3 («Abituriyentlar va talabalarga / Студентам и абитуриентам»): жесткие ссылки на `/specialties`, `/events`, `/teachers`, `/news`, `/settings`.
3. **Реестр обязательных сведений ст. 37 ЗРУ-637 (`apps/web/src/app/info/page.tsx`)**:
   - Массив `INFO_SECTIONS` (строки 28–103): 12 уставных разделов с фиксированными слагами, иконками и описаниями.
   - Страница `/info/[slug]/page.tsx`: имеет локальный массив `INFO_SECTIONS_FALLBACK` (строки 28–106).
4. **Локализация "Tuzilma va boshqaruv"**:
   - `header.tsx`: строки 87–88 (`labelUz: 'Tuzilma va boshqaruv'`, `labelRu: 'Структура и органы управления'`).
   - `footer.tsx`: строка 69 (`Tuzilma va boshqaruv organlari`).
   - `info/page.tsx`: строки 36–40 (`slug: 'info-struct'`, `title: 'Tuzilma va boshqaruv organlari'`).
   - `pages.service.ts`: строки 27–38 (`slug: 'info-struct'`, `title: 'Tuzilma va boshqaruv (Структура и управление)'`).
   - Миграции: `supabase/migrations/20260929000005_uzbekistan_adaptation.sql` (строки 38–48, ID `40000000-0000-0000-0000-000000000002`).
   - База данных `pages`: хранит запись `info-struct`, но связь с меню только по совпадению текстового слага.

### 2.2. Законодательные требования (docs/UZ_COMPLIANCE.md)
Согласно **Статье 37 Закона РУз «Об образовании» № ЗРУ-637** и **Указу Президента РУз № УП-6247**, статус обязательных (**VERIFIED**) имеют следующие 12 разделов:
1. `info-common`: Asosiy maʼlumotlar (Основные сведения об организации)
2. `info-struct`: Tuzilma va boshqaruv organlari (Структура и органы управления)
3. `info-documents`: Ustav va meʼyoriy hujjatlar (Устав и нормативно-правовые документы)
4. `info-languages`: Taʼlim tillari (Языки обучения)
5. `info-education`: Taʼlim dasturlari va standartlari (Образовательные программы и стандарты)
6. `info-leadership`: Rahbariyat va pedagogik tarkib (Руководство и педагогический состав)
7. `info-material`: Moddiy-texnik taʼminot (Материально-техническое обеспечение)
8. `info-dormitory`: Yotoqxona / Talabalar turar joyi (Общежитие и условия проживания)
9. `info-grants`: Stipendiyalar va ijtimoiy yordam (Стипендии и социальная поддержка)
10. `info-rating`: Reyting va sifat monitoringi (Рейтинг и мониторинг качества)
11. `info-science`: Ilmiy va innovatsion faoliyat (Научная и инновационная деятельность)
12. `info-vacant`: Qabul komissiyasi va boʻsh oʻrinlar (Приемная комиссия и вакантные места)

*Правовое правило конструктора:* Данные 12 разделов помечаются флагом `is_required = true`. Их физическое удаление (`DELETE`) блокируется на уровне схемы БД и бизнес-логики API. Попытка деактивации (`is_visible = false`) сопровождается предупреждающим модальным окном с выдержкой из ст. 37 ЗРУ-637.

---

## 3. Модель данных (Database Schema & TypeScript Models)

Все новые таблицы создаются в отдельной миграции `supabase/migrations/20261001000001_site_builder.sql`. Существующие миграции остаются неизменными.

### 3.1. Таблица `navigation_items` (Пункты навигации)
Хранит иерархическое меню для шапки и подвала.

```sql
CREATE TYPE navigation_menu_location AS ENUM (
  'header',
  'footer_regulatory',
  'footer_students',
  'footer_custom'
);

CREATE TYPE navigation_target_type AS ENUM (
  'internal_page',
  'module',
  'custom_url'
);

CREATE TABLE public.navigation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NULL REFERENCES public.navigation_items(id) ON DELETE CASCADE,
  location navigation_menu_location NOT NULL DEFAULT 'header',
  label_uz VARCHAR(255) NOT NULL,
  label_ru VARCHAR(255) NOT NULL,
  target_type navigation_target_type NOT NULL DEFAULT 'internal_page',
  path VARCHAR(255) NOT NULL,
  page_id UUID NULL REFERENCES public.pages(id) ON DELETE SET NULL,
  icon_name VARCHAR(50) NULL,
  badge_text_uz VARCHAR(50) NULL,
  badge_text_ru VARCHAR(50) NULL,
  open_in_new_tab BOOLEAN NOT NULL DEFAULT false,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_system BOOLEAN NOT NULL DEFAULT false,
  is_required BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_nav_location_sort ON public.navigation_items(location, sort_order) WHERE deleted_at IS NULL;
CREATE INDEX idx_nav_parent_id ON public.navigation_items(parent_id);
```

### 3.2. Расширение таблицы `pages` (Страницы)
Модифицируем существующую таблицу `pages` (добавляем двуязычные заголовки, тип страницы, флаги уставных требований и метаданные):

```sql
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS title_uz VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS title_ru VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS page_type VARCHAR(50) NOT NULL DEFAULT 'custom', -- 'statutory', 'custom', 'module_landing'
  ADD COLUMN IF NOT EXISTS is_system BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_required BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT NULL,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ NULL;

-- Заполняем title_uz и title_ru из существующего поля title для обратной совместимости
UPDATE public.pages SET title_uz = title WHERE title_uz IS NULL;
UPDATE public.pages SET title_ru = title WHERE title_ru IS NULL;
```

### 3.3. Таблица `page_blocks` (Контентные блоки страниц)
Хранит модульные секции страниц с валидированным JSON-контентом.

```sql
CREATE TYPE page_block_type AS ENUM (
  'hero',
  'rich_text',
  'media_gallery',
  'document_list',
  'feature_cards',
  'accordion_faq',
  'contact_card',
  'stats_counter'
);

CREATE TABLE public.page_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  block_type page_block_type NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_page_blocks_page_sort ON public.page_blocks(page_id, sort_order);
```

### 3.4. Таблица `page_revisions` (История версий страниц)
Позволяет откатить любое неудачное редактирование страницы администратором.

```sql
CREATE TABLE public.page_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id),
  change_summary VARCHAR(255) NULL,
  snapshot JSONB NOT NULL, -- полный слепок страницы и всех ее блоков
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_page_revisions_page ON public.page_revisions(page_id, created_at DESC);
```

### 3.5. Таблица `page_slug_redirects` (301-редиректы при смене адреса)
Гарантирует сохранение SEO-индексации и отсутствие битых внешних ссылок при переименовании слага.

```sql
CREATE TABLE public.page_slug_redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  old_slug VARCHAR(150) NOT NULL UNIQUE,
  new_slug VARCHAR(150) NOT NULL,
  status_code INTEGER NOT NULL DEFAULT 301,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_slug_redirects_old ON public.page_slug_redirects(old_slug);
```

### 3.6. Оформление и темы (Theme Presets) в `institution_settings`
Добавляем в существующую таблицу `institution_settings` поле пресета оформления:

```sql
ALTER TABLE public.institution_settings
  ADD COLUMN IF NOT EXISTS theme_preset VARCHAR(50) NOT NULL DEFAULT 'classic_academic',
  ADD COLUMN IF NOT EXISTS font_family VARCHAR(50) NOT NULL DEFAULT 'inter',
  ADD COLUMN IF NOT EXISTS border_radius_mode VARCHAR(20) NOT NULL DEFAULT 'rounded';
```

---

## 4. Правила и бизнес-логика (Business Rules & Lifecycle)

### 4.1. Разделение сущностей: Системные (`is_system`) vs Пользовательские (`custom`)
- **Системные разделы и модули (`is_system = true`)**:
  - Создаются базовыми миграциями платформы (`/news`, `/events`, `/specialties`, `/teachers`, `/administration`, `/contacts`, `/info/*`).
  - Не могут быть физически удалены из базы.
  - Могут быть переименованы (на узбекском и русском языках).
  - Могут быть перемещены в структуре меню (изменение `sort_order` и `parent_id`).
  - Могут быть скрыты из публичной видимости (`is_visible = false`), за исключением законодательно обязательных.
- **Пользовательские разделы (`is_system = false`)**:
  - Создаются администратором в панели управления.
  - Могут редактироваться, переименовываться, перемещаться, удаляться в корзину (Soft Delete) и восстанавливаться.

### 4.2. Обязательные разделы: Защита ст. 37 ЗРУ-637 (`is_required`)
- 12 обязательных разделов техникума имеют флаг `is_required = true`.
- Попытка выполнить `DELETE` на эндпоинтах API возвращает `403 Forbidden` с сообщением:
  *«Ushbu boʻlim Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni 37-moddasiga muvofiq majburiy hisoblanadi va oʻchirilishi mumkin emas / Данный раздел является обязательным согласно ст. 37 Закона РУз «Об образовании» и не подлежит удалению»*.
- При попытке скрыть обязательный раздел из меню (`is_visible: false`) администратор видит модальное окно подтверждения с правовым предупреждением о нарушении требований открытости государственных органов (УП-6247).

### 4.3. Мягкое удаление (Soft Delete) и возврат к заводским настройкам (Restore Defaults)
- Все операции удаления пунктов меню и страниц устанавливают `deleted_at = now()`.
- В админке доступен экран «Arxiv / Savat» (Корзина), где администратор может восстановить любой элемент в один клик.
- Кнопка **«Boshlangʻich navigatsiyani tiklash / Восстановить меню по умолчанию»**: восстанавливает заводское дерево меню со всеми 12 уставными разделами и стандартными модулями, переводя пользовательские ссылки в статус черновика.

### 4.4. Валидация слагов и автоматические 301-редиректы
1. **Формат слага**: строго `^[a-z0-9]+(-[a-z0-9]+)*$` (kebab-case, длина 3–100 символов).
2. **Зарезервированные пути (Reserved Slugs)**: запрещено создавать страницы со слагами:
   `admin`, `api`, `setup`, `login`, `logout`, `_next`, `public`, `media`, `static`, `sitemap`, `robots`, `news`, `events`, `teachers`, `specialties`, `administration`, `contacts`, `info`, `settings`.
3. **Обработка смены слага**:
   - При изменении слага страницы `old-page` на `new-page`, API автоматически создает запись в `page_slug_redirects` (`old_slug = 'old-page'`, `new_slug = 'new-page'`).
   - Серверный роут в Next.js проверяет таблицу редиректов и при совпадении отдает постоянный HTTP-редирект `301 Moved Permanently`.
   - Защита от циклических редиректов: перед созданием записи проверяется отсутствие обратной цепочки.

---

## 5. Библиотека контентных блоков V1 (Block Library & JSON Schemas)

Каждый блок на странице сохраняется в таблице `page_blocks` с полем `config: JSONB`. Ниже представлены строгие схемы для 8 обязательных блоков первой версии:

### 5.1. Блок `hero` (Главный экран страницы)
```typescript
interface HeroBlockConfig {
  badgeUz?: string;
  badgeRu?: string;
  titleUz: string;
  titleRu: string;
  subtitleUz?: string;
  subtitleRu?: string;
  backgroundStyle: 'gradient' | 'image' | 'solid_primary' | 'subtle_card';
  backgroundImageUrl?: string;
  overlayOpacity?: number; // 0..100
  align: 'left' | 'center';
  primaryButton?: {
    textUz: string;
    textRu: string;
    url: string;
    openInNewTab?: boolean;
  };
  secondaryButton?: {
    textUz: string;
    textRu: string;
    url: string;
  };
}
```

### 5.2. Блок `rich_text` (Форматированный академический текст)
Использует существующий WYSIWYG-редактор `apps/web/src/components/admin/wysiwyg-editor.tsx`.
```typescript
interface RichTextBlockConfig {
  contentUzHtml: string;
  contentRuHtml: string;
  containerWidth: 'prose' | 'wide' | 'full'; // 'prose' (65ch) для удобного чтения
  showBorder?: boolean;
}
```

### 5.3. Блок `media_gallery` (Медиагалерея и фотоотчеты)
```typescript
interface MediaGalleryItem {
  id: string;
  imageUrl: string;
  captionUz?: string;
  captionRu?: string;
  altTextUz: string;
  altTextRu: string;
}

interface MediaGalleryBlockConfig {
  titleUz?: string;
  titleRu?: string;
  layout: 'grid_3' | 'grid_4' | 'carousel' | 'masonry';
  aspectRatio: '16:9' | '4:3' | '1:1';
  enableLightbox: boolean;
  items: MediaGalleryItem[];
}
```

### 5.4. Блок `document_list` (Официальные документы и файлы для скачивания)
Необходим для публикации положений, лицензий и учебных планов согласно ст. 37 ЗРУ-637.
```typescript
interface DocumentItem {
  id: string;
  titleUz: string;
  titleRu: string;
  documentNumber?: string;
  issueDate?: string; // YYYY-MM-DD
  fileUrl: string;
  fileSizeBytes: number;
  fileFormat: 'pdf' | 'doc' | 'docx' | 'xls' | 'xlsx' | 'zip';
}

interface DocumentListBlockConfig {
  titleUz?: string;
  titleRu?: string;
  descriptionUz?: string;
  descriptionRu?: string;
  documents: DocumentItem[];
}
```

### 5.5. Блок `feature_cards` (Сетка карточек преимуществ / направлений)
```typescript
interface FeatureCardItem {
  id: string;
  iconName: string; // Lucide icon
  titleUz: string;
  titleRu: string;
  descriptionUz: string;
  descriptionRu: string;
  linkUrl?: string;
  badgeUz?: string;
  badgeRu?: string;
}

interface FeatureCardsBlockConfig {
  titleUz?: string;
  titleRu?: string;
  columns: 2 | 3 | 4;
  cards: FeatureCardItem[];
}
```

### 5.6. Блок `accordion_faq` (Часто задаваемые вопросы / Раскрывающийся аккордеон)
Соответствует стандарту доступности WCAG 2.1 AA (клавиатурная навигация, WAI-ARIA атрибуты `aria-expanded`, `aria-controls`).
```typescript
interface AccordionItem {
  id: string;
  questionUz: string;
  questionRu: string;
  answerUzHtml: string;
  answerRuHtml: string;
}

interface AccordionBlockConfig {
  titleUz?: string;
  titleRu?: string;
  allowMultipleOpen: boolean;
  items: AccordionItem[];
}
```

### 5.7. Блок `contact_card` (Контакты подразделения и карта)
```typescript
interface ContactCardBlockConfig {
  titleUz?: string;
  titleRu?: string;
  departmentNameUz?: string;
  departmentNameRu?: string;
  addressUz?: string;
  addressRu?: string;
  phone?: string;
  email?: string;
  workHoursUz?: string;
  workHoursRu?: string;
  showMap: boolean;
  geoLatitude?: number;
  geoLongitude?: number;
}
```

### 5.8. Блок `stats_counter` (Ключевые показатели техникума в цифрах)
```typescript
interface StatItem {
  id: string;
  numberValue: string; // "1200+", "94%", "28"
  labelUz: string;
  labelRu: string;
  iconName?: string;
}

interface StatsCounterBlockConfig {
  titleUz?: string;
  titleRu?: string;
  items: StatItem[];
}
```

---

## 6. Безопасность и ролевая модель (Security, Permissions & Sanitization)

### 6.1. Санитизация контента и запрет вредоносных вставок
1. **Полный запрет исполняемого кода**: любые теги `<script>`, `<style>`, `<iframe>` с произвольных доменов, `<object>`, `<embed>`, `<form>` и инлайн-обработчики событий (`onload`, `onerror`, `onclick`, `onmouseover`) физически вырезаются на этапе валидации DTO в `apps/api`.
2. **Белый список встраиваемого контента (Safe Embed Allowlist)**:
   - Видеохостинги: `https://www.youtube.com/embed/*`, `https://player.vimeo.com/*`.
   - Государственные гео- и медиа-сервисы РУз: OpenStreetMap iframe (`https://www.openstreetmap.org/export/embed.html*`).
   - Ссылки проверяются на соответствие схеме `https://` (запрещены `javascript:`, `data:text/html`).
3. **Библиотека санитизации**: использование промышленного санитайзера `sanitize-html` с жесткой конфигурацией допустимых тегов (`h2`, `h3`, `h4`, `p`, `ul`, `ol`, `li`, `strong`, `em`, `a`, `img`, `table`, `thead`, `tbody`, `tr`, `th`, `td`, `blockquote`, `hr`, `span`).

### 6.2. Ролевая модель доступа (RBAC)
- **Суперадминистратор (`UserRole.ADMIN`)**:
  - Полный доступ к структуре навигации (создание, скрытие, перемещение, удаление пунктов меню).
  - Смена тем оформления (пресетов).
  - Создание и публикация любых страниц.
  - Восстановление заводских настроек меню.
- **Редактор (`UserRole.EDITOR`)**:
  - Создание и редактирование контента страниц и блоков.
  - Редактирование текстов существующих страниц.
  - Запрет на удаление системных пунктов навигации и смену глобального пресета оформления сайта.
- **Модератор (`UserRole.MODERATOR`)**:
  - Только предпросмотр черновиков страниц (Preview Mode).

### 6.3. Row Level Security (RLS) в Supabase
- Публичный доступ (`anon`, `authenticated`):
  - `SELECT` из `navigation_items` только где `is_visible = true AND deleted_at IS NULL`.
  - `SELECT` из `pages` только где `is_published = true AND deleted_at IS NULL`.
  - `SELECT` из `page_blocks` только для опубликованных видимых страниц.
- Доступ на запись (`INSERT`, `UPDATE`, `DELETE`):
  - Разрешен только через защищенный NestJS REST API с проверкой токена администратора/редактора. Прямая запись из браузера через анонимный Supabase ключ заблокирована политиками RLS.

### 6.4. Журнал аудита (`audit_log`)
Все действия с конструктором сайта регистрируются в таблице `audit_log`:
- Добавление, изменение, переупорядочивание и удаление пунктов навигации;
- Публикация, обновление блоков и архивация страниц;
- Смена пресета темы оформления;
- Снимки до и после (`oldValues`, `newValues`) фиксируются в формате JSON для расследования инцидентов.

---

## 7. Темы оформления и дизайн-пресеты (Theme Presets)

В панель управления `/admin/settings/theme` выносится выбор из 5 академических пресетов оформления, гармонирующих с фирменным цветом техникума:

1. **Classic Academic (Классический академический — по умолчанию)**:
   - Строгие прямые линии, сбалансированные отступы, шрифт `Inter`, элегантные рамки карточек, традиционный двухколоночный контент.
2. **Modern Tech (Современный цифровой техникум)**:
   - Мягкие скругления (`rounded-xl`), акцентные фоновые плашки, бейджи в стиле bento-сетки, технологичные иконки, компактная плотность.
3. **Emerald Oasis (Национальный изумрудный)**:
   - Традиционные глубокие бирюзовые и изумрудные тона, гармонирующие с государственной символикой РУз, теплый фон карточек, увеличенные заголовки.
4. **Traditional Navy (Университетский темно-синий)**:
   - Авторитетный темно-синий стиль, классические разделители, солидная академическая верстка документов.
5. **Clean Slate (Минималистичный)**:
   - Максимум «воздуха», ультра-тонкие границы, акцент на типографике и легкой читаемости материалов.

*Совместимость с доступностью:* Режимы для слабовидящих (`contrast-bw`, `contrast-wb`, `contrast-blue` и др.) имеют абсолютный приоритет над пресетами оформления. При включении панели доступности все кастомные стили пресета временно отключаются.

---

## 8. Оценка библиотек для сортировки и Drag-and-Drop

Для управления порядком следования пунктов навигации и блоков страниц требуется удобный инструмент сортировки:

### Вариант 1: `@dnd-kit/core` + `@dnd-kit/sortable` (Рекомендуется)
- **Официальный сайт:** [https://dndkit.com](https://dndkit.com)
- **Лицензия:** MIT
- **Поддержка и сообщество:** Высокая активность, отраслевой стандарт для современных приложений Next.js и React 18+.
- **Доступность (a11y):** Лучшая в классе поддержка доступности. Включает нативную навигацию с клавиатуры (пробел для захвата, стрелки для перемещения, Enter для фиксации) и автоматические экранные оповещения для скринридеров (`ScreenReaderInstructions`).
- **Размер бандла:** Легковесный, модульный (~12 КБ в gzip).

### Вариант 2: Доступное управление без сторонних библиотек (Native Accessible Reordering)
- Кнопки перемещения «Вверх» (`ArrowUp`) и «Вниз» (`ArrowDown`) рядом с каждым элементом в таблице/списке + поле прямого ввода порядкового номера (`order_index`).
- **Плюсы:** 0 новых библиотек в `package.json`, 100% стабильность на мобильных устройствах, нулевой вес.
- **Минусы:** Менее зрелищно при демонстрации заказчикам.

*Решение:* Реализовать гибридный подход — подключить `@dnd-kit` для плавного Drag & Drop в десктопной админке и продублировать его кнопками «Вверх/Вниз» для безупречной доступности по стандарту WCAG 2.1 AA.

---

## 9. Интеграция с существующей экосистемой платформы

1. **White-Label настройки (`institution_settings`)**:
   - Название заведения (`nameUz`, `nameRu`), логотип, герб и фирменный цвет (`brand_primary_color`) автоматически применяются к шапке, футеру и контентным блокам (`hero`, `contact_card`).
2. **Мультиязычность (`next-intl`)**:
   - Все поля навигации и блоков имеют параллельные поля `uz` и `ru`.
   - В публичной части при переключении языка в шапке контент переключается мгновенно без перезагрузки страниц.
3. **SEO, Sitemap и Open Graph**:
   - Файл `apps/web/src/app/sitemap.ts` автоматически опрашивает API и включает все опубликованные страницы из таблицы `pages` с динамическими адресами.
   - Мета-теги Open Graph генерируются автоматически на основе полей `meta_title`, `meta_description` и `og_image_url`.
4. **Тур онбординга (Onboarding Tour)**:
   - В `apps/web/src/lib/onboarding-data.ts` добавляются шаги для новых разделов:
     - `/admin/navigation` — обучение управлению меню шапки и подвала;
     - `/admin/pages` — обучение созданию и сборке страниц из блоков;
     - `/admin/settings/theme` — выбор пресета темы оформления.

---

## 10. План миграции данных (Data Migration & Upgrade Strategy)

### 10.1. Миграция на существующей установке (Upgrade Migration)
1. Выполняется скрипт миграции базы данных `20261001000001_site_builder.sql`.
2. Создаются таблицы `navigation_items`, `page_blocks`, `page_revisions`, `page_slug_redirects`.
3. Скрипт миграции извлекает все ранее захардкоженные пункты меню из `header.tsx` и `footer.tsx` и преобразует их в записи таблицы `navigation_items` со статусом `is_system = true`.
4. Для 12 уставных разделов ст. 37 ЗРУ-637 обновляются атрибуты `is_system = true`, `is_required = true`, `page_type = 'statutory'`.
5. Текстовое содержимое `content_html` существующих страниц автоматически мигрирует в первый блок типа `rich_text` в таблице `page_blocks`.

### 10.2. Чистая установка для нового техникума (Zero-Content Fresh Install)
1. При первой установке (`is_configured = false`) миграция создает стандартный каркас навигации (шапка, подвал, 12 обязательных разделов с пустыми шаблонами).
2. Демонстрационный контент и новости отсутствуют.
3. После прохождения мастера первичной настройки `/setup` техникум получает рабочую структуру сайта с заполненными реквизитами, готовую к наполнению через конструктор.

---

## 11. Поэтапный план реализации (Implementation Phases)

- **Phase S0 (Текущая):** Архитектурный план и согласование ключевых проектных решений. Без изменений в кодовой базе.
- **Phase S1 (База данных и REST API конструктора):** Создание миграции, DTO с валидацией, сервисов и контроллеров `NavigationModule`, `PageBuilderModule`, `ThemeModule` в `apps/api`.
- **Phase S2 (Административный интерфейс управления навигацией и темами):** Разработка разделов `/admin/navigation` (сортировка меню, древовидная структура) и `/admin/settings/theme`.
- **Phase S3 (Визуальный редактор страниц из блоков):** Разработка блочного конструктора в `/admin/pages/[id]/builder` с предпросмотром, историей ревизий и интеграцией WYSIWYG.
- **Phase S4 (Подключение публичной части и переключение с хардкода на динамику):** Интеграция динамической навигации в `header.tsx`, `footer.tsx`, рендеринг блоков на публичных страницах `/info/[slug]` и `/[slug]`, генерация sitemap и редиректы 301.
- **Phase S5 (Верификация и полировка):** Сквозное тестирование сценариев создания страниц, проверка доступности WCAG 2.1 AA, линтинг, тесты и сборка монорепозитория.
