import React, { useCallback } from 'react';
import { ATTACHMENT_STATUS_OPTIONS } from '../../types';
import { RotateCcw, FileExport } from '../../App'; // Added FileExport for export button

const historyTableBaseHeadersForFilter = ["Solicitante", "Data", "Centro de Custo", "NF", "Equipe", "Razão Social (Hotel)", "Cliente", "Check-in", "Check-out", "PIX", "CNPJ"];


interface HistoryRequestsFilterBarProps {
    filterColumn: string;
    setFilterColumn: (value: string) => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    singleDateFilter: string;
    setSingleDateFilter: (value: string) => void;
    rangeDateFilter: { start: string; end: string };
    setRangeDateFilter: React.Dispatch<React.SetStateAction<{ start: string; end: string }>>;
    attachmentStatusFilter: number;
    setAttachmentStatusFilter: (value: number) => void;
    selectedCount: number;
    onReturnSelectedToActive: () => void;
    onExportSelected: () => void;
}

const HistoryRequestsFilterBar: React.FC<HistoryRequestsFilterBarProps> = ({
    filterColumn, setFilterColumn, searchTerm, setSearchTerm,
    singleDateFilter, setSingleDateFilter, rangeDateFilter, setRangeDateFilter,
    attachmentStatusFilter, setAttachmentStatusFilter,
    selectedCount, onReturnSelectedToActive, onExportSelected
}) => {

    const handleFilterColumnChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setFilterColumn(e.target.value);
        setSearchTerm(''); // Clear text search term when column changes
        setSingleDateFilter(''); // Clear single date filter
        setRangeDateFilter({start: '', end: ''}); // Clear range date filter
    }, [setFilterColumn, setSearchTerm, setSingleDateFilter, setRangeDateFilter]);

    const handleSearchTermChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    }, [setSearchTerm]);

    const handleSingleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSingleDateFilter(e.target.value);
    }, [setSingleDateFilter]);
    
    const handleRangeDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setRangeDateFilter(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }, [setRangeDateFilter]);

    const handleAttachmentStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setAttachmentStatusFilter(Number(e.target.value));
    }, [setAttachmentStatusFilter]);

    const renderFilterInput = () => {
        if (filterColumn === 'Data') {
            return (
                <div className="grid grid-cols-2 gap-2 col-span-1 md:col-span-2">
                    <div>
                        <label htmlFor="range_date_start_hist" className="sr-only">Data Início</label>
                        <input
                            type="date" id="range_date_start_hist" name="start" value={rangeDateFilter.start} onChange={handleRangeDateChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            aria-label="Data de início do filtro de data da solicitação"
                        />
                    </div>
                    <div>
                        <label htmlFor="range_date_end_hist" className="sr-only">Data Fim</label>
                        <input
                            type="date" id="range_date_end_hist" name="end" value={rangeDateFilter.end} onChange={handleRangeDateChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            aria-label="Data de fim do filtro de data da solicitação"
                        />
                    </div>
                </div>
            );
        } else if (filterColumn === 'Check-in' || filterColumn === 'Check-out') {
            return (
                 <div className="col-span-1 md:col-span-2">
                    <label htmlFor="single_date_filter_hist" className="sr-only">{`Filtrar por ${filterColumn}`}</label>
                    <input
                        type="date" id="single_date_filter_hist" value={singleDateFilter} onChange={handleSingleDateChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-label={`Filtrar por data de ${filterColumn}`}
                    />
                </div>
            );
        } else {
            return (
                <div className="col-span-1 md:col-span-2">
                    <input
                        type="text"
                        placeholder={`Buscar em ${filterColumn.toLowerCase()}...`}
                        value={searchTerm}
                        onChange={handleSearchTermChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        aria-label="Termo de busca para o histórico"
                    />
                </div>
            );
        }
    };

    return (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg shadow space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                <div className="col-span-1">
                    <label htmlFor="filter_column_hist" className="block text-sm font-medium text-gray-700 mb-1">Filtrar por Coluna</label>
                    <select
                        id="filter_column_hist"
                        onChange={handleFilterColumnChange}
                        value={filterColumn}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="Todas as Colunas">Todas as Colunas</option>
                        {historyTableBaseHeadersForFilter.map(header => <option key={header} value={header}>{header}</option>)}
                    </select>
                </div>
                
                {renderFilterInput()} {/* This will span 1 or 2 columns based on its content */}

                <div className="col-span-1">
                    <label htmlFor="attachment_status_filter_hist" className="block text-sm font-medium text-gray-700 mb-1">Status dos Anexos</label>
                    <select
                        id="attachment_status_filter_hist" value={attachmentStatusFilter} onChange={handleAttachmentStatusChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {ATTACHMENT_STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            {selectedCount > 0 && (
                 <div className="flex flex-wrap gap-2 pt-3 border-t">
                    <button
                        onClick={onReturnSelectedToActive}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded-md flex items-center text-xs sm:text-sm"
                        aria-label={`Retornar ${selectedCount} itens selecionados para ativas`}
                    >
                        <RotateCcw size={16} className="mr-1 sm:mr-2"/> Retornar Selecionados ({selectedCount})
                    </button>
                    <button
                        onClick={onExportSelected}
                        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-3 rounded-md flex items-center text-xs sm:text-sm"
                        aria-label={`Exportar ${selectedCount} itens selecionados`}
                    >
                        <FileExport size={16} className="mr-1 sm:mr-2"/> Exportar Selecionados ({selectedCount})
                    </button>
                    {/* Excluir Selecionados button removed */}
                </div>
            )}
        </div>
    );
};

export default HistoryRequestsFilterBar;
