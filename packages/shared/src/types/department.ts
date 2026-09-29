export interface Department {
  id: string;
  name: string;
  slug: string;
  headName: string | null;
  description: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}
