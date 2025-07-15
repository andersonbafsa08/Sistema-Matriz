import React, { useState, useMemo, useCallback } from 'react';
import { Request, AddNotificationType, ITEMS_PER_PAGE } from '../../types';
import ActiveRequestTableRow from './ActiveRequestTableRow';
import { Tooltip, Edit, Trash2, Paperclip, Upload, ChevronUp, ChevronDown, Briefcase, ChevronLeft, ChevronRight, formatDate, formatCnpjDisplay } from '../../App';


type SortableRequestKey = keyof Pick<Request, 'solicitante' | 'data_solicitacao' | 'centro_custo' | 'nf' | 'equipe_members' | 'hotel_name' | 'client_name' | 'check_in' | 'check_out' | 'quant_diarias' | 'valor_diaria' | 'valor_total'>;

const tableHeaders: { label: string; key?: SortableRequestKey; sortable?: boolean, isNumeric?: boolean, isDate?: boolean, isCentered?: boolean, isUppercase?: boolean, isCheckbox?: boolean }[] = [
    { label: "Selecionar Todos", isCheckbox: true }, // "Ações" column, now with "Select All"
    { label: "Solicitante", key: 'solicitante', sortable: true, isUppercase: true },
    { label: "Data", key: 'data_solicitacao', sortable: true, isDate: true },
    { label: "Centro de Custo", key: 'centro_custo', sortable: true, isUppercase: true },
    { label: "NF", key: 'nf', sortable: true, isUppercase: true },
    { label: "Equipe", key: 'equipe_members', sortable: true },
    { label: "QUANT. EQUIPE", isCentered: true },
    { label: "Razão Social (Hotel)", key: 'hotel_name', sortable: true, isUppercase: true },
    { label: "Cliente", key: 'client_name', sortable: true, isUppercase: true },
    { label: "Check-in", key: 'check_in', sortable: true, isDate: true },
    { label: "Check-out", key: 'check_out', sortable: true, isDate: true },
    { label: "Quant. Diárias", key: 'quant_diarias', sortable: true, isNumeric: true, isCentered: true },
    { label: "Valor Diária", key: 'valor_diaria', sortable: true, isNumeric: true },
    { label: "Valor Total", key: 'valor_total', sortable: true, isNumeric: true },
    { label: "PIX", isUppercase: true },
    { label: "CNPJ" },
    { label: "Anexos" }
];


interface ActiveRequestsTableProps {
    solicitacoes: Request[];
    selectedRequestIds: string[];
    setSelectedRequestIds: React.Dispatch<React.SetStateAction<string[]>>;
    onEdit: (request: Request) => void;
    onDelete: (request: Request) => void;
    addNotification: AddNotificationType; // For copy data
}

const ActiveRequestsTable: React.FC<ActiveRequestsTableProps> = ({
    solicitacoes, selectedRequestIds, setSelectedRequestIds, onEdit, onDelete, addNotification
}) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortableRequestKey | null; direction: 'ascending' | 'descending' }>({ key: 'data_solicitacao', direction: 'descending' });
    const [currentPage, setCurrentPage] = useState(1);

    const sortedSolicitacoes = useMemo(() => {
        let sortableItems = [...solicitacoes];
        if (sortConfig.key) {
            sortableItems.sort((a, b) => {
                const valA = a[sortConfig.key!];
                const valB = b[sortConfig.key!];
                let comparison = 0;

                if (typeof valA === 'number' && typeof valB === 'number') {
                    comparison = valA - valB;
                } else if (typeof valA === 'string' && typeof valB === 'string') {
                    if (sortConfig.key === 'data_solicitacao' || sortConfig.key === 'check_in' || sortConfig.key === 'check_out') {
                        comparison = new Date(valA).getTime() - new Date(valB).getTime();
                    } else {
                        comparison = valA.localeCompare(valB);
                    }
                }
                return sortConfig.direction === 'ascending' ? comparison : -comparison;
            });
        }
        return sortableItems;
    }, [solicitacoes, sortConfig]);

    const paginatedSolicitacoes = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return sortedSolicitacoes.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [sortedSolicitacoes, currentPage]);

    const totalPages = Math.ceil(sortedSolicitacoes.length / ITEMS_PER_PAGE);

    const requestSort = useCallback((key: SortableRequestKey) => {
        setSortConfig(prevSortConfig => {
            let direction: 'ascending' | 'descending' = 'ascending';
            if (prevSortConfig.key === key && prevSortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            return { key, direction };
        });
        setCurrentPage(1);
    }, []);
    
    const getSortIndicator = useCallback((headerKey?: SortableRequestKey) => {
        if (!headerKey || sortConfig.key !== headerKey) return null;
        return sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1 inline" /> : <ChevronDown size={14} className="ml-1 inline" />;
    }, [sortConfig]);

    const toggleSelectRequest = useCallback((id: string) => {
        setSelectedRequestIds(prev =>
            prev.includes(id) ? prev.filter(reqId => reqId !== id) : [...prev, id]
        );
    }, [setSelectedRequestIds]);

    const toggleSelectAllRequests = useCallback(() => {
        if (selectedRequestIds.length === paginatedSolicitacoes.length && paginatedSolicitacoes.length > 0) {
            setSelectedRequestIds([]);
        } else {
            setSelectedRequestIds(paginatedSolicitacoes.map(req => req.id));
        }
    }, [selectedRequestIds, paginatedSolicitacoes, setSelectedRequestIds]);


    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div 
                className="overflow-x-auto overflow-y-auto" 
                style={{ maxHeight: "calc(100vh - 380px)" }} // Adjusted: Added overflow-y-auto and maxHeight
            >
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-20">
                        <tr>
                            {tableHeaders.map((header, index) => (
                                <th
                                    key={header.label}
                                    scope="col"
                                    className={`px-4 py-3 whitespace-nowrap ${index === 0 ? 'sticky left-0 z-20 bg-gray-100' : ''} ${header.isCentered ? "text-center" : ""} ${header.sortable ? "cursor-pointer hover:bg-gray-200" : ""}`}
                                    onClick={header.sortable && header.key ? () => requestSort(header.key!) : undefined}
                                >
                                    {header.isCheckbox ? (
                                        <div className="flex items-center">
                                            <input
                                                type="checkbox"
                                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-2"
                                                aria-label="Selecionar todas as solicitações ativas nesta página"
                                                checked={paginatedSolicitacoes.length > 0 && selectedRequestIds.length === paginatedSolicitacoes.length}
                                                onChange={toggleSelectAllRequests}
                                                disabled={paginatedSolicitacoes.length === 0}
                                            />
                                            Ações
                                        </div>
                                    ) : (
                                        <>
                                        {header.label}
                                        {header.sortable && getSortIndicator(header.key)}
                                        </>
                                    )}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedSolicitacoes.length > 0 ? paginatedSolicitacoes.map(req => (
                            <ActiveRequestTableRow
                                key={req.id}
                                req={req}
                                isSelected={selectedRequestIds.includes(req.id)}
                                onToggleSelect={toggleSelectRequest}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        )) : (
                            <tr>
                                <td colSpan={tableHeaders.length} className="text-center p-6">
                                    <div className="flex flex-col items-center text-gray-500">
                                        <Briefcase size={40} className="text-gray-400 mb-3"/>
                                        <p className="mb-2 text-md">Nenhuma solicitação ativa no momento.</p>
                                        <p className="text-sm">Crie uma nova solicitação utilizando o formulário acima.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && paginatedSolicitacoes.length > 0 && (
                <div className="p-4 border-t flex justify-between items-center bg-gray-50">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 flex items-center"
                        aria-label="Página anterior"
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
                        aria-label="Próxima página"
                    >
                        Próxima <ChevronRight size={16} className="ml-1" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default ActiveRequestsTable;