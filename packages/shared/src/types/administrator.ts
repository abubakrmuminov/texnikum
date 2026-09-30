export type AdministratorCategory = 'leadership' | 'department_head' | 'administrative';

export interface AdministratorMember {
  id: string;
  fullName: string;
  slug: string;
  position: string;
  category: AdministratorCategory;
  departmentId?: string | null;
  departmentName?: string | null;
  receptionHours: string;
  phone: string;
  email: string;
  roomNumber: string;
  duties?: string;
  bio?: string;
  photoUrl?: string | null;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
