export interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: 'male' | 'female';
  address: string;
  medicalHistory: string;
  createdAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  phone: string;
  workingDays: string[];
  workingHours: string;
  isActive: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  treatment: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
  createdAt: string;
}

export interface Treatment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  treatmentType: string;
  description: string;
  cost: number;
  date: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  patientId: string;
  patientName: string;
  treatments: { name: string; cost: number }[];
  totalAmount: number;
  paidAmount: number;
  status: 'paid' | 'partial' | 'unpaid';
  date: string;
  createdAt: string;
}

export interface CenterSettings {
  centerName: string;
  logo: string;
  phone: string;
  address: string;
  isSetupComplete: boolean;
}

// ملاحظات المرضى
export interface PatientNote {
  id: string;
  patientId: string;
  note: string;
  createdAt: string;
  createdBy: string;
}

// الوصفات الطبية
export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  patientName: string;
  date: string;
  medications: PrescriptionMedication[];
  notes: string;
}

export interface PrescriptionMedication {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

// صور الأشعة
export interface XRayImage {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  description: string;
  imageData: string;
  date: string;
  doctorId: string;
  doctorName: string;
}

// المخزن
export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  price: number;
  supplier: string;
  lastUpdated: string;
}

// التنبيهات
export interface AppNotification {
  id: string;
  type: 'appointment' | 'inventory' | 'payment' | 'general';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  relatedId?: string;
}

// نظام المستخدمين والصلاحيات
export type UserRole = 'admin' | 'reception' | 'doctor';

export interface User {
  id: string;
  username: string;
  password: string;
  name: string;
  role: UserRole;
  doctorId?: string;
  isActive: boolean;
  createdAt: string;
}

export interface RolePermissions {
  dashboard: boolean;
  notifications: boolean;
  patientFiles: boolean;
  patients: boolean;
  patientNotes: boolean;
  doctors: boolean;
  appointments: boolean;
  treatments: boolean;
  prescriptions: boolean;
  xrays: boolean;
  invoices: boolean;
  inventory: boolean;
  reports: boolean;
  settings: boolean;
  userManagement: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin: {
    dashboard: true,
    notifications: true,
    patientFiles: true,
    patients: true,
    patientNotes: true,
    doctors: true,
    appointments: true,
    treatments: true,
    prescriptions: true,
    xrays: true,
    invoices: true,
    inventory: true,
    reports: true,
    settings: true,
    userManagement: true,
  },
  reception: {
    dashboard: true,
    notifications: true,
    patientFiles: false,
    patients: true,
    patientNotes: false,
    doctors: false,
    appointments: true,
    treatments: false,
    prescriptions: false,
    xrays: false,
    invoices: true,
    inventory: false,
    reports: false,
    settings: false,
    userManagement: false,
  },
  doctor: {
    dashboard: true,
    notifications: true,
    patientFiles: true,
    patients: false,  // لا يضيف مرضى - من اختصاص الاستقبال
    patientNotes: true,
    doctors: false,
    appointments: false,  // لا يحجز مواعيد - من اختصاص الاستقبال
    treatments: true,
    prescriptions: true,
    xrays: true,
    invoices: false,
    inventory: false,
    reports: false,
    settings: false,
    userManagement: false,
  },
};

export const ROLE_NAMES: Record<UserRole, string> = {
  admin: 'مدير النظام',
  reception: 'موظف استقبال',
  doctor: 'طبيب',
};

export interface DentalData {
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  treatments: Treatment[];
  invoices: Invoice[];
  centerSettings: CenterSettings;
  patientNotes: PatientNote[];
  prescriptions: Prescription[];
  xrayImages: XRayImage[];
  inventory: InventoryItem[];
  notifications: AppNotification[];
  users: User[];
}
