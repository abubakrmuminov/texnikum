---
name: supabase-backend-auth
description: Comprehensive backend skill for Supabase integration, Supabase Auth (регистрация и авторизация пользователей/админов), PostgreSQL database schema (news, events, profiles, categories), Row Level Security (RLS) policies, and Supabase Storage for educational portals.
triggers:
  - supabase
  - супа
  - супарегистрация
  - supabase auth
  - backend news
  - postgres schema
  - бэкенд для новостей
  - база данных новостей
  - rls policies
---

# Supabase Backend & Auth Integration Skill

## 1. Scope & Architecture
Этот скилл регламентирует интеграцию бэкенда на базе **Supabase**:
- **Аутентификация («супарегистрация»)**: Готовая система регистрации и входа пользователей без изобретения собственных JWT/хэширования паролей.
- **Ролевая модель (RBAC)**: Роли пользователей (`admin`, `editor`, `student`, `applicant`) в таблице `profiles`, привязанной к `auth.users`.
- **База данных PostgreSQL**: Схемы таблиц для новостей (`news`), категорий (`categories`), событий (`events`) и документов.
- **Row Level Security (RLS)**: Разграничение прав на уровне БД (гости видят опубликованные новости; админы/редакторы создают, редактируют и удаляют).
- **Supabase Storage**: Бакеты для хранения обложек новостей (`news-media`) и официальных PDF-документов с ЭЦП (`official-docs`).

---

## 2. Архитектура схемы данных (PostgreSQL)

### 2.1. Таблица профилей и ролей (`public.profiles`)
Автоматически связывается с `auth.users` через внешний ключ и триггер при регистрации:
```sql
CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'editor', 'student', 'guest');

CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role user_role DEFAULT 'student'::user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

### 2.2. Таблицы категорий и новостей
```sql
CREATE TABLE public.news_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color_badge TEXT DEFAULT 'blue' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.news (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id INTEGER REFERENCES public.news_categories(id) ON DELETE RESTRICT NOT NULL,
  lead_text TEXT NOT NULL,
  content_html TEXT NOT NULL,
  cover_image_url TEXT,
  reading_time_min INTEGER DEFAULT 3 NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')) NOT NULL,
  is_featured BOOLEAN DEFAULT FALSE NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
```

---

## 3. «Супарегистрация» и Аутентификация (Client Patterns)

Используется официальный клиент `@supabase/supabase-js`.

### 3.1. Регистрация нового пользователя (Sign Up)
```javascript
import { supabase } from './supabaseClient.js';

export async function registerUser({ email, password, fullName }) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        role: 'student' // Дефолтная роль
      }
    }
  });

  if (error) {
    console.error('Ошибка супарегистрации:', error.message);
    throw error;
  }
  return data;
}
```

### 3.2. Вход (Sign In) и получение роли
```javascript
export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) throw error;

  // Запрашиваем профиль для проверки прав
  const { data: profile, error: profileErr } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', data.user.id)
    .single();

  return { session: data.session, user: data.user, profile };
}
```

### 3.3. Проверка прав администратора
```javascript
export async function checkIsAdmin() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin' || profile?.role === 'super_admin';
}
```

---

## 4. Политики безопасности Row Level Security (RLS)

1. **Таблица `profiles`:**
   - Чтение: Любой авторизованный пользователь может читать свой профиль; админы могут читать все.
   - Изменение: Только владелец или супер-админ.
2. **Таблица `news`:**
   - Чтение: Гости (`anon`) и студенты могут читать **только** новости со `status = 'published'`.
   - Создание/Изменение/Удаление: Только пользователи с ролью `admin` или `editor`.

```sql
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;

-- 1. Публичное чтение для всех
CREATE POLICY "Public users can view published news"
ON public.news FOR SELECT
USING (status = 'published');

-- 2. Полный доступ для админов и редакторов
CREATE POLICY "Admins and editors manage news"
ON public.news FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role IN ('super_admin', 'admin', 'editor')
  )
);
```

---

## 5. Загрузка медиа в Supabase Storage

- **Бакет `news-media`** (публичный):
  ```javascript
  export async function uploadNewsCover(file, newsSlug) {
    const ext = file.name.split('.').pop();
    const filePath = `covers/${newsSlug}-${Date.now()}.${ext}`;

    const { data, error } = await supabase.storage
      .from('news-media')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('news-media')
      .getPublicUrl(filePath);

    return publicUrl;
  }
  ```

---

## 6. Чек-лист готовности бэкенда
- [ ] Таблицы и триггеры созданы (скрипт `scripts/schema.sql`).
- [ ] RLS включен на всех публичных таблицах.
- [ ] Публичные бакеты Storage созданы (`news-media`, `official-docs`).
- [ ] Ключи `SUPABASE_URL` и `SUPABASE_ANON_KEY` безопасно настроены в переменных окружения.
