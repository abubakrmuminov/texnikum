-- =============================================================================
-- МИГРАЦИЯ 20260930000007: Добавление колонки onboarding для панели администратора
-- Соответствие: docs/SPEC.md, .agent/skills/onboarding-wizard/SKILL.md
-- =============================================================================

-- Добавляем колонку onboarding (JSONB) в таблицу profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS onboarding jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.profiles.onboarding IS 'Состояние онбординга пользователя: приветственный тур (main) и просмотренные разделы (sections)';
