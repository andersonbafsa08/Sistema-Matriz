

import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { AddNotificationType, StockItem, StockHistoryItem, Collaborator } from '../../types';
import { Spinner } from '../../App';
import { supabase } from '../../src/supabaseClient';

interface ExitFormProps {
    onFinished: () => void;
    addNotification: AddNotificationType;
    itemClass: 'UNIFORME' | 'EPI';
}

type TempExitItem = {
    id: string;
    classe: 'UNIFORME' | 'EPI';
    tipo: string;
    tamanho: string;
    quantidade: number;
}

const ExitForm: React.FC<ExitFormProps> = ({ onFinished, addNotification, itemClass }) => {
    const dispatch: AppDispatch = useDispatch();
    const stock = useSelector((state: RootState) => state.stock.items);
    const collaborators = useSelector((state: RootState) => state.collaborators.collaborators);
    
    const [isSaving, setIsSaving] = useState(false);
    const [selectedCollaborator, setSelectedCollaborator] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    const [tempExitList, setTempExitList] = useState<TempExitItem[]>([]);

    const availableStock = useMemo(() => 
        stock.filter(item => item.quantidade > 0 && item.classe === itemClass)
             .sort((a,b) => a.tipo.localeCompare(b.tipo) || a.tamanho.localeCompare(b.tamanho)),
    [stock, itemClass]);

    const currentItemInStock = useMemo(() => 
        selectedItem ? stock.find(item => item.id === selectedItem) : null,
    [selectedItem, stock]);

    const handleAddItemToList = useCallback(() => {
        if (!selectedItem || !itemQuantity || itemQuantity <= 0) {
            addNotification("Selecione um item e uma quantidade válida.", 'error');
            return;
        }
        if (!currentItemInStock) {
            addNotification("Item selecionado não encontrado no estoque.", "error");
            return;
        }

        const quantityInList = tempExitList.find(item => item.id === selectedItem)?.quantidade || 0;
        if (itemQuantity > (currentItemInStock.quantidade - quantityInList)) {
            addNotification("Quantidade solicitada excede o estoque disponível.", "error");
            return;
        }

        setTempExitList(prevList => {
            const existing = prevList.find(item => item.id === selectedItem);
            if (existing) {
                return prevList.map(item => item.id === selectedItem ? { ...item, quantidade: item.quantidade + itemQuantity } : item);
            }
            return [...prevList, {
                id: currentItemInStock.id,
                classe: currentItemInStock.classe,
                tipo: currentItemInStock.tipo,
                tamanho: currentItemInStock.tamanho,
                quantidade: itemQuantity
            }];
        });

        setSelectedItem('');
        setItemQuantity(1);
    }, [selectedItem, itemQuantity, currentItemInStock, tempExitList, addNotification]);

    const handleRemoveFromList = useCallback((itemId: string) => {
        setTempExitList(prev => prev.filter(item => item.id !== itemId));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCollaborator || tempExitList.length === 0) {
            addNotification("Selecione um colaborador e adicione pelo menos um item à lista.", "error");
            return;
        }
        setIsSaving(true);
        const collaborator = collaborators.find(c => c.id === selectedCollaborator);
        if (!collaborator) {
             addNotification("Colaborador não encontrado.", "error");
             setIsSaving(false);
             return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado.");

            const historyEntryPayload: StockHistoryItem = {
                id: `unif_hist_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                idColaborador: selectedCollaborator,
                nomeColaborador: collaborator.nome,
                data: new Date().toISOString(),
                items: tempExitList,
                user_id: user.id
            };

            // This should ideally be a transaction. Using Promise.all is the next best thing
            // without a dedicated RPC function.
            const stockUpdatePromises = tempExitList.map(itemToUpdate => {
                const currentItem = stock.find(i => i.id === itemToUpdate.id);
                if (!currentItem) throw new Error(`Item de estoque ${itemToUpdate.id} não encontrado.`);
                const newQuantity = currentItem.quantidade - itemToUpdate.quantidade;
                return supabase.from('stock_items').update({ quantidade: newQuantity }).eq('id', itemToUpdate.id);
            });
            
            const results = await Promise.all(stockUpdatePromises);
            const stockUpdateError = results.find(res => res.error);
            if (stockUpdateError) throw stockUpdateError.error;

            const { error: historyError } = await supabase.from('stock_history').insert(historyEntryPayload);
            if (historyError) throw historyError;

            addNotification("Saída de itens registrada com sucesso!", "success");
            onFinished();

        } catch (error: any) {
             addNotification(`Erro ao registrar saída: ${error.message}`, "error");
        } finally {
            setIsSaving(false);
        }

    }, [selectedCollaborator, tempExitList, collaborators, stock, addNotification, onFinished]);

    return (
         <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="saida-colaborador" className="block text-sm font-medium text-gray-700">Colaborador</label>
                <select id="saida-colaborador" value={selectedCollaborator} onChange={e => setSelectedCollaborator(e.target.value)} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 bg-white">
                    <option value="">Selecione...</option>
                    {[...collaborators].sort((a,b) => a.nome.localeCompare(b.nome)).map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                    ))}
                </select>
            </div>
            
            <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-7">
                        <label htmlFor="saida-item" className="block text-sm font-medium text-gray-700">Item do Estoque</label>
                        <select id="saida-item" value={selectedItem} onChange={e => setSelectedItem(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500 bg-white">
                            <option value="">Selecione...</option>
                            {availableStock.map(item => (
                                <option key={item.id} value={item.id}>{item.tipo} - {item.tamanho} (Disp: {item.quantidade})</option>
                            ))}
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="saida-quantidade" className="block text-sm font-medium text-gray-700">Qtd.</label>
                        <input type="number" id="saida-quantidade" value={itemQuantity} onChange={e => setItemQuantity(Number(e.target.value))} min="1" max={currentItemInStock ? currentItemInStock.quantidade - (tempExitList.find(i => i.id === currentItemInStock.id)?.quantidade || 0) : 1} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-red-500 focus:border-red-500" />
                    </div>
                    <div className="md:col-span-3">
                        <button type="button" onClick={handleAddItemToList} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg w-full h-full">Adicionar</button>
                    </div>
                </div>
                 <div>
                    <h4 className="text-lg font-semibold mb-2">Itens para Saída</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 border rounded-md bg-gray-50 min-h-[50px]">
                        {tempExitList.length === 0 && <p className="text-gray-400 text-sm text-center">Nenhum item adicionado.</p>}
                        {tempExitList.map(item => (
                            <div key={item.id} className="flex justify-between items-center bg-white p-2 rounded shadow-sm">
                                <span>{item.quantidade}x {item.tipo} ({item.tamanho})</span>
                                <button type="button" onClick={() => handleRemoveFromList(item.id)} className="text-red-500 hover:text-red-700 font-bold">&times;</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-4 border-t pt-6">
                <button type="button" onClick={onFinished} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[150px]">
                     {isSaving ? <Spinner/> : 'Finalizar Saída'}
                </button>
            </div>
        </form>
    );
};

export default ExitForm;