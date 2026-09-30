export interface CampusItem {
  id: string;
  name: string;
  address: string;
  departments: string;
  phone: string;
  email: string;
  workHours: string;
  transport: string;
  orderIndex?: number;
}

export interface PhoneDirectoryItem {
  id: string;
  title: string;
  phone: string;
  note: string;
  orderIndex?: number;
}

export interface ContactsDirections {
  bus: string;
  landmark: string;
}

export interface ContactsMapCoordinates {
  lat: number;
  lng: number;
  zoom: number;
}

export interface ContactsData {
  campuses: CampusItem[];
  phones: PhoneDirectoryItem[];
  directions: ContactsDirections;
  mapCoordinates: ContactsMapCoordinates;
}
