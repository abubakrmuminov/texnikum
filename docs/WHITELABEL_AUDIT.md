# Аудит хардкода и разделения данных заведения (WHITELABEL_AUDIT.md)

## 1. Введение и цель аудита
Цель аудита — инвентаризация всех захардкоженных параметров образовательного учреждения (Ферганский техникум № 2) в кодовой базе и их классификация на **публичные** (доступные гостям и поисковым системам) и **приватные** (доступные исключительно суперадминистраторам/бухгалтерии колледжа).
Это необходимо для трансформации портала в тиражируемое White-label решение для любых СПО / техникумов / лицеев / колледжей Республики Узбекистан без правок в кодовой базе.

---

## 2. Инвентаризация текущих захардкоженных параметров

| Параметр | Текущее значение в коде | Файлы вхождения | Категория доступа |
| :--- | :--- | :--- | :--- |
| **Полное название (UZ)** | Fargʻona viloyati Fargʻona shahri 2-son texnikumi | `footer.tsx`, `header.tsx`, `ru.json`, `uz.json`, `pages.service.ts` | **PUBLIC** |
| **Полное название (RU)** | Ферганский техникум № 2 | `ru.json`, `uz.json`, `footer.tsx` | **PUBLIC** |
| **Краткое название (UZ)** | 2-son texnikum | `header.tsx`, `login/page.tsx` | **PUBLIC** |
| **Краткое название (RU)** | Техникум № 2 | `header.tsx`, `ru.json` | **PUBLIC** |
| **Тип учреждения** | texnikum (техникум) | `specialties`, `pages`, `messages` | **PUBLIC** |
| **Юридический адрес (UZ)** | 150100, Fargʻona viloyati, Fargʻona sh., Al-Fargʻoniy koʻchasi, 42-uy | `contacts.service.ts`, `api-client.ts`, `pages.service.ts` | **PUBLIC** |
| **Юридический адрес (RU)** | 150100, Ферганская обл., г. Фергана, ул. Аль-Фергани, д. 42 | `contacts.service.ts`, `pages.service.ts` | **PUBLIC** |
| **Основной телефон** | +998 (73) 244-00-00 | `contacts.service.ts`, `footer.tsx`, `messages` | **PUBLIC** |
| **Телефон доверия / горячая линия** | 1006 / +998 (73) 244-00-11 | `footer.tsx`, `contacts.service.ts` | **PUBLIC** |
| **Телефон приемной комиссии** | +998 (73) 244-00-00 | `specialties-feed.tsx`, `contacts.service.ts` | **PUBLIC** |
| **Email для обращений** | info@texnikum2.uz / info@fargona-texnikum2.uz | `contacts`, `footer`, `pages`, `messages` | **PUBLIC** |
| **Email приемной комиссии** | priem@texnikum2.uz | `specialties-feed.tsx` | **PUBLIC** |
| **Официальный домен** | texnikum2.uz | `sitemap.ts`, `robots.ts`, `auth.guard.ts` | **PUBLIC** |
| **Координаты карты** | 40.3864 (lat), 71.7864 (lng) | `contacts-client.tsx`, `contacts.service.ts` | **PUBLIC** |
| **График работы** | Dushanba – Shanba: 08:30 – 17:30 | `footer.tsx`, `contacts.service.ts` | **PUBLIC** |
| **СТИР / ИНН (STIR)** | 302987654 | `supabase/seed.sql`, `pages.service.ts` | **PUBLIC** (ст. 37 ЗРУ-637) |
| **Брендовые цвета** | Синий Tailwind (#1e3a8a / blue-600) | `tailwind.config.ts`, `globals.css` | **PUBLIC** |
| **Логотип / герб / фавикон** | `/images/gerb.webp`, `/favicon.ico` | `header.tsx`, `footer.tsx`, `app/layout.tsx` | **PUBLIC** |
| **Банковские счета и МФО** | Х/р: 23402000300100001010, МФО: 00014 | `pages.service.ts` (info-financial) | **PRIVATE** |
| **ЖШШИР / ПИНФЛ** | 31205851234567 | `pages.service.ts` | **PRIVATE** |
| **Казначейский лицевой счет** | 400110860262667950100075001 | `pages.service.ts` | **PRIVATE** |
| **ОКЭД (IFUT)** | 85320 | `pages.service.ts` | **PRIVATE** |
| **Контакты директора** | ФИО и личный мобильный директора | `administration/page.tsx` | **PRIVATE** |

---

## 3. Выводы архитектурного аудита

1. **Разделение таблиц в базе данных**:
   - `public.institution_settings`: публичная таблица (синглтон, 1 строка). Содержит все поля, необходимые для рендеринга сайта, метатегов SEO, карты OpenStreetMap и шапки/подвала.
   - `public.institution_private`: приватная таблица (синглтон, 1 строка). Содержит финансовые, налоговые и внутренние административные реквизиты.
2. **Безопасность (RLS)**:
   - Анонимные и публичные пользователи могут делать `SELECT` только к `institution_settings` (публичная таблица).
   - Приватная таблица `institution_private` закрыта политиками RLS: `SELECT` и `UPDATE` разрешены только роли `admin`.
3. **Чистая установка (Clean Install)**:
   - Миграции создают пустые таблицы с флагом `is_configured = false`.
   - Никаких демо-данных в миграциях не создается.
   - Демо-данные Ферганского техникума выносятся в отдельный изолированный сид-файл `supabase/seed_demo_institution.sql`.
