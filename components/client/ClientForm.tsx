

import React, { useState, useEffect, useCallback } from 'react';
import {
    Client, AddNotificationType, clientFormSchema, ClientFormValidationErrors
} from '../../types';
import { useForm, Spinner } from '../../App';
import { supabase } from '../../src/supabaseClient';

interface ClientFormProps {
    onFinished: () => void;
    existingClient?: Client;
    addNotification: AddNotificationType;
}

const ClientForm: React.FC<ClientFormProps> = ({ onFinished, existingClient, addNotification }) => {
    const initialState: Partial<Client> = {
        cliente: '', cidade: '', distancia: '', lat_final: '', lon_final: ''
    };
    const [formData, handleChange, setFormData] = useForm<Partial<Client>>(existingClient || initialState);
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<ClientFormValidationErrors | null>(null);

    useEffect(() => {
        if (existingClient) {
            setFormData(existingClient);
        } else {
            setFormData(initialState);
        }
        setFormErrors(null);
    }, [existingClient, setFormData]);

    const handlePaste = useCallback((e: React.ClipboardEvent<HTMLInputElement>) => {
        const pastedText = e.clipboardData.getData('text');
        const coords = pastedText.match(/-?\d+([.,]\d+)?/g);
        if (coords && coords.length >= 2) {
            e.preventDefault();
            setFormData(prev => ({ ...prev, lat_final: coords[0].replace(',', '.'), lon_final: coords[1].replace(',', '.') }));
        }
    }, [setFormData]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFormErrors(null);

        const dataToValidate = {
            cliente: formData.cliente || '',
            cidade: formData.cidade || '',
            distancia: formData.distancia || '',
            lat_final: formData.lat_final ? formData.lat_final.replace(',', '.') : '',
            lon_final: formData.lon_final ? formData.lon_final.replace(',', '.') : '',
        };

        const validationResult = clientFormSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            setFormErrors(validationResult.error.format());
            addNotification("Por favor, corrija os erros no formulário.", 'error');
            setIsSaving(false);
            return;
        }

        try {
            const dataToSave = {
                cliente: validationResult.data.cliente,
                cidade: validationResult.data.cidade,
                searchableKeywords: [
                    ...(validationResult.data.cliente.toLowerCase().split(' ').filter(Boolean)),
                    ...(validationResult.data.cidade.toLowerCase().split(' ').filter(Boolean))
                ],
                distancia: validationResult.data.distancia || '',
                lat_final: validationResult.data.lat_final || '',
                lon_final: validationResult.data.lon_final || '',
                observacoes: existingClient?.observacoes || formData.observacoes
            };

            let error;
            if (existingClient) {
                const { error: updateError } = await supabase.from('clientes').update(dataToSave).eq('id', existingClient.id);
                error = updateError;
            } else {
                 const { data: { user } } = await supabase.auth.getUser();
                 if (!user) throw new Error("Usuário não autenticado.");
                const { error: insertError } = await supabase.from('clientes').insert({...dataToSave, user_id: user.id});
                error = insertError;
            }

            if (error) throw error;
            
            addNotification(existingClient ? "Cliente atualizado com sucesso!" : "Cliente adicionado com sucesso!", 'success');
            onFinished();
        } catch (error: any) {
            console.error("Error saving client: ", error);
            addNotification(`Ocorreu um erro ao salvar o cliente: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    }, [formData, existingClient, addNotification, onFinished]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input name="cliente" value={formData.cliente || ''} onChange={handleChange} placeholder="Nome do Cliente" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.cliente ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="cliente-error" />
                {formErrors?.cliente?._errors && <p id="cliente-error" className="text-red-500 text-xs mt-1">{formErrors.cliente._errors.join(', ')}</p>}
            </div>
            <div>
                <input name="cidade" value={formData.cidade || ''} onChange={handleChange} placeholder="Cidade" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.cidade ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="cidade-error" />
                {formErrors?.cidade?._errors && <p id="cidade-error" className="text-red-500 text-xs mt-1">{formErrors.cidade._errors.join(', ')}</p>}
            </div>
            <div>
                <input name="distancia" type="text" inputMode="numeric" pattern="[0-9]*" value={formData.distancia || ''} onChange={handleChange} placeholder="Distância (km)" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.distancia ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="distancia-error" />
                {formErrors?.distancia?._errors && <p id="distancia-error" className="text-red-500 text-xs mt-1">{formErrors.distancia._errors.join(', ')}</p>}
            </div>
            <div>
                <input name="lat_final" value={formData.lat_final || ''} onChange={handleChange} onPaste={handlePaste} placeholder="Latitude Final (ex: -23.5505)" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.lat_final ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="lat_final-error"/>
                {formErrors?.lat_final?._errors && <p id="lat_final-error" className="text-red-500 text-xs mt-1">{formErrors.lat_final._errors.join(', ')}</p>}
            </div>
            <div>
                <input name="lon_final" value={formData.lon_final || ''} onChange={handleChange} placeholder="Longitude Final (ex: -46.6333)" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.lon_final ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="lon_final-error" />
                {formErrors?.lon_final?._errors && <p id="lon_final-error" className="text-red-500 text-xs mt-1">{formErrors.lon_final._errors.join(', ')}</p>}
            </div>
            <div className="flex justify-end pt-4">
                <button type="button" onClick={onFinished} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors min-w-[150px] min-h-[40px]"
                >
                    {isSaving ? <Spinner/> : (existingClient ? 'Atualizar Cliente' : 'Salvar Cliente')}
                </button>
            </div>
        </form>
    );
};

export default ClientForm;
