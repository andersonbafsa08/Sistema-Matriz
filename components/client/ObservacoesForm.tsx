
import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../src/store/store';
import { Client, ClientObservacoes, AddNotificationType } from '../../types';
import { updateClient as updateClientAction } from '../../src/store/slices/clientsSlice';
import { useForm, Spinner } from '../../App';

interface ObservacoesFormProps {
    client: Client;
    onFinished: () => void;
    addNotification: AddNotificationType;
}

const ObservacoesForm: React.FC<ObservacoesFormProps> = ({ client, onFinished, addNotification }) => {
    const dispatch: AppDispatch = useDispatch();

    const getInitialFormState = useCallback(() => {
        const obs = client.observacoes;
        return {
            sismografia: (obs?.sismografia || '').toUpperCase(),
            granulometria: (obs?.granulometria || '').toUpperCase(),
            carro_tracado: (obs?.carro_tracado || '').toUpperCase(),
            carro_passeio: (obs?.carro_passeio || '').toUpperCase(),
            observacao: (obs?.observacao || '').toUpperCase(),
        };
    }, [client.observacoes]);

    const [formData, _, setFormDataState] = useForm<ClientObservacoes>(getInitialFormState());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormDataState(getInitialFormState());
    }, [client.id, getInitialFormState, setFormDataState]); // Re-initialize if client.id changes

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormDataState(prev => ({
            ...prev,
            [name]: value.toUpperCase() // Convert to uppercase as user types
        }));
    }, [setFormDataState]);


    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // formData already contains uppercase values due to handleChange
            const updatedClient = { ...client, observacoes: formData };
            dispatch(updateClientAction(updatedClient));
            addNotification("Observações salvas com sucesso!", 'success');
            onFinished();
        } catch (error) {
            console.error("Error saving observations: ", error);
            addNotification("Erro ao salvar observações.", 'error');
        } finally {
            setIsSaving(false);
        }
    }, [client, formData, dispatch, addNotification, onFinished]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <textarea name="sismografia" value={formData.sismografia} onChange={handleChange} placeholder="Sismografia" className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[60px]" />
            <textarea name="granulometria" value={formData.granulometria} onChange={handleChange} placeholder="Granulometria" className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[60px]" />
            <textarea name="carro_tracado" value={formData.carro_tracado} onChange={handleChange} placeholder="Carro Traçado" className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[60px]" />
            <textarea name="carro_passeio" value={formData.carro_passeio} onChange={handleChange} placeholder="Carro Passeio" className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[60px]" />
            <textarea name="observacao" value={formData.observacao} onChange={handleChange} placeholder="Observação Geral" className="w-full px-3 py-2 border border-gray-300 rounded-lg min-h-[100px]" />
            <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={onFinished} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[180px] min-h-[40px]"
                >
                    {isSaving ? <Spinner/> : 'Salvar Observações'}
                </button>
            </div>
        </form>
    );
};
export default ObservacoesForm;
