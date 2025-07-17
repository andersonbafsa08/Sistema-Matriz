

import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { StockHistoryItem, Collaborator, AddNotificationType } from '../../types';
import { FileText, Edit, Trash2, Modal, Spinner, Eye, ChevronsRight } from '../../App';
import { generateReceiptPdf } from '../../src/utils/pdfUtils';
import { supabase } from '../../src/supabaseClient';

// Edit Form Component (now internal to the modal)
const EditExitForm: React.FC<{
    historyItem: StockHistoryItem;
    onFinished: () => void;
    addNotification: AddNotificationType;
}> = ({ historyItem, onFinished, addNotification }) => {
    const dispatch: AppDispatch = useDispatch();
    const stock = useSelector((state: RootState) => state.stock.items);
    const [isSaving, setIsSaving] = useState(false);
    const [editedItems, setEditedItems] = useState([...historyItem.items]);

    const handleQuantityChange = (itemId: string, newQuantityStr: string) => {
        const newQuantity = parseInt(newQuantityStr, 10);
        
        if (isNaN(newQuantity)) { // Handles empty input
            setEditedItems(currentItems => currentItems.map(i => i.id === itemId ? { ...i, quantidade: 0 } : i));
            return;
        }

        const originalItem = historyItem.items.find(i => i.id === itemId);
        const itemInStock = stock.find(i => i.id === itemId);
        if (!originalItem || !itemInStock) return;

        const originalQuantity = originalItem.quantidade;
        const availableStock = itemInStock.quantidade;
        const maxAllowed = availableStock + originalQuantity;

        if (newQuantity < 0) {
            addNotification("A quantidade não pode ser negativa.", "error");
            return;
        }
        if (newQuantity > maxAllowed) {
            addNotification(`Quantidade excede o estoque disponível (${maxAllowed} unidades).`, "error");
            return;
        }

        setEditedItems(currentItems => {
            const itemExists = currentItems.some(i => i.id === itemId);
            if (newQuantity === 0 && itemExists) {
                // Keep it in the list with quantity 0 to handle stock updates correctly on submit
                 return currentItems.map(i => i.id === itemId ? { ...i, quantidade: 0 } : i);
            }
             return currentItems.map(i => i.id === itemId ? { ...i, quantidade: newQuantity } : i);
        });
    };
    
    const handleRemoveItem = useCallback((itemIdToRemove: string) => {
        setEditedItems(currentItems => currentItems.filter(i => i.id !== itemIdToRemove));
    }, []);

    const handleSubmit = async () => {
        setIsSaving(true);
        const finalItems = editedItems.filter(i => i.quantidade > 0);
        
        try {
            // Calculate stock adjustments
            const stockUpdates: { id: string; quantityChange: number }[] = [];
            const allItemIds = new Set([...historyItem.items.map(i => i.id), ...editedItems.map(i => i.id)]);
            
            allItemIds.forEach(id => {
                const originalQty = historyItem.items.find(i => i.id === id)?.quantidade || 0;
                const editedQty = editedItems.find(i => i.id === id)?.quantidade || 0;
                const quantityDelta = originalQty - editedQty; // Positive if items were returned, negative if more were taken
                if (quantityDelta !== 0) {
                    stockUpdates.push({ id, quantityChange: quantityDelta });
                }
            });

            // Apply stock adjustments
            if (stockUpdates.length > 0) {
                const stockUpdatePromises = stockUpdates.map(update => {
                    const currentItem = stock.find(s => s.id === update.id);
                    if (!currentItem) throw new Error(`Item de estoque ${update.id} não encontrado.`);
                    const newQuantity = currentItem.quantidade + update.quantityChange;
                    return supabase.from('stock_items').update({ quantidade: newQuantity }).eq('id', update.id);
                });
                const results = await Promise.all(stockUpdatePromises);
                const stockError = results.find(res => res.error);
                if (stockError) throw stockError.error;
            }

            // Update or delete history record
            if (finalItems.length === 0) {
                const { error } = await supabase.from('stock_history').delete().eq('id', historyItem.id);
                if (error) throw error;
                addNotification("Saída removida e estoque restaurado.", "success");
            } else {
                const updatedHistoryItemPayload = { items: finalItems, data: new Date().toISOString() };
                const { error } = await supabase.from('stock_history').update(updatedHistoryItemPayload).eq('id', historyItem.id);
                if (error) throw error;
                addNotification("Registro de saída atualizado!", "success");
            }

            onFinished();

        } catch (error: any) {
             addNotification(`Erro ao atualizar saída: ${error.message}`, "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
         <div className="flex flex-col h-full">
            <div className="space-y-4 flex-grow overflow-y-auto pr-2">
                <p className="text-sm text-gray-600">Ajuste as quantidades dos itens ou clique no ícone de lixeira para remover.</p>
                <div className="space-y-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                     {editedItems.map(item => (
                        <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                            <span className="col-span-7">{item.tipo} ({item.tamanho})</span>
                            <div className="col-span-4">
                               <input
                                   type="number" value={item.quantidade.toString()}
                                   onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                   className="w-full border border-gray-300 rounded-md shadow-sm p-2" min="0"
                               />
                            </div>
                            <div className="col-span-1 text-right">
                               <button type="button" onClick={() => handleRemoveItem(item.id)} className="p-1 text-red-500 hover:bg-red-100 rounded-full" title="Remover item da saída">
                                   <Trash2 size={16}/>
                               </button>
                            </div>
                        </div>
                    ))}
                    {editedItems.length === 0 && <p className="text-center text-gray-500 py-4">Nenhum item nesta saída. Salvar irá remover o registro permanentemente.</p>}
                </div>
            </div>
             <div className="flex justify-end space-x-4 pt-4 border-t mt-4 flex-shrink-0">
                    <button type="button" onClick={onFinished} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Voltar</button>
                    <button onClick={handleSubmit} disabled={isSaving} className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[120px]">
                        {isSaving ? <Spinner /> : 'Salvar'}
                    </button>
                </div>
        </div>
    );
};


// New modal for "Gerar Controle" options
const GenerateControlOptionsModal: React.FC<{
    onClose: () => void;
    onGenerate: (options: { type: 'UNIFORME' | 'EPI' | 'AMBOS', period: { start: string, end: string } }) => void;
}> = ({ onClose, onGenerate }) => {
    const [type, setType] = useState<'UNIFORME' | 'EPI' | 'AMBOS'>('AMBOS');
    const [period, setPeriod] = useState({ start: '', end: '' });

    const handleGenerateClick = () => {
        onGenerate({ type, period });
        onClose();
    };

    return (
        <Modal title="Opções para Gerar Controle" onClose={onClose} zIndex={60}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Item</label>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="w-full mt-1 p-2 border rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="AMBOS">Ambos</option>
                        <option value="UNIFORME">Apenas Uniformes</option>
                        <option value="EPI">Apenas EPIs</option>
                    </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Período - Início (Opcional)</label>
                        <input type="date" value={period.start} onChange={e => setPeriod(p => ({ ...p, start: e.target.value }))} className="w-full mt-1 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Período - Fim (Opcional)</label>
                        <input type="date" value={period.end} onChange={e => setPeriod(p => ({ ...p, end: e.target.value }))} className="w-full mt-1 p-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <p className="text-xs text-gray-500">Se nenhum período for selecionado, apenas as saídas pendentes serão incluídas.</p>
                <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button onClick={handleGenerateClick} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg">Gerar</button>
                </div>
            </div>
        </Modal>
    );
};


// Details Modal
const CollaboratorExitsModal: React.FC<{
    collaborator: Collaborator;
    onClose: () => void;
    addNotification: AddNotificationType;
}> = ({ collaborator, onClose, addNotification }) => {
    const dispatch: AppDispatch = useDispatch();
    const [editingHistoryItem, setEditingHistoryItem] = useState<StockHistoryItem | null>(null);
    const [showGenerateOptions, setShowGenerateOptions] = useState(false);
    const pdfSettings = useSelector((state: RootState) => state.stockSettings.settings);
    
    // Filter out history items that may have been deleted during the modal's lifecycle
    const currentHistoryItems = useSelector((state: RootState) => state.stockHistory.history.filter(h => h.idColaborador === collaborator.id));
    
    const handleEditFinished = useCallback(() => {
        setEditingHistoryItem(null);
    }, []);
    
    const handleGeneratePdf = useCallback(async (options: { type: 'UNIFORME' | 'EPI' | 'AMBOS', period: { start: string, end: string } }) => {
        const hasPeriodFilter = !!(options.period.start || options.period.end);
        
        // If a period is specified, consider all history items. Otherwise, only unreceipted items.
        let itemsToConsider = hasPeriodFilter
            ? currentHistoryItems
            : currentHistoryItems.filter(h => !h.receiptGeneratedAt);
        
        // Filter by period if provided
        if (options.period.start) {
            const startDate = new Date(options.period.start);
            startDate.setMinutes(startDate.getMinutes() + startDate.getTimezoneOffset());
            itemsToConsider = itemsToConsider.filter(h => new Date(h.data) >= startDate);
        }
        if (options.period.end) {
            const endDate = new Date(options.period.end);
            endDate.setMinutes(endDate.getMinutes() + endDate.getTimezoneOffset());
            endDate.setHours(23, 59, 59, 999); // Include whole day
            itemsToConsider = itemsToConsider.filter(h => new Date(h.data) <= endDate);
        }

        // Flatten items from the filtered transactions, adding the transaction date to each item
        const allItemsToProcess = itemsToConsider.flatMap(h => 
            h.items.map(i => ({...i, historyId: h.id, dataSaida: h.data }))
        );
        
        const filteredItemsByType = options.type === 'AMBOS' 
            ? allItemsToProcess 
            : allItemsToProcess.filter(i => i.classe === options.type);
        
        if (filteredItemsByType.length === 0) {
            addNotification("Não há saídas para os filtros selecionados.", "info");
            return;
        }

        const combinedHistoryItem: StockHistoryItem = {
            id: `combined_${Date.now()}`,
            idColaborador: collaborator.id,
            nomeColaborador: collaborator.nome,
            data: new Date().toISOString(),
            items: filteredItemsByType,
        };
        
        generateReceiptPdf(combinedHistoryItem, collaborator, pdfSettings, addNotification);

        const generationTimestamp = new Date().toISOString();
        const historyIdsToUpdate = [...new Set(filteredItemsByType.map(i => i.historyId))];

        const updatePromises = historyIdsToUpdate.map(id => 
            supabase.from('stock_history').update({ receiptGeneratedAt: generationTimestamp }).eq('id', id)
        );

        try {
            const results = await Promise.all(updatePromises);
            const error = results.find(res => res.error);
            if (error) throw error.error;
        } catch(e: any) {
            addNotification(`Erro ao marcar recibos como gerados: ${e.message}`, 'error');
        }

    }, [currentHistoryItems, collaborator, pdfSettings, addNotification, dispatch]);

    const groupedHistoryItems = useMemo(() => {
        const groups: { [key: string]: StockHistoryItem[] } = {};
        
        currentHistoryItems.forEach(item => {
            const key = item.receiptGeneratedAt || 'CURRENT';
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        
        const renderedGroups = Object.entries(groups).map(([key, items]) => {
            const sortedItemsInGroup = items.sort((a,b) => new Date(b.data).getTime() - new Date(a.data).getTime());
            return {
                key: key,
                date: key === 'CURRENT' ? new Date().toISOString() : key,
                transactions: sortedItemsInGroup
            };
        });

        return renderedGroups.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [currentHistoryItems]);


    return (
        <>
        {showGenerateOptions && (
            <GenerateControlOptionsModal
                onClose={() => setShowGenerateOptions(false)}
                onGenerate={handleGeneratePdf}
            />
        )}
        <Modal 
            title={editingHistoryItem ? `Editar Saída - ${collaborator.nome}` : collaborator.nome} 
            onClose={editingHistoryItem ? handleEditFinished : onClose} 
            modalContentClassName="max-w-4xl"
        >
             {editingHistoryItem ? (
                <EditExitForm
                    historyItem={editingHistoryItem}
                    onFinished={handleEditFinished}
                    addNotification={addNotification}
                />
            ) : (
                <div className="flex flex-col h-full">
                    <div className="flex-grow overflow-y-auto border rounded-lg">
                        <table className="w-full text-sm text-left text-gray-600">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0">
                                <tr>
                                    <th scope="col" className="px-4 py-3">Data</th>
                                    <th scope="col" className="px-4 py-3">Item</th>
                                    <th scope="col" className="px-4 py-3">Tamanho</th>
                                    <th scope="col" className="px-4 py-3">Quantidade</th>
                                    <th scope="col" className="px-4 py-3 text-center">Ações</th>
                                </tr>
                            </thead>
                             <tbody className="bg-white divide-y">
                                {groupedHistoryItems.map((group) => (
                                    <React.Fragment key={group.key}>
                                        {group.key !== 'CURRENT' && (
                                            <tr className="bg-gray-100 font-semibold">
                                                <td colSpan={5} className="px-4 py-2 text-center text-gray-700">
                                                    Controle gerado em: {new Date(group.date).toLocaleDateString('pt-BR')}
                                                </td>
                                            </tr>
                                        )}
                                        {group.transactions.map((item) => (
                                            <React.Fragment key={item.id}>
                                                {item.items.map((subItem, subIndex) => (
                                                    <tr key={`${item.id}-${subItem.id}`}>
                                                        {subIndex === 0 && <td rowSpan={item.items.length} className="px-4 py-3 whitespace-nowrap align-top">{new Date(item.data).toLocaleDateString('pt-BR')}</td>}
                                                        <td className="px-4 py-3 align-top">{subItem.tipo}</td>
                                                        <td className="px-4 py-3 align-top">{subItem.tamanho}</td>
                                                        <td className="px-4 py-3 align-top">{subItem.quantidade}</td>
                                                        {subIndex === 0 && 
                                                            <td rowSpan={item.items.length} className="px-4 py-3 align-middle">
                                                                <div className="flex justify-center items-center space-x-4">
                                                                    <button onClick={() => setEditingHistoryItem(item)} className="text-blue-500 hover:text-blue-700" title="Editar Saída"><Edit size={18}/></button>
                                                                </div>
                                                            </td>
                                                        }
                                                    </tr>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </React.Fragment>
                                ))}
                                 {currentHistoryItems.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center p-4 text-gray-500">Nenhuma saída registrada para este colaborador.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                     <div className="flex justify-between items-center pt-4 mt-4 flex-shrink-0 border-t">
                        <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                            Fechar
                        </button>
                        <button onClick={() => setShowGenerateOptions(true)} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center">
                            <FileText size={18} className="mr-2" /> Gerar Controle
                        </button>
                    </div>
                </div>
            )}
        </Modal>
        </>
    );
}

interface HistorySectionProps {
    history: StockHistoryItem[];
    collaborators: Collaborator[];
    addNotification: AddNotificationType;
}

const HistorySection: React.FC<HistorySectionProps> = ({ history, collaborators, addNotification }) => {
    const [filter, setFilter] = useState('');
    const [viewingCollaboratorId, setViewingCollaboratorId] = useState<string | null>(null);

    const groupedHistory = useMemo(() => {
        const groups: Record<string, StockHistoryItem[]> = {};
        history.filter(item => item.idColaborador !== 'SYSTEM_ENTRY').forEach(item => {
            const key = item.idColaborador;
            if (!groups[key]) groups[key] = [];
            groups[key].push(item);
        });
        return Object.values(groups).sort((a, b) => {
            const latestA = a.reduce((latest, current) => new Date(current.data) > new Date(latest.data) ? current : latest, a[0]);
            const latestB = b.reduce((latest, current) => new Date(current.data) > new Date(latest.data) ? current : latest, b[0]);
            return new Date(latestB.data).getTime() - new Date(latestA.data).getTime();
        });
    }, [history]);

    const filteredAndGroupedHistory = useMemo(() => {
        if (!filter) return groupedHistory;
        const lowerCaseFilter = filter.toLowerCase();
        return groupedHistory.filter(group => 
            group[0].nomeColaborador.toLowerCase().includes(lowerCaseFilter) ||
            group.some(item => item.items.some(subItem => subItem.tipo.toLowerCase().includes(lowerCaseFilter)))
        );
    }, [groupedHistory, filter]);
    
    const viewingCollaborator = useMemo(() => collaborators.find(c => c.id === viewingCollaboratorId), [collaborators, viewingCollaboratorId]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            {viewingCollaboratorId && viewingCollaborator && (
                <CollaboratorExitsModal 
                    collaborator={viewingCollaborator}
                    onClose={() => setViewingCollaboratorId(null)}
                    addNotification={addNotification}
                />
            )}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-700">Histórico de Saídas</h2>
                <input
                    type="text" value={filter} onChange={(e) => setFilter(e.target.value)}
                    placeholder="Filtrar por nome, item..."
                    className="border rounded-md px-2 py-1 text-sm focus:ring-blue-500 focus:border-blue-500 transition"
                />
            </div>
            <div className="overflow-auto" style={{ maxHeight: '29.5rem' }}>
                {filteredAndGroupedHistory.length > 0 ? (
                    filteredAndGroupedHistory.map((group) => {
                        const collaboratorId = group[0].idColaborador;
                        const collaboratorName = group[0].nomeColaborador;
                        const latestTransaction = group.reduce((latest, current) => new Date(current.data) > new Date(latest.data) ? current : latest, group[0]);
                        const unreceiptedCount = group.filter(item => !item.receiptGeneratedAt).length;

                        return (
                             <div key={collaboratorId} onClick={() => setViewingCollaboratorId(collaboratorId)} className="p-4 hover:bg-gray-100 cursor-pointer flex justify-between items-center border-b">
                                <div>
                                    <p className="font-semibold text-gray-800">{collaboratorName}</p>
                                    <p className="text-sm text-gray-500">
                                        Última atualização: {new Date(latestTransaction.data).toLocaleDateString('pt-BR')}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-4">
                                    {unreceiptedCount > 0 && 
                                        <span className="text-xs bg-yellow-200 text-yellow-800 rounded-full px-2 py-1 animate-pulse" title={`${unreceiptedCount} saídas pendentes de controle`}>
                                            {unreceiptedCount} pendente(s)
                                        </span>
                                    }
                                    <span className="text-xs bg-gray-200 text-gray-700 rounded-full px-2 py-1">{group.length} saídas totais</span>
                                    <ChevronsRight size={20} className="text-gray-400" />
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="text-center p-4 text-gray-500">Nenhum histórico encontrado.</div>
                )}
            </div>
        </div>
    );
};

export default HistorySection;