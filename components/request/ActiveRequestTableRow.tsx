import React, { memo } from 'react';
import { Request } from '../../types';
import { Tooltip, Edit, Trash2, Paperclip, formatDate, formatCnpjDisplay } from '../../App';

interface ActiveRequestTableRowProps {
    req: Request;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onEdit: (request: Request) => void;
    onDelete: (request: Request) => void; // This onDelete is for the bulk action, not an individual button here.
}

const ActiveRequestTableRow: React.FC<ActiveRequestTableRowProps> = memo(({ req, isSelected, onToggleSelect, onEdit, onDelete }) => {
    const handleCheckboxChange = () => { 
        onToggleSelect(req.id);
    };
    return (
        <tr className={`border-b group ${isSelected ? 'bg-blue-50 hover:bg-blue-100' : 'bg-white hover:bg-gray-50'}`}>
            <td className={`px-4 py-3 sticky left-0 z-10 ${isSelected ? 'bg-blue-50 group-hover:bg-blue-100' : 'bg-white group-hover:bg-gray-50'}`}>
                 <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        aria-label={`Selecionar solicitação de ${req.solicitante} para ${req.hotel_name}`}
                    />
                    <Tooltip text="Editar"><button onClick={() => onEdit(req)} className="p-1 rounded-full hover:bg-gray-200"><Edit size={16}/></button></Tooltip>
                    {/* Individual Delete Button Removed as per request */}
                </div>
            </td>
            <td className="px-4 py-3 whitespace-nowrap uppercase">{req.solicitante}</td>
            <td className="px-4 py-3 whitespace-nowrap">{formatDate(req.data_solicitacao)}</td>
            <td className="px-4 py-3 whitespace-nowrap uppercase">{req.centro_custo}</td>
            <td className="px-4 py-3 whitespace-nowrap uppercase">{req.nf}</td>
            <td className="px-4 py-3 whitespace-normal break-words max-w-lg">{req.equipe_members}</td>
            <td className="px-4 py-3 text-center">{req.quant_equipe}</td>
            <td className="px-4 py-3 whitespace-normal break-words max-w-sm uppercase">{req.hotel_name}</td>
            <td className="px-4 py-3 whitespace-normal break-words max-w-sm uppercase">{req.client_name}</td>
            <td className="px-4 py-3 whitespace-nowrap">{formatDate(req.check_in)}</td>
            <td className="px-4 py-3 whitespace-nowrap">{formatDate(req.check_out)}</td>
            <td className="px-4 py-3 text-center">{req.quant_diarias}</td>
            <td className="px-4 py-3 whitespace-nowrap">R$ {Number(req.valor_diaria || 0).toFixed(2)}</td>
            <td className="px-4 py-3 whitespace-nowrap">R$ {Number(req.valor_total || 0).toFixed(2)}</td>
            <td className="px-4 py-3 whitespace-nowrap uppercase">{req.pix}</td>
            <td className="px-4 py-3 whitespace-nowrap">{formatCnpjDisplay(req.cnpj)}</td>
            <td className="px-4 py-3 whitespace-nowrap">
                {(req.nf_attachments && req.nf_attachments.length > 0) || (req.pix_attachments && req.pix_attachments.length > 0) ? (
                    <div className="flex items-center space-x-1">
                        {req.nf_attachments && req.nf_attachments.length > 0 &&
                            <Tooltip text={`${req.nf_attachments.length} anexo(s) NF`}>
                                <Paperclip size={14} className="text-blue-500" />
                            </Tooltip>}
                        {req.pix_attachments && req.pix_attachments.length > 0 &&
                            <Tooltip text={`${req.pix_attachments.length} anexo(s) PIX`}>
                                <Paperclip size={14} className="text-green-500" />
                            </Tooltip>}
                    </div>
                ) : '-'}
            </td>
        </tr>
    );
});

export default ActiveRequestTableRow;