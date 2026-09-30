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
        address: '150100, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 42-uy',
        departments: 'Qabul komissiyasi (105-xona), Maʼmuriyat, Buxgalteriya, Axborot-resurs markazi (Kutubxona)',
        phone: '+998 (73) 244-00-00',
        email: 'info@texnikum2.uz',
        workHours: 'Dush–Shanba: 08:30 – 17:30',
        transport: '«Universitet» bekati (1, 8, 14, 22-sonli jamoat transporti)',
        orderIndex: 1,
      },
      {
        id: 'campus-2',
        name: 'Oʻquv-amaliyot binosi va laboratoriyalar',
        address: '150100, Fargʻona viloyati, Fargʻona shahri, B. Margʻinoniy koʻchasi, 18-uy',
        departments: 'IT-laboratoriyalar, kompyuter tarmoqlari sinflari, WorldSkills kasbiy mahorat ustaxonalari',
        phone: '+998 (73) 244-00-11',
        email: 'it-dept@texnikum2.uz',
        workHours: 'Dush–Shanba: 08:30 – 18:00',
        transport: '«Margʻinoniy» bekati (5, 12, 19-sonli marshrutkalar)',
        orderIndex: 2,
      },
      {
        id: 'campus-3',
        name: 'Talabalar turar joyi (Yotoqxona)',
        address: '150100, Fargʻona viloyati, Fargʻona shahri, Al-Fargʻoniy koʻchasi, 44-uy',
        departments: 'Yotoqxona maʼmuriyati, tibbiyot punkti, sport sektori, maʼnaviyat xonasi',
        phone: '+998 (73) 244-00-15',
        email: 'hostel@texnikum2.uz',
        workHours: 'Kechu-kunduz (24/7 navbatchilik va nazorat)',
        transport: 'Bosh oʻquv binosi yonida (1 daqiqalik piyoda yoʻl)',
        orderIndex: 3,
      },
    ],
    phones: [
      {
        id: 'phone-1',
        title: 'Qabul komissiyasi (ishonch telefoni)',
        phone: '+998 (73) 244-00-00',
        note: 'Qabul va hujjat topshirish boʻyicha maʼlumot',
        orderIndex: 1,
      },
      {
        id: 'phone-2',
        title: 'Direktor qabulxonasi / Devonxona',
        phone: '+998 (73) 244-00-01',
        note: 'Rasmiy yozishmalar va murojaatlar',
        orderIndex: 2,
      },
      {
        id: 'phone-3',
        title: 'Oʻquv-metodika boʻlimi',
        phone: '+998 (73) 244-00-02',
        note: 'Oʻquv jarayoni va akademik maʼlumotnomalar',
        orderIndex: 3,
      },
      {
        id: 'phone-4',
        title: 'Amaliyot va bitiruvchilar bandligi',
        phone: '+998 (73) 244-00-03',
        note: 'Ish beruvchilar bilan shartnomalar va dual taʼlim',
        orderIndex: 4,
      },
      {
        id: 'phone-5',
        title: 'Buxgalteriya (kontrakt toʻlovlari)',
        phone: '+998 (73) 244-00-04',
        note: 'Toʻlov-kontrakt shartnomalari va kvitansiyalar',
        orderIndex: 5,
      },
    ],
    directions: {
      bus: 'Fargʻona shahri boʻylab 1, 8, 14, 22-sonli avtobus yoki yoʻnalishli taksilar orqali «Universitet» yoki «2-son texnikum» bekatiga kelishingiz mumkin.',
      landmark: 'Fargʻona davlat universiteti bosh binosi roʻparasida, Al-Fargʻoniy koʻchasi boʻylab 42-uy.',
    },
    mapCoordinates: {
      lat: 40.3864,
      lng: 71.7864,
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
      return {
        success: true,
        data: this.contactsData,
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
