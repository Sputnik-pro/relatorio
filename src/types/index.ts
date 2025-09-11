export interface Appointment {
  id: string;
  patient_name: string;
  patient_city: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'noshow' | 'completed';
  doctor: string;
  procedure_type: string;
  value: string;
  insurance: string;
  cancellation_reason?: string;
}

export interface FilterState {
  period: number;
  doctor: string;
  patient: string;
  status: string;
  city: string;
  procedure: string;
  insurance: string;
}

export interface Metrics {
  total: number;
  completionRate: number;
  noShowRate: number;
  totalRevenue: number;
  scheduledSurgeries: number;
  completedSurgeries: number;
  cancelledSurgeries: number;
}

export interface ReportData {
  scheduledSurgeries: Appointment[];
  completedSurgeries: Appointment[];
  cancelledSurgeries: Appointment[];
  proceduresSummary: { [key: string]: number };
  cancellationReasons: { [key: string]: number };
}
