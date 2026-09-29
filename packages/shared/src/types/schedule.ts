import { Teacher } from './teacher';

export type Parity = 'both' | 'odd' | 'even';

export interface ScheduleItem {
  id: string;
  groupName: string;
  dayOfWeek: number; // 1 = Понедельник, 6 = Суббота
  lessonNumber: number; // 1 .. 7
  timeStart: string;
  timeEnd: string;
  subject: string;
  teacherId: string | null;
  teacher?: Teacher;
  classroom: string;
  parity: Parity;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
