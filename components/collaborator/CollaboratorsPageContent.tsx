

import React, { useState, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { Collaborator, CollaboratorFeaturesProps } from '../../types';
import { useNotification, Spinner, Modal, Plus, Users } from '../../App';
import CollaboratorForm from './CollaboratorForm';
import CollaboratorsTable from './CollaboratorsTable';
import { supabase } from '../../src/supabaseClient';


const CollaboratorsPageContent: React.FC<CollaboratorFeaturesProps> = ({ addNotification }) => {
    const collaboratorsData = useSelector((state: RootState) => state.collaborators.collaborators);

    const [isLoading, setIsLoading] = useState(false); // For future async operations
    const [editingCollaborator, setEditingCollaborator] = useState<Collaborator | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedFiliais, setSelectedFiliais] = useState<string[]>([]);

    const filiais: string[] = useMemo(() => [...new Set<string>(collaboratorsData.map(c => c.filial || 'Sem Filial'))].sort(), [collaboratorsData]);
    const handleToggleFilial = (filial: string) => {
        setSelectedFiliais(prev => 
            prev.includes(filial) ? prev.filter(f => f !== filial) : [...prev, filial]
        );
    };

    const handleEdit = useCallback((collab: Collaborator) => { setEditingCollaborator(collab); setIsFormOpen(true); }, []);
    const handleAddNew = useCallback(() => { setEditingCollaborator(null); setIsFormOpen(true); }, []);
    const handleCloseForm = useCallback(() => setIsFormOpen(false), []);

    const handleDelete = useCallback(async (collaboratorToDelete: Collaborator) => {
        if (window.confirm("Tem certeza que deseja excluir este colaborador?")) {
            const { error } = await supabase.from('colaboradores').delete().eq('id', collaboratorToDelete.id);
            if (error) {
                addNotification(`Erro ao excluir colaborador: ${error.message}`, 'error');
            } else {
                addNotification(`Colaborador '${collaboratorToDelete.nome}' excluído.`, 'success');
            }
        }
    }, [addNotification]);

    const openWhatsApp = useCallback((telefone?: string) => {
        if (!telefone) { addNotification('Número de telefone não fornecido.', 'error'); return; }
        const justDigits = telefone.replace(/\D/g, '');
        if (justDigits) { window.open(`https://wa.me/55${justDigits}`, '_blank'); }
        else { addNotification('Número de telefone inválido para WhatsApp.', 'error'); }
    }, [addNotification]);

    const renderEmptyStateForTable = () => {
         if (collaboratorsData.length === 0) { // This check should be inside CollaboratorsTable if it handles its own empty state based on filtered results
            return (
                 <div className="flex flex-col items-center text-gray-500 p-10">
                    <Users size={48} className="text-gray-400 mb-4" />
                    <p className="mb-4 text-lg">Nenhum colaborador cadastrado ainda.</p>
                    <button
                        onClick={handleAddNew}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg flex items-center justify-center transition-colors text-base"
                    >
                        <Plus size={20} className="mr-2"/> Adicionar Primeiro Colaborador
                    </button>
                </div>
            );
        }
        return null;
    }


    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Colaboradores</h2>
                <button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                    <Plus size={18} className="mr-2"/> Adicionar Colaborador
                </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
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

            {isFormOpen && (
                <Modal title={editingCollaborator ? "Editar Colaborador" : "Novo Colaborador"} onClose={handleCloseForm} modalContentClassName="max-w-2xl">
                    <CollaboratorForm
                        onFinished={handleCloseForm}
                        existingCollaborator={editingCollaborator}
                        addNotification={addNotification}
                    />
                </Modal>
            )}

            {isLoading ? <Spinner /> : (
                 collaboratorsData.length > 0 ? (
                    <CollaboratorsTable
                        collaborators={collaboratorsData}
                        selectedFiliais={selectedFiliais}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onOpenWhatsApp={openWhatsApp}
                    />
                 ) : (
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
                        {renderEmptyStateForTable()}
                    </div>
                 )
            )}
        </div>
    );
};

export default CollaboratorsPageContent;