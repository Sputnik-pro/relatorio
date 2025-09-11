import React from 'react';
import { Appointment } from '../types';
import { formatCurrency } from '../utils/formatters';

interface ChartsProps {
  appointments: Appointment[];
  loading: boolean;
}

export const Charts: React.FC<ChartsProps> = ({ appointments, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-pulse">
            <div className="w-40 h-6 bg-gray-200 rounded mb-4"></div>
            <div className="w-full h-64 bg-gray-100 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // Evolução diária
  const getDailyEvolution = () => {
    const dailyData = appointments.reduce((acc, apt) => {
      const date = new Date(apt.start_time).toLocaleDateString('pt-BR');
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedDates = Object.keys(dailyData).sort((a, b) => {
      const dateA = new Date(a.split('/').reverse().join('-'));
      const dateB = new Date(b.split('/').reverse().join('-'));
      return dateA.getTime() - dateB.getTime();
    });

    const maxValue = Math.max(...Object.values(dailyData), 1);

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Evolução Diária</h3>
        <div className="space-y-2">
          {sortedDates.slice(-7).map(date => (
            <div key={date} className="flex items-center">
              <div className="w-20 text-xs text-gray-600">{date}</div>
              <div className="flex-1 mx-2">
                <div className="bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${(dailyData[date] / maxValue) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-8 text-xs text-right text-gray-700">{dailyData[date]}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Distribuição de status
  const getStatusDistribution = () => {
    const statusData = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusColors = {
      confirmed: '#3b82f6',
      completed: '#10b981',
      cancelled: '#ef4444',
      noshow: '#f59e0b'
    };

    const statusLabels = {
      confirmed: 'Confirmado',
      completed: 'Realizado', 
      cancelled: 'Cancelado',
      noshow: 'Faltou'
    };

    const total = Object.values(statusData).reduce((sum, count) => sum + count, 0);

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuição por Status</h3>
        <div className="space-y-3">
          {Object.entries(statusData).map(([status, count]) => {
            const percentage = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: statusColors[status as keyof typeof statusColors] }}
                  ></div>
                  <span className="text-sm text-gray-600">
                    {statusLabels[status as keyof typeof statusLabels]}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{count}</span>
                  <span className="text-xs text-gray-500">({percentage.toFixed(1)}%)</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Performance por médico
  const getDoctorPerformance = () => {
    const doctorData = appointments.reduce((acc, apt) => {
      if (!acc[apt.doctor]) {
        acc[apt.doctor] = { total: 0, completed: 0 };
      }
      acc[apt.doctor].total += 1;
      if (apt.status === 'completed') {
        acc[apt.doctor].completed += 1;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    const maxTotal = Math.max(...Object.values(doctorData).map(d => d.total), 1);

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance por Médico</h3>
        <div className="space-y-3">
          {Object.entries(doctorData).map(([doctor, data]) => {
            const rate = data.total > 0 ? (data.completed / data.total) * 100 : 0;
            return (
              <div key={doctor}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-700">{doctor}</span>
                  <span className="text-xs text-gray-500">{rate.toFixed(1)}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(data.total / maxTotal) * 100}%` }}
                  ></div>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {data.completed}/{data.total} agendamentos
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Top procedimentos
  const getTopProcedures = () => {
    const procedureData = appointments.reduce((acc, apt) => {
      acc[apt.procedure_type] = (acc[apt.procedure_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const sortedProcedures = Object.entries(procedureData)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);

    const maxCount = Math.max(...sortedProcedures.map(([, count]) => count), 1);

    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Procedimentos</h3>
        <div className="space-y-3">
          {sortedProcedures.map(([procedure, count]) => (
            <div key={procedure} className="flex items-center">
              <div className="w-32 text-sm text-gray-700 truncate">{procedure}</div>
              <div className="flex-1 mx-2">
                <div className="bg-gray-200 rounded-full h-4 relative">
                  <div
                    className="bg-purple-500 h-4 rounded-full"
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-8 text-sm text-right text-gray-700">{count}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {getDailyEvolution()}
      {getStatusDistribution()}
      {getDoctorPerformance()}
      {getTopProcedures()}
    </div>
  );
};