

import React, { useState, useEffect, useCallback } from 'react';
import {
    Hotel, AddNotificationType, hotelFormSchema, HotelFormValidationErrors
} from '../../types';
import { useForm, Spinner, formatCnpjInput, formatCnpjDisplay } from '../../App';
import { supabase } from '../../src/supabaseClient';

interface HotelFormProps {
    onFinished: () => void;
    clientId: string;
    existingHotel?: Hotel | null;
    addNotification: AddNotificationType;
}

const HotelForm: React.FC<HotelFormProps> = ({ onFinished, clientId, existingHotel, addNotification }) => {
    const initialHotelState: Partial<Hotel> = {
        hotel: '', cnpj: '', telefone: '', dados_pag: '', quarto_ind: 0, quarto_dup: 0, quarto_tri: 0
    };

    const prepareInitialFormData = useCallback(() => {
        if (existingHotel) {
            return { ...existingHotel, cnpj: formatCnpjDisplay(existingHotel.cnpj) };
        }
        return initialHotelState;
    }, [existingHotel]);

    const [formData, handleChange, setFormData] = useForm<Partial<Hotel>>(prepareInitialFormData());
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<HotelFormValidationErrors | null>(null);

    useEffect(() => {
        setFormData(prepareInitialFormData());
        setFormErrors(null);
    }, [existingHotel, setFormData, prepareInitialFormData]);

    const handleCnpjInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const formattedCnpj = formatCnpjInput(e.target.value);
        if (e.target.value.replace(/\D/g, '') !== (formData.cnpj || '').replace(/\D/g, '') || formattedCnpj !== formData.cnpj) {
            setFormData(prev => ({ ...prev, cnpj: formattedCnpj }));
        }
    }, [setFormData, formData.cnpj]);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFormErrors(null);

        const dataToValidate = {
            hotel: formData.hotel || '',
            cnpj: formData.cnpj || '',
            telefone: formData.telefone || '',
            dados_pag: formData.dados_pag || '',
            quarto_ind: formData.quarto_ind,
            quarto_dup: formData.quarto_dup,
            quarto_tri: formData.quarto_tri,
        };
        const validationResult = hotelFormSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            setFormErrors(validationResult.error.format());
            addNotification("Por favor, corrija os erros no formulário.", 'error');
            setIsSaving(false);
            return;
        }
        
        try {
            const dataToSave = {
                client_id: clientId,
                hotel: validationResult.data.hotel!,
                cnpj: (validationResult.data.cnpj || '').replace(/\D/g, ''),
                telefone: validationResult.data.telefone || '',
                dados_pag: validationResult.data.dados_pag || '',
                quarto_ind: Number(validationResult.data.quarto_ind || 0),
                quarto_dup: Number(validationResult.data.quarto_dup || 0),
                quarto_tri: Number(validationResult.data.quarto_tri || 0)
            };

            let error;
            if (existingHotel) {
                const { error: updateError } = await supabase.from('hoteis').update(dataToSave).eq('id', existingHotel.id);
                error = updateError;
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado.");
                const { error: insertError } = await supabase.from('hoteis').insert({...dataToSave, user_id: user.id});
                error = insertError;
            }
            if (error) throw error;

            addNotification(existingHotel ? "Hotel atualizado com sucesso!" : "Hotel adicionado com sucesso!", 'success');
            onFinished();
        } catch (error: any) {
            console.error("Error saving hotel: ", error);
            addNotification(`Ocorreu um erro ao salvar o hotel: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    }, [formData, existingHotel, clientId, addNotification, onFinished]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <input name="hotel" value={formData.hotel || ''} onChange={handleChange} placeholder="Nome do Hotel" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.hotel ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="hotel-error"/>
                {formErrors?.hotel?._errors && <p id="hotel-error" className="text-red-500 text-xs mt-1">{formErrors.hotel._errors.join(', ')}</p>}
            </div>
            <div>
                <input name="cnpj" value={formData.cnpj || ''} onChange={handleCnpjInputChange} placeholder="CNPJ (XX.XXX.XXX/XXXX-XX)" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.cnpj ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="cnpj-error"/>
                {formErrors?.cnpj?._errors && <p id="cnpj-error" className="text-red-500 text-xs mt-1">{formErrors.cnpj._errors.join(', ')}</p>}
            </div>
            <div>
                <input name="telefone" value={formData.telefone || ''} onChange={handleChange} placeholder="Telefone" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.telefone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="telefone-error"/>
                {formErrors?.telefone?._errors && <p id="telefone-error" className="text-red-500 text-xs mt-1">{formErrors.telefone._errors.join(', ')}</p>}
            </div>
            <div>
                <input name="dados_pag" value={formData.dados_pag || ''} onChange={handleChange} placeholder="Dados de Pagamento (PIX)" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.dados_pag ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="dados_pag-error"/>
                {formErrors?.dados_pag?._errors && <p id="dados_pag-error" className="text-red-500 text-xs mt-1">{formErrors.dados_pag._errors.join(', ')}</p>}
            </div>
            <div>
                <input name="quarto_ind" type="number" step="0.01" value={formData.quarto_ind ?? ''} onChange={handleChange} placeholder="Valor Quarto Individual" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.quarto_ind ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="quarto_ind-error"/>
                {formErrors?.quarto_ind?._errors && <p id="quarto_ind-error" className="text-red-500 text-xs mt-1">{formErrors.quarto_ind._errors.join(', ')}</p>}
            </div>
             <div>
                <input name="quarto_dup" type="number" step="0.01" value={formData.quarto_dup ?? ''} onChange={handleChange} placeholder="Valor Quarto Duplo" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.quarto_dup ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="quarto_dup-error"/>
                {formErrors?.quarto_dup?._errors && <p id="quarto_dup-error" className="text-red-500 text-xs mt-1">{formErrors.quarto_dup._errors.join(', ')}</p>}
            </div>
             <div>
                <input name="quarto_tri" type="number" step="0.01" value={formData.quarto_tri ?? ''} onChange={handleChange} placeholder="Valor Quarto Triplo" className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-blue-500 transition ${formErrors?.quarto_tri ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`} aria-describedby="quarto_tri-error"/>
                {formErrors?.quarto_tri?._errors && <p id="quarto_tri-error" className="text-red-500 text-xs mt-1">{formErrors.quarto_tri._errors.join(', ')}</p>}
            </div>
            <div className="flex justify-end pt-4">
                 <button type="button" onClick={onFinished} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                 <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors min-w-[150px] min-h-[40px]"
                >
                    {isSaving ? <Spinner/> : (existingHotel ? 'Atualizar Hotel' : 'Salvar Hotel')}
                </button>
            </div>
        </form>
    );
};
export default HotelForm;
