
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { Diaria, AddNotificationType, Collaborator } from '../../types';
import { useForm, Spinner } from '../../App';
import { addDiaria, updateDiaria } from '../../src/store/slices/diariasSlice';
import { supabase } from '../../src/supabaseClient';

interface DiariaFormProps {
    onFinished: () => void;
    addNotification: AddNotificationType;
    existingDiaria?: Diaria | null;
}

const DiariaForm: React.FC<DiariaFormProps> = ({ onFinished, addNotification, existingDiaria }) => {
    const dispatch: AppDispatch = useDispatch();
    const collaborators = useSelector((state: RootState) => state.collaborators.collaborators);

    const eligibleCollaborators = useMemo(() => {
        return collaborators
            .filter(c => c.valor_diaria_custom != null && c.valor_diaria_custom > 0)
            .sort((a,b) => a.nome.localeCompare(b.nome));
    }, [collaborators]);

    const getInitialState = (): Partial<Diaria> => ({
        solicitante: '', idColaborador: '', data_inicial: '', data_final: '', hora_inicial: '08:00', hora_final: '18:00',
        destino: '', observacao: '', centro_custo: '', total_cafes: 0, total_almocos: 0, total_jantas: 0, total_pernoites: 0,
        valor_total_refeicoes: 0, valor_total_pernoites: 0, valor_total_geral: 0,
    });
    
    const [formData, handleChange, setFormData] = useForm<Partial<Diaria>>(existingDiaria || getInitialState());
    const [isSaving, setIsSaving] = useState(false);

    const selectedCollaborator = useMemo(() => {
        return collaborators.find(c => c.id === formData.idColaborador);
    }, [formData.idColaborador, collaborators]);

    const effectiveDailyRate = useMemo(() => {
        return selectedCollaborator?.valor_diaria_custom || 0;
    }, [selectedCollaborator]);
    
    const effectivePernoiteRate = useMemo(() => {
        return selectedCollaborator?.valor_pernoite_custom || 0;
    }, [selectedCollaborator]);

    useEffect(() => {
        const { data_inicial, data_final, hora_inicial, hora_final } = formData;

        if (!data_inicial || !data_final || !hora_inicial || !hora_final || !effectiveDailyRate) {
            return;
        }

        const startDateTime = new Date(`${data_inicial}T${hora_inicial}`);
        const endDateTime = new Date(`${data_final}T${hora_final}`);
        
        if (startDateTime >= endDateTime) {
            setFormData(prev => ({...prev, total_cafes:0, total_almocos:0, total_jantas:0, total_pernoites:0, valor_total_refeicoes:0, valor_total_pernoites:0, valor_total_geral: 0}));
            return;
        }
        
        let cafes = 0, almocos = 0, jantas = 0, pernoites = 0;
        let currentDate = new Date(startDateTime);
        const mealValue = effectiveDailyRate / 3;

        while(currentDate < endDateTime) {
            const dayStart = currentDate.getTime() === startDateTime.getTime() ? startDateTime : new Date(currentDate.setHours(0,0,0,0));
            const dayEnd = (new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1) < endDateTime) 
                ? new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59) 
                : endDateTime;

            const startHour = dayStart.getHours();
            const endHour = dayEnd.getHours();
            
            if (startHour < 12 && endHour >= 3) cafes++;
            if (startHour < 18 && endHour >= 12) almocos++;
            if (startHour < 22 && endHour >= 18) jantas++;

            const nextDay = new Date(currentDate);
            nextDay.setDate(nextDay.getDate() + 1);
            if (nextDay < endDateTime) {
                pernoites++;
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
            currentDate.setHours(0,0,0,0);
        }

        const valorRefeicoes = (cafes * mealValue) + (almocos * mealValue) + (jantas * mealValue);
        const valorPernoites = pernoites * effectivePernoiteRate;
        
        setFormData(prev => ({
            ...prev, total_cafes: cafes, total_almocos: almocos, total_jantas: jantas, total_pernoites: pernoites,
            valor_total_refeicoes: valorRefeicoes, valor_total_pernoites: valorPernoites, valor_total_geral: valorRefeicoes + valorPernoites,
        }));

    }, [formData.data_inicial, formData.data_final, formData.hora_inicial, formData.hora_final, setFormData, effectiveDailyRate, effectivePernoiteRate]);

    const handleUpperCaseChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
         const { name, value } = e.target;
         setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        if (!formData.idColaborador || !formData.destino) {
            addNotification("Por favor, preencha Colaborador e Destino.", "error");
            setIsSaving(false);
            return;
        }

        try {
            const dataToSave = {
                id: existingDiaria?.id || undefined, // Let Supabase generate ID for new entries
                ...getInitialState(), // ensures all fields are present
                ...formData,
            } as Diaria;

            let error;
            if (existingDiaria) {
                const { error: updateError } = await supabase.from('diarias').update(dataToSave).eq('id', existingDiaria.id);
                error = updateError;
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado.");
                const { error: insertError } = await supabase.from('diarias').insert({ ...dataToSave, user_id: user.id }).select();
                error = insertError;
            }

            if (error) throw error;
            
            addNotification(existingDiaria ? "Diária atualizada com sucesso!" : "Diária adicionada com sucesso!", "success");
            onFinished();

        } catch(error: any) {
            addNotification(`Erro ao salvar diária: ${error.message}`, "error");
        } finally {
            setIsSaving(false);
        }
    }, [formData, existingDiaria, addNotification, onFinished]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input name="solicitante" value={formData.solicitante || ''} onChange={handleUpperCaseChange} placeholder="Solicitante" className="w-full p-2 border rounded" />
                <select name="idColaborador" value={formData.idColaborador || ''} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                    <option value="">Selecione o Colaborador</option>
                    {eligibleCollaborators.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
                <input name="centro_custo" value={formData.centro_custo || ''} onChange={handleUpperCaseChange} placeholder="Centro de Custo" className="w-full p-2 border rounded" />
                <div className="lg:col-span-3">
                    <input name="destino" value={formData.destino || ''} onChange={handleUpperCaseChange} placeholder="Destino" className="w-full p-2 border rounded" />
                </div>
                <input type="date" name="data_inicial" value={formData.data_inicial || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                <input type="time" name="hora_inicial" value={formData.hora_inicial || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                <div/>
                <input type="date" name="data_final" value={formData.data_final || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                <input type="time" name="hora_final" value={formData.hora_final || ''} onChange={handleChange} className="w-full p-2 border rounded" />
                <div/>
                 <div className="lg:col-span-3">
                    <textarea name="observacao" value={formData.observacao || ''} onChange={handleUpperCaseChange} placeholder="Observação" className="w-full p-2 border rounded min-h-[60px]" />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-gray-50 mt-4">
                <div className="text-center"><p className="text-sm">Cafés ({formData.total_cafes})</p><p className="font-bold">R$ {(formData.total_cafes! * (effectiveDailyRate / 3)).toFixed(2)}</p></div>
                <div className="text-center"><p className="text-sm">Almoços ({formData.total_almocos})</p><p className="font-bold">R$ {(formData.total_almocos! * (effectiveDailyRate / 3)).toFixed(2)}</p></div>
                <div className="text-center"><p className="text-sm">Jantas ({formData.total_jantas})</p><p className="font-bold">R$ {(formData.total_jantas! * (effectiveDailyRate / 3)).toFixed(2)}</p></div>
                <div className="text-center"><p className="text-sm">Pernoites ({formData.total_pernoites})</p><p className="font-bold">R$ {formData.valor_total_pernoites?.toFixed(2) || '0.00'}</p></div>
                <div className="text-center col-span-full bg-blue-100 p-2 rounded"><p className="text-lg font-bold">Total Geral</p><p className="text-2xl font-bold text-blue-600">R$ {formData.valor_total_geral?.toFixed(2) || '0.00'}</p></div>
            </div>

            <div className="flex justify-end pt-4">
                <button type="button" onClick={onFinished} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[150px]">{isSaving ? <Spinner /> : 'Salvar'}</button>
            </div>
        </form>
    );
};

export default DiariaForm;
