

import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import {
    Collaborator, AddNotificationType,
    collaboratorFormSchema, CollaboratorFormValidationErrors
} from '../../types';
import { Spinner, formatCpfInput } from '../../App';
import { supabase } from '../../src/supabaseClient';

interface CollaboratorFormProps {
    onFinished: () => void;
    existingCollaborator?: Collaborator | null;
    addNotification: AddNotificationType;
}

const CollaboratorForm: React.FC<CollaboratorFormProps> = ({ onFinished, existingCollaborator, addNotification }) => {
    const collaborators = useSelector((state: RootState) => state.collaborators.collaborators);

    const getInitialFormState = useCallback((collaborator?: Collaborator | null): Partial<Collaborator> => {
        const baseInitialState: Partial<Collaborator> = {
            nome: '', cpf: '', data_nasc: '', pix: '', banco: '', telefone: '', filial: '', funcao: '', funcao_outros: '', valor_diaria_custom: undefined, valor_pernoite_custom: undefined
        };
        if (collaborator) {
            return {
                ...collaborator,
                cpf: formatCpfInput(collaborator.cpf || ''),
                funcao_outros: collaborator.funcao === 'Outros' ? (collaborator.funcao_outros || '') : '',
            };
        }
        return baseInitialState;
    }, []);

    const [formData, setFormData] = useState<Partial<Collaborator>>(getInitialFormState(existingCollaborator));
    const [isSaving, setIsSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<CollaboratorFormValidationErrors | null>(null);

    useEffect(() => {
        setFormData(getInitialFormState(existingCollaborator));
        setFormErrors(null);
    }, [existingCollaborator, getInitialFormState]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            let processedValue: string | number | undefined = value;
            if (name === 'cpf') {
                processedValue = formatCpfInput(value);
            }
            if (name === 'valor_diaria_custom' || name === 'valor_pernoite_custom') {
                 processedValue = value === '' ? undefined : value; // Keep as string for input control
            }
            if (name === "funcao") {
                const newFuncaoValue = value as Collaborator['funcao'];
                return { ...prev, funcao: newFuncaoValue, funcao_outros: newFuncaoValue !== "Outros" ? '' : (prev.funcao_outros || '') };
            }
            return { ...prev, [name]: processedValue };
        });
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFormErrors(null);

        const dataToValidate = {
            ...formData,
            cpf: (formData.cpf || '').replace(/\D/g, ''),
        };
        const validationResult = collaboratorFormSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            setFormErrors(validationResult.error.format());
            addNotification("Por favor, corrija os erros no formulário.", 'error');
            setIsSaving(false);
            return;
        }

        const rawCpf = (validationResult.data.cpf || '').replace(/\D/g, '');
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            addNotification("Sessão inválida. Por favor, faça login novamente.", "error");
            setIsSaving(false);
            return;
        }
        
        // Check for existing CPF for the current user
        const { data: existingCpfData, error: fetchError } = await supabase
            .from('colaboradores')
            .select('id, cpf')
            .eq('cpf', rawCpf)
            .eq('user_id', user.id) // check only for current user's collaborators
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "No rows found" error
            addNotification(`Erro ao verificar CPF: ${fetchError.message}`, 'error');
            setIsSaving(false);
            return;
        }
        
        if (existingCpfData && (!existingCollaborator || existingCpfData.id !== existingCollaborator.id)) {
            addNotification("Já existe um colaborador com este CPF.", 'error');
            setIsSaving(false);
            setFormErrors(prev => ({ ...(prev || {}), cpf: { _errors: ["CPF já cadastrado."] } } as CollaboratorFormValidationErrors));
            return;
        }

        const dataToSave = {
            nome: validationResult.data.nome!,
            cpf: validationResult.data.cpf!,
            data_nasc: validationResult.data.data_nasc || '',
            pix: validationResult.data.pix || '',
            banco: validationResult.data.banco || '',
            telefone: validationResult.data.telefone || '',
            filial: validationResult.data.filial || '',
            funcao: validationResult.data.funcao || '',
            funcao_outros: validationResult.data.funcao === 'Outros' ? (validationResult.data.funcao_outros || '') : '',
            valor_diaria_custom: validationResult.data.valor_diaria_custom,
            valor_pernoite_custom: validationResult.data.valor_pernoite_custom,
        };

        try {
            let error;
            if (existingCollaborator) {
                const { error: updateError } = await supabase.from('colaboradores').update(dataToSave).eq('id', existingCollaborator.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase.from('colaboradores').insert({...dataToSave, user_id: user.id});
                error = insertError;
            }
            if (error) throw error;
            
            addNotification(existingCollaborator ? "Colaborador atualizado!" : "Colaborador salvo!", 'success');
            onFinished();
        } catch (error: any) {
            console.error("Error saving collaborator:", error); 
            addNotification(`Erro ao salvar colaborador: ${error.message}`, 'error');
        } finally { 
            setIsSaving(false); 
        }
    }, [formData, existingCollaborator, addNotification, onFinished]);

    return (
        <form onSubmit={handleSubmit} className="flex flex-col flex-grow min-h-0">
            <div className="flex-grow overflow-y-auto space-y-4 pr-4 -mr-4">
                <div>
                    <input name="nome" value={formData.nome || ''} onChange={handleChange} placeholder="Nome Completo" className={`w-full px-3 py-2 border rounded-lg ${formErrors?.nome ? 'border-red-500':'border-gray-300'}`} aria-label="Nome Completo do Colaborador"/>
                    {formErrors?.nome?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.nome._errors.join(', ')}</p>}
                </div>
                <div>
                    <input name="cpf" value={formData.cpf || ''} onChange={handleChange} placeholder="CPF (XXX.XXX.XXX-XX)" className={`w-full px-3 py-2 border rounded-lg ${formErrors?.cpf ? 'border-red-500':'border-gray-300'}`} aria-label="CPF do Colaborador"/>
                    {formErrors?.cpf?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.cpf._errors.join(', ')}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="data_nasc" className="text-sm font-medium text-gray-700">Data de Nascimento</label>
                        <input id="data_nasc" name="data_nasc" type="date" value={formData.data_nasc || ''} onChange={handleChange} className={`w-full mt-1 px-3 py-2 border rounded-lg ${formErrors?.data_nasc ? 'border-red-500':'border-gray-300'}`} aria-label="Data de Nascimento"/>
                        {formErrors?.data_nasc?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.data_nasc._errors.join(', ')}</p>}
                    </div>
                    <div>
                        <label htmlFor="banco_colab" className="text-sm font-medium text-gray-700">Banco</label>
                        <input id="banco_colab" name="banco" value={formData.banco || ''} onChange={handleChange} placeholder="Banco" className={`w-full mt-1 px-3 py-2 border rounded-lg self-end ${formErrors?.banco ? 'border-red-500':'border-gray-300'}`} aria-label="Banco"/>
                        {formErrors?.banco?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.banco._errors.join(', ')}</p>}
                    </div>
                </div>
                <div>
                    <input name="pix" value={formData.pix || ''} onChange={handleChange} placeholder="Chave PIX" className={`w-full px-3 py-2 border rounded-lg ${formErrors?.pix ? 'border-red-500':'border-gray-300'}`} aria-label="Chave PIX"/>
                    {formErrors?.pix?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.pix._errors.join(', ')}</p>}
                </div>
                <div>
                    <input name="telefone" value={formData.telefone || ''} onChange={handleChange} placeholder="Telefone (DDD + Número)" className={`w-full px-3 py-2 border rounded-lg ${formErrors?.telefone ? 'border-red-500':'border-gray-300'}`} aria-label="Telefone"/>
                    {formErrors?.telefone?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.telefone._errors.join(', ')}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label htmlFor="filial_colab" className="text-sm font-medium text-gray-700">Filial</label>
                        <input id="filial_colab" name="filial" value={formData.filial || ''} onChange={handleChange} placeholder="Filial" className={`w-full mt-1 px-3 py-2 border rounded-lg ${formErrors?.filial ? 'border-red-500':'border-gray-300'}`} aria-label="Filial"/>
                        {formErrors?.filial?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.filial._errors.join(', ')}</p>}
                    </div>
                    <div className="space-y-1">
                        <div>
                            <label htmlFor="funcao" className="text-sm font-medium text-gray-700">Função</label>
                            <select name="funcao" id="funcao" value={formData.funcao || ''} onChange={handleChange} className={`w-full mt-1 px-3 py-2 border rounded-lg bg-white ${formErrors?.funcao ? 'border-red-500':'border-gray-300'}`} aria-label="Função do Colaborador">
                                <option value="">Selecione...</option><option value="Técnico">TÉCNICO</option><option value="Motorista">MOTORISTA</option><option value="Mangueirista">MANGUEIRISTA</option><option value="Carreteiro">CARRETEIRO</option><option value="Outros">OUTROS</option>
                            </select>
                            {formErrors?.funcao?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.funcao._errors.join(', ')}</p>}
                        </div>
                        {formData.funcao === 'Outros' && (
                            <div className="space-y-2">
                                <input name="funcao_outros" id="funcao_outros" value={formData.funcao_outros || ''} onChange={handleChange} placeholder="Especifique a Função" className={`w-full px-3 py-2 border rounded-lg mt-1 ${formErrors?.funcao_outros ? 'border-red-500':'border-gray-300'}`} aria-label="Especificação da Função Outros"/>
                                {formErrors?.funcao_outros?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.funcao_outros._errors.join(', ')}</p>}
                            </div>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                        <label htmlFor="valor_diaria_custom" className="text-sm font-medium text-gray-700">Diária</label>
                        <input id="valor_diaria_custom" name="valor_diaria_custom" type="number" step="0.01" value={formData.valor_diaria_custom ?? ''} onChange={handleChange} placeholder="Valor R$" className={`w-full mt-1 px-3 py-2 border rounded-lg ${formErrors?.valor_diaria_custom ? 'border-red-500':'border-gray-300'}`} aria-label="Valor da diária personalizado"/>
                        {formErrors?.valor_diaria_custom?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.valor_diaria_custom._errors.join(', ')}</p>}
                    </div>
                    <div>
                        <label htmlFor="valor_pernoite_custom" className="text-sm font-medium text-gray-700">Pernoite</label>
                        <input id="valor_pernoite_custom" name="valor_pernoite_custom" type="number" step="0.01" value={formData.valor_pernoite_custom ?? ''} onChange={handleChange} placeholder="Valor R$" className={`w-full mt-1 px-3 py-2 border rounded-lg ${formErrors?.valor_pernoite_custom ? 'border-red-500':'border-gray-300'}`} aria-label="Valor do pernoite personalizado"/>
                        {formErrors?.valor_pernoite_custom?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.valor_pernoite_custom._errors.join(', ')}</p>}
                    </div>
                </div>
            </div>
            <div className="flex justify-end pt-4 flex-shrink-0">
                <button type="button" onClick={onFinished} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[200px] min-h-[40px]"
                >
                    {isSaving ? <Spinner/> : (existingCollaborator ? 'Atualizar Colaborador' : 'Salvar Colaborador')}
                </button>
            </div>
        </form>
    );
};
export default CollaboratorForm;
