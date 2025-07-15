
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../../src/store/store';
import { Client, Hotel, AddNotificationType, ClientFeaturesProps } from '../../types';
import { Spinner, Modal } from '../../App';
import ClientForm from './ClientForm';
import HotelForm from './HotelForm';
import ObservacoesForm from './ObservacoesForm';
import ClientDetailHeader from './ClientDetailHeader';
import HotelListDisplay from './HotelListDisplay';
import { supabase } from '../../src/supabaseClient';

interface ClientDetailPageContentProps extends Pick<ClientFeaturesProps, 'onNavigateToRequest' | 'addNotification'> {}

const ClientDetailPageContent: React.FC<ClientDetailPageContentProps> = ({
    onNavigateToRequest, addNotification
}) => {
    const { clientId } = useParams<{ clientId: string }>();
    const navigate = useNavigate();

    const client = useSelector((state: RootState) => state.clients.clients.find(c => c.id === clientId));
    const hotelsData = useSelector((state: RootState) => state.hotels.hotels);
    const rotasData = useSelector((state: RootState) => state.routes.rotas);

    const clientHotels = hotelsData.filter(h => h.client_id === clientId);
    const config = rotasData.find(r => r.isDefault);

    const [showClientForm, setShowClientForm] = useState(false);
    const [showHotelForm, setShowHotelForm] = useState(false);
    const [showObsForm, setShowObsForm] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

    const handleCloseClientForm = useCallback(() => setShowClientForm(false), []);
    const handleShowClientForm = useCallback(() => setShowClientForm(true), []);
    const handleCloseHotelForm = useCallback(() => setShowHotelForm(false), []);
    const handleCloseObsForm = useCallback(() => setShowObsForm(false), []);
    const handleShowObsForm = useCallback(() => setShowObsForm(true), []);

    useEffect(() => {
        // This effect can cause a flicker if Supabase hasn't loaded the data yet.
        // A better approach might involve a loading state managed in the component.
        // But for now, this logic handles cases where a user navigates to a deleted/invalid ID.
        const timer = setTimeout(() => {
            if (!client && clientId) {
                addNotification("Cliente não encontrado. Retornando para a lista.", "error");
                navigate('/clients', { replace: true });
            }
        }, 1000); // Wait a bit for data to load
        return () => clearTimeout(timer);
    }, [client, clientId, navigate, addNotification]);

    const deleteClientAndAssociatedHotels = useCallback(async () => {
        if (client && window.confirm("Tem certeza que deseja excluir este cliente e todos os seus hotéis associados? Esta ação não pode ser desfeita.")) {
            // Note: The UI will update via the realtime subscription.
            // We don't dispatch actions here anymore.
            // For a better UX, you might want to show a spinner.
            const { error } = await supabase.from('clientes').delete().eq('id', client.id);
            if (error) {
                addNotification(`Erro ao excluir cliente: ${error.message}`, 'error');
            } else {
                addNotification(`Cliente '${client.cliente}' excluído.`, 'success');
                navigate('/clients');
            }
        }
    }, [client, addNotification, navigate]);

    const showLocation = useCallback(() => {
        if (!config?.default_latitude || !config?.default_longitude) {
            addNotification("Nenhuma rota padrão configurada. Por favor, configure em 'Configurações'.", "error");
            return;
        }
        if (!client?.lat_final || !client?.lon_final) {
            addNotification("Latitude e Longitude final do cliente não preenchidas.", "error");
            return;
        }
        const url = `https://www.google.com/maps/dir/?api=1&origin=${config.default_latitude},${config.default_longitude}&destination=${client.lat_final},${client.lon_final}`;
        window.open(url, '_blank');
    }, [config, client, addNotification]);

    const handleEditHotel = useCallback((hotel: Hotel) => {
        setSelectedHotel(hotel);
        setShowHotelForm(true);
    }, []);

    const handleAddNewHotel = useCallback(() => {
        setSelectedHotel(null);
        setShowHotelForm(true);
    }, []);

    const handleDeleteHotel = useCallback(async (hotelId: string) => {
        const hotelToDelete = clientHotels.find(h => h.id === hotelId);
        if (hotelToDelete && window.confirm("Tem certeza que deseja excluir este hotel?")) {
            const { error } = await supabase.from('hoteis').delete().eq('id', hotelId);
             if (error) {
                addNotification(`Erro ao excluir hotel: ${error.message}`, 'error');
            } else {
                addNotification(`Hotel '${hotelToDelete.hotel}' excluído.`, 'success');
            }
        }
    }, [clientHotels, addNotification]);

    const handleNavigateToRequest = useCallback((hotel: Hotel) => {
        if (client) {
            onNavigateToRequest(hotel, client);
        }
    }, [client, onNavigateToRequest]);

    if (!client) return <Spinner />;

    return (
        <div className="w-full">
            {showClientForm && (
                <Modal title="Editar Cliente" onClose={handleCloseClientForm}>
                    <ClientForm
                        onFinished={handleCloseClientForm}
                        existingClient={client}
                        addNotification={addNotification}
                    />
                </Modal>
            )}
            {showHotelForm && client && (
                <Modal title={selectedHotel ? "Editar Hotel" : "Adicionar Novo Hotel"} onClose={handleCloseHotelForm}>
                    <HotelForm
                        onFinished={handleCloseHotelForm}
                        clientId={client.id}
                        existingHotel={selectedHotel}
                        addNotification={addNotification}
                    />
                </Modal>
            )}
            {showObsForm && client && (
                <Modal title="Observações do Cliente" onClose={handleCloseObsForm}>
                    <ObservacoesForm
                        client={client}
                        onFinished={handleCloseObsForm}
                        addNotification={addNotification}
                    />
                </Modal>
            )}

            <ClientDetailHeader
                client={client}
                onShowLocation={showLocation}
                onEditClient={handleShowClientForm}
                onDeleteClient={deleteClientAndAssociatedHotels}
                onShowObservacoes={handleShowObsForm}
            />

            <hr className="my-6 border-gray-300" />

            <HotelListDisplay
                hotels={clientHotels}
                onAddNewHotel={handleAddNewHotel}
                onEditHotel={handleEditHotel}
                onDeleteHotel={handleDeleteHotel}
                onNavigateToRequest={handleNavigateToRequest}
            />
        </div>
    );
};

export default ClientDetailPageContent;