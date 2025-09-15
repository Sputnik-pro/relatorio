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
    
    // Buscar dados reais do n8n
    fetch('https://sputnik-n8n.cloudfy.cloud/webhook/dashboard-data')
      .then(response => response.json())
      .then(data => {
        console.log('Dados reais carregados:', data.length, 'agendamentos');
        
        // Mapear dados corretos da nossa API
        const mappedData = data.map((item: any) => ({
          opportunity_id: item.opportunity_id,
          patient_name: item.patient_name,
          doctor: item.doctor || 'Médico não definido',
          city: item.city,
          procedure: item.procedure,
          insurance: item.insurance,
          appointment_status: item.appointment_status,
          phone: item.phone,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));
        
        setAppointments(mappedData);
        setLoading(false);
      })
      .catch(error => {
        console.error('Erro ao carregar dados:', error);
        setError('Erro ao carregar dados dos agendamentos');
        setLoading(false);
      });
  };

  const applyFilters = () => {
    let filtered = [...appointments];
    
    // Filtro de período
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.period);
    filtered = filtered.filter(apt => new Date(apt.created_at) >= cutoffDate);
    
    // Filtro de médico
    if (filters.doctor) {
      filtered = filtered.filter(apt => apt.doctor === filters.doctor);
    }
    
    // Filtro de paciente
    if (filters.patient) {
      filtered = filtered.filter(apt => apt.patient_name === filters.patient);
    }
    
    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter(apt => apt.appointment_status === filters.status);
    }
    
    // Filtro de cidade
    if (filters.city) {
      filtered = filtered.filter(apt => apt.city === filters.city);
    }
    
    // Filtro de procedimento
    if (filters.procedure) {
      filtered = filtered.filter(apt => apt.procedure === filters.procedure);
    }
    
    // Filtro de convênio
    if (filters.insurance) {
      filtered = filtered.filter(apt => apt.insurance === filters.insurance);
    }
    
    setFilteredAppointments(filtered);
  };

  const calculateMetrics = (): Metrics => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(apt => apt.appointment_status === 'Concluída - Compareceu').length;
    const noShow = filteredAppointments.filter(apt => apt.appointment_status === 'Não Compareceu').length;
    const cancelled = filteredAppointments.filter(apt => apt.appointment_status === 'Cancelada').length;
    const scheduled = filteredAppointments.filter(apt => apt.appointment_status === 'Confirmada').length;
    
    return {
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      noShowRate: total > 0 ? (noShow / total) * 100 : 0,
      totalRevenue: 0,
      scheduledSurgeries: scheduled,
      completedSurgeries: completed,
      cancelledSurgeries: cancelled
    };
  };

  const getDoctors = (): string[] => {
    const doctors = [...new Set(appointments.map(apt => apt.doctor))];
    return doctors.filter(doctor => doctor && doctor !== 'A definir').sort();
  };

  const getCities = (): string[] => {
    const cities = [...new Set(appointments.map(apt => apt.city))];
    return cities.filter(Boolean).sort();
  };

  const getProcedures = (): string[] => {
    const procedures = [...new Set(appointments.map(apt => apt.procedure))];
    return procedures.filter(Boolean).sort();
  };

  const getInsurances = (): string[] => {
    const insurances = [...new Set(appointments.map(apt => apt.insurance))];
    return insurances.filter(Boolean).sort();
  };

  const getPatients = (): string[] => {
    const patients = [...new Set(appointments.map(apt => apt.patient_name))];
    return patients.filter(Boolean).sort();
  };

  const getReportData = (): ReportData => {
    const scheduledSurgeries = filteredAppointments.filter(apt => apt.appointment_status === 'Confirmada');
    const completedSurgeries = filteredAppointments.filter(apt => apt.appointment_status === 'Concluída - Compareceu');
    const cancelledSurgeries = filteredAppointments.filter(apt => apt.appointment_status === 'Cancelada');
    
    const proceduresSummary = filteredAppointments.reduce((acc, apt) => {
      if (apt.procedure) {
        acc[apt.procedure] = (acc[apt.procedure] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      scheduledSurgeries,
      completedSurgeries,
      cancelledSurgeries,
      proceduresSummary,
      cancellationReasons: {}
    };
  };

  const exportData = () => {
    const csvData = filteredAppointments.map(apt => [
      apt.patient_name,
      apt.city,
      new Date(apt.created_at).toLocaleString('pt-BR'),
      apt.procedure,
      apt.doctor,
      apt.insurance,
      apt.appointment_status
    ]);
    
    const headers = ['Paciente', 'Cidade', 'Data/Hora', 'Procedimento', 'Médico', 'Convênio', 'Status'];
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `agendamentos_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
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
    doctors: getDoctors(),
    cities: getCities(),
    procedures: getProcedures(),
    insurances: getInsurances(),
    patients: getPatients(),
    reportData: getReportData(),
    refresh: fetchAppointments,
    exportData
  };
};
