import React from 'react';
import { Client } from '../../types';
import { Tooltip, MapPinIcon, Edit, Trash2 } from '../../App';

interface ClientDetailHeaderProps {
    client: Client;
    onShowLocation: () => void;
    onEditClient: () => void;
    onDeleteClient: () => void;
    onShowObservacoes: () => void;
}

const ClientDetailHeader: React.FC<ClientDetailHeaderProps> = ({
    client,
    onShowLocation,
    onEditClient,
    onDeleteClient,
    onShowObservacoes
}) => {
    return (
        <div className="flex justify-between items-start mb-2">
            <div>
                <h1 className="text-4xl font-bold text-blue-600" style={{ textTransform: 'uppercase' }}>{client.cliente}</h1>
                <div className="mt-1">
                    <p className="text-lg text-gray-600 font-semibold italic" style={{ textTransform: 'uppercase' }}>{client.cidade}</p>
                    <p className="text-sm text-gray-500 font-semibold italic">
                        {client.distancia && client.distancia.trim() !== "" ? `${client.distancia} km` : '0 km'}
                    </p>
                </div>
            </div>
            <div className="flex flex-col items-end">
                <div className="flex space-x-2">
                    <Tooltip text="Ver Localização">
                        <button onClick={onShowLocation} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                            <MapPinIcon size={18} className="mr-2"/> Localização
                        </button>
                    </Tooltip>
                    <Tooltip text="Editar Cliente">
                        <button onClick={onEditClient} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                            <Edit size={18} className="mr-2"/> Editar
                        </button>
                    </Tooltip>
                    <Tooltip text="Excluir Cliente">
                        <button onClick={onDeleteClient} className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                            <Trash2 size={18} className="mr-2"/> Excluir
                        </button>
                    </Tooltip>
                </div>
                <button onClick={onShowObservacoes} className="text-blue-600 hover:underline text-sm font-semibold mt-4">
                    Observações
                </button>
            </div>
        </div>
    );
};

export default ClientDetailHeader;