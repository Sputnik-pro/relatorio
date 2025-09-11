import { useState, useEffect } from 'react';
import { Appointment, FilterState, Metrics, ReportData } from '../types';

// Dados simulados para teste
const generateSimulatedData = (): Appointment[] => {
  const doctors = ['Dr. Maria Silva', 'Dr. João Santos', 'Dr. Ana Costa', 'Dr. Pedro Lima', 'Dr. Carla Mendes'];
  const procedures = ['Abdominoplastia', 'Rinoplastia', 'Lipoaspiração', 'Mamoplastia', 'Consulta', 'Blefaroplastia', 'Otoplastia'];
  const statuses: Array<'confirmed' | 'cancelled' | 'noshow' | 'completed'> = ['confirmed', 'cancelled', 'noshow', 'completed'];
  const values = ['200.00', '500.00', '800.00', '1200.00', '1500.00', '2000.00', '2500.00', '3000.00', '3500.00'];
  const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília', 'Fortaleza', 'Recife', 'Porto Alegre', 'Curitiba', 'Goiânia'];
  const insurances = ['Particular', 'Unimed', 'Bradesco Saúde', 'Amil', 'SulAmérica', 'Hapvida', 'NotreDame', 'Prevent Senior'];
  const patientNames = [
    'Ana Carolina Silva', 'João Pedro Santos', 'Maria Fernanda Costa', 'Carlos Eduardo Lima', 'Juliana Mendes',
    'Rafael Oliveira', 'Camila Rodrigues', 'Bruno Almeida', 'Larissa Ferreira', 'Diego Martins',
    'Gabriela Souza', 'Lucas Pereira', 'Amanda Ribeiro', 'Thiago Barbosa', 'Natália Cardoso',
    'Felipe Araújo', 'Isabela Nascimento', 'Gustavo Rocha', 'Letícia Dias', 'Mateus Gomes'
  ];
  const cancellationReasons = [
    'Paciente solicitou cancelamento',
    'Problema de saúde do paciente',
    'Reagendamento médico',
    'Falta de documentação',
    'Problema com convênio',
    'Emergência familiar',
    'Condições climáticas'
  ];

  const appointments: Appointment[] = [];
  
  // Gerar 200 agendamentos dos últimos 180 dias
  for (let i = 0; i < 200; i++) {
    const daysAgo = Math.floor(Math.random() * 180);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0, 0);
    
    const endDate = new Date(startDate);
    endDate.setMinutes(endDate.getMinutes() + 30 + Math.floor(Math.random() * 60));
    
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    appointments.push({
      id: `apt_${i + 1}`,
      patient_name: patientNames[Math.floor(Math.random() * patientNames.length)],
      patient_city: cities[Math.floor(Math.random() * cities.length)],
      start_time: startDate.toISOString(),
      end_time: endDate.toISOString(),
      status,
      doctor: doctors[Math.floor(Math.random() * doctors.length)],
      procedure_type: procedures[Math.floor(Math.random() * procedures.length)],
      value: values[Math.floor(Math.random() * values.length)],
      insurance: insurances[Math.floor(Math.random() * insurances.length)],
      cancellation_reason: status === 'cancelled' ? cancellationReasons[Math.floor(Math.random() * cancellationReasons.length)] : undefined
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
    status: '',
    city: '',
    procedure: '',
    insurance: ''
  });

  const fetchAppointments = async () => {
    setLoading(true);
    setError(null);
    
    // Tentar buscar dados reais do n8n
    fetch('https://sputnik-n8n.cloudfy.cloud/webhook/dashboard-data')
      .then(response => response.json())
      .then(data => {
        console.log('Dados reais carregados:', data.length, 'agendamentos');
        // Mapear dados reais para incluir médico da pipeline se disponível
        const mappedData = data.map((item: any) => ({
          ...item,
          // Se não tem doctor definido ou é o paciente, usar procedure_type como referência
          doctor: item.doctor && item.doctor !== item.patient_name ? item.doctor : 'A definir',
          patient_name: item.title || 'Paciente não informado',
          patient_city: item.city || 'Cidade não informada',
          insurance: item.insurance || 'Particular'
        }));
        setAppointments(mappedData);
        setLoading(false);
      })
      .catch(err => {
        console.log('Erro ao carregar dados reais, usando simulados:', err);
        // Em caso de erro, usar dados simulados
        const simulatedData = generateSimulatedData();
        setAppointments(simulatedData);
        setLoading(false);
      });
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
    
    // Filtro de cidade
    if (filters.city) {
      filtered = filtered.filter(apt => apt.patient_city === filters.city);
    }
    
    // Filtro de procedimento
    if (filters.procedure) {
      filtered = filtered.filter(apt => apt.procedure_type === filters.procedure);
    }
    
    // Filtro de convênio
    if (filters.insurance) {
      filtered = filtered.filter(apt => apt.insurance === filters.insurance);
    }
    
    setFilteredAppointments(filtered);
  };

  const calculateMetrics = (): Metrics => {
    const total = filteredAppointments.length;
    const completed = filteredAppointments.filter(apt => apt.status === 'completed').length;
    const noShow = filteredAppointments.filter(apt => apt.status === 'noshow').length;
    const cancelled = filteredAppointments.filter(apt => apt.status === 'cancelled').length;
    const scheduled = filteredAppointments.filter(apt => apt.status === 'confirmed').length;
    
    return {
      total,
      completionRate: total > 0 ? (completed / total) * 100 : 0,
      noShowRate: total > 0 ? (noShow / total) * 100 : 0,
      totalRevenue: 0, // Removido cálculo de receita
      scheduledSurgeries: scheduled,
      completedSurgeries: completed,
      cancelledSurgeries: cancelled
    };
  };

  const getDoctors = (): string[] => {
    const doctors = [...new Set(appointments.map(apt => apt.doctor))];
    return doctors.sort();
  };

  const getCities = (): string[] => {
    const cities = [...new Set(appointments.map(apt => apt.patient_city))];
    return cities.sort();
  };

  const getProcedures = (): string[] => {
    const procedures = [...new Set(appointments.map(apt => apt.procedure_type))];
    return procedures.sort();
  };

  const getInsurances = (): string[] => {
    const insurances = [...new Set(appointments.map(apt => apt.insurance))];
    return insurances.sort();
  };

  const getReportData = (): ReportData => {
    const scheduledSurgeries = filteredAppointments.filter(apt => apt.status === 'confirmed');
    const completedSurgeries = filteredAppointments.filter(apt => apt.status === 'completed');
    const cancelledSurgeries = filteredAppointments.filter(apt => apt.status === 'cancelled');
    
    const proceduresSummary = filteredAppointments.reduce((acc, apt) => {
      acc[apt.procedure_type] = (acc[apt.procedure_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const cancellationReasons = cancelledSurgeries.reduce((acc, apt) => {
      if (apt.cancellation_reason) {
        acc[apt.cancellation_reason] = (acc[apt.cancellation_reason] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    
    return {
      scheduledSurgeries,
      completedSurgeries,
      cancelledSurgeries,
      proceduresSummary,
      cancellationReasons
    };
  };

  const exportData = () => {
    const csvData = filteredAppointments.map(apt => [
      apt.patient_name,
      apt.patient_city,
      new Date(apt.start_time).toLocaleString('pt-BR'),
      apt.procedure_type,
      apt.doctor,
      apt.insurance,
      apt.status,
      apt.cancellation_reason || ''
    ]);
    
    const headers = ['Paciente', 'Cidade', 'Data/Hora', 'Procedimento', 'Médico', 'Convênio', 'Status', 'Motivo Cancelamento'];
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
    reportData: getReportData(),
    refresh: fetchAppointments,
    exportData
  };
};
