export type ThemePresetId =
  | 'classic_academic'
  | 'modern_tech'
  | 'emerald_oasis'
  | 'traditional_navy'
  | 'clean_slate';

export interface ThemePreset {
  id: ThemePresetId;
  nameUz: string;
  nameRu: string;
  descriptionUz: string;
  descriptionRu: string;
  fontFamily: string;
  borderRadius: string;
  previewColors: string[];
}

export interface ThemeSettings {
  id: number;
  preset: ThemePresetId;
  fontFamily: string;
  borderRadiusMode: string;
  updatedAt: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'classic_academic',
    nameUz: 'Klassik akademik',
    nameRu: 'Классический академический',
    descriptionUz: 'Anʼanaviy davlat taʼlim muassasalari uchun qatʼiy va nufuzli uslub',
    descriptionRu: 'Строгий академический стиль для традиционных образовательных учреждений',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    previewColors: ['#1e3a8a', '#3b82f6', '#f8fafc', '#0f172a'],
  },
  {
    id: 'modern_tech',
    nameUz: 'Zamonaviy raqamli texnikum',
    nameRu: 'Современный цифровой техникум',
    descriptionUz: 'Axborot texnologiyalari va innovatsion kasblar uchun texnologik uslub',
    descriptionRu: 'Технологичный современный дизайн для IT и инновационных направлений',
    fontFamily: 'Inter',
    borderRadius: '0.75rem',
    previewColors: ['#0284c7', '#06b6d4', '#f0f9ff', '#082f49'],
  },
  {
    id: 'emerald_oasis',
    nameUz: 'Milliy zumrad',
    nameRu: 'Национальный изумрудный',
    descriptionUz: 'Oʻzbekiston davlat ramzlari va tabiatiga hamohang sokin zumrad jilo',
    descriptionRu: 'Гармоничный изумрудный оттенок, сочетающийся с национальным колоритом',
    fontFamily: 'Inter',
    borderRadius: '0.5rem',
    previewColors: ['#047857', '#10b981', '#ecfdf5', '#064e3b'],
  },
  {
    id: 'traditional_navy',
    nameUz: 'Toʻq koʻk universitet',
    nameRu: 'Университетский темно-синий',
    descriptionUz: 'Mukammal kontrast va vazmin nufuzga ega toʻq moviy palitra',
    descriptionRu: 'Авторитетная глубокая темно-синяя гамма высокой контрастности',
    fontFamily: 'Inter',
    borderRadius: '0.375rem',
    previewColors: ['#0f172a', '#1e293b', '#f1f5f9', '#020617'],
  },
  {
    id: 'clean_slate',
    nameUz: 'Minimalistik yorugʻ',
    nameRu: 'Минималистичный светлый',
    descriptionUz: 'Yengil oʻqish va ortiqcha bezaklarsiz sof matnga urgʻu',
    descriptionRu: 'Максимум свободного пространства, акцент на удобстве чтения документов',
    fontFamily: 'Inter',
    borderRadius: '0.25rem',
    previewColors: ['#334155', '#64748b', '#ffffff', '#0f172a'],
  },
];
