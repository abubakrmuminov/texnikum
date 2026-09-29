-- =============================================================================
-- МИГРАЦИЯ 1: СХЕМА БАЗЫ ДАННЫХ ОБРАЗОВАТЕЛЬНОГО ПОРТАЛА КОЛЛЕДЖА (СПО)
-- Таблицы: roles, profiles, news_categories, news, departments, teachers,
--          specialties, events, schedule, pages, media, audit_log.
-- =============================================================================

-- Включаем необходимые расширения
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- -----------------------------------------------------------------------------
-- 1. ТАБЛИЦА РОЛЕЙ (roles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE CHECK (name IN ('admin', 'editor', 'moderator')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.roles IS 'Роли пользователей панели управления колледжа';

-- -----------------------------------------------------------------------------
-- 2. ТАБЛИЦА ПРОФИЛЕЙ ПОЛЬЗОВАТЕЛЕЙ (profiles)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.profiles IS 'Профили сотрудников и администраторов, привязанные к auth.users';

-- -----------------------------------------------------------------------------
-- 3. ТАБЛИЦА РУБРИК НОВОСТЕЙ (news_categories)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  color_badge TEXT DEFAULT 'slate' NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.news_categories IS 'Рубрики и категории новостных материалов';

-- -----------------------------------------------------------------------------
-- 4. ТАБЛИЦА ОТДЕЛЕНИЙ / КАФЕДР (departments)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  head_name TEXT,
  description TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.departments IS 'Учебные отделения и кафедры колледжа';

-- -----------------------------------------------------------------------------
-- 5. ТАБЛИЦА ПРЕПОДАВАТЕЛЕЙ (teachers)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  position TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  subjects TEXT[] DEFAULT '{}'::text[] NOT NULL,
  qualification TEXT NOT NULL,
  education TEXT,
  experience_years INTEGER DEFAULT 0 NOT NULL,
  teaching_experience_years INTEGER DEFAULT 0 NOT NULL,
  bio TEXT,
  photo_url TEXT,
  email TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.teachers IS 'Педагогический состав и мастера производственного обучения';

-- -----------------------------------------------------------------------------
-- 6. ТАБЛИЦА СПЕЦИАЛЬНОСТЕЙ И ПРОГРАММ ПОДГОТОВКИ (specialties)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  qualification TEXT NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE SET NULL,
  duration_months INTEGER NOT NULL,
  duration_text TEXT NOT NULL,
  base_education TEXT NOT NULL CHECK (base_education IN ('9_classes', '11_classes', 'both')),
  budget_places INTEGER DEFAULT 0 NOT NULL,
  commercial_places INTEGER DEFAULT 0 NOT NULL,
  cost_per_year NUMERIC(10,2),
  passing_score NUMERIC(4,2),
  description TEXT NOT NULL,
  career_opportunities TEXT,
  cover_image_url TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.specialties IS 'Образовательные программы СПО и специальности колледжа';

-- -----------------------------------------------------------------------------
-- 7. ТАБЛИЦА НОВОСТЕЙ (news)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.news (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  category_id UUID NOT NULL REFERENCES public.news_categories(id) ON DELETE RESTRICT,
  lead_text TEXT NOT NULL,
  content_html TEXT NOT NULL,
  cover_image_url TEXT,
  reading_time_min INTEGER DEFAULT 3 NOT NULL,
  status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'published', 'archived')),
  is_featured BOOLEAN DEFAULT false NOT NULL,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  published_at TIMESTAMPTZ,
  views_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.news IS 'Новости, пресс-релизы и официальные объявления колледжа';

-- -----------------------------------------------------------------------------
-- 8. ТАБЛИЦА СОБЫТИЙ И КАЛЕНДАРЯ МЕРОПРИЯТИЙ (events)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  content_html TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT NOT NULL,
  category TEXT DEFAULT 'general' NOT NULL CHECK (category IN ('open_doors', 'science', 'sports', 'culture', 'general')),
  cover_image_url TEXT,
  is_featured BOOLEAN DEFAULT false NOT NULL,
  is_published BOOLEAN DEFAULT true NOT NULL,
  organizer TEXT,
  registration_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.events IS 'Календарь событий, открытых дверей и студенческих активностей';

-- -----------------------------------------------------------------------------
-- 9. ТАБЛИЦА РАСПИСАНИЯ ЗАНЯТИЙ (schedule)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 1 AND 6),
  lesson_number SMALLINT NOT NULL CHECK (lesson_number BETWEEN 1 AND 7),
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  subject TEXT NOT NULL,
  teacher_id UUID REFERENCES public.teachers(id) ON DELETE SET NULL,
  classroom TEXT NOT NULL,
  parity TEXT DEFAULT 'both' NOT NULL CHECK (parity IN ('both', 'odd', 'even')),
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.schedule IS 'Расписание учебных занятий с фильтрацией по группам и преподавателям';

-- -----------------------------------------------------------------------------
-- 10. ТАБЛИЦА СТАТИЧЕСКИХ И ОБЯЗАТЕЛЬНЫХ СТРАНИЦ (pages)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  section TEXT NOT NULL CHECK (section IN ('sveden', 'about', 'applicants', 'students', 'general')),
  content_html TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true NOT NULL,
  order_index INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.pages IS 'Страницы разделов, включая Сведения об образовательной организации (Рособрнадзор)';

-- -----------------------------------------------------------------------------
-- 11. ТАБЛИЦА МЕДИАФАЙЛОВ И ДОКУМЕНТОВ (media)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_size_bytes BIGINT NOT NULL,
  mime_type TEXT NOT NULL,
  bucket TEXT NOT NULL CHECK (bucket IN ('news-media', 'official-docs')),
  storage_path TEXT NOT NULL UNIQUE,
  public_url TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.media IS 'Журнал загруженных файлов и медиаматериалов в бакетах Supabase Storage';

-- -----------------------------------------------------------------------------
-- 12. ТАБЛИЦА ЖУРНАЛА АУДИТА (audit_log)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE')),
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

COMMENT ON TABLE public.audit_log IS 'Неизменяемый журнал аудита административных действий';

-- -----------------------------------------------------------------------------
-- ТРИГГЕР ДЛЯ АВТОМАТИЧЕСКОГО ОБНОВЛЕНИЯ updated_at
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_departments_updated_at ON public.departments;
CREATE TRIGGER tr_departments_updated_at
  BEFORE UPDATE ON public.departments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_teachers_updated_at ON public.teachers;
CREATE TRIGGER tr_teachers_updated_at
  BEFORE UPDATE ON public.teachers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_specialties_updated_at ON public.specialties;
CREATE TRIGGER tr_specialties_updated_at
  BEFORE UPDATE ON public.specialties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_news_updated_at ON public.news;
CREATE TRIGGER tr_news_updated_at
  BEFORE UPDATE ON public.news
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_events_updated_at ON public.events;
CREATE TRIGGER tr_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_schedule_updated_at ON public.schedule;
CREATE TRIGGER tr_schedule_updated_at
  BEFORE UPDATE ON public.schedule
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS tr_pages_updated_at ON public.pages;
CREATE TRIGGER tr_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- БАКЕТЫ ХРАНИЛИЩА (Supabase Storage Buckets)
-- -----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('news-media', 'news-media', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
  ('official-docs', 'official-docs', true, 52428800, ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
