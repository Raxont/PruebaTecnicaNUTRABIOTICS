export type UserRole = 'ADMIN' | 'DOCTOR' | 'PATIENT';

export interface PrescriptionItem {
  id: string;
  name: string;
  dosage: string;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  code: string;
  doctorId: string;
  patientId?: string;
  patientEmail?: string;
  status: 'PENDING' | 'CONSUMED';
  notes?: string;
  consumedAt?: string;
  createdAt: string;
  items: PrescriptionItem[];
  doctor?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
  patient?: {
    id: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  };
}

export interface MetricsResponse {
  totalPatients: number;
  totalDoctors: number;
  totalPrescriptions: number;
  prescriptionsByStatus: {
    pending: number;
    consumed: number;
  };
  prescriptionsByDay: Array<{ date: string; count: number }>;
}
