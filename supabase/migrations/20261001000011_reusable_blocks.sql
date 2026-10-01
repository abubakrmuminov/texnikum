-- Migration: 20261001000011_reusable_blocks.sql
-- Description: Reusable and Global Blocks table with RLS and seed templates

CREATE TABLE IF NOT EXISTS reusable_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_uz TEXT NOT NULL,
  title_ru TEXT NOT NULL,
  category TEXT DEFAULT 'custom',
  is_global BOOLEAN DEFAULT false,
  row_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Индексы
CREATE INDEX IF NOT EXISTS idx_reusable_blocks_category ON reusable_blocks(category);
CREATE INDEX IF NOT EXISTS idx_reusable_blocks_is_global ON reusable_blocks(is_global);

-- RLS
ALTER TABLE reusable_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read reusable blocks"
  ON reusable_blocks FOR SELECT
  USING (true);

CREATE POLICY "Allow admin/editor insert reusable blocks"
  ON reusable_blocks FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin/editor update reusable blocks"
  ON reusable_blocks FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow admin/editor delete reusable blocks"
  ON reusable_blocks FOR DELETE
  USING (auth.role() = 'authenticated');

-- Сид дефолтных глобальных / переиспользуемых секций
INSERT INTO reusable_blocks (id, title_uz, title_ru, category, is_global, row_data)
VALUES
  (
    '50000000-0000-0000-0000-000000000001',
    'Qabul komissiyasi tezkor axborot paneli',
    'Информационная панель приемной комиссии',
    'banner',
    true,
    '{
      "id": "row-reusable-qabul-banner",
      "style": {
        "backgroundStyle": "brand",
        "paddingVertical": "compact",
        "containerWidth": "standard"
      },
      "cells": [
        {
          "id": "cell-reusable-qabul-banner",
          "colSpan": 12,
          "blocks": [
            {
              "id": "blk-reusable-qabul-banner",
              "type": "banner_alert",
              "sortOrder": 1,
              "isVisible": true,
              "config": {
                "variant": "info",
                "titleUz": "Qabul 2026/2027: Yagona my.edu.uz portali orqali ariza topshiring",
                "titleRu": "Прием 2026/2027: Подавайте заявки через единый портал my.edu.uz",
                "messageUz": "Hujjatlar 2026-yil 15-avgustga qadar qabul qilinadi. Qabul komissiyasi: +998 (73) 244-00-00.",
                "messageRu": "Прием документов ведется до 15 августа 2026 года. Приемная комиссия: +998 (73) 244-00-00.",
                "actionTextUz": "my.edu.uz saytiga oʻtish",
                "actionTextRu": "Перейти на my.edu.uz",
                "actionUrl": "https://my.edu.uz"
              }
            }
          ]
        }
      ]
    }'::jsonb
  ),
  (
    '50000000-0000-0000-0000-000000000002',
    'Texnikum asosiy yutuqlari (KPI)',
    'Ключевые достижения техникума (KPI)',
    'stats',
    false,
    '{
      "id": "row-reusable-kpi-stats",
      "style": {
        "backgroundStyle": "subtle",
        "paddingVertical": "normal",
        "containerWidth": "standard"
      },
      "cells": [
        {
          "id": "cell-reusable-kpi-stats",
          "colSpan": 12,
          "blocks": [
            {
              "id": "blk-reusable-kpi-stats",
              "type": "stats_counter",
              "sortOrder": 1,
              "isVisible": true,
              "config": {
                "titleUz": "Texnikum raqamlarda",
                "titleRu": "Техникум в цифрах",
                "columns": 4,
                "stats": [
                  { "id": "s1", "value": "1,200+", "labelUz": "Talabalar", "labelRu": "Студентов", "icon": "GraduationCap" },
                  { "id": "s2", "value": "85+", "labelUz": "Pedagoglar", "labelRu": "Педагогов", "icon": "Users" },
                  { "id": "s3", "value": "14 ta", "labelUz": "Laboratoriyalar", "labelRu": "Лабораторий", "icon": "Building" },
                  { "id": "s4", "value": "92%", "labelUz": "Ishga joylashish", "labelRu": "Трудоустройство", "icon": "Award" }
                ]
              }
            }
          ]
        }
      ]
    }'::jsonb
  )
ON CONFLICT (id) DO NOTHING;
