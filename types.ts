
export enum RoomStatus {
  VACANT = 'VACANT',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE',
}

export enum MaintenanceStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'TENANT';
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  roomId?: string;
  citizenId?: string;
}

export interface Tenant {
  id?: string;
  name: string;
  phone: string;
  email?: string;
  leaseStart: string;
  leaseEnd: string;
}

export interface RoomHistory {
  id: string;
  tenantName: string;
  startDate: string;
  endDate: string;
  note?: string;
}

export interface Room {
  id: string;
  number: string;
  floor: number;
  price: number;
  status: RoomStatus;
  currentTenant?: Tenant;
  history: RoomHistory[];
  lastMeterWater: number;
  lastMeterElec: number;
}

export interface Invoice {
  id: string;
  roomId: string;
  roomNumber: string;
  month: string;
  year: number;
  prevWater: number;
  currWater: number;
  prevElec: number;
  currElec: number;
  waterUnit: number;
  elecUnit: number;
  waterPrice: number;
  elecPrice: number;
  rentPrice: number;
  total: number;
  isPaid: boolean;
  dueDate: string;
}

export interface MaintenanceRequest {
  id: string;
  roomId: string;
  description: string;
  category: string; // e.g., Plumbing, Electric, AC
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: MaintenanceStatus;
  reportedAt: string;
  aiAnalysis?: string; // AI Suggestion
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string;
  isAiGenerated?: boolean;
}

export interface Parcel {
  id: string;
  roomNumber: string;
  recipientName: string;
  carrier: string; // Kerry, Flash, ThaiPost
  trackingNumber?: string;
  arrivedAt: string;
  status: 'WAITING' | 'COLLECTED';
  collectedAt?: string;
  imageUrl?: string;
}

export interface AppSettings {
  dormName: string;
  waterRate: number;
  elecRate: number;
  commonFee: number;
  theme?: string;
  darkMode?: boolean;
}
