import { useState, useEffect } from 'react';
import { Appointment, FilterState, Metrics, ReportData } from '../types';

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    period: 30,
    doctor: '',
    patient: '',
    status: '',
    city: '',
    procedure: '',
    insurance: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('https://sputnik-n8n.cloudfy.cloud/webhook/dashboard-data');
      const data = await response.json();
      
      const mappedData = data.map((item: any) => ({
        id: item.opportunity_id,
        patient_name: item.patient_name,
        doctor: item.doctor || 'Médico não definido',
        city: item.city || 'Cidade não informada',
        procedure: item.procedure || 'Procedimento não informado',
        insurance: item.insurance || 'Convênio não informado',
        appointment_status: item.appointment_status,
        created_at: item.created_at || new Date().toISOString()
      }));
      
      setAppointments(mappedData);
      setLoading(false);
    } catch (error) {
      console.error('Erro:', error);
      setError('Erro ao carregar dados');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    setFilteredAppointments(appointments);
  };

  const calculateMetrics = (): Metrics => {
    const total = filteredAppointments.length;
    return {
      total,
      completionRate: 0,
      noShowRate: 0,
      totalRevenue: 0,
      scheduledSurgeries: 0,
      completedSurgeries: 0,
      cancelledSurgeries: 0
    };
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters]);

  return {
    appointments: filteredAppointments,
    loading,
    error,
    filters,
    setFilters,
    metrics: calculateMetrics(),
    doctors: [],
    cities: [],
    procedures: [],
    insurances: [],
    patients: [],
    reportData: {} as ReportData,
    refresh: fetchAppointments,
    exportData: () => {}
  };
};
