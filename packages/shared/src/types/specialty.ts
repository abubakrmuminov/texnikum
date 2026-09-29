import { Department } from './department';

export type BaseEducation = '9_classes' | '11_classes' | 'both';

export interface Specialty {
  id: string;
  code: string;
  name: string;
  slug: string;
  qualification: string;
  departmentId: string | null;
  department?: Department;
  durationMonths: number;
  durationText: string;
  baseEducation: BaseEducation;
  budgetPlaces: number;
  commercialPlaces: number;
  costPerYear: number | null;
  passingScore: number | null;
  description: string;
  careerOpportunities: string | null;
  coverImageUrl: string | null;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}
