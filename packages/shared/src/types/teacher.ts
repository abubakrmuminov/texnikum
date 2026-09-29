import { Department } from './department';

export interface Teacher {
  id: string;
  fullName: string;
  slug: string;
  position: string;
  departmentId: string | null;
  department?: Department;
  subjects: string[];
  qualification: string;
  education: string | null;
  experienceYears: number;
  teachingExperienceYears: number;
  bio: string | null;
  photoUrl: string | null;
  email: string | null;
  isActive: boolean;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}
