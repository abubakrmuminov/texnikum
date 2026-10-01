-- =============================================================================
-- Migration: 20261001000010_visual_grid_builder.sql
-- Description: Phase B1 — 12-Column Grid Layout Model (Page -> Rows -> Cells -> Blocks)
-- Author: Platform Team
-- Date: 2026-10-01
-- =============================================================================

-- 1. РАСШИРЕНИЕ ТАБЛИЦЫ СТРАНИЦ ПОЛЯМИ 12-КОЛОНОЧНОЙ СЕТКИ (pages)
-- -----------------------------------------------------------------------------
ALTER TABLE public.pages
  ADD COLUMN IF NOT EXISTS schema_version INT NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS rows JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.pages.schema_version IS 'Версия схемы контента (1 = плоские блоки, 2 = 12-колоночная сетка)';
COMMENT ON COLUMN public.pages.rows IS '12-колоночная структура страницы: секции/строки, ячейки (colSpan 3-12) и контентные блоки';

-- 2. БЕЗОПАСНАЯ КОНВЕРТАЦИЯ СУЩЕСТВУЮЩИХ СТРАНИЦ (Zero Data Loss Migration)
-- -----------------------------------------------------------------------------
-- Каждый существующий блок первой версии оборачивается в отдельную строку на 12 колонок.
UPDATE public.pages
SET
  rows = (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', 'row-' || COALESCE(b->>'id', gen_random_uuid()::text),
          'style', jsonb_build_object(
            'backgroundStyle', 'none',
            'paddingVertical', 'normal',
            'containerWidth', 'standard'
          ),
          'cells', jsonb_build_array(
            jsonb_build_object(
              'id', 'cell-' || COALESCE(b->>'id', gen_random_uuid()::text),
              'colSpan', 12,
              'verticalAlign', 'top',
              'isCard', false,
              'blocks', jsonb_build_array(b)
            )
          )
        )
      ),
      '[]'::jsonb
    )
    FROM jsonb_array_elements(COALESCE(pages.blocks, '[]'::jsonb)) AS b
  ),
  schema_version = 2
WHERE (rows IS NULL OR rows = '[]'::jsonb)
  AND blocks IS NOT NULL
  AND jsonb_array_length(blocks) > 0;

-- 3. ОБНОВЛЕНИЕ ИНДЕКСОВ
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_pages_schema_version ON public.pages(schema_version);
