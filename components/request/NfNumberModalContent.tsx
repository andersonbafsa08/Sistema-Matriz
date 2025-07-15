import React, { useState, useCallback } from 'react';
import { HistoryRequest, AddNotificationType } from '../../types';
import { Spinner } from '../../App';
import { recalculateAttachmentsStatus } from '../../src/utils/requestUtils'; // Updated import

interface NfNumberModalProps {
    request: HistoryRequest;
    onClose: () => void;
    onUpdate: (updatedRequest: HistoryRequest) => void;
    addNotification: AddNotificationType;
}

const NfNumberModalContent: React.FC<NfNumberModalProps> = ({ request, onClose, onUpdate, addNotification }) => {
    const [nfNumber, setNfNumber] = useState(request.nf_number || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleNfNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setNfNumber(e.target.value);
    }, []);

    const handleSaveChanges = useCallback(() => {
        setIsSaving(true);
        const updatedRequestWithNfNumber = { ...request, nf_number: nfNumber };
        const finalUpdatedRequest = recalculateAttachmentsStatus(updatedRequestWithNfNumber);

        onUpdate(finalUpdatedRequest);
        addNotification("Número da NF atualizado.", 'success');
        setIsSaving(false);
        onClose();
    }, [request, nfNumber, onUpdate, addNotification, onClose]);

    return (
        <div>
            <div className="space-y-3 p-3 border rounded-lg">
                <h4 className="font-semibold text-gray-700 text-lg">Nota Fiscal (NF)</h4>
                <div>
                    <label htmlFor="nf_number_modal_input" className="block text-sm font-medium text-gray-700 mb-1">Número da NF</label>
                    <input
                        id="nf_number_modal_input" type="text" value={nfNumber} onChange={handleNfNumberChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Digite o número da NF"
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-2 pt-4 mt-4 border-t">
                <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                <button
                  onClick={handleSaveChanges}
                  disabled={isSaving}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg min-w-[120px] min-h-[40px] flex items-center justify-center"
                >
                    {isSaving ? <Spinner /> : 'Salvar NF'}
                </button>
            </div>
        </div>
    );
};
export default NfNumberModalContent;