

import React, { useState, useEffect, useCallback } from 'react';
import { Vehicle, AddNotificationType } from '../../types';
import { useForm, Spinner } from '../../App';
import { supabase } from '../../src/supabaseClient';

interface VehicleFormProps {
    onFinished: () => void;
    existingVehicle?: Vehicle | null;
    addNotification: AddNotificationType;
}

const vehicleTypes = [
    "CAVALINHO",
    "CARRETA BAÚ",
    "CARRETA TANQUE",
    "BITRUCK (4EIXO)",
    "CAMINHÃO TOCO (6T)",
    "CAMINHONETE",
    "CARRO OPERACIONAL",
    "CARRO DE APOIO"
];

const VehicleForm: React.FC<VehicleFormProps> = ({ onFinished, existingVehicle, addNotification }) => {
    const getInitialState = (): Partial<Vehicle> => ({
        placa: '', filial: '', tipo: '', modelo: '', chassi: '', ano: '', isLocado: false
    });

    const [formData, _, setFormData] = useForm<Partial<Vehicle>>(existingVehicle || getInitialState());
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setFormData(existingVehicle || getInitialState());
    }, [existingVehicle, setFormData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
             const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
        }
    };

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        const { placa, filial, tipo, modelo, chassi, ano, isLocado } = formData;
        
        if (!placa || !filial || !tipo || !modelo) {
            addNotification("Placa, Filial, Tipo e Modelo são obrigatórios.", "error");
            return;
        }
        if (!isLocado && (!chassi || !ano)) {
            addNotification("Chassi e Ano são obrigatórios para veículos não locados.", "error");
            return;
        }

        setIsSaving(true);
        const dataToSave = {
            placa: placa.trim(),
            filial: filial.trim(),
            tipo: tipo.trim(),
            modelo: modelo.trim(),
            chassi: isLocado ? '' : (chassi || '').trim(),
            ano: isLocado ? '' : (ano || '').trim(),
            isLocado: !!isLocado,
        };

        try {
            let error;
            if (existingVehicle) {
                const { error: updateError } = await supabase.from('veiculos').update(dataToSave).eq('id', existingVehicle.id);
                error = updateError;
            } else {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) throw new Error("Usuário não autenticado.");
                const { error: insertError } = await supabase.from('veiculos').insert({...dataToSave, user_id: user.id});
                error = insertError;
            }

            if (error) throw error;
            
            addNotification(existingVehicle ? "Veículo atualizado com sucesso!" : "Veículo adicionado com sucesso!", "success");
            onFinished();

        } catch (error: any) {
            addNotification(`Erro ao salvar veículo: ${error.message}`, "error");
        } finally {
            setIsSaving(false);
        }
    }, [formData, existingVehicle, addNotification, onFinished]);

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center">
                <input type="checkbox" id="isLocado" name="isLocado" checked={!!formData.isLocado} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                <label htmlFor="isLocado" className="ml-2 block text-sm font-medium text-gray-900">Veículo Locado</label>
            </div>
            <input name="placa" value={formData.placa || ''} onChange={handleChange} placeholder="Placa" className="w-full p-2 border rounded" maxLength={7} />
            <input name="filial" value={formData.filial || ''} onChange={handleChange} placeholder="Filial" className="w-full p-2 border rounded" />
            <select name="tipo" value={formData.tipo || ''} onChange={handleChange} className="w-full p-2 border rounded bg-white">
                <option value="">Selecione o Tipo</option>
                {vehicleTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <input name="modelo" value={formData.modelo || ''} onChange={handleChange} placeholder="Modelo" className="w-full p-2 border rounded" />
            {!formData.isLocado && (
                <>
                    <input name="chassi" value={formData.chassi || ''} onChange={handleChange} placeholder="Chassi" className="w-full p-2 border rounded" />
                    <input name="ano" value={formData.ano || ''} onChange={handleChange} placeholder="Ano" type="number" className="w-full p-2 border rounded" />
                </>
            )}
            <div className="flex justify-end pt-4">
                <button type="button" onClick={onFinished} className="mr-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[150px]">
                    {isSaving ? <Spinner /> : 'Salvar Veículo'}
                </button>
            </div>
        </form>
    );
};

export default VehicleForm;
