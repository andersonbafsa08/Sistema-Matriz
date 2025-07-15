import React from 'react';
import { Hotel } from '../../types';
import HotelCard from './HotelCard';
import { Plus } from '../../App';

interface HotelListDisplayProps {
    hotels: Hotel[];
    onAddNewHotel: () => void;
    onEditHotel: (hotel: Hotel) => void;
    onDeleteHotel: (hotelId: string) => void;
    onNavigateToRequest: (hotel: Hotel) => void;
}

const HotelListDisplay: React.FC<HotelListDisplayProps> = ({
    hotels,
    onAddNewHotel,
    onEditHotel,
    onDeleteHotel,
    onNavigateToRequest
}) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">Hotéis Cadastrados ({hotels.length})</h2>
                <button onClick={onAddNewHotel} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                    <Plus size={18} className="mr-2"/> Adicionar Hotel
                </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hotels.length > 0 ? hotels.map(hotel => (
                    <HotelCard
                        key={hotel.id}
                        hotel={hotel}
                        onEdit={() => onEditHotel(hotel)}
                        onDelete={() => onDeleteHotel(hotel.id)}
                        onAddToRequest={() => onNavigateToRequest(hotel)}
                    />
                )) : (
                    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 text-center text-gray-500 py-8 bg-white rounded-lg shadow-sm">
                        Nenhum hotel cadastrado para este cliente. <span className="text-xs block mt-1">Clique em 'Adicionar Hotel' acima para cadastrar.</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HotelListDisplay;