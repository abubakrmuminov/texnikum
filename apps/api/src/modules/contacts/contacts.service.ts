import { Injectable } from '@nestjs/common';
import {
  ApiResponse,
  ContactsData,
  UserProfile,
} from '@college/shared';
import { AuditService } from '../audit/audit.service';
import { CacheService } from '../cache/cache.service';
import { SupabaseService } from '../supabase/supabase.service';
import { UpdateContactsDto } from './dto/update-contacts.dto';

@Injectable()
export class ContactsService {
  private contactsData: ContactsData = {
    campuses: [
      {
        id: 'campus-1',
        name: 'Bosh oʻquv binosi',
        address: '100000, Toshkent shahri, Chilonzor tumani, Bunyodkor shoh koʻchasi, 1-uy',
        departments: 'Qabul komissiyasi (105-xona), Maʼmuriyat, Buxgalteriya, Axborot-resurs markazi (Kutubxona)',
        phone: '+998 (71) 200-00-00',
        email: 'info@texnikum.uz',
        workHours: 'Dush–Shanba: 08:30 – 17:30',
        transport: '«Texnikum» bekati (jamoat transporti)',
        orderIndex: 1,
      },
      {
        id: 'campus-2',
        name: 'Oʻquv-amaliyot binosi va laboratoriyalar',
        address: '100000, Toshkent shahri, Chilonzor tumani, Bunyodkor shoh koʻchasi, 2-uy',
        departments: 'IT-laboratoriyalar, kompyuter tarmoqlari sinflari, WorldSkills kasbiy mahorat ustaxonalari',
        phone: '+998 (71) 200-00-11',
        email: 'it-dept@texnikum.uz',
        workHours: 'Dush–Shanba: 08:30 – 18:00',
        transport: '«Texnikum» bekati (marshrutkalar)',
        orderIndex: 2,
      },
      {
        id: 'campus-3',
        name: 'Talabalar turar joyi (Yotoqxona)',
        address: '100000, Toshkent shahri, Chilonzor tumani, Bunyodkor shoh koʻchasi, 3-uy',
        departments: 'Yotoqxona maʼmuriyati, tibbiyot punkti, sport sektori, maʼnaviyat xonasi',
        phone: '+998 (71) 200-00-15',
        email: 'hostel@texnikum.uz',
        workHours: 'Kechu-kunduz (24/7 navbatchilik va nazorat)',
        transport: 'Bosh oʻquv binosi yonida (1 daqiqalik piyoda yoʻl)',
        orderIndex: 3,
      },
    ],
    phones: [
      {
        id: 'phone-1',
        title: 'Qabul komissiyasi (ishonch telefoni)',
        phone: '+998 (71) 200-00-00',
        note: 'Qabul va hujjat topshirish boʻyicha maʼlumot',
        orderIndex: 1,
      },
      {
        id: 'phone-2',
        title: 'Direktor qabulxonasi / Devonxona',
        phone: '+998 (71) 200-00-01',
        note: 'Rasmiy yozishmalar va murojaatlar',
        orderIndex: 2,
      },
      {
        id: 'phone-3',
        title: 'Oʻquv-metodika boʻlimi',
        phone: '+998 (71) 200-00-02',
        note: 'Oʻquv jarayoni va akademik maʼlumotnomalar',
        orderIndex: 3,
      },
      {
        id: 'phone-4',
        title: 'Amaliyot va bitiruvchilar bandligi',
        phone: '+998 (71) 200-00-03',
        note: 'Ish beruvchilar bilan shartnomalar va dual taʼlim',
        orderIndex: 4,
      },
      {
        id: 'phone-5',
        title: 'Buxgalteriya (kontrakt toʻlovlari)',
        phone: '+998 (71) 200-00-04',
        note: 'Toʻlov-kontrakt shartnomalari va kvitansiyalar',
        orderIndex: 5,
      },
    ],
    directions: {
      bus: 'Shahar boʻylab avtobus yoki yoʻnalishli taksilar orqali «Texnikum» bekatiga kelishingiz mumkin.',
      landmark: 'Markaziy maydon roʻparasida, Mustaqillik shoh koʻchasi boʻylab 1-uy.',
    },
    mapCoordinates: {
      lat: 41.3111,
      lng: 69.2797,
      zoom: 16,
    },
  };

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly auditService: AuditService,
    private readonly cacheService: CacheService,
  ) {}

  async getContacts(): Promise<ApiResponse<ContactsData>> {
    return this.cacheService.getOrSet('contacts:data', 300, async () => {
      let data = { ...this.contactsData };

      if (this.supabaseService.isReady()) {
        const supabase = this.supabaseService.getClient();
        if (supabase) {
          const { data: inst } = await supabase
            .from('institution_settings')
            .select('*')
            .eq('id', 1)
            .maybeSingle();

          if (inst && inst.is_configured) {
            const campuses = data.campuses.map((c, i) => {
              if (i === 0) {
                return {
                  ...c,
                  name: inst.short_name_uz ? `${inst.short_name_uz} (Bosh bino)` : c.name,
                  address: inst.legal_address_uz || c.address,
                  phone: inst.main_phone || c.phone,
                  email: inst.contact_email || c.email,
                  workHours: inst.work_hours_uz || c.workHours,
                };
              }
              return c;
            });

            data = {
              ...data,
              campuses,
              mapCoordinates: {
                lat: Number(inst.geo_latitude || 40.3864),
                lng: Number(inst.geo_longitude || 71.7864),
                zoom: 16,
              },
            };
          }
        }
      }

      return {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      };
    });
  }

  async updateContacts(
    dto: UpdateContactsDto,
    user: UserProfile,
  ): Promise<ApiResponse<ContactsData>> {
    const oldData = { ...this.contactsData };

    this.contactsData = {
      campuses: dto.campuses.map((c, i) => ({
        ...c,
        id: c.id || `campus-${Date.now()}-${i}`,
        orderIndex: c.orderIndex ?? i + 1,
      })),
      phones: dto.phones.map((p, i) => ({
        ...p,
        id: p.id || `phone-${Date.now()}-${i}`,
        orderIndex: p.orderIndex ?? i + 1,
      })),
      directions: {
        bus: dto.directions.bus,
        landmark: dto.directions.landmark,
      },
      mapCoordinates: {
        lat: dto.mapCoordinates.lat,
        lng: dto.mapCoordinates.lng,
        zoom: dto.mapCoordinates.zoom || 16,
      },
    };

    await this.auditService.log(
      user.id,
      'UPDATE',
      'contacts',
      'main',
      this.contactsData as unknown as Record<string, unknown>,
      oldData as unknown as Record<string, unknown>,
    );

    await this.cacheService.delByPattern('contacts:*');

    return {
      success: true,
      data: this.contactsData,
      message: 'Aloqa maʼlumotlari muvaffaqiyatli yangilandi',
      timestamp: new Date().toISOString(),
    };
  }
}
