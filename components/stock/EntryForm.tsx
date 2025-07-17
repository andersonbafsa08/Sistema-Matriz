

import React, { useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { AddNotificationType, StockItem, StockHistoryItem } from '../../types';
import { useForm, Spinner } from '../../App';
import { supabase } from '../../src/supabaseClient';

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

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
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
        
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado.");

            const existingItem = stock.find(item => item.id === id);
            const newQuantity = (existingItem ? existingItem.quantidade : 0) + Number(quantidade);

            const stockItemPayload: StockItem = {
                id,
                classe,
                tipo: upperCaseTipo,
                tamanho: upperCaseTamanho,
                quantidade: newQuantity,
                user_id: user.id
            };

            const historyEntryPayload: StockHistoryItem = {
                id: `unif_hist_entry_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                idColaborador: 'SYSTEM_ENTRY',
                nomeColaborador: 'ENTRADA NO ESTOQUE',
                data: new Date().toISOString(),
                items: [{
                    id: stockItemPayload.id,
                    classe: stockItemPayload.classe,
                    tipo: stockItemPayload.tipo,
                    tamanho: stockItemPayload.tamanho,
                    quantidade: Number(quantidade),
                }],
                user_id: user.id
            };

            const { error: stockError } = await supabase.from('stock_items').upsert(stockItemPayload);
            if (stockError) throw stockError;

            const { error: historyError } = await supabase.from('stock_history').insert(historyEntryPayload);
            if (historyError) throw historyError;

            addNotification("Entrada registrada com sucesso!", "success");
            onFinished();
        } catch (error: any) {
            addNotification(`Erro ao registrar entrada: ${error.message}`, "error");
            // Here you might want to add logic to revert the stock update if history fails.
            // For now, we just notify the user.
        } finally {
            setIsSaving(false);
        }

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