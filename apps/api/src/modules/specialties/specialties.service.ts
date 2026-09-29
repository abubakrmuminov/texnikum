import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse, PaginatedResponse, Specialty, UserProfile } from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateSpecialtyDto } from './dto/create-specialty.dto';
import { QuerySpecialtiesDto } from './dto/query-specialties.dto';
import { UpdateSpecialtyDto } from './dto/update-specialty.dto';

@Injectable()
export class SpecialtiesService {
  private specialties: Specialty[] = [
    {
      id: 'f0000000-0000-0000-0000-000000000001',
      code: '09.02.07',
      name: 'Информационные системы и программирование',
      slug: '09-02-07-informacionnye-sistemy-i-programmirovanie',
      qualification: 'Программист',
      departmentId: 'd0000000-0000-0000-0000-000000000001',
      durationMonths: 46,
      durationText: '3 года 10 месяцев на базе 9 классов',
      baseEducation: '9_classes',
      budgetPlaces: 50,
      commercialPlaces: 25,
      costPerYear: 135000,
      passingScore: 4.65,
      description: 'Флагманская специальность подготовки разработчиков прикладного и системного ПО.',
      careerOpportunities: 'Frontend/Backend разработчик, инженер-программист.',
      coverImageUrl: '/images/specialties/090207.webp',
      isActive: true,
      orderIndex: 1,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'f0000000-0000-0000-0000-000000000002',
      code: '09.02.06',
      name: 'Сетевое и системное администрирование',
      slug: '09-02-06-setevoe-i-sistemnoe-administrirovanie',
      qualification: 'Сетевой и системный администратор',
      departmentId: 'd0000000-0000-0000-0000-000000000002',
      durationMonths: 46,
      durationText: '3 года 10 месяцев на базе 9 классов',
      baseEducation: '9_classes',
      budgetPlaces: 30,
      commercialPlaces: 15,
      costPerYear: 125000,
      passingScore: 4.38,
      description: 'Программа готовит специалистов по поддержке локальных сетей и серверов.',
      careerOpportunities: 'Системный администратор, инженер технической поддержки.',
      coverImageUrl: '/images/specialties/090206.webp',
      isActive: true,
      orderIndex: 2,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
  ) {}

  async findAll(query: QuerySpecialtiesDto): Promise<ApiResponse<PaginatedResponse<Specialty>>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const offset = (page - 1) * limit;

    let filtered = [...this.specialties];
    if (query.isActive !== undefined) {
      filtered = filtered.filter((s) => s.isActive === query.isActive);
    }
    if (query.baseEducation) {
      filtered = filtered.filter((s) => s.baseEducation === query.baseEducation || s.baseEducation === 'both');
    }
    if (query.departmentId) {
      filtered = filtered.filter((s) => s.departmentId === query.departmentId);
    }
    if (query.search) {
      const s = query.search.toLowerCase();
      filtered = filtered.filter(
        (sp) =>
          sp.name.toLowerCase().includes(s) ||
          sp.code.toLowerCase().includes(s) ||
          sp.qualification.toLowerCase().includes(s),
      );
    }

    const total = filtered.length;
    const items = filtered.slice(offset, offset + limit);

    return {
      success: true,
      data: {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async findOne(slugOrId: string): Promise<ApiResponse<Specialty>> {
    const item = this.specialties.find((s) => s.slug === slugOrId || s.id === slugOrId);
    if (!item) {
      throw new NotFoundException(`Специальность «${slugOrId}» не найдена`);
    }
    return {
      success: true,
      data: item,
      timestamp: new Date().toISOString(),
    };
  }

  async create(dto: CreateSpecialtyDto, user: UserProfile): Promise<ApiResponse<Specialty>> {
    const slug =
      dto.slug ||
      `${dto.code.replace(/\./g, '-')}-${dto.name.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '-').slice(0, 50)}`;

    const newSpecialty: Specialty = {
      id: `specialty-${Date.now()}`,
      code: dto.code,
      name: dto.name,
      slug,
      qualification: dto.qualification,
      departmentId: dto.departmentId || null,
      durationMonths: dto.durationMonths,
      durationText: dto.durationText,
      baseEducation: dto.baseEducation,
      budgetPlaces: dto.budgetPlaces,
      commercialPlaces: dto.commercialPlaces,
      costPerYear: dto.costPerYear || null,
      passingScore: dto.passingScore || null,
      description: dto.description,
      careerOpportunities: dto.careerOpportunities || null,
      coverImageUrl: dto.coverImageUrl || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      orderIndex: dto.orderIndex || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.specialties.push(newSpecialty);
    await this.auditService.log(
      user.id,
      'CREATE',
      'specialties',
      newSpecialty.id,
      newSpecialty as unknown as Record<string, unknown>,
    );

    return {
      success: true,
      data: newSpecialty,
      message: 'Специальность успешно добавлена',
      timestamp: new Date().toISOString(),
    };
  }

  async update(id: string, dto: UpdateSpecialtyDto, user: UserProfile): Promise<ApiResponse<Specialty>> {
    const index = this.specialties.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Специальность с ID «${id}» не найдена`);
    }

    const old = this.specialties[index]!;
    const updated: Specialty = {
      ...old,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.specialties[index] = updated;
    await this.auditService.log(
      user.id,
      'UPDATE',
      'specialties',
      id,
      updated as unknown as Record<string, unknown>,
      old as unknown as Record<string, unknown>,
    );

    return {
      success: true,
      data: updated,
      message: 'Специальность обновлена',
      timestamp: new Date().toISOString(),
    };
  }

  async delete(id: string, user: UserProfile): Promise<ApiResponse<{ deleted: boolean }>> {
    const index = this.specialties.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Специальность с ID «${id}» не найдена`);
    }

    const old = this.specialties[index]!;
    this.specialties.splice(index, 1);
    await this.auditService.log(user.id, 'DELETE', 'specialties', id, undefined, old as unknown as Record<string, unknown>);

    return {
      success: true,
      data: { deleted: true },
      message: 'Специальность удалена',
      timestamp: new Date().toISOString(),
    };
  }
}
