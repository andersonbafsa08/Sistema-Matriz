import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { HistoryRequest, AddNotificationType, UNDO_NOTIFICATION_DURATION, Request as AppRequestType, AttachmentFile } from '../../types';
import {
    addRequest as addRequestAction
} from '../../src/store/slices/requestsSlice';
import {
    updateHistoryItem, deleteHistoryItemReducer, restoreHistoryItem, deleteMultipleHistoryItemsReducer
} from '../../src/store/slices/historySlice';

import { Spinner, Modal } from '../../App';
import HistoryRequestsFilterBar from './HistoryRequestsFilterBar';
import HistoryRequestsTable from './HistoryRequestsTable';
import HistoryAttachmentModalContent from './HistoryAttachmentModalContent';
import NfNumberModalContent from './NfNumberModalContent';
import { recalculateAttachmentsStatus } from '../../src/utils/requestUtils'; 
import { formatDate } from '../../App'; // For export

interface HistoryRequestsViewProps {
    addNotification: AddNotificationType;
}

const HistoryRequestsView: React.FC<HistoryRequestsViewProps> = ({ addNotification }) => {
    const dispatch: AppDispatch = useDispatch();
    const historicoData = useSelector((state: RootState) => state.history.historico);

    const [isLoading, setIsLoading] = useState(false); 
    const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
    const [selectedRequestForAttachments, setSelectedRequestForAttachments] = useState<HistoryRequest | null>(null);
    const [showNfNumberModal, setShowNfNumberModal] = useState(false);
    const [selectedRequestForNfNumber, setSelectedRequestForNfNumber] = useState<HistoryRequest | null>(null);
    
    const [filterColumn, setFilterColumn] = useState('Todas as Colunas');
    const [searchTerm, setSearchTerm] = useState('');
    const [singleDateFilter, setSingleDateFilter] = useState<string>(''); // For Check-in/Check-out
    const [rangeDateFilter, setRangeDateFilter] = useState<{ start: string; end: string }>({ start: '', end: '' }); // For "Data Solicitação"
    const [attachmentStatusFilter, setAttachmentStatusFilter] = useState<number>(-1);
    const [selectedHistoryIds, setSelectedHistoryIds] = useState<string[]>([]);


    const handleManageAttachments = useCallback((request: HistoryRequest) => { setSelectedRequestForAttachments(request); setShowAttachmentsModal(true); }, []);
    const handleCloseAttachmentsModal = useCallback(() => setShowAttachmentsModal(false), []);
    const handleAttachmentsUpdate = useCallback((updatedRequest: HistoryRequest) => {
        const finalUpdatedRequest = recalculateAttachmentsStatus(updatedRequest);
        dispatch(updateHistoryItem(finalUpdatedRequest));
    }, [dispatch]);

    const handleOpenNfNumberModal = useCallback((request: HistoryRequest) => { setSelectedRequestForNfNumber(request); setShowNfNumberModal(true); }, []);
    const handleCloseNfNumberModal = useCallback(() => setShowNfNumberModal(false), []);
    const handleNfNumberUpdate = useCallback((updatedRequest: HistoryRequest) => {
        const finalUpdatedRequest = recalculateAttachmentsStatus(updatedRequest);
        dispatch(updateHistoryItem(finalUpdatedRequest));
    }, [dispatch]);

    const handleReturnSelectedToActive = useCallback(() => {
        if (selectedHistoryIds.length === 0) {
            addNotification("Nenhum item selecionado para retornar.", 'error');
            return;
        }
        if (window.confirm(`Tem certeza que deseja retornar os ${selectedHistoryIds.length} itens selecionados para a lista de ativas?`)) {
            const requestsToReturn = historicoData.filter(req => selectedHistoryIds.includes(req.id));
            requestsToReturn.forEach(requestToReturn => {
                 const { nf_number, attachments_status, nf_attachments, pix_attachments, ...restOfHistoryReq } = requestToReturn;
                const activeRequest: AppRequestType = {
                    ...restOfHistoryReq,
                    id: requestToReturn.id, // Ensure ID is preserved
                    nf: nf_number || '',
                    nf_attachments: nf_attachments || [],
                    pix_attachments: pix_attachments || []
                };
                dispatch(addRequestAction(activeRequest));
            });
            dispatch(deleteMultipleHistoryItemsReducer(selectedHistoryIds));
            addNotification(`${selectedHistoryIds.length} itens retornados para a lista de ativas.`, 'success');
            setSelectedHistoryIds([]);
        }
    }, [selectedHistoryIds, historicoData, dispatch, addNotification]);
    

    const handleDeleteFromHistory = useCallback((requestToDelete: HistoryRequest) => {
        if (window.confirm("Tem certeza que deseja excluir este item do histórico?")) {
            const itemToRestore = { ...requestToDelete };
            dispatch(deleteHistoryItemReducer(requestToDelete.id));
            addNotification(
                `Item '${itemToRestore.hotel_name}' excluído do histórico.`,
                'info',
                {
                    isUndoable: true,
                    undoCallback: () => {
                        dispatch(restoreHistoryItem(itemToRestore));
                        addNotification(`Item '${itemToRestore.hotel_name}' restaurado no histórico.`, 'success');
                    },
                    duration: UNDO_NOTIFICATION_DURATION
                }
            );
            setSelectedHistoryIds(prev => prev.filter(id => id !== requestToDelete.id));
        }
    }, [dispatch, addNotification]);
    
    const handleExportSelectedHistory = useCallback(() => {
        if (selectedHistoryIds.length === 0) {
            addNotification("Nenhum item selecionado para exportar.", "error");
            return;
        }
        const dataToExport = historicoData.filter(item => selectedHistoryIds.includes(item.id))
            .map(histItem => {
                const { nf_attachments, pix_attachments, ...rest } = histItem;
                return {
                    ...rest,
                    nf_attachments_names: JSON.stringify(nf_attachments.map((att: AttachmentFile) => att.name)),
                    pix_attachments_names: JSON.stringify(pix_attachments.map((att: AttachmentFile) => att.name)),
                };
            });

        if (typeof window.XLSX === 'undefined') {
            addNotification("Biblioteca de exportação (XLSX) não está disponível.", "error");
            return;
        }
        try {
            const { utils, writeFile } = window.XLSX;
            const ws = utils.json_to_sheet(dataToExport);
            const wb = utils.book_new();
            utils.book_append_sheet(wb, ws, "Historico Selecionado");
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            writeFile(wb, `matriz_historico_selecionado_${dateStr}.xlsx`);
            addNotification(`${dataToExport.length} itens do histórico exportados!`, "success");
        } catch (error) {
            console.error("Export error:", error);
            addNotification("Erro ao exportar itens do histórico.", "error");
        }
    }, [selectedHistoryIds, historicoData, addNotification]);


    useEffect(() => {
        // Reset specific date filters when filterColumn changes from a date-specific one
        if (filterColumn !== 'Data') {
            setRangeDateFilter({ start: '', end: '' });
        }
        if (filterColumn !== 'Check-in' && filterColumn !== 'Check-out') {
            setSingleDateFilter('');
        }
    }, [filterColumn]);


    return (
        <div className="relative">
            <div className="sticky top-[128px] z-20">
                <HistoryRequestsFilterBar
                    filterColumn={filterColumn}
                    setFilterColumn={setFilterColumn}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    singleDateFilter={singleDateFilter}
                    setSingleDateFilter={setSingleDateFilter}
                    rangeDateFilter={rangeDateFilter}
                    setRangeDateFilter={setRangeDateFilter}
                    attachmentStatusFilter={attachmentStatusFilter}
                    setAttachmentStatusFilter={setAttachmentStatusFilter}
                    selectedCount={selectedHistoryIds.length}
                    onReturnSelectedToActive={handleReturnSelectedToActive}
                    onExportSelected={handleExportSelectedHistory}
                />
            </div>

            <div className="mt-4">
                {isLoading ? <Spinner /> : (
                    <HistoryRequestsTable
                        historicoData={historicoData}
                        filterColumn={filterColumn}
                        searchTerm={searchTerm} 
                        singleDateFilter={singleDateFilter}
                        rangeDateFilter={rangeDateFilter}
                        attachmentStatusFilter={attachmentStatusFilter}
                        selectedHistoryIds={selectedHistoryIds}
                        setSelectedHistoryIds={setSelectedHistoryIds}
                        onManageAttachments={handleManageAttachments}
                        onOpenNfNumberModal={handleOpenNfNumberModal}
                        onDelete={handleDeleteFromHistory}
                    />
                )}
            </div>

            {showAttachmentsModal && selectedRequestForAttachments && (
                <Modal title={`Gerenciar Anexos: ${selectedRequestForAttachments.hotel_name.toUpperCase()}`} onClose={handleCloseAttachmentsModal}>
                    <HistoryAttachmentModalContent
                        request={selectedRequestForAttachments}
                        onClose={handleCloseAttachmentsModal}
                        onUpdate={handleAttachmentsUpdate}
                        addNotification={addNotification}
                    />
                </Modal>
            )}
            {showNfNumberModal && selectedRequestForNfNumber && (
                <Modal title={`NF - ${selectedRequestForNfNumber.hotel_name.toUpperCase()}`} onClose={handleCloseNfNumberModal}>
                    <NfNumberModalContent
                        request={selectedRequestForNfNumber}
                        onClose={handleCloseNfNumberModal}
                        onUpdate={handleNfNumberUpdate}
                        addNotification={addNotification}
                    />
                </Modal>
            )}
        </div>
    );
};

export default HistoryRequestsView;