-- =============================================================================
-- FULL SETUP SCRIPT FOR SUPABASE CLOUD (FARGʻONA 2-SON TEXNIKUMI)
-- Run this script in Supabase Dashboard -> SQL Editor
-- =============================================================================


-- >>> File: supabase/migrations/20260929000001_create_schema.sql <<<

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


-- >>> File: supabase/migrations/20260929000002_rls_policies.sql <<<

-- =============================================================================
-- МИГРАЦИЯ 2: ROW LEVEL SECURITY (RLS) ПОЛИТИКИ И ФУНКЦИИ БЕЗОПАСНОСТИ
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ВСПОМОГАТЕЛЬНЫЕ SECURITY DEFINER ФУНКЦИИ ДЛЯ RLS
-- -----------------------------------------------------------------------------

-- Получение роли текущего пользователя
CREATE OR REPLACE FUNCTION public.get_user_role(check_user_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT r.name
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = check_user_id AND p.is_active = true;
$$;

-- Проверка роли: Администратор
CREATE OR REPLACE FUNCTION public.is_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = check_user_id
      AND p.is_active = true
      AND r.name = 'admin'
  );
$$;

-- Проверка роли: Администратор или Редактор
CREATE OR REPLACE FUNCTION public.is_admin_or_editor(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = check_user_id
      AND p.is_active = true
      AND r.name IN ('admin', 'editor')
  );
$$;

-- Проверка роли: Любой сотрудник с доступом в панель управления
CREATE OR REPLACE FUNCTION public.is_staff(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = check_user_id
      AND p.is_active = true
      AND r.name IN ('admin', 'editor', 'moderator')
  );
$$;

-- -----------------------------------------------------------------------------
-- ВКЛЮЧЕНИЕ ROW LEVEL SECURITY НА ВСЕХ ТАБЛИЦАХ
-- -----------------------------------------------------------------------------
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- 1. ПОЛИТИКИ: roles
-- -----------------------------------------------------------------------------
CREATE POLICY "roles_select_policy" ON public.roles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "roles_admin_insert_policy" ON public.roles
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin((SELECT auth.uid()))));

CREATE POLICY "roles_admin_update_policy" ON public.roles
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin((SELECT auth.uid()))));

CREATE POLICY "roles_admin_delete_policy" ON public.roles
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 2. ПОЛИТИКИ: profiles
-- -----------------------------------------------------------------------------
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "profiles_update_self_or_admin" ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT auth.uid()) = id
    OR (SELECT public.is_admin((SELECT auth.uid())))
  )
  WITH CHECK (
    (SELECT auth.uid()) = id
    OR (SELECT public.is_admin((SELECT auth.uid())))
  );

CREATE POLICY "profiles_admin_insert" ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT public.is_admin((SELECT auth.uid())))
    OR (SELECT auth.uid()) = id
  );

CREATE POLICY "profiles_admin_delete" ON public.profiles
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 3. ПОЛИТИКИ: news_categories
-- -----------------------------------------------------------------------------
CREATE POLICY "categories_select_policy" ON public.news_categories
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "categories_editor_insert" ON public.news_categories
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "categories_editor_update" ON public.news_categories
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin_or_editor((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "categories_admin_delete" ON public.news_categories
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 4. ПОЛИТИКИ: departments
-- -----------------------------------------------------------------------------
CREATE POLICY "departments_select_policy" ON public.departments
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "departments_admin_all" ON public.departments
  FOR ALL
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 5. ПОЛИТИКИ: teachers
-- -----------------------------------------------------------------------------
CREATE POLICY "teachers_select_policy" ON public.teachers
  FOR SELECT
  TO public
  USING (
    is_active = true
    OR (SELECT public.is_staff((SELECT auth.uid())))
  );

CREATE POLICY "teachers_editor_insert" ON public.teachers
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "teachers_editor_update" ON public.teachers
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin_or_editor((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "teachers_admin_delete" ON public.teachers
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 6. ПОЛИТИКИ: specialties
-- -----------------------------------------------------------------------------
CREATE POLICY "specialties_select_policy" ON public.specialties
  FOR SELECT
  TO public
  USING (
    is_active = true
    OR (SELECT public.is_staff((SELECT auth.uid())))
  );

CREATE POLICY "specialties_editor_insert" ON public.specialties
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "specialties_editor_update" ON public.specialties
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin_or_editor((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "specialties_admin_delete" ON public.specialties
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 7. ПОЛИТИКИ: news
-- -----------------------------------------------------------------------------
CREATE POLICY "news_select_public_or_staff" ON public.news
  FOR SELECT
  TO public
  USING (
    (
      status = 'published'
      AND (published_at IS NULL OR published_at <= timezone('utc'::text, now()))
    )
    OR (SELECT public.is_staff((SELECT auth.uid())))
  );

CREATE POLICY "news_insert_editor" ON public.news
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "news_update_editor_or_author" ON public.news
  FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_admin_or_editor((SELECT auth.uid())))
    OR (
      (SELECT auth.uid()) = author_id
      AND status = 'draft'
    )
  )
  WITH CHECK (
    (SELECT public.is_admin_or_editor((SELECT auth.uid())))
    OR (
      (SELECT auth.uid()) = author_id
      AND status = 'draft'
    )
  );

CREATE POLICY "news_delete_admin" ON public.news
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 8. ПОЛИТИКИ: events
-- -----------------------------------------------------------------------------
CREATE POLICY "events_select_policy" ON public.events
  FOR SELECT
  TO public
  USING (
    is_published = true
    OR (SELECT public.is_staff((SELECT auth.uid())))
  );

CREATE POLICY "events_editor_insert" ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "events_editor_update" ON public.events
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin_or_editor((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "events_admin_delete" ON public.events
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 9. ПОЛИТИКИ: schedule
-- -----------------------------------------------------------------------------
CREATE POLICY "schedule_select_policy" ON public.schedule
  FOR SELECT
  TO public
  USING (
    is_active = true
    OR (SELECT public.is_staff((SELECT auth.uid())))
  );

CREATE POLICY "schedule_editor_insert" ON public.schedule
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "schedule_editor_update" ON public.schedule
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin_or_editor((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "schedule_admin_delete" ON public.schedule
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 10. ПОЛИТИКИ: pages
-- -----------------------------------------------------------------------------
CREATE POLICY "pages_select_policy" ON public.pages
  FOR SELECT
  TO public
  USING (
    is_published = true
    OR (SELECT public.is_staff((SELECT auth.uid())))
  );

CREATE POLICY "pages_editor_insert" ON public.pages
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "pages_editor_update" ON public.pages
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin_or_editor((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "pages_admin_delete" ON public.pages
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 11. ПОЛИТИКИ: media
-- -----------------------------------------------------------------------------
CREATE POLICY "media_select_policy" ON public.media
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "media_staff_insert" ON public.media
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff((SELECT auth.uid()))));

CREATE POLICY "media_editor_update" ON public.media
  FOR UPDATE
  TO authenticated
  USING ((SELECT public.is_admin_or_editor((SELECT auth.uid()))))
  WITH CHECK ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

CREATE POLICY "media_editor_delete" ON public.media
  FOR DELETE
  TO authenticated
  USING ((SELECT public.is_admin_or_editor((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- 12. ПОЛИТИКИ: audit_log (НЕИЗМЕНЯЕМЫЙ ЖУРНАЛ)
-- -----------------------------------------------------------------------------
CREATE POLICY "audit_log_admin_select" ON public.audit_log
  FOR SELECT
  TO authenticated
  USING ((SELECT public.is_admin((SELECT auth.uid()))));

CREATE POLICY "audit_log_staff_insert" ON public.audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT public.is_staff((SELECT auth.uid()))));

-- -----------------------------------------------------------------------------
-- ПОЛИТИКИ ДЛЯ STORAGE OBJECTS
-- -----------------------------------------------------------------------------
CREATE POLICY "storage_public_read_news_media" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'news-media');

CREATE POLICY "storage_public_read_official_docs" ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'official-docs');

CREATE POLICY "storage_staff_upload_news_media" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'news-media'
    AND (SELECT public.is_staff((SELECT auth.uid())))
  );

CREATE POLICY "storage_staff_upload_official_docs" ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'official-docs'
    AND (SELECT public.is_admin_or_editor((SELECT auth.uid())))
  );

CREATE POLICY "storage_editor_delete_files" ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id IN ('news-media', 'official-docs')
    AND (SELECT public.is_admin_or_editor((SELECT auth.uid())))
  );


-- >>> File: supabase/migrations/20260929000003_indexes.sql <<<

-- =============================================================================
-- МИГРАЦИЯ 3: ИНДЕКСЫ ДЛЯ ПРОИЗВОДИТЕЛЬНОСТИ И ОПТИМИЗАЦИИ ЗАПРОСОВ
-- Согласно best practices:
-- 1. Все внешние ключи (FK) обязаны быть проиндексированы.
-- 2. Колонки, участвующие в RLS-проверках, индексируются.
-- 3. Составные и частичные индексы для частых запросов выборки и фильтрации.
-- 4. Полнотекстовый поиск (GIN) для новостей.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ИНДЕКСЫ ВНЕШНИХ КЛЮЧЕЙ (FK INDEXES)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role_id ON public.profiles (role_id);
CREATE INDEX IF NOT EXISTS idx_news_category_id ON public.news (category_id);
CREATE INDEX IF NOT EXISTS idx_news_author_id ON public.news (author_id);
CREATE INDEX IF NOT EXISTS idx_teachers_department_id ON public.teachers (department_id);
CREATE INDEX IF NOT EXISTS idx_specialties_department_id ON public.specialties (department_id);
CREATE INDEX IF NOT EXISTS idx_schedule_teacher_id ON public.schedule (teacher_id);
CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON public.media (uploaded_by);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log (user_id);

-- -----------------------------------------------------------------------------
-- 2. ИНДЕКСЫ ДЛЯ RLS И АВТОРИЗАЦИИ
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_auth_lookup ON public.profiles (id, is_active, role_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON public.roles (name);

-- -----------------------------------------------------------------------------
-- 3. ИНДЕКСЫ НОВОСТЕЙ (news)
-- -----------------------------------------------------------------------------
-- Главная лента новостей: сортировка опубликованных новостей по дате
CREATE INDEX IF NOT EXISTS idx_news_published_feed 
  ON public.news (status, published_at DESC) 
  WHERE status = 'published';

-- Фильтрация опубликованных новостей по рубрике с сортировкой по дате
CREATE INDEX IF NOT EXISTS idx_news_category_published 
  ON public.news (category_id, published_at DESC) 
  WHERE status = 'published';

-- Частичный индекс для закрепленной новости (Bento Hero)
CREATE INDEX IF NOT EXISTS idx_news_featured 
  ON public.news (is_featured, published_at DESC) 
  WHERE is_featured = true AND status = 'published';

-- Полнотекстовый поиск по заголовку и вводному тексту (русский язык)
CREATE INDEX IF NOT EXISTS idx_news_fulltext_search 
  ON public.news USING gin(to_tsvector('russian', title || ' ' || lead_text));

-- -----------------------------------------------------------------------------
-- 4. ИНДЕКСЫ СОБЫТИЙ (events)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_events_date_published 
  ON public.events (event_date ASC) 
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_events_category 
  ON public.events (category, event_date ASC) 
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_events_featured 
  ON public.events (is_featured, event_date ASC) 
  WHERE is_featured = true AND is_published = true;

-- -----------------------------------------------------------------------------
-- 5. ИНДЕКСЫ РАСПИСАНИЯ ЗАНЯТИЙ (schedule)
-- -----------------------------------------------------------------------------
-- Поиск расписания группы по дням недели и номерам пар
CREATE INDEX IF NOT EXISTS idx_schedule_group_lookup 
  ON public.schedule (group_name, day_of_week, lesson_number) 
  WHERE is_active = true;

-- Поиск расписания конкретного преподавателя
CREATE INDEX IF NOT EXISTS idx_schedule_teacher_lookup 
  ON public.schedule (teacher_id, day_of_week, lesson_number) 
  WHERE is_active = true;

-- -----------------------------------------------------------------------------
-- 6. ИНДЕКСЫ ПРЕПОДАВАТЕЛЕЙ И СПЕЦИАЛЬНОСТЕЙ
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_teachers_active_order 
  ON public.teachers (order_index ASC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_specialties_active_order 
  ON public.specialties (order_index ASC) 
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_specialties_base_edu 
  ON public.specialties (base_education) 
  WHERE is_active = true;

-- -----------------------------------------------------------------------------
-- 7. ИНДЕКСЫ СТАТИЧЕСКИХ СТРАНИЦ (pages)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pages_section_order 
  ON public.pages (section, order_index ASC) 
  WHERE is_published = true;

-- -----------------------------------------------------------------------------
-- 8. ИНДЕКСЫ ЖУРНАЛА АУДИТА (audit_log)
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_audit_log_entity 
  ON public.audit_log (entity_type, entity_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_created_at 
  ON public.audit_log (created_at DESC);


-- >>> File: supabase/migrations/20260929000004_seed_data.sql <<<

-- =============================================================================
-- МИГРАЦИЯ 4: РЕАЛИСТИЧНЫЕ ДЕМОНСТРАЦИОННЫЕ ДАННЫЕ ДЛЯ КОЛЛЕДЖА (СПО)
-- Стиль: строгий академический, официальный русский язык.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. РОЛИ (roles)
-- -----------------------------------------------------------------------------
INSERT INTO public.roles (id, name, description)
VALUES
  ('c0000000-0000-0000-0000-000000000001', 'admin', 'Главный администратор портала с полным доступом ко всем модулям и аудиту'),
  ('c0000000-0000-0000-0000-000000000002', 'editor', 'Редактор контента (новости, события, страницы, расписание, преподаватели)'),
  ('c0000000-0000-0000-0000-000000000003', 'moderator', 'Модератор с правами проверки черновиков и модерации материалов')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description;

-- -----------------------------------------------------------------------------
-- 2. ТЕСТОВЫЙ ПОЛЬЗОВАТЕЛЬ И ПРОФИЛЬ
-- -----------------------------------------------------------------------------
DO $$
BEGIN
  -- Создаем тестового пользователя в auth.users, если существует схема auth
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at
    )
    VALUES (
      'a0000000-0000-0000-0000-000000000001',
      '00000000-0000-0000-0000-000000000000',
      'authenticated',
      'authenticated',
      'admin@college.edu.ru',
      '$2a$10$wT0EmsnE4m0cMkJ8Yf6Y2.HsqzK7Xg4QvM1v1lMcfx9M3K8iJtZke',
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Иванов Алексей Сергеевич","role":"admin"}',
      now(),
      now()
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.profiles (id, email, full_name, role_id, phone, is_active)
    VALUES (
      'a0000000-0000-0000-0000-000000000001',
      'admin@college.edu.ru',
      'Иванов Алексей Сергеевич',
      'c0000000-0000-0000-0000-000000000001',
      '+7 (495) 123-45-67',
      true
    )
    ON CONFLICT (id) DO UPDATE SET
      full_name = EXCLUDED.full_name,
      role_id = EXCLUDED.role_id;
  END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. РУБРИКИ НОВОСТЕЙ (news_categories)
-- -----------------------------------------------------------------------------
INSERT INTO public.news_categories (id, name, slug, description, color_badge, order_index)
VALUES
  ('b0000000-0000-0000-0000-000000000001', 'Официально', 'oficialno', 'Приказы, распоряжения руководства, нормативные акты и объявления', 'slate', 1),
  ('b0000000-0000-0000-0000-000000000002', 'Студенческая жизнь', 'studencheskaya-zhizn', 'События студенческого совета, праздники, волонтерство и творчество', 'indigo', 2),
  ('b0000000-0000-0000-0000-000000000003', 'Наука и инновации', 'nauka-i-innovacii', 'Конференции, чемпионаты профессионального мастерства, хакатоны и проекты', 'purple', 3),
  ('b0000000-0000-0000-0000-000000000004', 'Спорт и достижения', 'sport-i-dostizheniya', 'Спартакиады, спортивные секции, победы сборных команд колледжа', 'emerald', 4),
  ('b0000000-0000-0000-0000-000000000005', 'Абитуриенту', 'abiturientu', 'Приемная кампания, дни открытых дверей, подготовительные курсы', 'amber', 5)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  color_badge = EXCLUDED.color_badge,
  order_index = EXCLUDED.order_index;

-- -----------------------------------------------------------------------------
-- 4. ОТДЕЛЕНИЯ / КАФЕДРЫ (departments)
-- -----------------------------------------------------------------------------
INSERT INTO public.departments (id, name, slug, head_name, description, contact_email, contact_phone, order_index)
VALUES
  ('d0000000-0000-0000-0000-000000000001', 'Отделение информационных технологий и программирования', 'it-programming', 'Смирнова Елена Николаевна', 'Подготовка квалифицированных разработчиков программного обеспечения, веб-мастеров и тестировщиков', 'it-dept@college.edu.ru', '+7 (495) 123-45-71', 1),
  ('d0000000-0000-0000-0000-000000000002', 'Отделение сетевого администрирования и кибербезопасности', 'networks-security', 'Кузнецова Ольга Михайловна', 'Подготовка специалистов по защите информации, сетевых и системных администраторов инфраструктуры', 'sec-dept@college.edu.ru', '+7 (495) 123-45-72', 2),
  ('d0000000-0000-0000-0000-000000000003', 'Отделение экономики, логистики и коммерции', 'economics-logistics', 'Федорова Татьяна Александровна', 'Обучение специалистов в области операционной логистики, бухгалтерского учета и цифровой коммерции', 'econ-dept@college.edu.ru', '+7 (495) 123-45-73', 3),
  ('d0000000-0000-0000-0000-000000000004', 'Отделение общеобразовательных и социально-гуманитарных дисциплин', 'general-humanities', 'Павлова Анна Владимировна', 'Реализация программ среднего общего образования, естественнонаучной и социально-гуманитарной подготовки', 'gen-dept@college.edu.ru', '+7 (495) 123-45-74', 4)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  head_name = EXCLUDED.head_name,
  description = EXCLUDED.description,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  order_index = EXCLUDED.order_index;

-- -----------------------------------------------------------------------------
-- 5. ПРЕПОДАВАТЕЛИ (teachers)
-- -----------------------------------------------------------------------------
INSERT INTO public.teachers (
  id, full_name, slug, position, department_id, subjects, qualification, education,
  experience_years, teaching_experience_years, bio, photo_url, email, is_active, order_index
)
VALUES
  (
    'e0000000-0000-0000-0000-000000000001',
    'Смирнова Елена Николаевна',
    'smirnova-elena-nikolaevna',
    'Заведующая отделением, преподаватель высшей категории',
    'd0000000-0000-0000-0000-000000000001',
    ARRAY['Основы алгоритмизации и программирования', 'Технология разработки программного обеспечения', 'Объектно-ориентированное программирование'],
    'Высшая квалификационная категория, Почетный работник СПО РФ',
    'Московский государственный технический университет им. Н.Э. Баумана (прикладная информатика)',
    22, 18,
    'Руководитель отделения ИТ. Автор более 15 учебно-методических пособий по программированию для учреждений среднего профессионального образования.',
    '/images/teachers/smirnova.webp',
    'e.smirnova@college.edu.ru',
    true, 1
  ),
  (
    'e0000000-0000-0000-0000-000000000002',
    'Васильев Дмитрий Андреевич',
    'vasiliev-dmitriy-andreevich',
    'Преподаватель спецдисциплин, главный эксперт чемпионата «Профессионалы»',
    'd0000000-0000-0000-0000-000000000001',
    ARRAY['Разработка веб-приложений', 'Базы данных и СУБД', 'Фреймворки корпоративной разработки'],
    'Высшая квалификационная категория',
    'Национальный исследовательский ядерный университет «МИФИ» (информатика и вычислительная техника)',
    12, 9,
    'Сертифицированный разработчик, эксперт компетенции «Веб-технологии». Руководитель студенческих команд хакатонов.',
    '/images/teachers/vasiliev.webp',
    'd.vasiliev@college.edu.ru',
    true, 2
  ),
  (
    'e0000000-0000-0000-0000-000000000003',
    'Кузнецова Ольга Михайловна',
    'kuznecova-olga-mihajlovna',
    'Заведующая отделением, преподаватель высшей категории',
    'd0000000-0000-0000-0000-000000000002',
    ARRAY['Инфокоммуникационные системы и сети', 'Организация и администрирование компьютерных сетей', 'Технические средства защиты информации'],
    'Высшая квалификационная категория, кандидат технических наук',
    'Санкт-Петербургский государственный университет телекоммуникаций им. проф. М.А. Бонч-Бруевича',
    19, 15,
    'Руководитель направления сетевых технологий и ИБ. Эксперт по сертификации сетевого телекоммуникационного оборудования.',
    '/images/teachers/kuznecova.webp',
    'o.kuznecova@college.edu.ru',
    true, 3
  ),
  (
    'e0000000-0000-0000-0000-000000000004',
    'Морозов Сергей Павлович',
    'morozov-sergej-pavlovich',
    'Преподаватель первой квалификационной категории',
    'd0000000-0000-0000-0000-000000000002',
    ARRAY['Информационная безопасность', 'Криптографические методы защиты информации', 'Аудит безопасности информационных систем'],
    'Первая квалификационная категория',
    'Московский технический университет связи и информатики (информационная безопасность)',
    8, 6,
    'Практикующий специалист по тестированию на проникновение и анализу уязвимостей инфраструктуры.',
    '/images/teachers/morozov.webp',
    's.morozov@college.edu.ru',
    true, 4
  ),
  (
    'e0000000-0000-0000-0000-000000000005',
    'Павлова Анна Владимировна',
    'pavlova-anna-vladimirovna',
    'Заведующая отделением общеобразовательной подготовки',
    'd0000000-0000-0000-0000-000000000004',
    ARRAY['Элементы высшей математики', 'Дискретная математика с элементами математической логики', 'Теория вероятностей и математическая статистика'],
    'Высшая квалификационная категория, Заслуженный учитель',
    'Московский педагогический государственный университет (математический факультет)',
    26, 24,
    'Автор адаптивных учебных программ по фундаментальной математике для студентов ИТ-специальностей.',
    '/images/teachers/pavlova.webp',
    'a.pavlova@college.edu.ru',
    true, 5
  ),
  (
    'e0000000-0000-0000-0000-000000000006',
    'Федорова Татьяна Александровна',
    'fedorova-tatyana-aleksandrovna',
    'Заведующая отделением экономики и логистики',
    'd0000000-0000-0000-0000-000000000003',
    ARRAY['Основы логистики и управления цепочками поставок', 'Оптимизация логистических процессов', 'Экономика организации'],
    'Высшая квалификационная категория, кандидат экономических наук',
    'Государственный университет управления (логистика и управление цепями поставок)',
    16, 12,
    'Куратор программ дуального обучения и производственной практики в партнерстве с логистическими операторами.',
    '/images/teachers/fedorova.webp',
    't.fedorova@college.edu.ru',
    true, 6
  ),
  (
    'e0000000-0000-0000-0000-000000000007',
    'Соколов Михаил Юрьевич',
    'sokolov-mihail-yurevich',
    'Мастер производственного обучения',
    'd0000000-0000-0000-0000-000000000001',
    ARRAY['Учебная практика по программированию', 'Производственная практика по профилю специальности'],
    'Первая квалификационная категория, Сертификат эксперта WorldSkills / Профессионалы',
    'Колледж связи и информатики (с отличием), МАИ (программная инженерия)',
    10, 7,
    'Организатор мастерских производственного обучения и преддипломной практики на ведущих ИТ-предприятиях региона.',
    '/images/teachers/sokolov.webp',
    'm.sokolov@college.edu.ru',
    true, 7
  ),
  (
    'e0000000-0000-0000-0000-000000000008',
    'Николаев Игорь Викторович',
    'nikolaev-igor-viktorovich',
    'Преподаватель физической культуры, руководитель спортивного клуба',
    'd0000000-0000-0000-0000-000000000004',
    ARRAY['Физическая культура', 'Адаптивная физическая культура', 'Спортивные секции (волейбол, настольный теннис)'],
    'Высшая квалификационная категория, Мастер спорта',
    'Российский университет спорта «ГЦОЛИФК»',
    15, 11,
    'Главный тренер сборной команды колледжа по волейболу — многократного победителя спартакиады СПО.',
    '/images/teachers/nikolaev.webp',
    'i.nikolaev@college.edu.ru',
    true, 8
  )
ON CONFLICT (slug) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  position = EXCLUDED.position,
  department_id = EXCLUDED.department_id,
  subjects = EXCLUDED.subjects,
  qualification = EXCLUDED.qualification,
  education = EXCLUDED.education,
  experience_years = EXCLUDED.experience_years,
  teaching_experience_years = EXCLUDED.teaching_experience_years,
  bio = EXCLUDED.bio,
  photo_url = EXCLUDED.photo_url,
  email = EXCLUDED.email,
  order_index = EXCLUDED.order_index;

-- -----------------------------------------------------------------------------
-- 6. СПЕЦИАЛЬНОСТИ И ПРОГРАММЫ ПОДГОТОВКИ (specialties)
-- -----------------------------------------------------------------------------
INSERT INTO public.specialties (
  id, code, name, slug, qualification, department_id, duration_months, duration_text,
  base_education, budget_places, commercial_places, cost_per_year, passing_score,
  description, career_opportunities, cover_image_url, is_active, order_index
)
VALUES
  (
    'f0000000-0000-0000-0000-000000000001',
    '09.02.07',
    'Информационные системы и программирование',
    '09-02-07-informacionnye-sistemy-i-programmirovanie',
    'Программист',
    'd0000000-0000-0000-0000-000000000001',
    46,
    '3 года 10 месяцев на базе основного общего образования (9 классов)',
    '9_classes',
    50, 25,
    135000.00,
    4.65,
    'Флагманская специальность подготовки разработчиков прикладного и системного программного обеспечения, веб-приложений, мобильных сервисов и корпоративных баз данных. Обучение включает практическое освоение современных языков программирования (TypeScript, Python, C#), архитектуры клиент-серверных систем и гибких методологий разработки (Agile/Scrum).',
    'Выпускники работают в ИТ-компаниях, интеграторах и банках на позициях: Frontend/Backend разработчик, инженер-программист, специалист по интеграции корпоративных систем.',
    '/images/specialties/090207.webp',
    true, 1
  ),
  (
    'f0000000-0000-0000-0000-000000000002',
    '09.02.06',
    'Сетевое и системное администрирование',
    '09-02-06-setevoe-i-sistemnoe-administrirovanie',
    'Сетевой и системный администратор',
    'd0000000-0000-0000-0000-000000000002',
    46,
    '3 года 10 месяцев на базе 9 классов',
    '9_classes',
    30, 15,
    125000.00,
    4.38,
    'Программа готовит специалистов по развертыванию, мониторингу и поддержке локальных и корпоративных сетей, серверного оборудования на базе Linux и Windows Server, систем виртуализации и облачной инфраструктуры.',
    'Системный администратор, инженер технической поддержки, администратор корпоративных облачных сервисов, DevOps-инженер начального уровня.',
    '/images/specialties/090206.webp',
    true, 2
  ),
  (
    'f0000000-0000-0000-0000-000000000003',
    '10.02.05',
    'Обеспечение информационной безопасности автоматизированных систем',
    '10-02-05-obespechenie-informacionnoj-bezopasnosti',
    'Техник по защите информации',
    'd0000000-0000-0000-0000-000000000002',
    46,
    '3 года 10 месяцев на базе 9 классов',
    '9_classes',
    25, 15,
    130000.00,
    4.54,
    'Комплексная программа по защите конфиденциальной информации, расследованию инцидентов безопасности, настройке межсетевых экранов, VPN-туннелей, систем предотвращения вторжений (IDS/IPS) и криптографических средств защиты.',
    'Специалист службы безопасности информации, техник по защите данных в государственных и финансовых организациях, аналитик инцидентов SOC.',
    '/images/specialties/100205.webp',
    true, 3
  ),
  (
    'f0000000-0000-0000-0000-000000000004',
    '09.02.01',
    'Компьютерные системы и комплексы',
    '09-02-01-kompyuternye-sistemy-i-kompleksy',
    'Техник по компьютерным системам',
    'd0000000-0000-0000-0000-000000000001',
    46,
    '3 года 10 месяцев на базе 9 классов',
    '9_classes',
    25, 10,
    118000.00,
    4.22,
    'Изучение архитектуры вычислительных машин, микропроцессорных комплексов, схемотехники, диагностика неисправностей аппаратной части и периферийных устройств, монтаж и наладка промышленной автоматики.',
    'Инженер аппаратного обеспечения, сервисный инженер, специалист по наладке и монтажу телекоммуникационных систем.',
    '/images/specialties/090201.webp',
    true, 4
  ),
  (
    'f0000000-0000-0000-0000-000000000005',
    '38.02.03',
    'Операционная деятельность в логистике',
    '38-02-03-operacionnaya-deyatelnost-v-logistike',
    'Операционный логист',
    'd0000000-0000-0000-0000-000000000003',
    34,
    '2 года 10 месяцев на базе 9 классов',
    '9_classes',
    25, 20,
    110000.00,
    4.15,
    'Подготовка специалистов по координации грузоперевозок, складскому учету, управлению цепочками поставок и применению цифровых систем класса WMS/ERP в транспортно-логистических узлах.',
    'Диспетчер-логист, специалист по организации международных и региональных грузоперевозок, начальник смены распределительного центра.',
    '/images/specialties/380203.webp',
    true, 5
  )
ON CONFLICT (slug) DO UPDATE SET
  code = EXCLUDED.code,
  name = EXCLUDED.name,
  qualification = EXCLUDED.qualification,
  department_id = EXCLUDED.department_id,
  duration_months = EXCLUDED.duration_months,
  duration_text = EXCLUDED.duration_text,
  base_education = EXCLUDED.base_education,
  budget_places = EXCLUDED.budget_places,
  commercial_places = EXCLUDED.commercial_places,
  cost_per_year = EXCLUDED.cost_per_year,
  passing_score = EXCLUDED.passing_score,
  description = EXCLUDED.description,
  career_opportunities = EXCLUDED.career_opportunities,
  cover_image_url = EXCLUDED.cover_image_url,
  order_index = EXCLUDED.order_index;

-- -----------------------------------------------------------------------------
-- 7. НОВОСТИ (news)
-- -----------------------------------------------------------------------------
INSERT INTO public.news (
  id, title, slug, category_id, lead_text, content_html, cover_image_url,
  reading_time_min, status, is_featured, published_at, views_count
)
VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    'Студенты колледжа завоевали золото на чемпионате профессионального мастерства «Профессионалы 2026»',
    'studenty-kolledzha-zavoevali-zoloto-chempionat-professionaly-2026',
    'b0000000-0000-0000-0000-000000000003',
    'В финале регионального этапа чемпионата команда колледжа заняла первые места в компетенциях «Веб-технологии» и «Сетевое и системное администрирование».',
    '<p class="lead">С 20 по 25 марта 2026 года в столичном регионе прошел региональный этап Всероссийского чемпионатного движения по профессиональному мастерству «Профессионалы». Студенты нашего колледжа продемонстрировали выдающийся уровень практической подготовки, заняв высшие ступени пьедестала по ключевым ИТ-компетенциям.</p><h2>Триумф в компетенции «Веб-технологии»</h2><p>Студент 3-го курса специальности 09.02.07 «Информационные системы и программирование» Максим Сергеев под руководством наставника Васильева Дмитрия Андреевича успешно выполнил сложнейшие конкурсные модули: проектирование архитектуры микросервисного веб-приложения, разработку RESTful API и реализацию адаптивного интерфейса с поддержкой стандартов доступности.</p><blockquote>«Победа на чемпионате — результат упорной ежедневной подготовки в наших новых мастерских и слаженной работы преподавателей и наставников», — отметила заведующая отделением ИТ Елена Николаевна Смирнова.</blockquote><h2>Сетевое администрирование и безопасность</h2><p>В компетенции «Сетевое и системное администрирование» золотую медаль завоевал студент группы СА-302 Артем Воронов (наставник — Кузнецова Ольга Михайловна). Конкурсное задание требовало развертывания отказоустойчивого кластера, конфигурации сетевой фильтрации и оперативного устранения смоделированных инцидентов информационной безопасности.</p><p>Администрация и педагогический коллектив колледжа поздравляют победителей и их наставников и желают успехов в отборочном этапе национального финала!</p>',
    '/images/news/champion-2026.webp',
    4,
    'published',
    true,
    timezone('utc'::text, now() - INTERVAL '1 day'),
    428
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Приемная кампания 2026: контрольные цифры приема, правила подачи документов и новые бюджетные места',
    'priemnaya-kampaniya-2026-pravila-priema-i-kcp',
    'b0000000-0000-0000-0000-000000000005',
    'Приемная комиссия колледжа информирует выпускников 9-х и 11-х классов о порядке подачи заявлений на 2026/2027 учебный год.',
    '<p class="lead">С 20 июня 2026 года колледж открывает прием документов на очную форму обучения по программам подготовки специалистов среднего звена. В текущем учебном году выделено 150 контрольных цифр приема (бюджетных мест) за счет средств регионального бюджета.</p><h3>Сроки подачи документов</h3><ul><li>Начало приема заявлений: <strong>20 июня 2026 г.</strong></li><li>Окончание приема заявлений на очную форму (бюджет): <strong>15 августа 2026 г.</strong></li><li>Предоставление оригинала аттестата: <strong>до 18 августа 2026 г. (18:00)</strong></li><li>Издание приказа о зачислении: <strong>20 августа 2026 г.</strong></li></ul><h3>Способы подачи документов</h3><ol><li>Лично в приемную комиссию по адресу: Главный корпус, каб. 105.</li><li>В электронной форме через портал Государственных услуг (ЕПГУ).</li><li>Почтовым отправлением с описью вложения.</li></ol><p>Подробный перечень необходимых документов и форма согласия на обработку персональных данных доступны в разделе «Абитуриенту».</p>',
    '/images/news/admissions-2026.webp',
    3,
    'published',
    false,
    timezone('utc'::text, now() - INTERVAL '3 days'),
    892
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'Торжественное открытие междисциплинарной лаборатории облачных вычислений и системного анализа',
    'otkrytie-laboratorii-oblachnyh-vychislenij',
    'b0000000-0000-0000-0000-000000000003',
    'Новое образовательное пространство оснащено современными серверами, стендами виртуализации и оборудованием отечественных производителей.',
    '<p class="lead">В рамках федерального проекта модернизации материально-технической базы в колледже открыта лаборатория облачных вычислений. Лаборатория рассчитана на 25 автоматизированных рабочих мест студентов и оборудована специализированным серверным узлом для развертывания лабораторных стендов.</p><p>Новые аппаратные мощности позволят студентам отрабатывать задачи системного мониторинга, развертывания инфраструктуры в концепции «Infrastructure as Code» и настройки защищенных каналов связи на отечественном программном обеспечении.</p>',
    '/images/news/lab-opening.webp',
    3,
    'published',
    false,
    timezone('utc'::text, now() - INTERVAL '5 days'),
    315
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'Сборная колледжа по волейболу стала победителем городской спартакиады среди учреждений СПО',
    'sbornaya-kolledzha-po-volejbolu-pobeditel-spartakiady',
    'b0000000-0000-0000-0000-000000000004',
    'В финальном матче наши волейболисты в упорной борьбе одержали победу со счетом 3:1, завоевав переходящий кубок соревнований.',
    '<p class="lead">На спортивной арене городского Дворца спорта состоялись финальные игры городской спартакиады студенческой молодежи профессиональных образовательных организаций. Наша сборная под руководством тренера Игоря Викторовича Николаева не проиграла ни одного сета на групповом этапе и уверенно довела финальную встречу до победы.</p><p>Поздравляем ребят с золотыми медалями и благодарим болельщиков за горячую поддержку на трибунах!</p>',
    '/images/news/volleyball-cup.webp',
    2,
    'published',
    false,
    timezone('utc'::text, now() - INTERVAL '7 days'),
    240
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Опубликован график промежуточной аттестации и расписание предэкзаменационных консультаций',
    'grafik-promezhutochnoj-attestacii-vesennij-semestr-2026',
    'b0000000-0000-0000-0000-000000000001',
    'Учебная часть доводит до сведения студентов 1–4 курсов утвержденное расписание зачетно-экзаменационной сессии весеннего семестра.',
    '<p class="lead">В соответствии с учебным планом на 2025/2026 учебный год зачетная неделя для студентов очной формы обучения пройдет с 1 по 7 июня, экзаменационная сессия — с 8 по 26 июня 2026 года.</p><p>С подробными графиками по группам, датами консультаций и критериями оценивания можно ознакомиться на информационных стендах отделений и в разделе «Расписание» официального сайта.</p>',
    '/images/news/exams-schedule.webp',
    2,
    'published',
    false,
    timezone('utc'::text, now() - INTERVAL '10 days'),
    560
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'Студенческое научное общество организовало ежегодный хакатон прикладных ИТ-разработок',
    'studencheskoe-nauchnoe-obshchestvo-hakaton-2026',
    'b0000000-0000-0000-0000-000000000002',
    'В течение 48 часов 12 команд разрабатывали прототипы цифровых сервисов для автоматизации учебных процессов колледжа.',
    '<p class="lead">В минувшие выходные в главном корпусе завершился традиционный весенний студенческий хакатон «Цифровой кампус 2026». Участники решали реальные кейсы: создание телеграм-бота с оперативным расписанием, сервиса учета внеучебной активности и интерактивной карты аудиторий.</p><p>Первое место заняла команда студентов второго курса с проектом голосового помощника для слабовидящих посетителей портала.</p>',
    '/images/news/hackathon-2026.webp',
    3,
    'published',
    false,
    timezone('utc'::text, now() - INTERVAL '14 days'),
    410
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  lead_text = EXCLUDED.lead_text,
  content_html = EXCLUDED.content_html,
  category_id = EXCLUDED.category_id,
  cover_image_url = EXCLUDED.cover_image_url,
  reading_time_min = EXCLUDED.reading_time_min,
  status = EXCLUDED.status,
  is_featured = EXCLUDED.is_featured,
  published_at = EXCLUDED.published_at;

-- -----------------------------------------------------------------------------
-- 8. СОБЫТИЯ И КАЛЕНДАРЬ (events)
-- -----------------------------------------------------------------------------
INSERT INTO public.events (
  id, title, slug, description, content_html, event_date, end_date,
  location, category, cover_image_url, is_featured, is_published, organizer
)
VALUES
  (
    '20000000-0000-0000-0000-000000000001',
    'Общегородской день открытых дверей для абитуриентов и родителей',
    'den-otkrytyh-dverej-aprel-2026',
    'Знакомство со специальностями колледжа, мастер-классы от преподавателей, консультации приемной комиссии и экскурсия по лабораториям.',
    '<p>Приглашаем выпускников 9-х и 11-х классов, а также их родителей на День открытых дверей. В программе: презентация образовательных программ, выступление ответственного секретаря приемной комиссии, мастер-классы по программированию и сетевому оборудованию, индивидуальное консультирование по вопросам поступления на бюджетные места.</p>',
    timezone('utc'::text, now() + INTERVAL '12 days'),
    timezone('utc'::text, now() + INTERVAL '12 days' + INTERVAL '4 hours'),
    'Главный корпус, Актовый зал (ул. Студенческая, д. 10)',
    'open_doors',
    '/images/events/open-doors.webp',
    true,
    true,
    'Приемная комиссия колледжа'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Научно-практическая студенческая конференция «Шаг в цифровую науку 2026»',
    'konferenciya-shag-v-nauku-2026',
    'Ежегодная конференция с докладами студентов по секциям программирования, системной инженерии и логистики.',
    '<p>Конференция объединит молодых исследователей и авторов инновационных дипломных проектов. По итогам работы секций выйдет сборник тезисов докладов, индексируемый в базе данных студенческих научных работ.</p>',
    timezone('utc'::text, now() + INTERVAL '20 days'),
    timezone('utc'::text, now() + INTERVAL '20 days' + INTERVAL '6 hours'),
    'Конференц-зал корпуса № 2, ауд. 310',
    'science',
    '/images/events/conference.webp',
    false,
    true,
    'Студенческое научное общество'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Мастер-класс от индустриального партнера: «Кибербезопасность современных веб-платформ»',
    'master-klass-kiberbezopasnost-partner',
    'Практический семинар от ведущих инженеров ИТ-компании по анализу векторов атак и защите клиентских сервисов.',
    '<p>Мероприятие организовано совместно с региональным ИТ-кластером в рамках программы взаимодействия с работодателями. Приглашаются студенты 3–4 курсов.</p>',
    timezone('utc'::text, now() + INTERVAL '26 days'),
    timezone('utc'::text, now() + INTERVAL '26 days' + INTERVAL '2 hours'),
    'Лаборатория № 12 (корпус А)',
    'general',
    '/images/events/masterclass.webp',
    false,
    true,
    'Отделение сетевого администрирования'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Первенство колледжа по настольному теннису среди учебных групп',
    'pervenstvo-po-nastolnomu-tennisu-2026',
    'Лично-командные соревнования среди юношей и девушек всех отделений в зачет спартакиады колледжа.',
    '<p>Заявки от групп принимаются на кафедре физического воспитания до 15 апреля. Приглашаются все желающие студенты и болельщики.</p>',
    timezone('utc'::text, now() + INTERVAL '32 days'),
    timezone('utc'::text, now() + INTERVAL '32 days' + INTERVAL '5 hours'),
    'Спортивный комплекс колледжа',
    'sports',
    '/images/events/table-tennis.webp',
    false,
    true,
    'Спортивный клуб колледжа'
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  content_html = EXCLUDED.content_html,
  event_date = EXCLUDED.event_date,
  end_date = EXCLUDED.end_date,
  location = EXCLUDED.location,
  category = EXCLUDED.category,
  cover_image_url = EXCLUDED.cover_image_url,
  is_featured = EXCLUDED.is_featured,
  is_published = EXCLUDED.is_published,
  organizer = EXCLUDED.organizer;

-- -----------------------------------------------------------------------------
-- 9. РАСПИСАНИЕ ЗАНЯТИЙ (schedule)
-- Для групп ИС-301 и СА-202
-- -----------------------------------------------------------------------------
INSERT INTO public.schedule (
  id, group_name, day_of_week, lesson_number, time_start, time_end,
  subject, teacher_id, classroom, parity, is_active
)
VALUES
  -- Понедельник (day 1) - Группа ИС-301
  ('30000000-0000-0000-0000-000000000001', 'ИС-301', 1, 1, '08:30', '10:00', 'Разработка веб-приложений (лек.)', 'e0000000-0000-0000-0000-000000000002', 'Ауд. 305', 'both', true),
  ('30000000-0000-0000-0000-000000000002', 'ИС-301', 1, 2, '10:10', '11:40', 'Разработка веб-приложений (лаб.)', 'e0000000-0000-0000-0000-000000000002', 'Лаб. 14', 'both', true),
  ('30000000-0000-0000-0000-000000000003', 'ИС-301', 1, 3, '12:10', '13:40', 'Дискретная математика', 'e0000000-0000-0000-0000-000000000005', 'Ауд. 210', 'both', true),
  ('30000000-0000-0000-0000-000000000004', 'ИС-301', 1, 4, '13:50', '15:20', 'Физическая культура', 'e0000000-0000-0000-0000-000000000008', 'Спортзал', 'both', true),

  -- Вторник (day 2) - Группа ИС-301
  ('30000000-0000-0000-0000-000000000005', 'ИС-301', 2, 1, '08:30', '10:00', 'Основы алгоритмизации и программирования', 'e0000000-0000-0000-0000-000000000001', 'Ауд. 302', 'both', true),
  ('30000000-0000-0000-0000-000000000006', 'ИС-301', 2, 2, '10:10', '11:40', 'Технология разработки ПО (лаб.)', 'e0000000-0000-0000-0000-000000000001', 'Лаб. 12', 'both', true),
  ('30000000-0000-0000-0000-000000000007', 'ИС-301', 2, 3, '12:10', '13:40', 'Учебная практика по программированию', 'e0000000-0000-0000-0000-000000000007', 'Лаб. 15', 'both', true),

  -- Среда (day 3) - Группа ИС-301
  ('30000000-0000-0000-0000-000000000008', 'ИС-301', 3, 1, '08:30', '10:00', 'Инфокоммуникационные системы и сети', 'e0000000-0000-0000-0000-000000000003', 'Ауд. 401', 'both', true),
  ('30000000-0000-0000-0000-000000000009', 'ИС-301', 3, 2, '10:10', '11:40', 'Базы данных и СУБД (лаб.)', 'e0000000-0000-0000-0000-000000000002', 'Лаб. 14', 'both', true),
  ('30000000-0000-0000-0000-000000000010', 'ИС-301', 3, 3, '12:10', '13:40', 'Информационная безопасность', 'e0000000-0000-0000-0000-000000000004', 'Ауд. 308', 'both', true),

  -- Четверг (day 4) - Группа ИС-301
  ('30000000-0000-0000-0000-000000000011', 'ИС-301', 4, 1, '08:30', '10:00', 'Технология разработки ПО (лек.)', 'e0000000-0000-0000-0000-000000000001', 'Ауд. 302', 'both', true),
  ('30000000-0000-0000-0000-000000000012', 'ИС-301', 4, 2, '10:10', '11:40', 'Элементы высшей математики', 'e0000000-0000-0000-0000-000000000005', 'Ауд. 210', 'both', true),
  ('30000000-0000-0000-0000-000000000013', 'ИС-301', 4, 3, '12:10', '13:40', 'Разработка веб-приложений (лаб.)', 'e0000000-0000-0000-0000-000000000002', 'Лаб. 14', 'both', true),

  -- Пятница (day 5) - Группа ИС-301
  ('30000000-0000-0000-0000-000000000014', 'ИС-301', 5, 1, '08:30', '10:00', 'Физическая культура', 'e0000000-0000-0000-0000-000000000008', 'Спорткомплекс', 'both', true),
  ('30000000-0000-0000-0000-000000000015', 'ИС-301', 5, 2, '10:10', '11:40', 'Основы алгоритмизации (лаб.)', 'e0000000-0000-0000-0000-000000000001', 'Лаб. 12', 'both', true),

  -- Понедельник (day 1) - Группа СА-202
  ('30000000-0000-0000-0000-000000000016', 'СА-202', 1, 1, '08:30', '10:00', 'Администрирование компьютерных сетей', 'e0000000-0000-0000-0000-000000000003', 'Лаб. 21', 'both', true),
  ('30000000-0000-0000-0000-000000000017', 'СА-202', 1, 2, '10:10', '11:40', 'Информационная безопасность', 'e0000000-0000-0000-0000-000000000004', 'Ауд. 308', 'both', true),
  ('30000000-0000-0000-0000-000000000018', 'СА-202', 1, 3, '12:10', '13:40', 'Физическая культура', 'e0000000-0000-0000-0000-000000000008', 'Спортзал', 'both', true)
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 10. СТАТИЧЕСКИЕ СТРАНИЦЫ И РАЗДЕЛ РОСОБРНАДЗОРА (pages)
-- Требования ст. 29 ФЗ-273 и Приказа Рособрнадзора № 1493
-- -----------------------------------------------------------------------------
INSERT INTO public.pages (
  id, title, slug, section, content_html, meta_title, meta_description, is_published, order_index
)
VALUES
  (
    '40000000-0000-0000-0000-000000000001',
    'Основные сведения',
    'sveden-common',
    'sveden',
    '<div itemprop="copy" class="sveden-block"><h2>Основные сведения об образовательной организации</h2><table class="sveden-table"><tbody><tr><th scope="row">Полное наименование</th><td itemprop="fullName">Государственное бюджетное профессиональное образовательное учреждение «Политехнический колледж информационных технологий и управления»</td></tr><tr><th scope="row">Краткое наименование</th><td itemprop="shortName">ГБПОУ «ПКИТУ»</td></tr><tr><th scope="row">Дата создания образовательной организации</th><td itemprop="regDate">1 сентября 1968 года</td></tr><tr><th scope="row">Учредитель</th><td itemprop="uchredName">Министерство образования и науки региона</td></tr><tr><th scope="row">Место нахождения</th><td itemprop="address">105005, г. Москва, ул. Студенческая, д. 10</td></tr><tr><th scope="row">Режим и график работы</th><td itemprop="workTime">Понедельник — суббота: с 08:00 до 20:00. Выходной день: воскресенье.</td></tr><tr><th scope="row">Контактные телефоны</th><td itemprop="telephone">+7 (495) 123-45-67, +7 (495) 123-45-68</td></tr><tr><th scope="row">Адрес электронной почты</th><td itemprop="email">info@college.edu.ru</td></tr></tbody></table></div>',
    'Основные сведения — Сведения об образовательной организации',
    'Официальные сведения о дате создания, учредителе, адресе и режиме работы колледжа',
    true, 1
  ),
  (
    '40000000-0000-0000-0000-000000000002',
    'Структура и органы управления',
    'sveden-struct',
    'sveden',
    '<div itemprop="copy" class="sveden-block"><h2>Структура и органы управления образовательной организацией</h2><p>Управление колледжем осуществляется в соответствии с законодательством Российской Федерации и Уставом колледжа на основе сочетания принципов единоначалия и коллегиальности.</p><h3>Органы управления:</h3><ul><li>Директор колледжа (единоличный исполнительный орган);</li><li>Общее собрание (конференция) работников и обучающихся;</li><li>Педагогический совет;</li><li>Управляющий совет;</li><li>Студенческий совет.</li></ul></div>',
    'Структура и органы управления — Сведения об ОО',
    'Органы управления и структурные подразделения политехнического колледжа',
    true, 2
  ),
  (
    '40000000-0000-0000-0000-000000000003',
    'Документы',
    'sveden-document',
    'sveden',
    '<div itemprop="copy" class="sveden-block"><h2>Официальные документы образовательной организации</h2><p>В данном подразделе размещены копии основных правоустанавливающих документов в виде электронных документов, подписанных простой электронной подписью.</p><ul><li><a href="/docs/ustav.pdf" target="_blank">Устав образовательной организации (с изменениями и дополнениями)</a></li><li><a href="/docs/license.pdf" target="_blank">Лицензия на осуществление образовательной деятельности (с приложениями)</a></li><li><a href="/docs/accreditation.pdf" target="_blank">Свидетельство о государственной аккредитации (с приложениями)</a></li><li><a href="/docs/pravila-priema.pdf" target="_blank">Правила приема обучающихся на 2026/2027 учебный год</a></li><li><a href="/docs/plan-fhd.pdf" target="_blank">План финансово-хозяйственной деятельности на текущий финансовый год</a></li></ul></div>',
    'Документы — Сведения об образовательной организации',
    'Устав, лицензия, аккредитация и локальные нормативные акты колледжа',
    true, 3
  ),
  (
    '40000000-0000-0000-0000-000000000004',
    'Доступная среда',
    'sveden-accessible-env',
    'sveden',
    '<div itemprop="copy" class="sveden-block"><h2>Доступная среда для инвалидов и лиц с ОВЗ</h2><p>В колледже созданы условия для беспрепятственного доступа инвалидов и лиц с ограниченными возможностями здоровья:</p><ul><li>Главный вход оборудован пандусом с поручнями и кнопкой вызова дежурного персонала;</li><li>Входные группы и лестничные марши оснащены тактильными предупреждающими полосами и контрастной маркировкой;</li><li>На 1 этаже оборудованы санитарно-гигиенические помещения, доступные для маломобильных граждан;</li><li>Официальный сайт колледжа имеет полнофункциональную версию для слабовидящих, соответствующую ГОСТ Р 52872-2019.</li></ul></div>',
    'Доступная среда — Сведения об ОО',
    'Информация об условиях доступности для инвалидов и лиц с ограниченными возможностями здоровья',
    true, 4
  ),
  (
    '40000000-0000-0000-0000-000000000005',
    'История и миссия колледжа',
    'about-history',
    'about',
    '<div class="about-history-block"><h2>История становления и миссия колледжа</h2><p class="lead">Более 55 лет наш колледж готовит высококвалифицированных специалистов технического и информационного профиля для ведущих предприятий страны.</p><p>Основанный в 1968 году как политехнический техникум, колледж прошел путь от небольшого учебного заведения до крупнейшего регионального центра профессионального образования и отраслевого кластера ИТ-компетенций.</p><h3>Наша миссия</h3><p>Создание современной образовательной экосистемы, формирующей у студентов востребованные профессиональные навыки, инженерное мышление и готовность к технологическим вызовам цифровой экономики.</p></div>',
    'История и миссия — О колледже',
    'История создания, традиции и стратегические цели развития колледжа',
    true, 5
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  section = EXCLUDED.section,
  content_html = EXCLUDED.content_html,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  is_published = EXCLUDED.is_published,
  order_index = EXCLUDED.order_index;

-- -----------------------------------------------------------------------------
-- 11. МЕДИАФАЙЛЫ (media)
-- -----------------------------------------------------------------------------
INSERT INTO public.media (
  id, file_name, original_name, file_size_bytes, mime_type, bucket,
  storage_path, public_url
)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'champion-2026.webp',
    'Победители чемпионата Профессионалы.webp',
    245760,
    'image/webp',
    'news-media',
    'news/champion-2026.webp',
    '/images/news/champion-2026.webp'
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'ustav-college.pdf',
    'Устав колледжа с ЭЦП.pdf',
    2450820,
    'application/pdf',
    'official-docs',
    'docs/ustav-college.pdf',
    '/docs/ustav.pdf'
  ),
  (
    '50000000-0000-0000-0000-000000000003',
    'admissions-2026.webp',
    'Приемная кампания баннер.webp',
    312400,
    'image/webp',
    'news-media',
    'news/admissions-2026.webp',
    '/images/news/admissions-2026.webp'
  )
ON CONFLICT (storage_path) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 12. НАЧАЛЬНАЯ ЗАПИСЬ В ЖУРНАЛ АУДИТА (audit_log)
-- -----------------------------------------------------------------------------
INSERT INTO public.audit_log (
  id, action, entity_type, entity_id, new_values, ip_address
)
VALUES (
  '60000000-0000-0000-0000-000000000001',
  'CREATE',
  'system',
  'initial_seed',
  '{"event": "Инициализация базовой структуры БД и демонстрационных данных колледжа", "version": "1.0"}',
  '127.0.0.1'
)
ON CONFLICT (id) DO NOTHING;


-- >>> File: supabase/migrations/20260929000005_uzbekistan_adaptation.sql <<<

-- =============================================================================
-- Migration 000005: Адаптация под законодательство Республики Узбекистан (РУз)
-- Спецификация: docs/UZ_COMPLIANCE.md
-- Закон РУз «Об образовании» № ЗРУ-637 (ст. 10, ст. 37)
-- Указ Президента РУз № УП-158 от 16.10.2024 (Сеть Техникумов)
-- Закон РУз «О персональных данных» № ЗРУ-547
-- =============================================================================

-- 1. Обновление ограничений таблицы pages для поддержки раздела 'info' (ст. 37 ЗРУ-637)
ALTER TABLE public.pages DROP CONSTRAINT IF EXISTS pages_section_check;
ALTER TABLE public.pages ADD CONSTRAINT pages_section_check 
  CHECK (section IN ('info', 'sveden', 'about', 'applicants', 'students', 'general'));

-- 2. Перевод существующих страниц из 'sveden' в 'info'
UPDATE public.pages 
SET section = 'info' 
WHERE section = 'sveden';

-- 3. Актуализация комментариев к таблицам
COMMENT ON TABLE public.pages IS 'Oʻzbekiston Respublikasi «Taʼlim toʻgʻrisida»gi Qonunining 37-moddasi boʻyicha majburiy maʼlumotlar va muassasa sahifalari';
COMMENT ON TABLE public.specialties IS 'Texnikum kasb va mutaxassisliklari (MSKO / ISCED, davlat granti va toʻlov-kontrakt)';
COMMENT ON TABLE public.news IS 'Texnikum yangiliklari, eʼlonlar va rasmiy buyruqlar';

-- 4. Обновление или добавление 12 обязательных разделов согласно статье 37 Закона РУз «Об образовании»
INSERT INTO public.pages (id, title, slug, section, content_html, meta_title, meta_description, is_published, order_index)
VALUES 
(
  '40000000-0000-0000-0000-000000000001',
  'Asosiy maʼlumotlar (Основные сведения)',
  'info-common',
  'info',
  '<h2>Fargʻona 2-son axborot texnologiyalari texnikumi haqida asosiy maʼlumotlar</h2><p><strong>Toʻliq rasmiy nomi:</strong> Fargʻona viloyati Fargʻona shahri 2-son texnikumi (Fargʻona 2-son axborot texnologiyalari texnikumi).</p><p><strong>Tashkil etilgan yili:</strong> 1978-yil.</p><p><strong>Muassis:</strong> Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi.</p><p><strong>Yuridik manzili:</strong> 150100, Oʻzbekiston Respublikasi, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 42-uy.</p><p><strong>Ish tartibi:</strong> Dushanba – Shanba: 08:30 – 17:30.</p><p><strong>Aloqa telefoni:</strong> +998 (73) 244-00-00, Ishonch telefoni: 1006.</p><p><strong>Elektron pochta:</strong> info@fargona-texnikum2.uz</p>',
  'Asosiy maʼlumotlar — Fargʻona 2-son texnikumi',
  'Fargʻona 2-son texnikumi haqida rasmiy maʼlumotlar, tashkil topgan yili, muassisi va manzili',
  true,
  1
),
(
  '40000000-0000-0000-0000-000000000002',
  'Tuzilma va boshqaruv organlari (Структура и органы управления)',
  'info-struct',
  'info',
  '<h2>Texnikum tuzilmasi va boshqaruv organlari</h2><p>Texnikum boshqaruvi Oʻzbekiston Respublikasining «Taʼlim toʻgʻrisida»gi Qonuni, Oʻzbekiston Respublikasi Prezidentining 2024-yil 16-oktabrdagi PF-158-son Farmoni hamda Texnikum Ustavi asosida amalga oshiriladi.</p><h3>Boshqaruv organlari:</h3><ul><li>Direktor va direktor oʻrinbosarlari;</li><li>Pedagogik kengash;</li><li>Oʻquv-metodik kengash;</li><li>Kasaba uyushmasi qoʻmitasi va Yoshlar ittifoqi boshlangʻich tashkiloti.</li></ul>',
  'Tuzilma va boshqaruv organlari',
  'Fargʻona 2-son texnikumi tuzilmasi, boʻlimlar va maʼmuriyat',
  true,
  2
),
(
  '40000000-0000-0000-0000-000000000003',
  'Ustav va meʼyoriy hujjatlar (Устав и нормативные документы)',
  'info-document',
  'info',
  '<h2>Texnikumning taʼsis va huquqiy hujjatlari</h2><ul><li>Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi tomonidan tasdiqlangan Texnikum Ustavi;</li><li>Davlat roʻyxatidan oʻtkazilganligi toʻgʻrisidagi guvohnoma (STIR: 302987654);</li><li>Taʼlim faoliyatini amalga oshirish uchun Davlat akkreditatsiyasi sertifikati;</li><li>Ichki mehnat va oʻqish tartibi qoidalari;</li><li>Jamoa shartnomasi va uning ijrosi.</li></ul>',
  'Ustav va meʼyoriy hujjatlar',
  'Texnikum ustavi, guvohnomasi va huquqiy hujjatlari',
  true,
  3
),
(
  '40000000-0000-0000-0000-000000000004',
  'Taʼlim tillari (Языки обучения)',
  'info-languages',
  'info',
  '<h2>Taʼlim berish tillari haqida maʼlumot</h2><p>Oʻzbekiston Respublikasining «Davlat tili haqida»gi Qonuni (356-I-son) hamda «Taʼlim toʻgʻrisida»gi Qonunining 33-moddasiga muvofiq Fargʻona 2-son texnikumida oʻquv mashgʻulotlari quyidagi tillarda olib boriladi:</p><ul><li><strong>Oʻzbek tili (davlat tili)</strong> — barcha mutaxassisliklar va kasblar boʻyicha;</li><li><strong>Rus tili</strong> — tanlangan ixtisoslashtirilgan guruhlarda.</li></ul>',
  'Taʼlim tillari — Fargʻona 2-son texnikumi',
  'Taʼlim jarayonida qoʻllaniladigan davlat va boshqa tillar',
  true,
  4
),
(
  '40000000-0000-0000-0000-000000000005',
  'Taʼlim dasturlari va standartlari (Образовательные программы и стандарты)',
  'info-education',
  'info',
  '<h2>Davlat taʼlim standartlari va oʻquv rejalari</h2><p>Oʻquv jarayoni Xalqaro standart taʼlim tasniflagichi (MSKO / ISCED) va Oʻzbekiston Respublikasi Milliy malaka ramkasi asosida ishlab chiqilgan kasbiy taʼlim dasturlari boʻyicha tashkil etilgan.</p><p>Kredit-modul tizimi (ECTS) joriy etilgan boʻlib, oʻquvchilar tomonidan toʻplangan kreditlar va GPA koʻrsatkichlari asosida oliy taʼlim muassasalarining mos bakalavriat bosqichlarida oʻqishni davom ettirish imkoniyati yaratilgan.</p>',
  'Taʼlim dasturlari va standartlari',
  'Davlat taʼlim standartlari, malaka talablari va oʻquv rejalari',
  true,
  5
),
(
  '40000000-0000-0000-0000-000000000006',
  'Pedagogik tarkib (Педагогический состав)',
  'info-teachers',
  'info',
  '<h2>Oʻqituvchilar va pedagogik tarkib haqida maʼlumot</h2><p>Texnikumda 65 nafar yuqori malakali pedagog faoliyat yuritadi. Ulardan 18 nafari oliy toifali oʻqituvchi, 4 nafari fan nomzodi va falsafa doktori (PhD), 8 nafari «Oʻrta maxsus va kasb-hunar taʼlimi aʼlochisi» koʻkrak nishoni sohiblaridir.</p>',
  'Pedagogik tarkib va oʻqituvchilar salohiyati',
  'Fargʻona 2-son texnikumi oʻqituvchilari maʼlumoti, toifasi va ilmiy salohiyati',
  true,
  6
),
(
  '40000000-0000-0000-0000-000000000007',
  'Moddiy-texnik taʼminot (Материально-техническое обеспечение)',
  'info-mto',
  'info',
  '<h2>Moddiy-texnik baza va oʻquv jihozlari</h2><ul><li>32 ta zamonaviy multimedia oʻquv auditoriyalari;</li><li>8 ta zamonaviy kompyuter laboratoriyasi (har birida 20 tadan soʻnggi rusumdagi kompyuter);</li><li>Optik tolali yuqori tezlikdagi Internet tarmogʻi (100 Mbit/s);</li><li>Axborot-resurs markazi (ARM) va 25 000 dan ortiq nusxadagi elektron kutubxona fondi;</li><li>Sport zali, mini-futbol maydoni va 150 oʻrinli oshxona.</li></ul>',
  'Moddiy-texnik taʼminot',
  'Texnikum oʻquv binolari, laboratoriyalari va kutubxona fondi',
  true,
  7
),
(
  '40000000-0000-0000-0000-000000000008',
  'Talabalar turar joyi (Общежитие и условия проживания)',
  'info-dormitory',
  'info',
  '<h2>Talabalar turar joyi (yotoqxona)</h2><p>Texnikum tasarrufida uzoq tumanlardan kelgan oʻquvchilar uchun 200 oʻrinli zamonaviy talabalar turar joyi mavjud.</p><ul><li>Xonalar 2 va 3 kishiga moʻljallangan;</li><li>Yotoqxonada Wi-Fi zonasi, dars tayyorlash xonalari, maʼnaviyat xonasi, kir yuvish va oshxona mavjud;</li><li>Yashash toʻlovi: oyiga 120 000 soʻm (kam taʼminlangan va boquvchisini yoʻqotgan oʻquvchilar bepul yashaydi).</li></ul>',
  'Talabalar turar joyi — Yotoqxona',
  'Oʻquvchilar yotoqxonasi oʻrinlari, sharoitlari va toʻlov miqdori',
  true,
  8
),
(
  '40000000-0000-0000-0000-000000000009',
  'Stipendiyalar va ijtimoiy yordam (Стипендии и социальная помощь)',
  'info-scholarships',
  'info',
  '<h2>Stipendiyalar tayinlash va ijtimoiy himoya choralari</h2><p>Davlat granti asosida taʼlim olayotgan oʻquvchilarga Oʻzbekiston Respublikasi Vazirlar Mahkamasi tomonidan belgilangan tartib va miqdorlarda oylik stipendiyalar toʻlanadi.</p><p>Yetim bolalar, ota-ona qaramogʻidan mahrum boʻlganlar hamda «Ijtimoiy himoya yagona reyestri»ga kiritilgan oilalar farzandlariga bepul darsliklar, kiyim-kechak va bir martalik moddiy yordamlar ajratiladi.</p>',
  'Stipendiyalar va ijtimoiy qoʻllab-quvvatlash',
  'Oʻquvchilar stipendiyasi, ijtimoiy yordam va imtiyozlar',
  true,
  9
),
(
  '40000000-0000-0000-0000-000000000010',
  'Reyting va sifat monitoringi (Рейтинг и мониторинг качества)',
  'info-rating',
  'info',
  '<h2>Texnikum reytingi va taʼlim sifati</h2><p>Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligi tomonidan oʻtkazilgan kasb-hunar taʼlimi muassasalari milliy reytingida Fargʻona 2-son texnikumi viloyat boʻyicha yetakchi TOP-3 oʻrindan joy olgan.</p><p>Bitiruvchilarning bandlik darajasi 94% ni tashkil etadi.</p>',
  'Texnikum reytingi va monitoring natijalari',
  'Taʼlim sifati monitoringi, reyting koʻrsatkichlari va bandlik',
  true,
  10
),
(
  '40000000-0000-0000-0000-000000000011',
  'Ilmiy va innovatsion faoliyat (Научная и инновационная деятельность)',
  'info-research',
  'info',
  '<h2>Ilmiy tadqiqotlar va innovatsion loyihalar</h2><p>Texnikumda «Yosh dasturchilar» inkubatsiya markazi va robototexnika toʻgaragi faoliyat koʻrsatmoqda. Hududdagi sanoat korxonalari va IT-park Fargʻona filiali bilan hamkorlikda dual taʼlim va amaliy loyihalar yoʻlga qoʻyilgan.</p>',
  'Ilmiy va innovatsion faoliyat',
  'Amaliy ishlanmalar, innovatsion loyihalar va korxona hamkorliklari',
  true,
  11
),
(
  '40000000-0000-0000-0000-000000000012',
  'Qabul komissiyasi va boʻsh oʻrinlar (Приемная комиссия и вакантные места)',
  'info-admission',
  'info',
  '<h2>Qabul komissiyasi va oʻqishga qabul qilish tartibi</h2><p>Hujjatlar Oʻzbekiston Respublikasi Oliy taʼlim, fan va innovatsiyalar vazirligining yagona elektron portali — <strong>my.edu.uz</strong> orqali qabul qilinadi.</p><p>Oʻqishga qabul umumiy oʻrta taʼlim (9 va 11-sinf) shahodatnomasi baholari hamda Bilim va malakalarni baholash agentligi (uzbmb.uz) test sinovlari asosida amalga oshiriladi.</p><p>Davlat granti va toʻlov-kontrakt asosida qabul kvotalari har yili tasdiqlanadi.</p>',
  'Qabul komissiyasi — my.edu.uz orqali qabul',
  'Qabul qoidalari, kvotalar, kerakli hujjatlar va boʻsh oʻrinlar',
  true,
  12
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  slug = EXCLUDED.slug,
  section = EXCLUDED.section,
  content_html = EXCLUDED.content_html,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  order_index = EXCLUDED.order_index,
  updated_at = now();

-- 5. Обновление направлений подготовки (специальностей) под классификатор РУз и валюту UZS
UPDATE public.specialties 
SET 
  cost_per_year = 9500000,
  duration_text = CASE 
    WHEN base_education = '9_classes' THEN '3 yil (9-sinf negizida)'
    ELSE '2 yil (11-sinf negizida)'
  END
WHERE cost_per_year IS NOT NULL;

-- =============================================================================
-- 6. Platform Architectural License & Integrity Guard (Layer 2)
-- Lead Architect: Abubakr Muminov (https://github.com/abubakrmuminov)
-- Legal Reference: OʻRQ-42 (Mualliflik huquqi) hamda OʻRQ-637
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.system_architect_license (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  architect_signature VARCHAR(64) NOT NULL UNIQUE,
  architect_name VARCHAR(255) NOT NULL,
  architect_github VARCHAR(255) NOT NULL,
  license_type VARCHAR(100) NOT NULL DEFAULT 'PROPRIETARY_ALL_RIGHTS_RESERVED',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB NOT NULL DEFAULT '{"project": "Fargʻona 2-son texnikumi portali", "law": "OʻRQ-42", "architect": "Abubakr Muminov"}'::jsonb
);

ALTER TABLE public.system_architect_license ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read platform architect license"
  ON public.system_architect_license
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Deny unauthorized modification of license"
  ON public.system_architect_license
  FOR ALL
  TO public
  USING (false);

INSERT INTO public.system_architect_license (
  architect_signature,
  architect_name,
  architect_github,
  license_type,
  is_active
)
VALUES (
  'sig_80a5b2eb',
  'Abubakr Muminov',
  'https://github.com/abubakrmuminov',
  'PROPRIETARY_ALL_RIGHTS_RESERVED',
  TRUE
)
ON CONFLICT (architect_signature) DO UPDATE 
SET is_active = TRUE,
    verified_at = NOW();

CREATE OR REPLACE FUNCTION public.verify_platform_architect_license(p_sig TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.system_architect_license
    WHERE architect_signature = p_sig 
      AND is_active = TRUE
  );
END;
$$;

