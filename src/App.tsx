import React from 'react';
import { Header } from './components/Header';
import { Filters } from './components/Filters';
import { MetricsCards } from './components/MetricsCards';
import { Charts } from './components/Charts';
import { AppointmentsTable } from './components/AppointmentsTable';
import { Reports } from './components/Reports';
import { useAppointments } from './hooks/useAppointments';

function App() {
  const {
    appointments,
    loading,
    error,
    filters,
    setFilters,
    metrics,
    doctors,
    cities,
    procedures,
    insurances,
    reportData,
    refresh,
    exportData
  } = useAppointments();

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 bg-red-600 rounded-full"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar dados</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button
              onClick={refresh}
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Carregando...' : 'Tentar Novamente'}
            </button>
            <p className="text-xs text-gray-500 mt-3">
              Usando dados de exemplo para demonstração
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onRefresh={refresh}
        onExport={exportData}
        loading={loading}
      />
      
      <Filters
        filters={filters}
        onFiltersChange={setFilters}
        doctors={doctors}
        cities={cities}
        procedures={procedures}
        insurances={insurances}
      />

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <MetricsCards metrics={metrics} loading={loading} />
        
        <Charts appointments={appointments} loading={loading} />
        
        <Reports reportData={reportData} loading={loading} />
        
        <AppointmentsTable appointments={appointments} loading={loading} />
      </main>
    </div>
  );
}

export default App;