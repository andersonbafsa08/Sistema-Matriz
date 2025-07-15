import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { AddNotificationType, StockItem, StockHistoryItem } from '../../types';
import { useForm, Spinner } from '../../App';
import { updateStockItem } from '../../src/store/slices/stockSlice';
import { addStockHistoryEntry } from '../../src/store/slices/stockHistorySlice';

interface EntryFormProps {
    onFinished: () => void;
    addNotification: AddNotificationType;
    itemClass: 'UNIFORME' | 'EPI';
}

const EntryForm: React.FC<EntryFormProps> = ({ onFinished, addNotification, itemClass }) => {
    const dispatch: AppDispatch = useDispatch();
    const stock = useSelector((state: RootState) => state.stock.items);

    const [formData, handleChange, setFormData] = useForm({
        classe: itemClass,
        tipo: '',
        tamanho: '',
        quantidade: 1,
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        const { classe, tipo, quantidade } = formData;
        let { tamanho } = formData; // Make it mutable

        if (!classe || !tipo.trim() || !quantidade || quantidade < 1) {
            addNotification("Por favor, preencha todos os campos corretamente.", "error");
            return;
        }

        if (itemClass === 'EPI' || (itemClass === 'UNIFORME' && !tamanho.trim())) {
            tamanho = 'ÚNICO';
        }

        setIsSaving(true);
        
        const upperCaseTipo = tipo.trim().toUpperCase();
        const upperCaseTamanho = tamanho.trim().toUpperCase();
        const id = `${classe.toLowerCase()}-${upperCaseTipo.toLowerCase().replace(/\s+/g, '-')}-${upperCaseTamanho.toLowerCase()}`;
        
        const existingItem = stock.find(item => item.id === id);
        const newQuantity = (existingItem ? existingItem.quantidade : 0) + Number(quantidade);

        const stockItem: StockItem = {
            id,
            classe,
            tipo: upperCaseTipo,
            tamanho: upperCaseTamanho,
            quantidade: newQuantity,
        };

        dispatch(updateStockItem(stockItem));
        
        const historyEntry: StockHistoryItem = {
            id: `unif_hist_entry_${Date.now()}`,
            idColaborador: 'SYSTEM_ENTRY',
            nomeColaborador: 'ENTRADA NO ESTOQUE',
            data: new Date().toISOString(),
            items: [{
                id: stockItem.id,
                classe: stockItem.classe,
                tipo: stockItem.tipo,
                tamanho: stockItem.tamanho,
                quantidade: Number(quantidade),
            }],
        };
        dispatch(addStockHistoryEntry(historyEntry));

        addNotification("Entrada registrada com sucesso!", "success");
        setIsSaving(false);
        onFinished();
    }, [formData, stock, dispatch, addNotification, onFinished, itemClass]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Classe do Item</label>
                <input type="text" value={formData.classe} readOnly className="mt-1 block w-full bg-gray-100 border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
                <label htmlFor="entrada-tipo" className="block text-sm font-medium text-gray-700">Descrição do Item</label>
                <input type="text" id="entrada-tipo" name="tipo" value={formData.tipo} onChange={handleChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            {itemClass === 'UNIFORME' && (
                <div>
                    <label htmlFor="entrada-tamanho" className="block text-sm font-medium text-gray-700">Tamanho</label>
                    <input type="text" id="entrada-tamanho" name="tamanho" value={formData.tamanho} onChange={handleChange} placeholder="Deixe em branco para 'ÚNICO'" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
                </div>
            )}
            <div>
                <label htmlFor="entrada-quantidade" className="block text-sm font-medium text-gray-700">Quantidade</label>
                <input type="number" id="entrada-quantidade" name="quantidade" value={formData.quantidade} onChange={handleChange} min="1" required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-green-500 focus:border-green-500" />
            </div>
            <div className="flex justify-end space-x-4 pt-4">
                <button type="button" onClick={onFinished} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[150px]">
                    {isSaving ? <Spinner /> : 'Adicionar ao Estoque'}
                </button>
            </div>
        </form>
    );
};

export default EntryForm;
