import { useState, useEffect } from 'react';
import { Appointment, FilterState, Metrics } from '../types';

// Dados simulados para teste
const generateSimulatedData = (): Appointment[] => {
  const doctors = ['Dr. Maria Silva', 'Dr. João Santos', 'Dr. Ana Costa', 'Dr. Pedro Lima', 'Dr. Carla Mendes'];
  const procedures = ['Abdominoplastia', 'Rinoplastia', 'Lipoaspiração', 'Mamoplastia', 'Consulta', 'Blefaroplastia', 'Otoplastia'];
  const statuses: Array<'confirmed' | 'cancelled' | 'noshow' | 'completed'> = ['confirmed', 'cancelled', 'noshow', 'completed'];
  const values = ['200.00', '500.00', '800.00', '1200.00', '1500.00', '2000.00', '2500.00', '3000.00', '3500.00'];

  const appointments: Appointment[] = [];
  
  // Gerar 50 agendamentos dos últimos 90 dias
  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30 + Math.floor(Math.random() * 60));

    appointments.push({
      id: `apt_${i + 1}`,
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      doctor: doctors[Math.floor(Math.random() * doctors.length)],
      procedure_type: procedures[Math.floor(Math.random() * procedures.length)],
      value: values[Math.floor(Math.random() * values.length)]
    });
  }

  // Ordenar por data (mais recentes primeiro)
  return appointments.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
};

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    period: 30,
    doctor: '',
    status: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    // Simular delay de carregamento
    setTimeout(() => {
      const simulatedData = generateSimulatedData();
      console.log('Dados simulados carregados:', simulatedData.length, 'agendamentos');
      setAppointments(simulatedData);
      setLoading(false);
    }, 1000);
  };

  const applyFilters = () => {
    let filtered = [...appointments];
    
    // Filtro de período
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - filters.period);
    filtered = filtered.filter(apt => new Date(apt.start_time) >= cutoffDate);
    
    // Filtro de médico
    if (filters.doctor) {
      filtered = filtered.filter(apt => apt.doctor === filters.doctor);
    }
    
    // Filtro de status
    if (filters.status) {
      filtered = filtered.filter(apt => apt.status === filters.status);
    }
    
    setFilteredAppointments(filtered);
  };

  const calculateMetrics = (): Metrics => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(apt => apt.status === 'completed').length;
    const noShow = filteredAppointments.filter(apt => apt.status === 'noshow').length;
    const totalRevenue = filteredAppointments
      .filter(apt => apt.status === 'completed')
      .reduce((sum, apt) => sum + parseFloat(apt.value), 0);
    
    return {
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      noShowRate: total > 0 ? (noShow / total) * 100 : 0,
      totalRevenue
    };
  };

  const getDoctors = (): string[] => {
    const doctors = [...new Set(appointments.map(apt => apt.doctor))];
    return doctors.sort();
  };

  const exportData = () => {
    const csvData = filteredAppointments.map(apt => [
      new Date(apt.start_time).toLocaleString('pt-BR'),
      apt.procedure_type,
      apt.doctor,
      apt.status,
      `R$ ${parseFloat(apt.value).toFixed(2).replace('.', ',')}`
    ]);
    
    const headers = ['Data/Hora', 'Procedimento', 'Médico', 'Status', 'Valor'];
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
    refresh: fetchAppointments,
    exportData
  };
};