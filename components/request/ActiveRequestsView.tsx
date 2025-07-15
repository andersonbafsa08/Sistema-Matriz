

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../src/store/store';
import { Request, HistoryRequest, AddNotificationType, UNDO_NOTIFICATION_DURATION } from '../../types';
import {
    deleteRequestReducer, clearRequests,
    restoreRequest, removeMultipleRequestsReducer, deleteMultipleRequestsReducer
} from '../../src/store/slices/requestsSlice';
import { addMultipleHistoryItems } from '../../src/store/slices/historySlice';
import { clearPrefilledRequestDataReducer } from '../../src/store/slices/navigationSlice';
import RequestForm from './RequestForm';
import ActiveRequestsTable from './ActiveRequestsTable';
import ActiveRequestsToolbar from './ActiveRequestsToolbar';
import { getInitialRequestState } from '../../constants';
import { Spinner } from '../../App'; 
import { recalculateAttachmentsStatus } from '../../src/utils/requestUtils'; 


interface ActiveRequestsViewProps {
    addNotification: AddNotificationType;
    formatCollaboratorName: (name?: string) => string;
}

const ActiveRequestsView: React.FC<ActiveRequestsViewProps> = ({ addNotification, formatCollaboratorName }) => {
    const dispatch: AppDispatch = useDispatch();
    const solicitacoesData = useSelector((state: RootState) => state.requests.solicitacoes);
    const prefilledDataFromState = useSelector((state: RootState) => state.navigation.prefilledRequest);

    const [isLoading, setIsLoading] = useState(false); 
    const [editingRequest, setEditingRequest] = useState<Partial<Request> | null>(null);
    const [isPrefillMode, setIsPrefillMode] = useState(false);
    const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);

    useEffect(() => {
        if (prefilledDataFromState) {
            setEditingRequest({
                ...getInitialRequestState(),
                ...prefilledDataFromState,
                id: prefilledDataFromState.id || getInitialRequestState().id
            });
            setIsPrefillMode(true);
            dispatch(clearPrefilledRequestDataReducer());
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            setIsPrefillMode(false);
        }
    }, [prefilledDataFromState, dispatch]);

    const handleEdit = useCallback((request: Request) => {
        setEditingRequest({ ...request }); 
        setIsPrefillMode(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDelete = useCallback((requestToDelete: Request) => {
        if (window.confirm("Tem certeza que deseja excluir esta solicitação?")) {
            const reqToRestore = { ...requestToDelete };
            dispatch(deleteRequestReducer(requestToDelete.id));
            addNotification(
                `Solicitação para '${reqToRestore.hotel_name}' excluída.`,
                'info',
                {
                    isUndoable: true,
                    undoCallback: () => {
                        dispatch(restoreRequest(reqToRestore));
                        addNotification(`Solicitação para '${reqToRestore.hotel_name}' restaurada.`, 'success');
                    },
                    duration: UNDO_NOTIFICATION_DURATION
                }
            );
             setSelectedRequestIds(prev => prev.filter(id => id !== requestToDelete.id));
        }
    }, [dispatch, addNotification]);

    const handleMoveAllToHistory = useCallback(() => {
        if (solicitacoesData.length === 0) {
            addNotification("Não há solicitações ativas para mover.", 'error');
            return;
        }
        if (window.confirm(`Tem certeza que deseja mover todas as ${solicitacoesData.length} solicitações ativas para o histórico?`)) {
            const historyItems = solicitacoesData.map(req => {
                const { nf, ...restOfReq } = req;
                const newHistReqObject: HistoryRequest = {
                    ...restOfReq,
                    id: req.id,
                    nf_number: nf,
                    attachments_status: 0, 
                    nf_attachments: req.nf_attachments || [],
                    pix_attachments: req.pix_attachments || [],
                };
                return recalculateAttachmentsStatus(newHistReqObject);
            });
            dispatch(addMultipleHistoryItems(historyItems)); 
            dispatch(clearRequests());
            addNotification(`${solicitacoesData.length} solicitações movidas para o histórico.`, 'success');
            setSelectedRequestIds([]);
        }
    }, [solicitacoesData, dispatch, addNotification]);

    const handleMoveSelectedToHistory = useCallback(() => {
        if (selectedRequestIds.length === 0) {
            addNotification("Nenhuma solicitação selecionada para mover.", 'error');
            return;
        }
        if (window.confirm(`Tem certeza que deseja mover as ${selectedRequestIds.length} solicitações selecionadas para o histórico?`)) {
            const requestsToMove = solicitacoesData.filter(req => selectedRequestIds.includes(req.id));
            const historyItems = requestsToMove.map(req => {
                 const { nf, ...restOfReq } = req;
                const newHistReqObject: HistoryRequest = {
                    ...restOfReq,
                    id: req.id,
                    nf_number: nf,
                    attachments_status: 0,
                    nf_attachments: req.nf_attachments || [],
                    pix_attachments: req.pix_attachments || [],
                };
                return recalculateAttachmentsStatus(newHistReqObject);
            });
            dispatch(addMultipleHistoryItems(historyItems));
            dispatch(removeMultipleRequestsReducer(selectedRequestIds));
            addNotification(`${selectedRequestIds.length} solicitações movidas para o histórico.`, 'success');
            setSelectedRequestIds([]);
        }
    }, [selectedRequestIds, solicitacoesData, dispatch, addNotification]);

    const handleDeleteSelectedRequests = useCallback(() => {
        if (selectedRequestIds.length === 0) {
            addNotification("Nenhuma solicitação selecionada para excluir.", 'error');
            return;
        }
        if (window.confirm(`Tem certeza que deseja excluir as ${selectedRequestIds.length} solicitações selecionadas? Esta ação não pode ser desfeita.`)) {
            dispatch(deleteMultipleRequestsReducer(selectedRequestIds));
            addNotification(`${selectedRequestIds.length} solicitações excluídas.`, 'success');
            setSelectedRequestIds([]);
        }
    }, [selectedRequestIds, dispatch, addNotification]);


    const handleFormFinished = useCallback(() => {
        setEditingRequest(null);
        setIsPrefillMode(false);
    }, []);
    
    return (
        <div>
            <RequestForm
                key={editingRequest?.id || 'new-request-form'}
                existingRequestProp={editingRequest}
                onFinished={handleFormFinished}
                addNotification={addNotification}
                formatCollaboratorName={formatCollaboratorName}
                initiallyCollapsed={!editingRequest && !prefilledDataFromState}
                isPrefill={isPrefillMode}
            />
            <div className="mt-8">
                <ActiveRequestsToolbar
                    solicitacoesCount={solicitacoesData.length}
                    selectedCount={selectedRequestIds.length}
                    selectedRequestIds={selectedRequestIds} // Pass selected IDs
                    onMoveSelectedToHistory={handleMoveSelectedToHistory}
                    onDeleteSelected={handleDeleteSelectedRequests}
                    addNotification={addNotification}
                />
                {isLoading ? <Spinner /> : (
                    <ActiveRequestsTable
                        solicitacoes={solicitacoesData}
                        selectedRequestIds={selectedRequestIds}
                        setSelectedRequestIds={setSelectedRequestIds}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        addNotification={addNotification}
                    />
                )}
            </div>
        </div>
    );
};

export default ActiveRequestsView;