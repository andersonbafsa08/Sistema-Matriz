import React, { memo } from 'react';
import { Client } from '../../types';
import { ChevronsRight } from '../../App';

interface ClientListItemProps {
    client: Client;
    onSelectClient: (id: string) => void;
}

const ClientListItem: React.FC<ClientListItemProps> = memo(({ client, onSelectClient }) => {
    return (
        <div
            onClick={() => onSelectClient(client.id)}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors flex justify-between items-center border-b border-gray-200"
            role="button"
            tabIndex={0}
            onKeyPress={(e) => e.key === 'Enter' && onSelectClient(client.id)}
            aria-label={`Ver detalhes de ${client.cliente}`}
        >
            <div>
                <p className="font-semibold text-gray-800" style={{textTransform: 'uppercase'}}>{client.cliente}</p>
                <p className="text-sm text-gray-500" style={{textTransform: 'uppercase'}}>{client.cidade}, {client.distancia || '0'} km</p>
            </div>
            <ChevronsRight size={24} className="text-gray-400"/>
        </div>
    );
});

export default ClientListItem;