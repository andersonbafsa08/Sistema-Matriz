
import React, { useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { AddNotificationType } from '../../types';
import { Upload, RotateCcw, Trash2, formatDate, formatCnpjDisplay } from '../../App'; 

const tableHeadersForCopy = ["Solicitante", "Data", "Centro de Custo", "NF", "Equipe", "QUANT. EQUIPE", "Razão Social (Hotel)", "Cliente", "Check-in", "Check-out", "Quant. Diárias", "Valor Diária", "Valor Total", "PIX", "CNPJ"];

interface ActiveRequestsToolbarProps {
    solicitacoesCount: number;
    selectedCount: number;
    selectedRequestIds: string[]; // Added to get access to selected IDs for copying
    onMoveSelectedToHistory: () => void;
    onDeleteSelected: () => void;
    addNotification: AddNotificationType;
}

const CURRENCY_NUMERIC_PART_WIDTH = 14; // Target width for the numeric part of the currency string

const formatCurrencyForCopy = (value: number | undefined): string => {
    const num = Number(value || 0);
    // Format number with BRL style (comma for decimal, dot for thousands)
    const formattedNumber = num.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
    // Pad the numeric part to the CURRENCY_NUMERIC_PART_WIDTH with spaces on the left
    return `R$ ${formattedNumber.padStart(CURRENCY_NUMERIC_PART_WIDTH, ' ')}`;
};

const ActiveRequestsToolbar: React.FC<ActiveRequestsToolbarProps> = ({
    solicitacoesCount, selectedCount, selectedRequestIds, onMoveSelectedToHistory, onDeleteSelected, addNotification
}) => {
    const allSolicitacoesData = useSelector((state: RootState) => state.requests.solicitacoes); 

    const copyDataToClipboard = useCallback(() => {
        const dataToProcess = selectedRequestIds.length > 0
            ? allSolicitacoesData.filter(req => selectedRequestIds.includes(req.id))
            : []; 

        if (dataToProcess.length === 0) {
            addNotification("Não há dados selecionados para copiar.", 'error');
            return;
        }
        
        const rows = dataToProcess.map(req => {
             const valorDiariaFormatted = formatCurrencyForCopy(req.valor_diaria);
             const valorTotalFormatted = formatCurrencyForCopy(req.valor_total);

             const rowData = {
                 "Solicitante": req.solicitante, "Data": formatDate(req.data_solicitacao),
                 "Centro de Custo": req.centro_custo, "NF": req.nf, "Equipe": req.equipe_members,
                 "QUANT. EQUIPE": req.quant_equipe,
                 "Razão Social (Hotel)": req.hotel_name, "Cliente": req.client_name,
                 "Check-in": formatDate(req.check_in), "Check-out": formatDate(req.check_out),
                 "Quant. Diárias": req.quant_diarias, 
                 "Valor Diária": valorDiariaFormatted,
                 "Valor Total": valorTotalFormatted, 
                 "PIX": req.pix ? `PIX: ${req.pix}` : '-', 
                 "CNPJ": formatCnpjDisplay(req.cnpj)
             };
             type RowDataKeys = keyof typeof rowData; 
             return tableHeadersForCopy.map(h => {
                 const value = rowData[h as RowDataKeys];
                 // Apply uppercase to all string values, except for already formatted currency values
                 if (typeof value === 'string') {
                    if (h === "Valor Diária" || h === "Valor Total") {
                        return value; // Already formatted with custom spacing, skip uppercase
                    }
                    // For PIX, ensure no R$ is present and then uppercase. The "PIX: " prefix is already there.
                    if (h === "PIX" && value.startsWith("PIX: R$ ")) {
                         return `PIX: ${value.substring("PIX: R$ ".length).toUpperCase()}`;
                    } else if (h === "PIX" && value.startsWith("PIX: R$")) { // handle case with no space after R$
                         return `PIX: ${value.substring("PIX: R$".length).toUpperCase()}`;
                    }
                    return value.toUpperCase();
                 }
                 return value;
             }).join('\t');
        });
        
        const textToCopy = rows.join('\n');
        navigator.clipboard.writeText(textToCopy).then(() => {
            addNotification("Dados selecionados copiados para a área de transferência!", 'success');
        }).catch(() => { addNotification("Falha ao copiar dados.", "error"); });
    }, [allSolicitacoesData, selectedRequestIds, addNotification]);

    return (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
            <h3 className="text-xl font-bold text-gray-800">Solicitações Ativas ({solicitacoesCount})</h3>
            <div className="flex flex-wrap gap-2">
                {selectedCount > 0 && (
                    <>
                        <button onClick={onMoveSelectedToHistory} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-3 rounded-md flex items-center text-xs sm:text-sm">
                            <RotateCcw size={16} className="mr-1 sm:mr-2"/> Mover Selecionadas ({selectedCount})
                        </button>
                        <button onClick={onDeleteSelected} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-3 rounded-md flex items-center text-xs sm:text-sm">
                            <Trash2 size={16} className="mr-1 sm:mr-2"/> Excluir Selecionadas ({selectedCount})
                        </button>
                        <button onClick={copyDataToClipboard} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-3 rounded-lg flex items-center text-xs sm:text-sm">
                            <Upload size={16} className="mr-1 sm:mr-2"/> Copiar Dados Selecionados ({selectedCount})
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ActiveRequestsToolbar;
