import React, { memo } from 'react';
import { Collaborator } from '../../types';
import { Tooltip, CopyableField, Edit, Trash2, WhatsAppIcon, formatPhoneDisplay, formatCpfDisplay, formatDate } from '../../App';

interface CollaboratorTableRowProps {
    collaborator: Collaborator;
    onEdit: (collaborator: Collaborator) => void;
    onDelete: (collaborator: Collaborator) => void;
    onOpenWhatsApp: (telefone?: string) => void;
}

const CollaboratorTableRow: React.FC<CollaboratorTableRowProps> = memo(({ collaborator: c, onEdit, onDelete, onOpenWhatsApp }) => {
    const getDisplayFuncao = () => {
        let funcaoText = c.funcao || '';
        if (c.funcao === 'Outros') {
            funcaoText = c.funcao_outros || 'OUTROS'; // Fallback if Outros is selected but specific not provided
        }
        return (funcaoText || '-').toUpperCase();
    };
    const displayFuncao = getDisplayFuncao();

    return (
        <tr className="hover:bg-gray-50 group">
            <td className="px-6 py-4 whitespace-nowrap sticky left-0 z-10 bg-white group-hover:bg-gray-50">
                <div className="flex space-x-2">
                    <Tooltip text="Editar Colaborador" tooltipClassName="!-translate-x-[30%]">
                        <button onClick={() => onEdit(c)} className="p-1 rounded-full hover:bg-gray-200" aria-label={`Editar ${c.nome}`}>
                            <Edit size={16}/>
                        </button>
                    </Tooltip>
                    <Tooltip text="Excluir Colaborador">
                        <button onClick={() => onDelete(c)} className="p-1 rounded-full hover:bg-red-100 text-red-500" aria-label={`Excluir ${c.nome}`}>
                            <Trash2 size={16}/>
                        </button>
                    </Tooltip>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-normal break-words max-w-sm"><CopyableField value={c.nome} /></td>
            <td className="px-6 py-4 whitespace-nowrap"><CopyableField value={formatCpfDisplay(c.cpf)} /></td>
            <td className="px-6 py-4 whitespace-nowrap"><CopyableField value={c.data_nasc ? formatDate(c.data_nasc) : '-'} /></td>
            <td className="px-6 py-4 whitespace-nowrap"><CopyableField value={c.pix} /></td>
            <td className="px-6 py-4 whitespace-nowrap"><CopyableField value={c.banco} /></td>
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center space-x-2">
                    <CopyableField value={formatPhoneDisplay(c.telefone)} />
                    {c.telefone && (
                        <Tooltip text="Abrir no WhatsApp">
                            <button onClick={() => onOpenWhatsApp(c.telefone)} className="p-1 text-green-600 hover:bg-green-100 rounded-full" aria-label={`Abrir WhatsApp para ${c.nome}`}>
                                <WhatsAppIcon size={16}/>
                            </button>
                        </Tooltip>
                    )}
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap"><CopyableField value={displayFuncao} /></td>
        </tr>
    );
});
export default CollaboratorTableRow;