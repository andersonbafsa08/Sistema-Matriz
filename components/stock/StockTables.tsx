import React, { useMemo, useState, useCallback } from 'react';
import { StockItem, StockHistoryItem } from '../../types';
import { ChevronDown, ChevronUp } from '../../App';

interface ItemHistoryTableProps {
    stockItemId: string;
    history: StockHistoryItem[];
}

const ItemHistoryTable: React.FC<ItemHistoryTableProps> = ({ stockItemId, history }) => {
    const itemHistory = useMemo(() => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        return history
            .filter(transaction => {
                const transactionDate = new Date(transaction.data);
                return transactionDate.getFullYear() === currentYear && transactionDate.getMonth() === currentMonth;
            })
            .flatMap(transaction => 
                transaction.items
                    .filter(item => item.id === stockItemId)
                    .map(item => ({
                        ...item,
                        date: transaction.data,
                        collaborator: transaction.idColaborador === 'SYSTEM_ENTRY' ? 'ENTRADA NO ESTOQUE' : transaction.nomeColaborador,
                        type: transaction.idColaborador === 'SYSTEM_ENTRY' ? 'ENTRADA' : 'SAÍDA'
                    }))
            )
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [stockItemId, history]);

    if (itemHistory.length === 0) {
        return <div className="p-4 text-center text-gray-500 text-sm">Nenhuma movimentação registrada para este item no mês atual.</div>;
    }

    return (
        <div className="p-2 bg-gray-50">
            <table className="w-full text-xs text-left">
                <thead className="text-gray-600 uppercase">
                    <tr>
                        <th className="px-4 py-2">Data</th>
                        <th className="px-4 py-2">Tipo</th>
                        <th className="px-4 py-2">Colaborador/Origem</th>
                        <th className="px-4 py-2 text-right">Quantidade</th>
                    </tr>
                </thead>
                <tbody className="bg-white">
                    {itemHistory.map((item, index) => (
                        <tr key={index} className={item.type === 'ENTRADA' ? 'bg-green-50' : 'bg-red-50'}>
                            <td className="px-4 py-2">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                            <td className="px-4 py-2 font-semibold">{item.type}</td>
                            <td className="px-4 py-2">{item.collaborator}</td>
                            <td className="px-4 py-2 text-right font-bold">{item.quantidade}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};


interface StockTablesProps {
    stock: StockItem[];
    title: string;
    history: StockHistoryItem[];
}

const StockTables: React.FC<StockTablesProps> = ({ stock, title, history }) => {
    const [openItemId, setOpenItemId] = useState<string | null>(null);
    const toggleItem = useCallback((itemId: string) => {
        setOpenItemId(prev => (prev === itemId ? null : itemId));
    }, []);

    if (stock.length === 0) {
        return <div className="p-6 text-center text-gray-500">Nenhum item em estoque para esta categoria.</div>;
    }
    
    return (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <h3 className="text-lg font-bold text-gray-800 p-4 bg-gray-50 border-b">{title}</h3>
             <div className="overflow-auto" style={{maxHeight: 'calc(100vh - 350px)'}}>
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                        <tr>
                            <th className="px-6 py-3">Item</th>
                            <th className="px-6 py-3">Tamanho</th>
                            <th className="px-6 py-3 text-right">Quantidade</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {stock.map(item => (
                            <React.Fragment key={item.id}>
                                <tr className="hover:bg-gray-50">
                                    <td 
                                        onClick={() => toggleItem(item.id)}
                                        className="px-6 py-4 font-medium text-gray-900 cursor-pointer flex items-center"
                                    >
                                        {item.tipo}
                                        {openItemId === item.id ? <ChevronUp size={16} className="ml-2"/> : <ChevronDown size={16} className="ml-2"/>}
                                    </td>
                                    <td className="px-6 py-4">{item.tamanho}</td>
                                    <td className="px-6 py-4 text-right font-bold text-lg">{item.quantidade}</td>
                                </tr>
                                {openItemId === item.id && (
                                    <tr>
                                        <td colSpan={3} className="p-0">
                                            <ItemHistoryTable stockItemId={item.id} history={history} />
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default StockTables;
