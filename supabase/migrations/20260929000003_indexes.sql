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
