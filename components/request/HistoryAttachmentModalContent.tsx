import React, { useState, useEffect, useCallback } from 'react';
import { HistoryRequest, AttachmentFile, AddNotificationType, MAX_FILE_SIZE_BYTES, ALLOWED_FILE_TYPES, ALLOWED_FILE_EXTENSIONS_MSG } from '../../types';
import { Spinner, Tooltip, Upload, Paperclip, Eye, Trash2, CheckCircle, AlertTriangle } from '../../App';
import { recalculateAttachmentsStatus } from '../../src/utils/requestUtils'; // Updated import

interface HistoryAttachmentModalProps {
    request: HistoryRequest;
    onClose: () => void;
    onUpdate: (updatedRequest: HistoryRequest) => void;
    addNotification: AddNotificationType;
}

const HistoryAttachmentModalContent: React.FC<HistoryAttachmentModalProps> = ({ request, onClose, onUpdate, addNotification }) => {
    const [currentRequest, setCurrentRequest] = useState<HistoryRequest>(request);
    const [isUploadingNf, setIsUploadingNf] = useState(false);
    const [isUploadingPix, setIsUploadingPix] = useState(false);

    useEffect(() => { setCurrentRequest(recalculateAttachmentsStatus(request)); }, [request]);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>, type: 'nf' | 'pix') => {
        const files = e.target.files;
        if (!files || files.length === 0) {
            // Ensure loading state is reset if no files are selected or selection is cancelled
            if (type === 'nf') setIsUploadingNf(false); else setIsUploadingPix(false);
            e.target.value = ''; // Reset file input
            return;
        }

        if (type === 'nf') setIsUploadingNf(true); else setIsUploadingPix(true);

        const allFilesArray = Array.from(files);
        let filesProcessedCounter = 0;
        const newLocalAttachments: AttachmentFile[] = [];
        let anyInvalidFiles = false;

        if (allFilesArray.length === 0) { 
            if (type === 'nf') setIsUploadingNf(false); else setIsUploadingPix(false);
            e.target.value = '';
            return;
        }

        allFilesArray.forEach(file => {
            const finishFileProcessing = () => {
                filesProcessedCounter++;
                if (filesProcessedCounter === allFilesArray.length) {
                    if (newLocalAttachments.length > 0) {
                        setCurrentRequest(prevReq => {
                            const updatedAttachmentsList = [...(prevReq[`${type}_attachments`] || []), ...newLocalAttachments];
                            const tempUpdatedReq = { ...prevReq, [`${type}_attachments`]: updatedAttachmentsList };
                            return recalculateAttachmentsStatus(tempUpdatedReq);
                        });
                        if (anyInvalidFiles || newLocalAttachments.length < allFilesArray.length) {
                             addNotification(`${newLocalAttachments.length} anexo(s) ${type.toUpperCase()} adicionado(s). Alguns arquivos foram ignorados.`, 'info');
                        } else {
                            addNotification(`${newLocalAttachments.length} anexo(s) ${type.toUpperCase()} adicionado(s)!`, 'success');
                        }
                    } else if (anyInvalidFiles) {
                         addNotification(`Nenhum anexo válido adicionado. Verifique os erros.`, 'error');
                    } else if (allFilesArray.length > 0 && newLocalAttachments.length === 0 && !anyInvalidFiles){
                        // This case means files were selected, but none were processed (e.g. all empty or some other issue)
                        // but not flagged as invalid by size/type. This is unlikely with current checks but good for robustness.
                         addNotification(`Nenhum anexo processado. Verifique os arquivos.`, 'info');
                    }
                    if (type === 'nf') setIsUploadingNf(false); else setIsUploadingPix(false);
                }
            };

            if (!ALLOWED_FILE_TYPES.includes(file.type)) {
                addNotification(`Tipo de arquivo inválido: ${file.name}. ${ALLOWED_FILE_EXTENSIONS_MSG}`, 'error');
                anyInvalidFiles = true;
                finishFileProcessing();
                return;
            }
            if (file.size > MAX_FILE_SIZE_BYTES) {
                addNotification(`Arquivo ${file.name} é muito grande (Máx 5MB).`, 'error');
                anyInvalidFiles = true;
                finishFileProcessing();
                return;
            }

            const reader = new FileReader();
            reader.onload = () => {
                newLocalAttachments.push({
                    name: file.name,
                    data: reader.result as string,
                    type: file.type,
                    size: file.size
                });
                finishFileProcessing();
            };
            reader.onerror = (errorEvent) => {
                console.error("File reading error:", errorEvent);
                addNotification(`Erro ao ler o arquivo ${file.name}.`, 'error');
                anyInvalidFiles = true;
                finishFileProcessing();
            };
            reader.readAsDataURL(file);
        });
        e.target.value = ''; // Reset file input
    }, [addNotification]);


    const removeAttachment = useCallback((indexToRemove: number, type: 'nf' | 'pix') => {
        setCurrentRequest(prevReq => {
            const existingAttachments = prevReq[`${type}_attachments`] || [];
            const updatedAttachments = existingAttachments.filter((_, index) => index !== indexToRemove);
            const tempUpdatedReq = { ...prevReq, [`${type}_attachments`]: updatedAttachments };
            return recalculateAttachmentsStatus(tempUpdatedReq);
        });
        addNotification(`Anexo ${type.toUpperCase()} removido.`, 'success');
    }, [addNotification]);

    const handleSaveChanges = useCallback(() => {
        onUpdate(currentRequest);
        addNotification("Alterações nos anexos salvas.", 'success');
        onClose();
    }, [currentRequest, onUpdate, addNotification, onClose]);

    const renderAttachmentList = useCallback((attachments: AttachmentFile[], type: 'nf' | 'pix') => (
        <ul className="space-y-2 max-h-40 overflow-y-auto border p-2 rounded-md bg-gray-50">
            {attachments.map((att, index) => (
                <li key={index} className="flex justify-between items-center bg-white p-2 rounded-md shadow-sm">
                   <span className="text-gray-700 flex items-center text-sm mr-2 break-all min-w-0"><Paperclip size={14} className="mr-2 flex-shrink-0"/><span className="truncate">{att.name}</span></span>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-auto">
                        <Tooltip text="Visualizar/Baixar"><a href={att.data} target="_blank" rel="noopener noreferrer" download={att.name} className="p-1 rounded-full hover:bg-blue-100 text-blue-500"><Eye size={16}/></a></Tooltip>
                        <Tooltip text="Excluir"><button type="button" onClick={() => removeAttachment(index, type)} className="p-1 rounded-full hover:bg-red-100 text-red-500"><Trash2 size={16}/></button></Tooltip>
                     </div>
                </li>
            ))}
            {attachments.length === 0 && <p className="text-center text-xs text-gray-500 py-2">Nenhum anexo {type.toUpperCase()}.</p>}
        </ul>
    ), [removeAttachment]);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-grow overflow-y-auto min-h-0 space-y-6 pr-2">
                <div className="space-y-3 p-3 border rounded-lg">
                    <h4 className="font-semibold text-gray-700 text-lg">Nota Fiscal (NF)</h4>
                    <div><label className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full text-center cursor-pointer flex items-center justify-center ${isUploadingNf ? 'opacity-50 cursor-not-allowed' : ''}`}>{isUploadingNf ? <Spinner/> : <Upload size={16} className="mr-2"/>} Adicionar Anexo(s) NF<input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, 'nf')} disabled={isUploadingNf} accept={ALLOWED_FILE_TYPES.join(",")} aria-label="Adicionar anexos NF"/></label></div>
                    <p className="text-xs text-gray-500 text-center">{ALLOWED_FILE_EXTENSIONS_MSG}</p>
                    {renderAttachmentList(currentRequest.nf_attachments || [], 'nf')}
                </div>
                <div className="space-y-3 p-3 border rounded-lg">
                    <h4 className="font-semibold text-gray-700 text-lg">Comprovante PIX</h4>
                     <div><label className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full text-center cursor-pointer flex items-center justify-center ${isUploadingPix ? 'opacity-50 cursor-not-allowed' : ''}`}>{isUploadingPix ? <Spinner/> : <Upload size={16} className="mr-2"/>} Adicionar Anexo(s) PIX<input type="file" multiple className="hidden" onChange={(e) => handleFileChange(e, 'pix')} disabled={isUploadingPix} accept={ALLOWED_FILE_TYPES.join(",")} aria-label="Adicionar anexos PIX"/></label></div>
                     <p className="text-xs text-gray-500 text-center">{ALLOWED_FILE_EXTENSIONS_MSG}</p>
                    {renderAttachmentList(currentRequest.pix_attachments || [], 'pix')}
                </div>
            </div>
             <div className="flex-shrink-0 flex justify-between items-center pt-4 mt-4 border-t">
                <div>Status: {currentRequest.attachments_status === 1 ? <span className="flex items-center text-green-600 font-semibold"><CheckCircle size={18} className="mr-1"/> Completo</span> : <span className="flex items-center text-red-600 font-semibold"><AlertTriangle size={18} className="mr-1"/> Pendente</span>}</div>
                <div className="flex space-x-2">
                    <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button type="button" onClick={handleSaveChanges} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Salvar Alterações</button>
                </div>
            </div>
        </div>
    );
};
export default HistoryAttachmentModalContent;