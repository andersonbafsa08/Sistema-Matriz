import React, { memo } from 'react';
import { Hotel } from '../../types';
import { Tooltip, CopyableField, Edit, Trash2, formatCnpjDisplay, formatPhoneDisplay } from '../../App';

interface HotelCardProps {
    hotel: Hotel;
    onEdit: () => void;
    onDelete: () => void;
    onAddToRequest: () => void;
}

const HotelCard: React.FC<HotelCardProps> = memo(({ hotel, onEdit, onDelete, onAddToRequest }) => {
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 flex flex-col justify-between">
            <div>
                 <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-xl text-blue-600" style={{textTransform: 'uppercase'}}>{hotel.hotel}</h3>
                     <div className="flex space-x-2">
                        <Tooltip text="Editar Hotel">
                             <button onClick={onEdit} className="p-2 rounded-full hover:bg-gray-200 transition-colors" aria-label={`Editar hotel ${hotel.hotel}`}><Edit size={18}/></button>
                        </Tooltip>
                        <Tooltip text="Excluir Hotel">
                             <button onClick={onDelete} className="p-2 rounded-full hover:bg-red-100 text-red-500 transition-colors" aria-label={`Excluir hotel ${hotel.hotel}`}><Trash2 size={18}/></button>
                        </Tooltip>
                    </div>
                </div>

                <div className="mb-4 space-y-1">
                    <p className="text-sm"><strong className="font-bold text-black">CNPJ:</strong> <CopyableField value={formatCnpjDisplay(hotel.cnpj)} /></p>
                    <p className="text-sm"><strong className="font-bold text-black">Telefone:</strong> <CopyableField value={formatPhoneDisplay(hotel.telefone)} /></p>
                    <p className="text-sm"><strong className="font-bold text-black">Pagamento:</strong> <CopyableField value={hotel.dados_pag} prefix={hotel.dados_pag ? "PIX " : ""} /></p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                     <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-600">Individual</p>
                        <p className="font-bold text-lg text-gray-800">R$ {Number(hotel.quarto_ind || 0).toFixed(2)}</p>
                    </div>
                     <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-600">Duplo</p>
                        <p className="font-bold text-lg text-gray-800">R$ {Number(hotel.quarto_dup || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-gray-100 rounded-lg p-3 text-center">
                        <p className="text-sm text-gray-600">Triplo</p>
                        <p className="font-bold text-lg text-gray-800">R$ {Number(hotel.quarto_tri || 0).toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <button
                onClick={onAddToRequest}
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors mt-6"
            >
                Solicitar este Hotel
            </button>
        </div>
    );
});

export default HotelCard;