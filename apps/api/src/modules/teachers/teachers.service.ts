import { Injectable, NotFoundException } from '@nestjs/common';
import { ApiResponse, Department, PaginatedResponse, Teacher, UserProfile } from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { QueryTeachersDto } from './dto/query-teachers.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  private departments: Department[] = [
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      name: 'Dasturiy injiniring va axborot tizimlari boʻlimi',
      slug: 'it-programming',
      headName: 'Rustamov Jasur Anvarovich',
      description: 'Dasturiy taʼminot va raqamli texnologiyalar boʻyicha malakali mutaxassislar tayyorlash',
      contactEmail: 'it@texnikum.uz',
      contactPhone: '+998 (71) 200-00-11',
      orderIndex: 1,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      name: 'Tarmoq maʼmuriyatchiligi va kiberxavfsizlik boʻlimi',
      slug: 'networks-security',
      headName: 'Alimov Bobur Mirzayevich',
      description: 'Tizim maʼmurlari va axborot xavfsizligi mutaxassislarini tayyorlash',
      contactEmail: 'security@texnikum.uz',
      contactPhone: '+998 (71) 200-00-12',
      orderIndex: 2,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  private teachers: Teacher[] = [
    {
      id: 'e0000000-0000-0000-0000-000000000001',
      fullName: 'Rustamov Jasur Anvarovich',
      slug: 'rustamov-jasur-anvarovich',
      position: 'Boʻlim mudiri, oliy toifali pedagog',
      departmentId: 'd0000000-0000-0000-0000-000000000001',
      subjects: ['Algoritmlash va dasturlash asoslari', 'Dasturiy taʼminotni ishlab chiqish texnologiyalari'],
      qualification: 'Oliy malaka toifasi, Oʻrta maxsus va kasb-hunar taʼlimi aʼlochisi',
      education: 'Toshkent axborot texnologiyalari universiteti (Amaliy informatika magistri)',
      experienceYears: 22,
      teachingExperienceYears: 18,
      bio: 'Dasturlash boʻyicha 15 dan ortiq oʻquv-uslubiy qoʻllanmalar muallifi.',
      photoUrl: '/images/teachers/smirnova.webp',
      email: 'j.rustamov@texnikum.uz',
      isActive: true,
      orderIndex: 1,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'e0000000-0000-0000-0000-000000000002',
      fullName: 'Karimova Dilnoza Shuhratovna',
      slug: 'karimova-dilnoza-shuhratovna',
      position: 'Maxsus fanlar oʻqituvchisi, WorldSkills Uzbekistan eksperti',
      departmentId: 'd0000000-0000-0000-0000-000000000001',
      subjects: ['Veb-ilovalarni yaratish', 'Maʼlumotlar bazasi va MBBT'],
      qualification: 'Oliy malaka toifasi',
      education: 'Oʻzbekiston Milliy universiteti (Amaliy matematika va informatika)',
      experienceYears: 12,
      teachingExperienceYears: 9,
      bio: '«Veb-texnologiyalar» kompetensiyasi boʻyicha hududiy ekspert.',
      photoUrl: '/images/teachers/vasiliev.webp',
      email: 'd.karimova@texnikum.uz',
      isActive: true,
      orderIndex: 2,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
    {
      id: 'e0000000-0000-0000-0000-000000000003',
      fullName: 'Alimov Bobur Mirzayevich',
      slug: 'alimov-bobur-mirzayevich',
      position: 'Boʻlim mudiri, texnika fanlari nomzodi',
      departmentId: 'd0000000-0000-0000-0000-000000000002',
      subjects: ['Infokommunikatsiya tizimlari va tarmoqlari', 'Tarmoqlarni tashkil etish va maʼmurlash'],
      qualification: 'Oliy toifa, t.f.n.',
      education: 'Toshkent axborot texnologiyalari universiteti',
      experienceYears: 19,
      teachingExperienceYears: 15,
      bio: 'Tarmoq texnologiyalari va kiberxavfsizlik yoʻnalishi rahbari.',
      photoUrl: '/images/teachers/kuznecova.webp',
      email: 'b.alimov@texnikum.uz',
      isActive: true,
      orderIndex: 3,
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    },
  ];

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  async findAll(query: QueryTeachersDto): Promise<ApiResponse<PaginatedResponse<Teacher>>> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const act = query.isActive !== undefined ? String(query.isActive) : 'all';
    const dept = query.departmentId || 'all';
    const subj = query.subject ? encodeURIComponent(query.subject.trim().toLowerCase()) : 'all';
    const search = query.search ? encodeURIComponent(query.search.trim().toLowerCase()) : '';
    const cacheKey = `teachers:list:p${page}:l${limit}:act${act}:d${dept}:s${subj}:q${search}`;

    return this.cacheService.getOrSet(cacheKey, 300, async () => {
      const offset = (page - 1) * limit;

      let filtered = [...this.teachers];
      if (query.isActive !== undefined) {
        filtered = filtered.filter((t) => t.isActive === query.isActive);
      }
      if (query.departmentId) {
        filtered = filtered.filter((t) => t.departmentId === query.departmentId);
      }
      if (query.subject) {
        filtered = filtered.filter((t) =>
          t.subjects.some((s) => s.toLowerCase().includes(query.subject!.toLowerCase())),
        );
      }
      if (query.search) {
        const s = query.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.fullName.toLowerCase().includes(s) ||
            t.position.toLowerCase().includes(s) ||
            t.subjects.some((sub) => sub.toLowerCase().includes(s)),
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
    });
  }

  async findOne(slugOrId: string): Promise<ApiResponse<Teacher>> {
    return this.cacheService.getOrSet(`teachers:detail:${slugOrId}`, 600, async () => {
      const teacher = this.teachers.find((t) => t.slug === slugOrId || t.id === slugOrId);
      if (!teacher) {
        throw new NotFoundException(`Преподаватель «${slugOrId}» не найден`);
      }
      return {
        success: true,
        data: teacher,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async findAllDepartments(): Promise<ApiResponse<Department[]>> {
    return this.cacheService.getOrSet('teachers:departments:all', 600, async () => {
      return {
        success: true,
        data: this.departments,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async create(dto: CreateTeacherDto, user: UserProfile): Promise<ApiResponse<Teacher>> {
    const slug =
      dto.slug ||
      dto.fullName.toLowerCase().replace(/[^a-z0-9а-яё]/gi, '-').slice(0, 50);

    const newTeacher: Teacher = {
      id: `teacher-${Date.now()}`,
      fullName: dto.fullName,
      slug,
      position: dto.position,
      departmentId: dto.departmentId || null,
      subjects: dto.subjects,
      qualification: dto.qualification,
      education: dto.education || null,
      experienceYears: dto.experienceYears || 0,
      teachingExperienceYears: dto.teachingExperienceYears || 0,
      bio: dto.bio || null,
      photoUrl: dto.photoUrl || null,
      email: dto.email || null,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      orderIndex: dto.orderIndex || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.teachers.push(newTeacher);
    await this.auditService.log(
      user.id,
      'CREATE',
      'teachers',
      newTeacher.id,
      newTeacher as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('teachers:*');

    return {
      success: true,
      data: newTeacher,
      message: 'Преподаватель успешно добавлен',
      timestamp: new Date().toISOString(),
    };
  }

  async update(id: string, dto: UpdateTeacherDto, user: UserProfile): Promise<ApiResponse<Teacher>> {
    const index = this.teachers.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Преподаватель с ID «${id}» не найден`);
    }

    const oldTeacher = this.teachers[index]!;
    const updated: Teacher = {
      ...oldTeacher,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.teachers[index] = updated;
    await this.auditService.log(
      user.id,
      'UPDATE',
      'teachers',
      id,
      updated as unknown as Record<string, unknown>,
      oldTeacher as unknown as Record<string, unknown>,
    );
    await this.cacheService.delByPattern('teachers:*');

    return {
      success: true,
      data: updated,
      message: 'Данные преподавателя обновлены',
      timestamp: new Date().toISOString(),
    };
  }

  async delete(id: string, user: UserProfile): Promise<ApiResponse<{ deleted: boolean }>> {
    const index = this.teachers.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundException(`Преподаватель с ID «${id}» не найден`);
    }

    const old = this.teachers[index]!;
    this.teachers.splice(index, 1);
    await this.auditService.log(user.id, 'DELETE', 'teachers', id, undefined, old as unknown as Record<string, unknown>);
    await this.cacheService.delByPattern('teachers:*');

    return {
      success: true,
      data: { deleted: true },
      message: 'Преподаватель удален из системы',
      timestamp: new Date().toISOString(),
    };
  }
}
