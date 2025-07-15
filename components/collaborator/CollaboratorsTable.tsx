import React, { useState, useMemo, useCallback } from 'react';
import { Collaborator } from '../../types';
import CollaboratorTableRow from './CollaboratorTableRow';
import { ChevronUp, ChevronDown } from '../../App';

type SortableCollaboratorKey = keyof Pick<Collaborator, 'nome' | 'cpf' | 'data_nasc' | 'banco' | 'funcao' | 'funcao_outros'>;

const tableHeaders: { label: string; key?: SortableCollaboratorKey; sortable?: boolean, isUppercase?:boolean }[] = [
    { label: "Ações" },
    { label: "Nome", key: 'nome', sortable: true, isUppercase: true },
    { label: "CPF", key: 'cpf', sortable: true, isUppercase: true },
    { label: "Data Nasc.", key: 'data_nasc', sortable: true, isUppercase: true },
    { label: "PIX", isUppercase: true },
    { label: "Banco", key: 'banco', sortable: true, isUppercase: true },
    { label: "Telefone", isUppercase: true },
    { label: "Função", key: 'funcao', sortable: true, isUppercase: true }
];

interface CollaboratorsTableProps {
    collaborators: Collaborator[];
    selectedFiliais: string[];
    onEdit: (collaborator: Collaborator) => void;
    onDelete: (collaborator: Collaborator) => void;
    onOpenWhatsApp: (telefone?: string) => void;
}

const CollaboratorsTable: React.FC<CollaboratorsTableProps> = ({
    collaborators, selectedFiliais, onEdit, onDelete, onOpenWhatsApp
}) => {
    const [sortConfig, setSortConfig] = useState<{ key: SortableCollaboratorKey | null; direction: 'ascending' | 'descending' }>({ key: 'nome', direction: 'ascending' });

    const groupedAndSortedCollaborators = useMemo(() => {
        let filteredItems = [...collaborators];

        if (selectedFiliais.length > 0) {
            filteredItems = filteredItems.filter(c => selectedFiliais.includes(c.filial || 'Sem Filial'));
        }
        
        const grouped = filteredItems.reduce((acc, c) => {
            const filial = c.filial || 'Sem Filial';
            (acc[filial] = acc[filial] || []).push(c);
            return acc;
        }, {} as Record<string, Collaborator[]>);

        // Sort collaborators within each group
        for (const filial in grouped) {
            grouped[filial].sort((a, b) => {
                if (sortConfig.key) {
                    let valA = a[sortConfig.key!];
                    let valB = b[sortConfig.key!];

                    if (sortConfig.key === 'funcao') {
                        valA = a.funcao === 'Outros' ? a.funcao_outros || 'OUTROS' : a.funcao;
                        valB = b.funcao === 'Outros' ? b.funcao_outros || 'OUTROS' : b.funcao;
                    }

                    let comparison = 0;
                    if (typeof valA === 'string' && typeof valB === 'string') {
                        if (sortConfig.key === 'data_nasc') {
                            comparison = new Date(valA).getTime() - new Date(valB).getTime();
                        } else {
                            comparison = valA.localeCompare(valB);
                        }
                    } else if (typeof valA === 'number' && typeof valB === 'number') {
                        comparison = valA - valB;
                    } else if (valA === undefined || valA === null) comparison = -1;
                      else if (valB === undefined || valB === null) comparison = 1;

                    return sortConfig.direction === 'ascending' ? comparison : -comparison;
                }
                return 0; // Should not happen if sortConfig.key is always set
            });
        }
        
        // Sort the groups by filial name
        return Object.entries(grouped).sort(([filialA], [filialB]) => filialA.localeCompare(filialB));

    }, [collaborators, sortConfig, selectedFiliais]);


    const requestSort = useCallback((key: SortableCollaboratorKey) => {
        setSortConfig(prevSortConfig => {
            let direction: 'ascending' | 'descending' = 'ascending';
            if (prevSortConfig.key === key && prevSortConfig.direction === 'ascending') {
                direction = 'descending';
            }
            return { key, direction };
        });
    }, []);

    const getSortIndicator = useCallback((headerKey?: SortableCollaboratorKey) => {
        if (!headerKey || sortConfig.key !== headerKey) return null;
        return sortConfig.direction === 'ascending' ? <ChevronUp size={14} className="ml-1 inline" /> : <ChevronDown size={14} className="ml-1 inline" />;
    }, [sortConfig]);
    

    return (
        <div className="space-y-8">
            {groupedAndSortedCollaborators.map(([filial, collaboratorsInFilial]) => (
                 <div key={filial} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                    <h3 className="text-lg font-bold text-gray-800 p-4 bg-gray-50 border-b">{filial} ({collaboratorsInFilial.length})</h3>
                     <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-xs text-gray-700">
                                <tr>{tableHeaders.map((header, index) => (
                                <th
                                    key={header.label}
                                    scope="col"
                                    className={`px-6 py-3 tracking-wider whitespace-nowrap uppercase ${index === 0 ? 'sticky left-0 z-10 bg-gray-100' : ''} ${header.sortable ? "cursor-pointer hover:bg-gray-200" : ""}`}
                                    onClick={header.sortable && header.key ? () => requestSort(header.key!) : undefined}
                                >
                                    {header.label}
                                    {header.sortable && getSortIndicator(header.key)}
                                </th>
                                ))}</tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {collaboratorsInFilial.map((c) => (
                                    <CollaboratorTableRow
                                        key={c.id}
                                        collaborator={c}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                        onOpenWhatsApp={onOpenWhatsApp}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
             {groupedAndSortedCollaborators.length === 0 && (
                 <div className="text-center py-10 bg-white rounded-lg shadow-md border">
                    <p className="text-gray-500">Nenhum colaborador encontrado para os filtros selecionados.</p>
                </div>
            )}
        </div>
    );
};

export default CollaboratorsTable;