export type EventCategory = 'open_doors' | 'science' | 'sports' | 'culture' | 'general';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  contentHtml: string | null;
  eventDate: string;
  endDate: string | null;
  location: string;
  category: EventCategory;
  coverImageUrl: string | null;
  isFeatured: boolean;
  isPublished: boolean;
  organizer: string | null;
  registrationUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
