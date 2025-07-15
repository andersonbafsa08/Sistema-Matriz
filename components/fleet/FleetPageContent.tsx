

import React, { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { Vehicle, FleetFeaturesProps } from '../../types';
import { Modal, Plus, Users, Search as SearchIcon } from '../../App';
import VehicleForm from './FleetForm';
import VehicleCard from './FleetCard';
import { supabase } from '../../src/supabaseClient';

const FleetPageContent: React.FC<FleetFeaturesProps> = ({ addNotification }) => {
    const vehicles = useSelector((state: RootState) => state.vehicles.vehicles);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
    const [selectedFiliais, setSelectedFiliais] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchField, setSearchField] = useState('placa');
    
    const filiais: string[] = useMemo(() => [...new Set<string>(vehicles.map(v => v.filial))].sort(), [vehicles]);

    const handleToggleFilial = (filial: string) => {
        setSelectedFiliais(prev => 
            prev.includes(filial) ? prev.filter(f => f !== filial) : [...prev, filial]
        );
    };
    
    const filteredVehicles = useMemo(() => {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return vehicles.filter(v => {
            const matchesFilial = selectedFiliais.length === 0 || selectedFiliais.includes(v.filial);
            if (!matchesFilial) return false;

            if (searchTerm === '') return true;

            const targetValue = v[searchField as keyof Vehicle] as string;
            return targetValue?.toLowerCase().includes(lowerCaseSearchTerm);
        });
    }, [vehicles, selectedFiliais, searchTerm, searchField]);

    const groupedVehicles = useMemo(() => {
        return filteredVehicles.reduce<Record<string, Vehicle[]>>((acc, vehicle) => {
            (acc[vehicle.filial] = acc[vehicle.filial] || []).push(vehicle);
            return acc;
        }, {});
    }, [filteredVehicles]);

    const handleAddNew = useCallback(() => {
        setEditingVehicle(null);
        setIsFormOpen(true);
    }, []);

    const handleEdit = useCallback((vehicle: Vehicle) => {
        setEditingVehicle(vehicle);
        setIsFormOpen(true);
    }, []);

    const handleDelete = useCallback(async (vehicleId: string) => {
        if (window.confirm("Tem certeza que deseja excluir este veículo?")) {
            const { error } = await supabase.from('veiculos').delete().eq('id', vehicleId);
            if (error) {
                 addNotification(`Erro ao excluir veículo: ${error.message}`, "error");
            } else {
                addNotification("Veículo excluído com sucesso.", "success");
            }
        }
    }, [addNotification]);

    const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

    return (
        <div className="w-full">
            <div className="sticky top-[76px] z-20 bg-gray-100 p-4 rounded-b-lg shadow-sm border-b -mx-4 -mt-4 mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Frota</h2>
                    <button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                        <Plus size={18} className="mr-2"/> Adicionar Veículo
                    </button>
                </div>

                <div className="flex gap-2">
                    <div className="flex-shrink-0">
                         <select 
                            value={searchField} 
                            onChange={(e) => setSearchField(e.target.value)}
                            className="h-full px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        >
                            <option value="placa">Placa</option>
                            <option value="modelo">Modelo</option>
                            <option value="ano">Ano</option>
                        </select>
                    </div>
                    <div className="relative flex-grow">
                        <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                            aria-label="Buscar na frota"
                        />
                    </div>
                </div>

                 <div className="flex flex-wrap gap-2 mt-4">
                    {filiais.map(filial => (
                        <button
                            key={filial}
                            onClick={() => handleToggleFilial(filial)}
                            className={`px-3 py-1 rounded-full text-sm font-semibold border-2 transition-colors ${
                                selectedFiliais.includes(filial)
                                    ? 'bg-blue-500 border-blue-500 text-white'
                                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                            }`}
                        >
                            {filial}
                        </button>
                    ))}
                </div>
            </div>

            {isFormOpen && (
                <Modal title={editingVehicle ? "Editar Veículo" : "Adicionar Veículo"} onClose={handleCloseForm}>
                    <VehicleForm
                        onFinished={handleCloseForm}
                        existingVehicle={editingVehicle}
                        addNotification={addNotification}
                    />
                </Modal>
            )}

            <div className="space-y-6">
                {Object.keys(groupedVehicles).length > 0 ? (
                    Object.keys(groupedVehicles).sort((a, b) => a.localeCompare(b)).map(filial => {
                        const vehiclesInFilial = groupedVehicles[filial];
                        return (
                            <div key={filial}>
                                <h3 className="text-lg font-bold text-gray-600 mb-2 border-b pb-1">{filial} ({vehiclesInFilial.length})</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {vehiclesInFilial.map(vehicle => (
                                        <VehicleCard
                                            key={vehicle.id}
                                            vehicle={vehicle}
                                            onEdit={() => handleEdit(vehicle)}
                                            onDelete={() => handleDelete(vehicle.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center py-10">
                        <Users size={48} className="mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-500">Nenhum veículo encontrado.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FleetPageContent;
