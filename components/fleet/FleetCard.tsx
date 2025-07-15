import React from 'react';
import { Vehicle } from '../../types';
import { Tooltip, Edit, Trash2 } from '../../App';

interface VehicleCardProps {
    vehicle: Vehicle;
    onEdit: () => void;
    onDelete: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onEdit, onDelete }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col justify-between text-sm">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-base text-blue-600 uppercase truncate" title={vehicle.modelo}>{vehicle.modelo}</h3>
                         {vehicle.isLocado && <span className="text-xs bg-yellow-200 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">LOCADO</span>}
                    </div>
                    <div className="flex items-center space-x-1 flex-shrink-0 ml-2">
                        <Tooltip text="Editar Veículo">
                            <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label={`Editar veículo ${vehicle.placa}`}><Edit size={16}/></button>
                        </Tooltip>
                        <Tooltip text="Excluir Veículo">
                            <button onClick={onDelete} className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors" aria-label={`Excluir veículo ${vehicle.placa}`}><Trash2 size={16}/></button>
                        </Tooltip>
                    </div>
                </div>
                <div className="space-y-1 text-gray-700">
                    <p><strong>PLACA:</strong> {vehicle.placa}</p>
                    <p><strong>TIPO:</strong> {vehicle.tipo}</p>
                    {!vehicle.isLocado && (
                        <>
                            <p><strong>CHASSI:</strong> {vehicle.chassi}</p>
                            <p><strong>ANO:</strong> {vehicle.ano}</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VehicleCard;