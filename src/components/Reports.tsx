import React, { useState } from 'react';
import { FileText, Download, Users, Calendar, XCircle, Activity } from 'lucide-react';
import { ReportData, Appointment } from '../types';
import { formatDateTime, formatCurrency, getStatusLabel } from '../utils/formatters';

interface ReportsProps {
  reportData: ReportData;
  loading: boolean;
}

export const Reports: React.FC<ReportsProps> = ({ reportData, loading }) => {
  const [activeReport, setActiveReport] = useState<string>('scheduled');

  const reportTypes = [
    {
      id: 'scheduled',
      title: 'Cirurgias Agendadas',
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      data: reportData.scheduledSurgeries
    },
    {
      id: 'completed',
      title: 'Cirurgias Realizadas',
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      data: reportData.completedSurgeries
    },
    {
      id: 'cancelled',
      title: 'Cirurgias Canceladas',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      data: reportData.cancelledSurgeries
    },
    {
      id: 'procedures',
      title: 'Relatório de Procedimentos',
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      data: null
    },
    {
      id: 'cancellations',
      title: 'Motivos de Cancelamento',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      data: null
    }
  ];

  const exportReport = (reportType: string) => {
    let csvData: string[][] = [];
    let headers: string[] = [];
    let filename = '';

    switch (reportType) {
      case 'scheduled':
      case 'completed':
      case 'cancelled':
        const data = reportTypes.find(r => r.id === reportType)?.data as Appointment[];
        headers = ['Paciente', 'Cidade', 'Data/Hora', 'Procedimento', 'Médico', 'Convênio', 'Status', 'Valor'];
        csvData = data?.map(apt => [
          apt.patient_name,
          apt.patient_city,
          formatDateTime(apt.start_time),
          apt.procedure_type,
          apt.doctor,
          apt.insurance,
          getStatusLabel(apt.status),
          `R$ ${parseFloat(apt.value).toFixed(2).replace('.', ',')}`
        ]) || [];
        filename = `${reportType}_${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      
      case 'procedures':
        headers = ['Procedimento', 'Quantidade'];
        csvData = Object.entries(reportData.proceduresSummary).map(([procedure, count]) => [
          procedure,
          count.toString()
        ]);
        filename = `procedimentos_${new Date().toISOString().slice(0, 10)}.csv`;
        break;
      
      case 'cancellations':
        headers = ['Motivo', 'Quantidade'];
        csvData = Object.entries(reportData.cancellationReasons).map(([reason, count]) => [
          reason,
          count.toString()
        ]);
        filename = `cancelamentos_${new Date().toISOString().slice(0, 10)}.csv`;
        break;
    }

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  const renderReportContent = () => {
    if (loading) {
      return (
        <div className="animate-pulse">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      );
    }

    const activeReportData = reportTypes.find(r => r.id === activeReport);

    switch (activeReport) {
      case 'scheduled':
      case 'completed':
      case 'cancelled':
        const appointments = activeReportData?.data as Appointment[];
        return (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cidade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Data/Hora</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Procedimento</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Médico</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Convênio</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Valor</th>
                  {activeReport === 'cancelled' && (
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {appointments?.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{appointment.patient_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{appointment.patient_city}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatDateTime(appointment.start_time)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.procedure_type}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{appointment.doctor}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{appointment.insurance}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(parseFloat(appointment.value))}</td>
                    {activeReport === 'cancelled' && (
                      <td className="px-4 py-3 text-sm text-gray-600">{appointment.cancellation_reason || '-'}</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'procedures':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Resumo de Procedimentos</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(reportData.proceduresSummary).map(([procedure, count]) => (
                <div key={procedure} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{procedure}</span>
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'cancellations':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Motivos de Cancelamento</h4>
            <div className="space-y-3">
              {Object.entries(reportData.cancellationReasons).map(([reason, count]) => (
                <div key={reason} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-700">{reason}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-gray-900">{count}</span>
                    <span className="text-xs text-gray-500">
                      ({((count / reportData.cancelledSurgeries.length) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Relatórios Detalhados</h3>
            <p className="text-sm text-gray-500 mt-1">Análises completas com dados de pacientes e municípios</p>
          </div>
          
          <button
            onClick={() => exportReport(activeReport)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar Relatório
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Tabs de Relatórios */}
        <div className="flex flex-wrap gap-2 mb-6">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            const isActive = activeReport === report.id;
            return (
              <button
                key={report.id}
                onClick={() => setActiveReport(report.id)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? `${report.bgColor} ${report.color} border-2 border-current`
                    : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {report.title}
                {report.data && (
                  <span className="ml-1 px-2 py-0.5 text-xs bg-white bg-opacity-50 rounded-full">
                    {report.data.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Conteúdo do Relatório */}
        <div className="min-h-[400px]">
          {renderReportContent()}
        </div>
      </div>
    </div>
  );
};