import React from 'react';
import { FilterState } from '../types';

interface FiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  doctors: string[];
  cities: string[];
  procedures: string[];
  insurances: string[];
}

export const Filters: React.FC<FiltersProps> = ({ 
  filters, 
  onFiltersChange, 
  doctors, 
  cities, 
  procedures, 
  insurances 
}) => {
  const periodOptions = [
    { value: 7, label: '7 dias' },
    { value: 15, label: '15 dias' },
    { value: 30, label: '30 dias' },
    { value: 90, label: '90 dias' }
  ];

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'confirmed', label: 'Confirmado' },
    { value: 'completed', label: 'Realizado' },
    { value: 'cancelled', label: 'Cancelado' },
    { value: 'noshow', label: 'Faltou' }
  ];

  return (
    <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div>
            <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
              Período
            </label>
            <select
              id="period"
              value={filters.period}
              onChange={(e) => onFiltersChange({ ...filters, period: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {periodOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="doctor" className="block text-sm font-medium text-gray-700 mb-2">
              Médico
            </label>
            <select
              id="doctor"
              value={filters.doctor}
              onChange={(e) => onFiltersChange({ ...filters, doctor: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os médicos</option>
              {doctors.map(doctor => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
              Cidade
            </label>
            <select
              id="city"
              value={filters.city}
              onChange={(e) => onFiltersChange({ ...filters, city: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todas as cidades</option>
              {cities.map(city => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="procedure" className="block text-sm font-medium text-gray-700 mb-2">
              Procedimento
            </label>
            <select
              id="procedure"
              value={filters.procedure}
              onChange={(e) => onFiltersChange({ ...filters, procedure: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os procedimentos</option>
              {procedures.map(procedure => (
                <option key={procedure} value={procedure}>
                  {procedure}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-2">
              Convênio
            </label>
            <select
              id="insurance"
              value={filters.insurance}
              onChange={(e) => onFiltersChange({ ...filters, insurance: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Todos os convênios</option>
              {insurances.map(insurance => (
                <option key={insurance} value={insurance}>
                  {insurance}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};