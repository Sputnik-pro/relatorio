export interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'noshow' | 'completed';
  doctor: string;
  procedure_type: string;
  value: string;
}

export interface FilterState {
  period: number;
  doctor: string;
  status: string;
}

export interface Metrics {
  total: number;
  completionRate: number;
  noShowRate: number;
  totalRevenue: number;
}