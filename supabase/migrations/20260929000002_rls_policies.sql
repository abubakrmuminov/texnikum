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
