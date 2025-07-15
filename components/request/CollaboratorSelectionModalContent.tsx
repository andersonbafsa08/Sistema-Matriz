import React, { useState, useCallback } from 'react';
import { Collaborator } from '../../types';

interface CollaboratorSelectionProps {
    onSelect: (selectedNames: string[]) => void;
    initialSelection: string;
    collaborators: Collaborator[];
    formatCollaboratorName: (name?: string) => string;
}

const CollaboratorSelectionModalContent: React.FC<CollaboratorSelectionProps> = ({ onSelect, initialSelection, collaborators, formatCollaboratorName }) => {
    const [selected, setSelected] = useState<string[]>(() =>
        initialSelection.split(',').map(s => s.trim()).filter(Boolean)
    );

    const toggleSelection = useCallback((fullName: string) => {
        const formattedName = formatCollaboratorName(fullName);
        setSelected(prev =>
            prev.includes(formattedName) ? prev.filter(n => n !== formattedName) : [...prev, formattedName]
        );
    }, [formatCollaboratorName]);

    const handleConfirmSelection = useCallback(() => {
        onSelect(selected);
    }, [onSelect, selected]);

    const renderCollaboratorItem = useCallback((collaborator: Collaborator) => {
        const formattedName = formatCollaboratorName(collaborator.nome);
        return (
            <div
                key={collaborator.id}
                onClick={() => toggleSelection(collaborator.nome)}
                className={`p-2 rounded cursor-pointer flex items-center ${selected.includes(formattedName) ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                role="checkbox"
                aria-checked={selected.includes(formattedName)}
                tabIndex={0}
                onKeyPress={(e) => e.key === 'Enter' && toggleSelection(collaborator.nome)}
            >
                <input
                    type="checkbox"
                    checked={selected.includes(formattedName)}
                    readOnly
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 pointer-events-none"
                    aria-label={`Selecionar ${collaborator.nome}`}
                />
                {collaborator.nome}
            </div>
        );
    }, [selected, toggleSelection, formatCollaboratorName]);

    return (
        <div>
            <div className="border rounded-md mb-4 bg-gray-50">
                {collaborators.length > 0 ? (
                     <div className="max-h-64 overflow-y-auto">
                        {collaborators.map((collaborator) => renderCollaboratorItem(collaborator))}
                    </div>
                ) : (
                    <p className="p-4 text-center text-gray-500">Nenhum colaborador disponível.</p>
                )}
            </div>
            <p className="text-sm text-gray-600 mb-2">Selecionados: {selected.join(', ') || 'Nenhum'}</p>
            <div className="flex justify-end pt-4">
                <button onClick={handleConfirmSelection} className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg">Confirmar Seleção</button>
            </div>
        </div>
    );
};
export default CollaboratorSelectionModalContent;