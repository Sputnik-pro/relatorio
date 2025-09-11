import React from 'react';
import { RefreshCw, Download } from 'lucide-react';

interface HeaderProps {
  onRefresh: () => void;
  onExport: () => void;
  loading: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onRefresh, onExport, loading }) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
     <div className="flex items-center gap-4">
  {/* Logo HJGP */}
  <div className="flex-shrink-0">
    <svg width="48" height="48" viewBox="0 0 200 200" className="w-12 h-12">
      <path d="M100 160 C60 120, 20 80, 50 50 C70 30, 90 40, 100 60 C110 40, 130 30, 150 50 C180 80, 140 120, 100 160 Z" fill="#8BC34A" />
      <path d="M40 100 C30 90, 20 100, 30 110 C40 120, 50 110, 40 100 Z" fill="#26BCD3" />
      <path d="M160 100 C170 90, 180 100, 170 110 C160 120, 150 110, 160 100 Z" fill="#26BCD3" />
    </svg>
  </div>
  
  <div>
    <h1 className="text-2xl font-bold text-gray-900">Relatório Exclusivo HJGP</h1>
    <p className="text-sm text-gray-600 mt-1">Analytics de Agendamentos e Performance</p>
  </div>
</div>
        
        <div className="flex gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Dados
          </button>
          
          <button
            onClick={onExport}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
        </div>
      </div>
    </div>
  );
};
