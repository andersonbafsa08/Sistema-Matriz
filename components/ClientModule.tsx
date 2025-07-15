import React, { useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { ClientFeaturesProps, AddNotificationType } from '../types';

import ClientListPageContent from './client/ClientListPageContent';
import ClientDetailPageContent from './client/ClientDetailPageContent';

// Note: Specific form components (ClientForm, HotelForm, ObservacoesForm)
// and item components (ClientListItem, HotelCard) are now in their respective files
// within the './client/' directory and imported by ClientListPageContent or ClientDetailPageContent.

const ClientModule: React.FC<ClientFeaturesProps> = (props) => {
    const navigate = useNavigate();
    
    const handleSelectClient = useCallback((id: string) => {
        navigate(id); // Relative navigation within the /clients/* route
    }, [navigate]);

    // This function might be better placed within ClientDetailPageContent if it's only used there,
    // or passed down if it truly orchestrates navigation from the module level.
    // For now, keeping it here as it was part of the original props structure.
    const onNavigateToRequest = props.onNavigateToRequest; 

    return (
        <Routes>
            <Route 
                index 
                element={
                    <ClientListPageContent
                        addNotification={props.addNotification} 
                        onSelectClient={handleSelectClient} 
                    />
                } 
            />
            <Route 
                path=":clientId" 
                element={
                    <ClientDetailPageContent
                        addNotification={props.addNotification} 
                        onNavigateToRequest={onNavigateToRequest}
                    />
                } 
            />
        </Routes>
    );
};

export default ClientModule;