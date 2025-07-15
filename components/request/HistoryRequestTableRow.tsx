import React, { memo } from 'react';
import { HistoryRequest } from '../../types';
import { Tooltip, RefreshCw, FilePlus, Trash2, CheckCircle, AlertTriangle, formatDate, formatCnpjDisplay } from '../../App';

interface HistoryRequestTableRowProps {
    req: HistoryRequest;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    // onReturnToActive: (request: HistoryRequest) => void; // Removed, handled by bulk action
    onManageAttachments: (request: HistoryRequest) => void;
    onOpenNfNumberModal: (request: HistoryRequest) => void;
    onDelete: (request: HistoryRequest) => void;
}

const HistoryRequestTableRow: React.FC<HistoryRequestTableRowProps> = memo(({ req, isSelected, onToggleSelect, onManageAttachments, onOpenNfNumberModal, onDelete}) => {
    const handleCheckboxChange = () => { 
        onToggleSelect(req.id);
    };
    return (
        <tr className={`border-b group ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'}`}>
            <td className={`px-4 py-3 sticky left-0 z-10 whitespace-nowrap ${isSelected ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-white group-hover:bg-gray-50'}`}>
                <div className="flex items-center space-x-1">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mr-1"
                        aria-label={`Selecionar item do histórico de ${req.solicitante} para ${req.hotel_name}`}
                    />
                    {/* Retornar para Ativas button removed */}
                    <Tooltip text="Gerenciar Anexos"><button type="button" onClick={() => onManageAttachments(req)} className="p-1 text-indigo-500 hover:bg-indigo-100 rounded-full" aria-label="Gerenciar Anexos"><FilePlus size={16}/></button></Tooltip>
                    <Tooltip text="Excluir do Histórico"><button type="button" onClick={() => onDelete(req)} className="p-1 text-red-500 hover:bg-red-100 rounded-full" aria-label="Excluir do histórico"><Trash2 size={16}/></button></Tooltip>
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap">{req.attachments_status === 0 ? <span className="flex items-center text-red-600"><AlertTriangle size={16} className="mr-1"/> Pendente</span> : <span className="flex items-center text-green-600"><CheckCircle size={16} className="mr-1"/> Completo</span>}</td>
            <td className="px-4 py-3 whitespace-nowrap uppercase">{req.solicitante}</td><td className="px-4 py-3 whitespace-nowrap">{formatDate(req.data_solicitacao)}</td><td className="px-4 py-3 whitespace-nowrap uppercase">{req.centro_custo}</td>
            <td className="px-4 py-3 whitespace-nowrap"><Tooltip text={`Gerenciar NF: ${req.nf_number || '-'}`}><button type="button" onClick={() => onOpenNfNumberModal(req)} className="text-blue-500 hover:underline hover:text-blue-700 transition-colors p-0 m-0 bg-transparent border-none uppercase" aria-label={`Gerenciar Número da NF para ${req.hotel_name}, NF ${req.nf_number || '-'}`}>{req.nf_number || '-'}</button></Tooltip></td>
            <td className="px-4 py-3 whitespace-normal break-words max-w-lg">{req.equipe_members}</td>
            <td className="px-4 py-3 text-center">{req.quant_equipe}</td>
            <td className="px-4 py-3 whitespace-normal break-words max-w-sm uppercase">{req.hotel_name}</td><td className="px-4 py-3 whitespace-normal break-words max-w-sm uppercase">{req.client_name}</td>
            <td className="px-4 py-3 whitespace-nowrap">{formatDate(req.check_in)}</td><td className="px-4 py-3 whitespace-nowrap">{formatDate(req.check_out)}</td><td className="px-4 py-3 text-center">{req.quant_diarias}</td>
            <td className="px-4 py-3 whitespace-nowrap">R$ {Number(req.valor_diaria || 0).toFixed(2)}</td><td className="px-4 py-3 whitespace-nowrap">R$ {Number(req.valor_total || 0).toFixed(2)}</td>
            <td className="px-4 py-3 whitespace-nowrap uppercase">{req.pix}</td><td className="px-4 py-3 whitespace-nowrap">{formatCnpjDisplay(req.cnpj)}</td>
        </tr>
    );
});

export default HistoryRequestTableRow;