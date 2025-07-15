import React, { memo } from 'react';
import { Diaria } from '../../types';
import { Tooltip, Edit, Trash2, formatDate, Eye } from '../../App';

interface DiariaTableRowProps {
    diaria: Diaria;
    collaboratorName: string;
    onEdit: () => void;
    onDelete: () => void;
}

const DiariaTableRow: React.FC<DiariaTableRowProps> = memo(({ diaria, collaboratorName, onEdit, onDelete }) => {
    return (
        <tr className="hover:bg-gray-50 group">
            <td className="px-4 py-3 whitespace-nowrap sticky left-0 z-10 bg-white group-hover:bg-gray-50 align-top">
                <div className="flex items-center space-x-2">
                    <Tooltip text="Editar">
                        <button onClick={onEdit} className="p-1 rounded-full hover:bg-gray-200" aria-label={`Editar diária de ${collaboratorName}`}>
                            <Edit size={16}/>
                        </button>
                    </Tooltip>
                    <Tooltip text="Excluir">
                        <button onClick={onDelete} className="p-1 rounded-full hover:bg-red-100 text-red-500" aria-label={`Excluir diária de ${collaboratorName}`}>
                            <Trash2 size={16}/>
                        </button>
                    </Tooltip>
                </div>
            </td>
            <td className="px-4 py-3 font-medium text-gray-900 align-top">{collaboratorName}</td>
            <td className="px-4 py-3 align-top">{diaria.destino}</td>
            <td className="px-4 py-3 align-top">{diaria.centro_custo}</td>
            <td className="px-4 py-3 align-top">{formatDate(diaria.data_inicial)} a {formatDate(diaria.data_final)}</td>
            <td className="px-4 py-3 align-top">{diaria.hora_inicial} - {diaria.hora_final}</td>
            <td className="px-4 py-3 align-top whitespace-normal break-words max-w-xs">
                {diaria.observacao || '-'}
            </td>
            <td className="px-4 py-3 text-right font-semibold align-top">R$ {diaria.valor_total_geral.toFixed(2)}</td>
        </tr>
    );
});

export default DiariaTableRow;