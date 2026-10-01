# План реализации White-label архитектуры и мастера настройки (WHITELABEL_PLAN.md)

## 1. Концепция и цель
Трансформация сайта техникума в тиражируемое решение (White-label Multi-tenant CMS), готовое к установке в любом профессиональном колледже, техникуме или академическом лицее Республики Узбекистан без изменения исходного кода.

---

## 2. Схема базы данных (Database Schema)

### 2.1. Таблица `institution_settings` (Публичный синглтон)
Ограничение: `CONSTRAINT single_row CHECK (id = 1)` гарантирует ровно одну запись.
- `id`: INTEGER PRIMARY KEY DEFAULT 1
- `name_uz`: VARCHAR(255) NOT NULL DEFAULT '' (Полное название на узбекском)
- `name_ru`: VARCHAR(255) NOT NULL DEFAULT '' (Полное название на русском)
- `short_name_uz`: VARCHAR(100) NOT NULL DEFAULT '' (Краткое наименование UZ)
- `short_name_ru`: VARCHAR(100) NOT NULL DEFAULT '' (Краткое наименование RU)
- `institution_type`: VARCHAR(50) NOT NULL DEFAULT 'texnikum' (texnikum, kollej, litsey, kasb-hunar maktabi)
- `legal_address_uz`: TEXT NOT NULL DEFAULT ''
- `legal_address_ru`: TEXT NOT NULL DEFAULT ''
- `main_phone`: VARCHAR(30) NOT NULL DEFAULT '' (+998...)
- `admission_phone`: VARCHAR(30) NOT NULL DEFAULT ''
- `trust_phone`: VARCHAR(30) NOT NULL DEFAULT ''
- `contact_email`: VARCHAR(100) NOT NULL DEFAULT ''
- `admission_email`: VARCHAR(100) NOT NULL DEFAULT ''
- `website_domain`: VARCHAR(100) NOT NULL DEFAULT ''
- `geo_latitude`: NUMERIC(9, 6) NOT NULL DEFAULT 40.386400 (Широта, диапазон -90..90)
- `geo_longitude`: NUMERIC(9, 6) NOT NULL DEFAULT 71.786400 (Долгота, диапазон -180..180)
- `logo_url`: TEXT NULL (Логотип: PNG, JPG, WEBP)
- `favicon_url`: TEXT NULL (Иконка: PNG, ICO, WEBP)
- `coat_of_arms_url`: TEXT NULL (Герб РУз / эмблема: PNG, JPG, WEBP)
- `brand_primary_color`: VARCHAR(10) NOT NULL DEFAULT '#1e3a8a' (HEX-код цвета)
- `social_telegram`: VARCHAR(255) NULL
- `social_instagram`: VARCHAR(255) NULL
- `social_facebook`: VARCHAR(255) NULL
- `social_youtube`: VARCHAR(255) NULL
- `stir_inn`: VARCHAR(20) NOT NULL DEFAULT '' (СТИР/ИНН, 9 цифр)
- `work_hours_uz`: VARCHAR(150) NOT NULL DEFAULT 'Dushanba – Shanba: 08:30 – 17:30'
- `work_hours_ru`: VARCHAR(150) NOT NULL DEFAULT 'Понедельник – Суббота: 08:30 – 17:30'
- `is_configured`: BOOLEAN NOT NULL DEFAULT false (Флаг завершенности первичной настройки)
- `setup_completed_at`: TIMESTAMPTZ NULL
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())

### 2.2. Таблица `institution_private` (Приватный синглтон)
Ограничение: `CONSTRAINT single_row CHECK (id = 1)`, внешний ключ к `institution_settings(id)`.
- `id`: INTEGER PRIMARY KEY DEFAULT 1
- `bank_name`: VARCHAR(255) NULL (Наименование обслуживающего банка)
- `bank_account`: VARCHAR(50) NULL (Расчетный счет / h/r, 20 знаков)
- `mfo_code`: VARCHAR(10) NULL (МФО банка, 5 цифр)
- `jshshir_pinfl`: VARCHAR(20) NULL (ЖШШИР / ПИНФЛ директора/учреждения, 14 цифр)
- `treasury_account`: VARCHAR(50) NULL (Казначейский лицевой счет)
- `oked_code`: VARCHAR(10) NULL (ОКЭД / IFUT, 5 цифр)
- `director_name_uz`: VARCHAR(255) NULL (ФИО директора на узбекском)
- `director_name_ru`: VARCHAR(255) NULL (ФИО директора на русском)
- `director_phone`: VARCHAR(30) NULL (Прямой/служебный телефон директора)
- `created_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
- `updated_at`: TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())

### 2.3. RLS Политики
- `institution_settings`:
  - `SELECT`: разрешен анонимным (`anon`) и авторизованным (`authenticated`) пользователям.
  - `UPDATE` / `INSERT` / `DELETE`: запрещен напрямую; разрешен только пользователям с ролью `admin` через API.
- `institution_private`:
  - `SELECT`: разрешен только пользователям с ролью `admin` (`public.is_admin(auth.uid())`).
  - `UPDATE` / `INSERT`: разрешен только пользователям с ролью `admin`.

---

## 3. Спецификация API (NestJS REST API)

### 3.1. `GET /public/institution`
- **Доступ**: Публичный (не требует авторизации).
- **Кэширование**: Заголовок `Cache-Control: public, max-age=300, stale-while-revalidate=600`.
- **Возвращает**: Только поля `InstitutionPublicSettings`. Приватные поля не отдаются ни при каких условиях.

### 3.2. `GET /setup/status`
- **Доступ**: Публичный.
- **Поведение**:
  - Пока `is_configured = false`: возвращает `{ configured: false }`.
  - После завершения настройки (`is_configured = true`): возвращает `404 Not Found` (эндпоинты опечатываются навсегда).

### 3.3. `POST /setup/complete`
- **Доступ**: Доступен только при `is_configured = false`.
- **Защита**: Одноразовый мастер-токен `SETUP_TOKEN` из `.env`.
  - Сравнение через `crypto.timingSafeEqual` в константном времени (защита от атак по времени).
  - Строгий Rate Limiting (максимум 5 попыток в минуту).
- **Атомарная операция**:
  - Условный апдейт: `UPDATE institution_settings ... WHERE id = 1 AND is_configured = false`. Если обновлено 0 строк — параллельный запрос уже перехватил установку.
  - Создание первого суперадмина в `auth.users` (Supabase Auth) и привязка роли `admin` в `public.profiles`.
  - Валидация надежности пароля (минимум 8 символов, заглавная, строчная, цифра, спецсимвол).
  - Сохранение публичных и приватных настроек учреждения.
  - Установка `is_configured = true` и `setup_completed_at = now()`.
  - Запись действия в журнал аудита (`audit_log`).
- **После завершения**: Эндпоинт навсегда возвращает `404 Not Found`.

### 3.4. `GET /admin/institution`
- **Доступ**: Только роль `admin` (`@UseGuards(JwtAuthGuard, RolesGuard)`, `@Roles(UserRole.ADMIN)`).
- **Возвращает**: Полный объект `InstitutionFullSettings` (публичные + приватные поля).

### 3.5. `PATCH /admin/institution`
- **Доступ**: Только роль `admin`.
- **Валидация**: `UpdateInstitutionDto` с `class-validator` (проверка форматов телефонов +998, email, hex-цвета, диапазонов координат).
- **Аудит**: Изменения логируются в `audit_log` со снимком до и после.

### 3.6. Валидация медиа-файлов
- Разрешены только форматы `png`, `jpg`, `jpeg`, `webp`.
- Запрет SVG без специализированного санитайзера (защита от Stored XSS).
- Ограничение размера файлов: логотип/герб до 5 МБ, фавикон до 1 МБ.

---

## 4. Двуязычные сообщения об ошибках валидации (UZ / RU)
Все валидаторы DTO снабжены двуязычными подсказками:
- Телефон: `«Telefon raqami +998 (XX) XXX-XX-XX formatida boʻlishi kerak / Номер телефона должен быть в формате +998»`
- Пароль: `«Parol kamida 8 ta belgidan iborat boʻlishi, katta va kichik harflar, raqam va maxsus belgini oʻz ichiga olishi kerak / Пароль должен содержать минимум 8 символов, заглавную и строчную буквы, цифру и специальный символ»`
- Email: `«Elektron pochta manzili toʻgʻri formatda kiritilishi lozim / Введите корректный адрес электронной почты»`
- Координаты: `«Geolokatsiya koordinatalari toʻgʻri oraliqda boʻlishi shart / Координаты геолокации должны находиться в допустимом диапазоне»`
- HEX-цвет: `«Rang kodi #RGB yoki #RRGGBB formatida boʻlishi kerak / Код цвета должен быть в формате #RGB или #RRGGBB»`
