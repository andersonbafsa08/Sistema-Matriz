


import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import {
    Request, Collaborator, AddNotificationType,
    requestFormSchema, RequestFormValidationErrors
} from '../../types';
import {
    Spinner, Modal, ChevronDown, ChevronUp, formatCnpjInput
} from '../../App';
import { getInitialRequestState } from '../../constants';
import CollaboratorSelectionModalContent from './CollaboratorSelectionModalContent';
import { supabase } from '../../src/supabaseClient';


interface RequestFormProps {
    existingRequestProp: Partial<Request> | null;
    onFinished: () => void;
    addNotification: AddNotificationType;
    formatCollaboratorName: (name?: string) => string;
    initiallyCollapsed?: boolean;
    isPrefill: boolean;
}

const RequestForm: React.FC<RequestFormProps> = ({
    existingRequestProp, onFinished, addNotification, formatCollaboratorName, initiallyCollapsed = true, isPrefill
}) => {
    const dispatch: AppDispatch = useDispatch();
    const collaborators = useSelector((state: RootState) => state.collaborators.collaborators);
    const solicitacoes = useSelector((state: RootState) => state.requests.solicitacoes);

    const [formData, setFormData] = useState<Request>(getInitialRequestState());
    const [isSaving, setIsSaving] = useState(false);
    const [showCollabModal, setShowCollabModal] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);
    const [formErrors, setFormErrors] = useState<RequestFormValidationErrors | null>(null);

    useEffect(() => {
        if (existingRequestProp) {
            setFormData(prev => ({
                ...getInitialRequestState(),
                ...prev,
                ...existingRequestProp,
                id: existingRequestProp.id || prev.id,
                cnpj: formatCnpjInput(existingRequestProp.cnpj || ''),
                nf_attachments: existingRequestProp.nf_attachments || [],
                pix_attachments: existingRequestProp.pix_attachments || [],
            }));
            setIsCollapsed(false);
        } else {
            setFormData(getInitialRequestState());
            setIsCollapsed(true);
        }
        setFormErrors(null);
    }, [existingRequestProp]);

    useEffect(() => {
        const { check_in, check_out, valor_diaria, equipe_members } = formData;

        const parseDateString = (dateStr: string): Date | null => {
            if (!dateStr || typeof dateStr !== 'string') return null;
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                const year = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const day = parseInt(parts[2], 10);
                if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
                    return new Date(year, month, day);
                }
            }
            return null;
        };

        try {
            if (!check_in || !check_out) return;
            const date1 = parseDateString(check_in);
            const date2 = parseDateString(check_out);

            if (!date1 || !date2) {
                setFormData(prev => ({ ...prev, quant_diarias: 0, valor_total: 0 }));
                return;
            }

            if (date1 > date2) {
                setFormData(prev => ({ ...prev, quant_diarias: 0, valor_total: 0 }));
                return;
            };

            const diffTime = Math.abs(date2.getTime() - date1.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const diarias = diffDays === 0 && date1.getTime() === date2.getTime() ? 1 : (diffDays === 0 ? 1 : diffDays);

            const equipe = equipe_members.split(',').map(s => s.trim()).filter(Boolean);
            const quant_equipe = equipe.length > 0 ? equipe.length : 1;
            const total = diarias * Number(valor_diaria) * quant_equipe;

            setFormData(prev => ({ ...prev, quant_diarias: diarias, quant_equipe: quant_equipe, valor_total: total }));
        } catch (e) {
            console.error("Date calculation error:", e);
            setFormData(prev => ({ ...prev, quant_diarias: 0, valor_total: 0 }));
        }
    }, [formData.check_in, formData.check_out, formData.valor_diaria, formData.equipe_members]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name === 'cnpj') {
            setFormData(prev => ({ ...prev, cnpj: formatCnpjInput(value) }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    }, []);

    const handleCollaboratorSelect = useCallback((selectedNames: string[]) => {
        setFormData(prev => ({ ...prev, equipe_members: selectedNames.join(', ') }));
        setShowCollabModal(false);
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setFormErrors(null);

        const dataToValidate = {
            ...formData,
            valor_diaria: Number(formData.valor_diaria || 0),
            cnpj: formData.cnpj || '',
        };

        const validationResult = requestFormSchema.safeParse(dataToValidate);

        if (!validationResult.success) {
            setFormErrors(validationResult.error.format());
            addNotification("Por favor, corrija os erros no formulário.", 'error');
            setIsSaving(false);
            return;
        }

        const dataForDb = {
            ...formData,
            ...validationResult.data,
            valor_total: Number(formData.valor_total),
            quant_diarias: Number(formData.quant_diarias),
            quant_equipe: Number(formData.quant_equipe),
            pix: validationResult.data.pix || '',
            cnpj: (validationResult.data.cnpj || '').replace(/\D/g, ''),
            nf: validationResult.data.nf || '',
        };
        // Remove ID for inserts, keep it for updates
        const { id, ...dataToSave } = dataForDb;

        try {
            const isActualEdit = !isPrefill && existingRequestProp?.id;

            let error;
            if (isActualEdit) {
                const { error: updateError } = await supabase.from('solicitacoes').update(dataToSave).eq('id', existingRequestProp.id);
                error = updateError;
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                 if (!user) throw new Error("Usuário não autenticado.");
                const { error: insertError } = await supabase.from('solicitacoes').insert({...dataToSave, user_id: user.id});
                error = insertError;
            }

            if (error) throw error;
            
            addNotification(isActualEdit ? "Solicitação atualizada!" : "Nova solicitação salva!", 'success');
            onFinished();
            setFormData(getInitialRequestState());
            setIsCollapsed(true);
        } catch (error: any) {
            console.error("Error saving request:", error);
            addNotification(`Erro ao salvar solicitação: ${error.message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    }, [formData, isPrefill, existingRequestProp, dispatch, addNotification, onFinished]);

    const handleCancel = useCallback(() => {
        onFinished();
        setFormData(getInitialRequestState());
        setIsCollapsed(true);
        setFormErrors(null);
    }, [onFinished]);

    const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), []);
    const openCollabModal = useCallback(() => setShowCollabModal(true), []);
    const closeCollabModal = useCallback(() => setShowCollabModal(false), []);

    return (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 sticky top-20 z-30 mb-8">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-xl font-bold text-gray-800">{isPrefill || !existingRequestProp?.id ? 'Nova Solicitação' : 'Editar Solicitação'}</h3>
                 <button onClick={toggleCollapse} className="p-2 rounded-full hover:bg-gray-200" aria-expanded={!isCollapsed} aria-controls="request-form-content">
                    {isCollapsed ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
                 </button>
            </div>
            {!isCollapsed && (
            <form onSubmit={handleSubmit} className="space-y-4" id="request-form-content">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    <div>
                        <input className={`w-full px-3 py-2 border rounded-lg ${formErrors?.solicitante ? 'border-red-500' : 'border-gray-300'}`} name="solicitante" value={formData.solicitante} onChange={handleChange} placeholder="Solicitante" aria-label="Solicitante"/>
                        {formErrors?.solicitante?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.solicitante._errors.join(', ')}</p>}
                    </div>
                    <div>
                        <input className={`w-full px-3 py-2 border rounded-lg ${formErrors?.data_solicitacao ? 'border-red-500' : 'border-gray-300'}`} type="date" name="data_solicitacao" value={formData.data_solicitacao} onChange={handleChange} aria-label="Data da Solicitação" />
                        {formErrors?.data_solicitacao?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.data_solicitacao._errors.join(', ')}</p>}
                    </div>
                    <div>
                        <input className={`w-full px-3 py-2 border rounded-lg ${formErrors?.centro_custo ? 'border-red-500' : 'border-gray-300'}`} name="centro_custo" value={formData.centro_custo} onChange={handleChange} placeholder="Centro de Custo" aria-label="Centro de Custo" />
                        {formErrors?.centro_custo?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.centro_custo._errors.join(', ')}</p>}
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 xl:col-span-1 grid grid-cols-1 gap-4">
                       <div>
                            <input className={`w-full px-3 py-2 border rounded-lg ${formErrors?.client_name ? 'border-red-500' : 'border-gray-300'}`} name="client_name" value={formData.client_name} onChange={handleChange} placeholder="Cliente" aria-label="Nome do Cliente" />
                            {formErrors?.client_name?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.client_name._errors.join(', ')}</p>}
                        </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4">
                        <div>
                            <input className={`w-full px-3 py-2 border rounded-lg ${formErrors?.hotel_name ? 'border-red-500' : 'border-gray-300'}`} name="hotel_name" value={formData.hotel_name} onChange={handleChange} placeholder="Hotel (Razão Social)" aria-label="Nome do Hotel (Razão Social)" />
                            {formErrors?.hotel_name?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.hotel_name._errors.join(', ')}</p>}
                        </div>
                    </div>

                    <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 flex items-start">
                        <div className="flex-grow">
                            <input className={`w-full px-3 py-2 border rounded-lg ${formErrors?.equipe_members ? 'border-red-500' : 'border-gray-300'}`} name="equipe_members" value={formData.equipe_members} onChange={handleChange} placeholder="Membros da Equipe (separados por vírgula)" aria-label="Membros da Equipe" />
                            {formErrors?.equipe_members?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.equipe_members._errors.join(', ')}</p>}
                        </div>
                        <button type="button" onClick={openCollabModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg flex items-center justify-center transition-colors ml-2 whitespace-nowrap self-stretch">Selecionar</button>
                    </div>

                    <div className="space-y-1">
                        <label htmlFor="check_in_form" className="text-sm font-medium text-gray-700 mb-1 block">Check-in</label>
                        <input id="check_in_form" className={`w-full px-3 py-2 border rounded-lg ${formErrors?.check_in ? 'border-red-500' : 'border-gray-300'}`} type="date" name="check_in" value={formData.check_in} onChange={handleChange} />
                        {formErrors?.check_in?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.check_in._errors.join(', ')}</p>}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="check_out_form" className="text-sm font-medium text-gray-700 mb-1 block">Check-out</label>
                        <input id="check_out_form" className={`w-full px-3 py-2 border rounded-lg ${formErrors?.check_out ? 'border-red-500' : 'border-gray-300'}`} type="date" name="check_out" value={formData.check_out} onChange={handleChange} />
                        {formErrors?.check_out?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.check_out._errors.join(', ')}</p>}
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="valor_diaria_form" className="text-sm font-medium text-gray-700 mb-1 block">Valor da Diária (R$)</label>
                        <input id="valor_diaria_form" className={`w-full px-3 py-2 border rounded-lg ${formErrors?.valor_diaria ? 'border-red-500' : 'border-gray-300'}`} type="number" step="0.01" name="valor_diaria" value={formData.valor_diaria} onChange={handleChange} />
                        {formErrors?.valor_diaria?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.valor_diaria._errors.join(', ')}</p>}
                    </div>

                    <div className="bg-gray-100 p-3 rounded-md text-center">
                       <label className="text-sm font-medium text-gray-700 mb-1 block">Diárias</label>
                       <p className="font-bold text-lg text-gray-800">{formData.quant_diarias}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-md text-center xl:col-start-1">
                       <label className="text-sm font-medium text-gray-700 mb-1 block">Nº Pessoas</label>
                       <p className="font-bold text-lg text-gray-800">{formData.quant_equipe}</p>
                    </div>
                    <div className="bg-blue-100 p-3 rounded-md text-center">
                       <label className="text-sm font-medium text-gray-700 mb-1 block">Valor Total</label>
                       <p className="font-bold text-lg text-blue-800">R$ {Number(formData.valor_total).toFixed(2)}</p>
                    </div>

                    {/* PIX, CNPJ, NF Fields - Reverted Layout */}
                    <div className="xl:col-span-2"> 
                        <input className={`w-full px-3 py-2 border rounded-lg ${formErrors?.pix ? 'border-red-500' : 'border-gray-300'}`} name="pix" value={formData.pix} onChange={handleChange} placeholder="Chave PIX" aria-label="Chave PIX" />
                        {formErrors?.pix?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.pix._errors.join(', ')}</p>}
                    </div>
                    <div> 
                        <input
                            className={`w-full px-3 py-2 border rounded-lg ${formErrors?.cnpj ? 'border-red-500' : 'border-gray-300'}`}
                            name="cnpj"
                            value={formData.cnpj}
                            onChange={handleChange}
                            placeholder="CNPJ Hotel (XX.XXX.XXX/XXXX-XX)"
                            aria-label="CNPJ do Hotel"
                        />
                        {formErrors?.cnpj?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.cnpj._errors.join(', ')}</p>}
                    </div>
                    <div> 
                        <input className={`w-full px-3 py-2 border rounded-lg ${formErrors?.nf ? 'border-red-500' : 'border-gray-300'}`} name="nf" value={formData.nf} onChange={handleChange} placeholder="Nº NF (opcional)" aria-label="Número NF (opcional)"/>
                        {formErrors?.nf?._errors && <p className="text-red-500 text-xs mt-1">{formErrors.nf._errors.join(', ')}</p>}
                    </div>
                 </div>

                 <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button type="button" onClick={handleCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[180px] min-h-[40px]"
                        disabled={isSaving}
                    >
                        {isSaving ? <Spinner/> : (isPrefill || !existingRequestProp?.id ? "Salvar Solicitação" : "Atualizar Solicitação")}
                    </button>
                 </div>
            </form>
            )}
            {showCollabModal && (
                <Modal title="Selecionar Colaboradores" onClose={closeCollabModal}>
                    <CollaboratorSelectionModalContent
                        onSelect={handleCollaboratorSelect}
                        initialSelection={formData.equipe_members}
                        collaborators={collaborators}
                        formatCollaboratorName={formatCollaboratorName}
                    />
                </Modal>
            )}
        </div>
    );
};

export default RequestForm;