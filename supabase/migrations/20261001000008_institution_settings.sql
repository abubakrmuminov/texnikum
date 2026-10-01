-- =============================================================================
-- МИГРАЦИЯ 20261001000008: Настройки образовательного учреждения (White-label)
-- Соответствие: docs/WHITELABEL_PLAN.md, docs/UZ_COMPLIANCE.md
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. ТАБЛИЦА ПУБЛИЧНЫХ НАСТРОЕК (institution_settings)
-- Синглтон: ограничение single_row гарантирует ровно одну запись в таблице
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institution_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name_uz TEXT NOT NULL DEFAULT '',
  name_ru TEXT NOT NULL DEFAULT '',
  short_name_uz TEXT NOT NULL DEFAULT '',
  short_name_ru TEXT NOT NULL DEFAULT '',
  institution_type TEXT NOT NULL DEFAULT 'texnikum',
  legal_address_uz TEXT NOT NULL DEFAULT '',
  legal_address_ru TEXT NOT NULL DEFAULT '',
  main_phone TEXT NOT NULL DEFAULT '',
  admission_phone TEXT NOT NULL DEFAULT '',
  trust_phone TEXT NOT NULL DEFAULT '',
  contact_email TEXT NOT NULL DEFAULT '',
  admission_email TEXT NOT NULL DEFAULT '',
  website_domain TEXT NOT NULL DEFAULT '',
  geo_latitude DOUBLE PRECISION NOT NULL DEFAULT 40.386400,
  geo_longitude DOUBLE PRECISION NOT NULL DEFAULT 71.786400,
  logo_url TEXT,
  favicon_url TEXT,
  coat_of_arms_url TEXT,
  brand_primary_color TEXT NOT NULL DEFAULT '#1e3a8a',
  social_telegram TEXT,
  social_instagram TEXT,
  social_facebook TEXT,
  social_youtube TEXT,
  stir_inn TEXT NOT NULL DEFAULT '',
  work_hours_uz TEXT NOT NULL DEFAULT 'Dushanba – Shanba: 08:30 – 17:30',
  work_hours_ru TEXT NOT NULL DEFAULT 'Понедельник – Суббота: 08:30 – 17:30',
  is_configured BOOLEAN NOT NULL DEFAULT false,
  setup_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT single_institution_settings CHECK (id = 1)
);

COMMENT ON TABLE public.institution_settings IS 'Публичные реквизиты, брендинг и параметры учреждения (синглтон)';

-- -----------------------------------------------------------------------------
-- 2. ТАБЛИЦА ПРИВАТНЫХ НАСТРОЕК (institution_private)
-- Синглтон: финансовые и внутренние административные реквизиты учреждения
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.institution_private (
  id INTEGER PRIMARY KEY DEFAULT 1,
  bank_name TEXT,
  bank_account TEXT,
  mfo_code TEXT,
  jshshir_pinfl TEXT,
  treasury_account TEXT,
  oked_code TEXT,
  director_name_uz TEXT,
  director_name_ru TEXT,
  director_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT single_institution_private CHECK (id = 1),
  CONSTRAINT fk_institution_settings FOREIGN KEY (id) REFERENCES public.institution_settings(id) ON DELETE CASCADE
);

COMMENT ON TABLE public.institution_private IS 'Приватные финансовые и административные реквизиты учреждения (синглтон)';

-- -----------------------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS) ПОЛИТИКИ
-- -----------------------------------------------------------------------------
ALTER TABLE public.institution_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institution_private ENABLE ROW LEVEL SECURITY;

-- Публичные настройки: чтение доступно всем (anon и authenticated)
CREATE POLICY "Allow public select institution_settings"
  ON public.institution_settings
  FOR SELECT
  USING (true);

-- Публичные настройки: запись (UPDATE) только для роли admin
CREATE POLICY "Allow admin write institution_settings"
  ON public.institution_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Приватные настройки: чтение только для роли admin
CREATE POLICY "Allow admin select institution_private"
  ON public.institution_private
  FOR SELECT
  TO authenticated
  USING (public.is_admin(auth.uid()));

-- Приватные настройки: запись только для роли admin
CREATE POLICY "Allow admin write institution_private"
  ON public.institution_private
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Права доступа (Grants): доступ к приватной таблице для anon и не-админов заблокирован
REVOKE ALL ON public.institution_private FROM anon;
GRANT SELECT ON public.institution_settings TO anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4. ИНИЦИАЛИЗАЦИЯ ПУСТЫХ СИНГЛТОН-ЗАПИСЕЙ (ЧИСТАЯ УСТАНОВКА БЕЗ ДЕМО-ДАННЫХ)
-- -----------------------------------------------------------------------------
INSERT INTO public.institution_settings (id, is_configured)
VALUES (1, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.institution_private (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;
