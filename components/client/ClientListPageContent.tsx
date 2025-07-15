import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { Client, AddNotificationType, ITEMS_PER_PAGE } from '../../types';
import { Modal, Plus, Search as SearchIcon, ChevronLeft, ChevronRight } from '../../App';
import ClientForm from './ClientForm';
import ClientListItem from './ClientListItem';

interface ClientListPageContentProps {
    onSelectClient: (id: string) => void;
    addNotification: AddNotificationType;
}

const ClientListPageContent: React.FC<ClientListPageContentProps> = ({ onSelectClient, addNotification }) => {
    const clientsData = useSelector((state: RootState) => state.clients.clients);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const filteredClients = useMemo(() => clientsData.filter(client => {
        const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
        return client.searchableKeywords.some(keyword => keyword.toLowerCase().includes(lowerCaseSearchTerm)) ||
               client.cliente.toLowerCase().includes(lowerCaseSearchTerm) ||
               client.cidade.toLowerCase().includes(lowerCaseSearchTerm);
    }), [clientsData, debouncedSearchTerm]);

    const paginatedClients = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredClients, currentPage]);

    const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, []);

    const handleOpenForm = useCallback(() => setIsFormOpen(true), []);
    const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

    const renderEmptyState = () => {
        if (debouncedSearchTerm && filteredClients.length === 0) {
            return <div className="p-6 text-center text-gray-500">Nenhum cliente encontrado para sua busca.</div>;
        }
        if (clientsData.length === 0) {
            return (
                <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                    <SearchIcon size={48} className="text-gray-400 mb-4" />
                    <p className="mb-4 text-lg">Nenhum cliente cadastrado ainda.</p>
                    <button
                        onClick={handleOpenForm}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-colors text-base"
                    >
                        <Plus size={20} className="mr-2"/> Adicionar Primeiro Cliente
                    </button>
                </div>
            );
        }
        if (filteredClients.length === 0) {
             return <div className="p-6 text-center text-gray-500">Nenhum cliente encontrado.</div>;
        }
        return null;
    };

    return (
        <div className="w-full">
            <div className="sticky top-[76px] z-20 bg-gray-100 py-4 -mx-4 px-4 border-b mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Clientes ({filteredClients.length})</h2>
                    <button onClick={handleOpenForm} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                        <Plus size={18} className="mr-2"/> Adicionar Cliente
                    </button>
                </div>
                <div className="relative">
                    <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Pesquisar por nome ou cidade..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        aria-label="Pesquisar cliente"
                    />
                </div>
            </div>

            {isFormOpen && (
                <Modal title="Adicionar Novo Cliente" onClose={handleCloseForm}>
                    <ClientForm
                        onFinished={handleCloseForm}
                        addNotification={addNotification}
                    />
                </Modal>
            )}

            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "calc(100vh - 280px)" }}
                    role="list"
                >
                    {paginatedClients.length > 0 ? (
                        paginatedClients.map((client) => (
                            <ClientListItem key={client.id} client={client} onSelectClient={onSelectClient} />
                        ))
                    ) : (
                        renderEmptyState()
                    )}
                </div>
                 {totalPages > 1 && paginatedClients.length > 0 && (
                    <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
                            aria-label="Página anterior"
                        >
                           <ChevronLeft size={16} className="mr-1" /> Anterior
                        </button>
                        <span className="text-sm text-gray-600">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
                            aria-label="Próxima página"
                        >
                            Próxima <ChevronRight size={16} className="ml-1" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClientListPageContent;