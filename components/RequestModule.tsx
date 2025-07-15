import React, { useState, useCallback } from 'react';
import { RequestFeaturesProps } from '../types';
import ActiveRequestsView from './request/ActiveRequestsView';
import HistoryRequestsView from './request/HistoryRequestsView';
import { formatCollaboratorName as globalFormatCollaboratorName } from '../App';

interface RequestsPageShellProps extends RequestFeaturesProps {
    formatCollaboratorName: (name?: string) => string;
}

const RequestsPageShell: React.FC<RequestsPageShellProps> = (props) => {
    const [view, setView] = useState<'active' | 'history'>('active');
    const handleSetView = useCallback((newView: 'active' | 'history') => setView(newView), []);

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Solicitações de Hotéis</h2>
            </div>
            <div className="flex border-b mb-6 bg-white rounded-t-lg shadow sticky top-[76px] z-30">
                <button 
                    type="button" 
                    onClick={() => handleSetView('active')} 
                    className={`py-3 px-6 font-semibold hover:bg-gray-50 transition-colors rounded-tl-lg ${view === 'active' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 border-b-2 border-transparent'}`} 
                    aria-pressed={view === 'active'}
                >
                    Ativas
                </button>
                <button 
                    type="button" 
                    onClick={() => handleSetView('history')} 
                    className={`py-3 px-6 font-semibold hover:bg-gray-50 transition-colors rounded-tr-lg ${view === 'history' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 border-b-2 border-transparent'}`} 
                    aria-pressed={view === 'history'}
                >
                    Histórico
                </button>
            </div>
            {view === 'active' ? (
                <ActiveRequestsView 
                    addNotification={props.addNotification} 
                    formatCollaboratorName={props.formatCollaboratorName} 
                />
            ) : (
                <HistoryRequestsView 
                    addNotification={props.addNotification} 
                />
            )}
        </div>
    );
};

const RequestModule: React.FC<RequestFeaturesProps> = (props) => {
    return <RequestsPageShell {...props} formatCollaboratorName={globalFormatCollaboratorName} />;
};

export default RequestModule;