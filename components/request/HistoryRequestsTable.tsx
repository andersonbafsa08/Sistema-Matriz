import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HistoryRequest, ITEMS_PER_PAGE } from '../../types';
import HistoryRequestTableRow from './HistoryRequestTableRow';
import { ChevronLeft, ChevronRight, Search, formatDate, formatCnpjDisplay } from '../../App'; 

const historyTableHeadersWithActions = ["Ações", "Status Anexos", "Solicitante", "Data", "Centro de Custo", "NF", "Equipe", "QUANT. EQUIPE", "Razão Social (Hotel)", "Cliente", "Check-in", "Check-out", "Quant. Diárias", "Valor Diária", "Valor Total", "PIX", "CNPJ"];

const historyHeaderToDbFieldMapForFilter: Record<string, keyof HistoryRequest | undefined> = {
    "Solicitante": 'solicitante', "Data": 'data_solicitacao', "Centro de Custo": 'centro_custo',
    "NF": 'nf_number', "Equipe": 'equipe_members', 
    "Razão Social (Hotel)": 'hotel_name', "Cliente": 'client_name',
    "Check-in": 'check_in', "Check-out": 'check_out', 
    "PIX": 'pix', "CNPJ": 'cnpj'
};

interface HistoryRequestsTableProps {
    historicoData: HistoryRequest[];
    filterColumn: string;
    searchTerm: string;
    singleDateFilter: string;
    rangeDateFilter: { start: string; end: string };
    attachmentStatusFilter: number;
    selectedHistoryIds: string[];
    setSelectedHistoryIds: React.Dispatch<React.SetStateAction<string[]>>;
    onManageAttachments: (request: HistoryRequest) => void;
    onOpenNfNumberModal: (request: HistoryRequest) => void;
    onDelete: (request: HistoryRequest) => void;
}

const HistoryRequestsTable: React.FC<HistoryRequestsTableProps> = ({
    historicoData, filterColumn, searchTerm, singleDateFilter, rangeDateFilter, attachmentStatusFilter,
    selectedHistoryIds, setSelectedHistoryIds,
    onManageAttachments, onOpenNfNumberModal, onDelete
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
    const [debouncedSingleDateFilter, setDebouncedSingleDateFilter] = useState(singleDateFilter);
    const [debouncedRangeDateFilter, setDebouncedRangeDateFilter] = useState(rangeDateFilter);


    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setDebouncedSingleDateFilter(singleDateFilter);
            setDebouncedRangeDateFilter(rangeDateFilter);
            setCurrentPage(1); 
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm, singleDateFilter, rangeDateFilter, attachmentStatusFilter]); 

    const filteredRequests = useMemo(() => historicoData.filter(req => {
        let matchesSearchTerm = true;
        let matchesDateFilter = true; // Unified date filter flag
        let matchesAttachmentStatus = true;

        const dbField = historyHeaderToDbFieldMapForFilter[filterColumn];
        const normalizedSearchTerm = debouncedSearchTerm.toLowerCase();

        if (filterColumn === 'Data' && dbField === 'data_solicitacao') { // Range date filter for "Data Solicitação"
            if (debouncedRangeDateFilter.start && debouncedRangeDateFilter.end) {
                const reqDate = new Date(req[dbField]); 
                const startDate = new Date(debouncedRangeDateFilter.start); 
                const endDate = new Date(debouncedRangeDateFilter.end);
                reqDate.setHours(0,0,0,0); startDate.setHours(0,0,0,0); endDate.setHours(0,0,0,0);
                matchesDateFilter = reqDate >= startDate && reqDate <= endDate;
            } else if (debouncedRangeDateFilter.start) {
                const reqDate = new Date(req[dbField]); const startDate = new Date(debouncedRangeDateFilter.start);
                reqDate.setHours(0,0,0,0); startDate.setHours(0,0,0,0);
                matchesDateFilter = reqDate >= startDate;
            } else if (debouncedRangeDateFilter.end) {
                const reqDate = new Date(req[dbField]); const endDate = new Date(debouncedRangeDateFilter.end);
                reqDate.setHours(0,0,0,0); endDate.setHours(0,0,0,0);
                matchesDateFilter = reqDate <= endDate;
            }
        } else if ((filterColumn === 'Check-in' && dbField === 'check_in') || (filterColumn === 'Check-out' && dbField === 'check_out')) { // Single date filter for Check-in/Check-out
            if (debouncedSingleDateFilter) {
                const reqDate = new Date(req[dbField]); const filterDate = new Date(debouncedSingleDateFilter);
                reqDate.setHours(0,0,0,0); filterDate.setHours(0,0,0,0);
                matchesDateFilter = reqDate.getTime() === filterDate.getTime();
            }
        } else if (debouncedSearchTerm) { // Text search for other columns or "Todas as Colunas"
            if (filterColumn === 'Todas as Colunas') {
                matchesSearchTerm = Object.values(historyHeaderToDbFieldMapForFilter).some(fieldKey => {
                     if (!fieldKey) return false;
                     const value = req[fieldKey];
                     if (fieldKey === 'cnpj') {
                        const searchDigits = normalizedSearchTerm.replace(/\D/g, '');
                        return String(value || '').replace(/\D/g, '').includes(searchDigits);
                     }
                     if (typeof value === 'number') return String(value).toLowerCase().includes(normalizedSearchTerm);
                     if (typeof value === 'string' && (fieldKey === 'data_solicitacao' || fieldKey === 'check_in' || fieldKey === 'check_out')) return formatDate(value).toLowerCase().includes(normalizedSearchTerm);
                     return String(value || '').toLowerCase().includes(normalizedSearchTerm);
                });
            } else {
                if (!dbField) { matchesSearchTerm = false; }
                else {
                    const value = req[dbField];
                    if (dbField === 'cnpj') {
                        const searchDigits = normalizedSearchTerm.replace(/\D/g, '');
                        matchesSearchTerm = String(value || '').replace(/\D/g, '').includes(searchDigits);
                    }
                    else if (typeof value === 'number') matchesSearchTerm = String(value).toLowerCase().includes(normalizedSearchTerm);
                    else if (typeof value === 'string' && (dbField === 'data_solicitacao' || dbField === 'check_in' || dbField === 'check_out')) matchesSearchTerm = formatDate(value).toLowerCase().includes(normalizedSearchTerm);
                    else matchesSearchTerm = String(req[dbField] || '').toLowerCase().includes(normalizedSearchTerm);
                }
            }
        }

        if (attachmentStatusFilter !== -1) {
            matchesAttachmentStatus = req.attachments_status === attachmentStatusFilter;
        }

        return matchesSearchTerm && matchesDateFilter && matchesAttachmentStatus;
    }), [historicoData, debouncedSearchTerm, filterColumn, debouncedSingleDateFilter, debouncedRangeDateFilter, attachmentStatusFilter]);

    const paginatedRequests = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRequests.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredRequests, currentPage]);

    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);

    const toggleSelectHistoryItem = useCallback((id: string) => {
        setSelectedHistoryIds(prev =>
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    }, [setSelectedHistoryIds]);

    const toggleSelectAllHistoryItems = useCallback(() => {
        if (selectedHistoryIds.length === paginatedRequests.length && paginatedRequests.length > 0) {
            setSelectedHistoryIds([]);
        } else {
            setSelectedHistoryIds(paginatedRequests.map(req => req.id));
        }
    }, [selectedHistoryIds, paginatedRequests, setSelectedHistoryIds]);

    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-x-auto">
            <div className="overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}> {/* Adjusted maxHeight */}
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-20">
                        <tr>{historyTableHeadersWithActions.map((header, index) => (
                        <th key={header} scope="col" className={`px-4 py-3 whitespace-nowrap ${index === 0 ? 'sticky left-0 z-20 bg-gray-100' : ''} ${header === "Quant. Diárias" || header === "QUANT. EQUIPE" ? "text-center" : ""}`}>
                             {index === 0 ? (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                        aria-label="Selecionar todos os itens do histórico nesta página"
                                        checked={paginatedRequests.length > 0 && selectedHistoryIds.length === paginatedRequests.length}
                                        onChange={toggleSelectAllHistoryItems}
                                        disabled={paginatedRequests.length === 0}
                                    />
                                    {header}
                                </div>
                            ) : (
                                header
                            )}
                        </th>))}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {paginatedRequests.length > 0 ? paginatedRequests.map(req => (
                            <HistoryRequestTableRow
                                key={req.id}
                                req={req}
                                isSelected={selectedHistoryIds.includes(req.id)}
                                onToggleSelect={toggleSelectHistoryItem}
                                onManageAttachments={onManageAttachments}
                                onOpenNfNumberModal={onOpenNfNumberModal}
                                onDelete={onDelete}
                            />
                        )) : (
                        <tr>
                            <td colSpan={historyTableHeadersWithActions.length} className="text-center p-6">
                                <div className="flex flex-col items-center text-gray-500">
                                    <Search size={40} className="text-gray-400 mb-3"/>
                                    <p className="mb-2 text-md">
                                        {debouncedSearchTerm || debouncedSingleDateFilter || debouncedRangeDateFilter.start || debouncedRangeDateFilter.end || attachmentStatusFilter !== -1
                                            ? 'Nenhum item no histórico encontrado para sua busca/filtros.'
                                            : 'Nenhum item no histórico ainda.'}
                                    </p>
                                    <p className="text-sm">Solicitações finalizadas ou movidas manualmente para o histórico aparecerão aqui.</p>
                                </div>
                            </td>
                        </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && paginatedRequests.length > 0 && (
                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
                        aria-label="Página anterior do histórico"
                    >
                       <ChevronLeft size={16} className="mr-1" /> Anterior
                    </button>
                    <span className="text-sm text-gray-600">
                        Página {currentPage} de {totalPages}
                    </span>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
                        aria-label="Próxima página do histórico"
                    >
                        Próxima <ChevronRight size={16} className="ml-1" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default HistoryRequestsTable;