export type Role = 'admin' | 'employee';

export type CustomerStatus = 'active' | 'passive' | 'new' | 'vip' | 'problematic' | 'archived';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  birthDate?: string; // YYYY-MM-DD
  notes?: string;
  status: CustomerStatus;
  nextRecommendedDate?: string; // YYYY-MM-DD (calculated e.g. 21 days for laser)
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string;
  name: string;
  profession: string; // კოსმეტოლოგი, ლაზეროთერაპევტი, წამწამების სპეციალისტი, etc.
  phone: string;
  email?: string;
  username: string;
  password?: string; // stored safely for client validation
  isActive: boolean;
  role: Role; // admin or employee
  workingDays: number[]; // 0 for Sunday, 1 for Monday, etc.
  workingHoursStart: string; // HH:MM
  workingHoursEnd: string; // HH:MM
  procedures: string[]; // list of procedureIds they can perform
  commissionPercent: number; // default percentage (e.g. 40)
  procedureCommissions?: Record<string, number>; // procedureId -> custom percentage override
  color?: string; // hex or tailwind class
}

export interface Procedure {
  id: string;
  name: string;
  category: string;
  description?: string;
  price: number; // default price
  minPrice?: number; // minimum price allowed to set
  duration: number; // duration in minutes
  isActive: boolean;
  isRecurring: boolean; // if next visit is recommended
  recurrenceDays?: number; // e.g. 21 days for laser
}

export type AppointmentStatus =
  | 'booked'              // ჩაწერილია
  | 'confirmed'           // დადასტურებულია
  | 'completed'           // დასრულებულია
  | 'noshow'              // არ მოვიდა
  | 'cancelled'           // გაუქმებულია
  | 'reschedule'          // გადასატანია
  | 'pending_confirmation'; // ელოდება დროის შეთანხმებას

export type PaymentStatus = 'paid' | 'partial' | 'unpaid' | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export type DiscountType = 'none' | 'amount' | 'percent';

export interface Appointment {
  id: string;
  customerId: string; // "new_customer_id" or real customer ID
  customerName: string; // duplicated for easy fast render
  phone: string;
  procedureId: string;
  employeeId: string;
  dateTime: string; // YYYY-MM-DDTHH:mm
  duration: number; // minutes
  price: number; // starting price (before discount)
  discountType: DiscountType;
  discountValue: number;
  finalPrice: number; // calculated
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  appointmentStatus: AppointmentStatus;
  note?: string;
  selectedZones?: string[]; // list of selected laser zone names or ids
  isLaserFollowUp?: boolean; // if created automatically as a 21-day recommendation
  createdAt: string;
  updatedAt: string;
  createdBy: string; // employee/admin name or ID
}

export type MessageChannel = 'sms' | 'whatsapp' | 'email';

export type MessageTemplateType =
  | 'booking_confirmation'
  | 'reminder'
  | 'cancellation'
  | 'reschedule'
  | 'laser_followup'
  | 'birthday'
  | 'promo';

export interface MessageTemplate {
  id: string;
  name: string;
  type?: MessageTemplateType;
  channel?: MessageChannel;
  text?: string;
  body: string; // content body
  subject?: string;
  isActive?: boolean;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

export interface MessageLog {
  id: string;
  customerId: string;
  customerName: string;
  channel: MessageChannel;
  templateName: string;
  content: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
}

export interface SystemSettings {
  businessName: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  currency: string;
  whatsappGatewayStatus: boolean;
  enforceMinPriceLimit: boolean;
}

export interface ActionLog {
  id: string;
  userId: string;
  userName: string;
  userRole: Role;
  action: string;
  timestamp: string; // ISO String
  details: string;
}

export interface CenterSettings {
  centerName: string;
  address: string;
  contactPhone: string;
  workingHoursStart: string; // HH:MM
  workingHoursEnd: string; // HH:MM
  currencySymbol: string; // e.g. "₾" or "GEL"
}
