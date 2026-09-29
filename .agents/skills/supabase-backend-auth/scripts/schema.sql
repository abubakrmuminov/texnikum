-- =====================================================================
-- ПОЛНАЯ СХЕМА БАЗЫ ДАННЫХ SUPABASE ДЛЯ САЙТА УЧИЛИЩА / КОЛЛЕДЖА
-- Включает: Профили (RBAC), Новости, Категории, События, Триггеры и RLS
-- =====================================================================

-- 1. ТИПЫ РОЛЕЙ
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'editor', 'student', 'guest');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. ТАБЛИЦА ПРОФИЛЕЙ ПОЛЬЗОВАТЕЛЕЙ (Связана с auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.user_role DEFAULT 'student'::public.user_role NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. АВТОМАТИЧЕСКИЙ ТРИГГЕР НА СУПАРЕГИСТРАЦИЮ (INSERT в auth.users -> INSERT в public.profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Новый пользователь'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'student'::public.user_role)
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ТАБЛИЦА КАТЕГОРИЙ НОВОСТЕЙ
CREATE TABLE IF NOT EXISTS public.news_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  color_badge TEXT DEFAULT 'blue' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Базовые категории училища
INSERT INTO public.news_categories (name, slug, color_badge) VALUES
  ('Студенческая жизнь', 'student-life', 'blue'),
  ('Наука и инновации', 'science', 'purple'),
  ('Официально', 'official', 'slate'),
  ('Спорт и победы', 'sports', 'emerald'),
  ('Абитуриенту', 'admissions', 'amber')
ON CONFLICT (slug) DO NOTHING;

-- 5. ТАБЛИЦА НОВОСТЕЙ
CREATE TABLE IF NOT EXISTS public.news (
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

-- 6. ТАБЛИЦА МЕРОПРИЯТИЙ (КАЛЕНДАРЬ)
CREATE TABLE IF NOT EXISTS public.events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'Общее' NOT NULL,
  max_participants INTEGER,
  registration_open BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) ПОЛИТИКИ
-- =====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Профили: каждый видит свой, админ видит все
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can read and update all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

-- Категории: публичное чтение, админское управление
CREATE POLICY "Public read categories" ON public.news_categories
  FOR SELECT USING (true);

CREATE POLICY "Admin manage categories" ON public.news_categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin'))
  );

-- Новости: чтение опубликованных для всех, админы могут всё
CREATE POLICY "Anyone can read published news" ON public.news
  FOR SELECT USING (status = 'published');

CREATE POLICY "Admins and editors manage all news" ON public.news
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'editor'))
  );

-- События: публичное чтение, админское управление
CREATE POLICY "Anyone can read events" ON public.events
  FOR SELECT USING (true);

CREATE POLICY "Admins manage events" ON public.events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('super_admin', 'admin', 'editor'))
  );

-- =====================================================================
-- STORAGE BUCKETS (Настройка хранилища)
-- =====================================================================
INSERT INTO storage.buckets (id, name, public) 
VALUES ('news-media', 'news-media', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('official-docs', 'official-docs', true)
ON CONFLICT (id) DO NOTHING;
