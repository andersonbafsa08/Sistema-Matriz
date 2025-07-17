

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { Rota, AddNotificationType } from '../../types';
import { Spinner, Plus, XIcon } from '../../App';
import { supabase } from '../../src/supabaseClient';

interface LocationFormProps {
    onFinished: () => void;
    addNotification: AddNotificationType;
}

const LocationForm: React.FC<LocationFormProps> = ({ onFinished, addNotification }) => {
    const dispatch: AppDispatch = useDispatch();
    const rotasDataFromStore = useSelector((state: RootState) => state.routes.rotas);
    const [localRotas, setLocalRotas] = useState<Rota[]>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Deep copy to prevent direct mutation of Redux state
        setLocalRotas(JSON.parse(JSON.stringify(rotasDataFromStore)));
    }, [rotasDataFromStore]);

    const handleRouteChange = useCallback((index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setLocalRotas(prevRoutes => {
            const newRoutes = [...prevRoutes];
            const routeKey = name as keyof Rota;
            if (type === 'checkbox') {
                newRoutes[index] = { ...newRoutes[index], [routeKey]: checked };
                if (routeKey === 'isDefault' && checked) {
                    newRoutes.forEach((route, i) => { if (i !== index) route.isDefault = false; });
                }
            } else { newRoutes[index] = { ...newRoutes[index], [routeKey]: value }; }
            return newRoutes;
        });
    }, []);

    const handlePaste = useCallback((index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        const coords = pastedText.match(/-?\d+([.,]\d+)?/g);
        if (coords && coords.length >= 2) {
            e.preventDefault();
            setLocalRotas(prevRoutes => {
                const newRoutes = [...prevRoutes];
                newRoutes[index].default_latitude = coords[0].replace(',', '.');
                newRoutes[index].default_longitude = coords[1].replace(',', '.');
                return newRoutes;
            });
        }
    }, []);

    const addRoute = useCallback(() => setLocalRotas(prev => [{ id: `new_rota_${Date.now()}`, filial: '', default_latitude: '', default_longitude: '', isDefault: prev.length === 0 }, ...prev]), []);
    const removeRoute = useCallback((indexToRemove: number) => setLocalRotas(prev => prev.filter((_, index) => index !== indexToRemove)), []);

    const handleSave = useCallback(async () => {
        setIsSaving(true);
        for (const route of localRotas) { if (!route.filial.trim()) { addNotification("O nome da filial é obrigatório.", 'error'); setIsSaving(false); return; } }
        if (localRotas.length > 0 && !localRotas.some(r => r.isDefault)) { addNotification("Defina uma rota como padrão.", 'error'); setIsSaving(false); return; }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado.");

            // This is a "replace all" operation for this user.
            
            // 1. Delete all existing routes for the current user
            const { error: deleteError } = await supabase.from('rotas').delete().eq('user_id', user.id);
            if (deleteError) throw deleteError;

            // 2. Insert the new set of routes if any exist
            if (localRotas.length > 0) {
                 const routesToInsert = localRotas.map(({ id, created_at, user_id, ...rest }) => ({...rest, user_id: user.id}));
                 const { error: insertError } = await supabase.from('rotas').insert(routesToInsert);
                 if (insertError) throw insertError;
            }
            
            // The redux state will be updated via the realtime subscription in App.tsx
            addNotification("Rotas salvas!", 'success');
            onFinished();
        } catch (error: any) {
            console.error("Error saving routes:", error);
            addNotification(`Erro ao salvar rotas: ${error.message}`, "error");
        } finally {
            setIsSaving(false);
        }
    }, [localRotas, addNotification, onFinished]);

    return (
        <div className="flex flex-col h-full overflow-hidden"> {/* Ensures container adheres to modal structure */}
            <div className="flex justify-end mb-4 flex-shrink-0"> {/* Add button area, prevent shrinking */}
                <button onClick={addRoute} className="bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-1 px-3 rounded-lg flex items-center">
                    <Plus size={16} className="mr-1"/> Adicionar Filial/Rota
                </button>
            </div>
            <div className="flex-grow overflow-y-auto space-y-4 pr-2 pb-2 min-h-0"> {/* Scrollable content area */}
                {localRotas.length === 0 && <p className="text-center text-gray-500 py-4">Nenhuma rota cadastrada.</p>}
                {localRotas.map((route, index) => (
                    <div key={route.id || index} className="p-4 border rounded-lg space-y-3 bg-gray-50 relative">
                         <button onClick={() => removeRoute(index)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-red-100 text-red-500" title="Remover Rota"><XIcon size={18} /></button>
                         <div className="flex flex-col sm:flex-row items-center gap-4">
                            <input name="filial" value={route.filial} onChange={(e) => handleRouteChange(index, e)} placeholder="Nome da Filial/Rota" className="w-full px-3 py-2 border border-gray-300 rounded-lg flex-grow"/>
                            <div className="flex items-center self-start sm:self-center pt-2 sm:pt-0"><input type="checkbox" name="isDefault" checked={route.isDefault} onChange={(e) => handleRouteChange(index, e)} id={`default-${index}`} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" /><label htmlFor={`default-${index}`} className="ml-2 block text-sm text-gray-900">Padrão</label></div>
                         </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input name="default_latitude" value={route.default_latitude} onChange={(e) => handleRouteChange(index, e)} onPaste={(e) => handlePaste(index, e)} placeholder="Latitude" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                            <input name="default_longitude" value={route.default_longitude} onChange={(e) => handleRouteChange(index, e)} placeholder="Longitude" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                         </div>
                    </div>
                ))}
            </div>
            <div className="flex-shrink-0 flex justify-end space-x-2 pt-4 border-t"> {/* Sticky footer area */}
                 <button onClick={onFinished} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                 <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[120px] min-h-[40px]"
                >
                    {isSaving ? <Spinner /> : 'Salvar Rotas'}
                </button>
            </div>
        </div>
    );
};
export default LocationForm;