import React, { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../../src/store/store';
import { PdfSettings, AddNotificationType } from '../../types';
import { updateStockPdfSettings } from '../../src/store/slices/stockSettingsSlice';
import { Spinner, Upload } from '../../App';

interface PdfSettingsFormProps {
    currentSettings: PdfSettings;
    addNotification: AddNotificationType;
    onFinished: () => void;
}

const PdfSettingsForm: React.FC<PdfSettingsFormProps> = ({ currentSettings, addNotification, onFinished }) => {
    const dispatch: AppDispatch = useDispatch();
    const [settings, setSettings] = useState(currentSettings);
    const [logoPreview, setLogoPreview] = useState<string | null>(currentSettings.logoURL);
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSettings({ ...settings, [e.target.name]: e.target.value.toUpperCase() });
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setSettings({ ...settings, logoURL: base64String });
                setLogoPreview(base64String);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        dispatch(updateStockPdfSettings(settings));
        addNotification("Configurações do PDF salvas!", "success");
        setIsSaving(false);
        onFinished();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="pdf-branch" className="block text-sm font-medium text-gray-700">Filial</label>
                <input type="text" id="pdf-branch" name="branchName" value={settings.branchName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase" />
            </div>
            <div>
                <label htmlFor="pdf-manager" className="block text-sm font-medium text-gray-700">Gestor</label>
                <input type="text" id="pdf-manager" name="managerName" value={settings.managerName} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500 uppercase" />
            </div>
            <div>
                <label htmlFor="pdf-logo" className="block text-sm font-medium text-gray-700">Logo da Empresa</label>
                <input type="file" id="pdf-logo" onChange={handleLogoChange} accept="image/png, image/jpeg" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                {logoPreview && <img src={logoPreview} className="mt-4 h-16" alt="Pré-visualização da Logo" />}
            </div>
            <div className="flex justify-end space-x-4 mt-6">
                <button type="button" onClick={onFinished} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSaving} className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[120px]">
                    {isSaving ? <Spinner /> : 'Salvar'}
                </button>
            </div>
        </form>
    );
};

export default PdfSettingsForm;
