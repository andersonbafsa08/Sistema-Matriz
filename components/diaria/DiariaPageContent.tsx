import React, { useState, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { DiariaFeaturesProps, Diaria, ITEMS_PER_PAGE } from '../../types';
import { Modal, Plus, Users, Search as SearchIcon, Tooltip, ChevronLeft, ChevronRight } from '../../App';
import DiariaForm from './DiariaForm';
import DiariaTableRow from './DiariaTableRow';
import { deleteDiaria } from '../../src/store/slices/diariasSlice';

const DiariaPageContent: React.FC<DiariaFeaturesProps> = ({ addNotification }) => {
    const dispatch: AppDispatch = useDispatch();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingDiaria, setEditingDiaria] = useState<Diaria | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const diarias = useSelector((state: RootState) => state.diarias.diarias);
    const collaborators = useSelector((state: RootState) => state.collaborators.collaborators);

    const getCollaboratorName = useCallback((id: string): string => {
        return collaborators.find(c => c.id === id)?.nome || 'Desconhecido';
    }, [collaborators]);
    
    const sortedDiarias = useMemo(() => {
        return [...diarias].sort((a,b) => new Date(b.data_inicial).getTime() - new Date(a.data_inicial).getTime());
    }, [diarias]);

    const filteredDiarias = useMemo(() => {
        if (!searchTerm) {
            return sortedDiarias;
        }
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return sortedDiarias.filter(d => {
            const collaboratorName = getCollaboratorName(d.idColaborador).toLowerCase();
            return (
                collaboratorName.includes(lowerCaseSearchTerm) ||
                d.destino.toLowerCase().includes(lowerCaseSearchTerm) ||
                d.centro_custo.toLowerCase().includes(lowerCaseSearchTerm) ||
                d.observacao.toLowerCase().includes(lowerCaseSearchTerm)
            );
        });
    }, [sortedDiarias, searchTerm, getCollaboratorName]);

    const paginatedDiarias = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredDiarias.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredDiarias, currentPage]);

    const totalPages = Math.ceil(filteredDiarias.length / ITEMS_PER_PAGE);
    

    const handleAddNew = useCallback(() => {
        setEditingDiaria(null);
        setIsFormOpen(true);
    }, []);
    
    const handleEdit = useCallback((diaria: Diaria) => {
        setEditingDiaria(diaria);
        setIsFormOpen(true);
    }, []);

    const handleDelete = useCallback((diariaId: string) => {
        if (window.confirm("Tem certeza que deseja excluir este registro de diária?")) {
            dispatch(deleteDiaria(diariaId));
            addNotification("Registro de diária excluído.", "success");
        }
    }, [dispatch, addNotification]);

    const handleCloseForm = useCallback(() => {
        setIsFormOpen(false);
        setEditingDiaria(null);
    }, []);

    return (
        <div className="w-full">
            <div className="sticky top-[76px] z-20 bg-gray-100 py-4 -mx-4 px-4 border-b mb-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Solicitações de Diárias</h2>
                    <button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors">
                        <Plus size={18} className="mr-2"/> Adicionar Diárias
                    </button>
                </div>
                 <div className="relative">
                    <SearchIcon size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input
                        type="text"
                        placeholder="Buscar por colaborador, destino, centro de custo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                        aria-label="Buscar diárias"
                    />
                </div>
            </div>

             {isFormOpen && (
                <Modal title={editingDiaria ? "Editar Diária" : "Adicionar Diárias"} onClose={handleCloseForm} modalContentClassName="max-w-4xl">
                    <DiariaForm 
                        onFinished={handleCloseForm} 
                        addNotification={addNotification} 
                        existingDiaria={editingDiaria}
                    />
                </Modal>
            )}


            <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto" style={{maxHeight: 'calc(100vh - 350px)'}}>
                    <table className="w-full text-sm text-left text-gray-600">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
                            <tr>
                                <th scope="col" className="px-4 py-3 sticky left-0 z-10 bg-gray-100">Ações</th>
                                <th scope="col" className="px-4 py-3">Colaborador</th>
                                <th scope="col" className="px-4 py-3">Destino</th>
                                <th scope="col" className="px-4 py-3">Centro de Custo</th>
                                <th scope="col" className="px-4 py-3">Período</th>
                                <th scope="col" className="px-4 py-3">Horário</th>
                                <th scope="col" className="px-4 py-3">Observações</th>
                                <th scope="col" className="px-4 py-3 text-right">Valor Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {paginatedDiarias.length > 0 ? (
                                paginatedDiarias.map(d => (
                                    <DiariaTableRow
                                        key={d.id}
                                        diaria={d}
                                        collaboratorName={getCollaboratorName(d.idColaborador)}
                                        onEdit={() => handleEdit(d)}
                                        onDelete={() => handleDelete(d.id)}
                                    />
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="text-center p-8 text-gray-500">
                                        <Users size={48} className="mx-auto mb-4 text-gray-400" />
                                        Nenhum registro de diária encontrado.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                 {totalPages > 1 && paginatedDiarias.length > 0 && (
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

export default DiariaPageContent;