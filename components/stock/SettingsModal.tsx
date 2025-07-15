import React, { useState } from 'react';
import { Modal } from '../../App';

interface ExportModalProps {
    onClose: () => void;
    onExport: (options: {
        format: 'PDF' | 'EXCEL';
        type: 'UNIFORME' | 'EPI';
        style: 'SIMPLES' | 'DETALHADO';
        period: { start: string; end: string };
    }) => void;
    itemClass: 'UNIFORME' | 'EPI';
}

const ExportModal: React.FC<ExportModalProps> = ({ onClose, onExport, itemClass }) => {
    const [format, setFormat] = useState<'PDF' | 'EXCEL'>('PDF');
    const [style, setStyle] = useState<'SIMPLES' | 'DETALHADO'>('SIMPLES');
    const [period, setPeriod] = useState({ start: '', end: '' });

    const handleExportClick = () => {
        onExport({ format, type: itemClass, style, period });
        onClose();
    };

    return (
        <Modal title={`Exportar Estoque de ${itemClass === 'UNIFORME' ? 'Uniformes' : 'EPIs'}`} onClose={onClose}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Formato</label>
                    <select value={format} onChange={e => setFormat(e.target.value as any)} className="w-full mt-1 p-2 border rounded bg-white shadow-sm">
                        <option value="PDF">PDF</option>
                        <option value="EXCEL">Excel</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Relatório</label>
                    <select value={style} onChange={e => setStyle(e.target.value as any)} className="w-full mt-1 p-2 border rounded bg-white shadow-sm">
                        <option value="SIMPLES">Simples (Posição Atual)</option>
                        <option value="DETALHADO">Detalhado (Movimentações)</option>
                    </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Início (Opcional)</label>
                        <input type="date" value={period.start} onChange={e => setPeriod(p => ({ ...p, start: e.target.value }))} className="w-full mt-1 p-2 border rounded shadow-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data Fim (Opcional)</label>
                        <input type="date" value={period.end} onChange={e => setPeriod(p => ({ ...p, end: e.target.value }))} className="w-full mt-1 p-2 border rounded shadow-sm" />
                    </div>
                </div>
                
                 <div className="flex justify-end space-x-2 pt-4 border-t mt-4">
                    <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancelar</button>
                    <button onClick={handleExportClick} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg">Exportar</button>
                </div>
            </div>
        </Modal>
    );
};

export default ExportModal;
