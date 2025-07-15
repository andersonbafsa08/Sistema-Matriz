import React, { useState, useCallback } from 'react';
import { Modal, CopyIcon, XIcon, AlertTriangle } from '../../App';
import { AddNotificationType } from '../../types';

// Hardcoded data from user prompt
const unindexedKeys = [
    { table: 'clientes', fkey: 'clientes_user_id_fkey', column: 'user_id' },
    { table: 'colaboradores', fkey: 'colaboradores_user_id_fkey', column: 'user_id' },
    { table: 'diarias', fkey: 'diarias_user_id_fkey', column: 'user_id' },
    { table: 'historico', fkey: 'historico_user_id_fkey', column: 'user_id' },
    { table: 'hoteis', fkey: 'hoteis_client_id_fkey', column: 'client_id' },
    { table: 'hoteis', fkey: 'hoteis_user_id_fkey', column: 'user_id' },
    { table: 'rotas', fkey: 'rotas_user_id_fkey', column: 'user_id' },
    { table: 'solicitacoes', fkey: 'solicitacoes_user_id_fkey', column: 'user_id' },
    { table: 'stock_history', fkey: 'stock_history_user_id_fkey', column: 'user_id' },
    { table: 'stock_items', fkey: 'stock_items_user_id_fkey', column: 'user_id' },
    { table: 'veiculos', fkey: 'veiculos_user_id_fkey', column: 'user_id' }
];

const generateSqlStatement = (item: typeof unindexedKeys[0]) => {
    const indexName = `${item.table}_${item.column}_idx`;
    return `CREATE INDEX CONCURRENTLY "${indexName}" ON "public"."${item.table}" USING btree ("${item.column}");`;
};


const SqlDisplay: React.FC<{ sql: string; onCopy: (sql: string) => void; onClose: () => void; }> = ({ sql, onCopy, onClose }) => {
    return (
        <div className="mt-4 p-4 border-t border-gray-200">
             <h3 className="font-semibold text-lg mb-2">Correção SQL Gerada</h3>
             <p className="text-sm mb-2">Copie o comando abaixo e cole no <a href="https://supabase.com/dashboard/project/_/sql" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Editor SQL do Supabase</a>.</p>
             <div className="bg-gray-800 text-white p-4 rounded-lg font-mono text-sm overflow-x-auto relative">
                 <code>{sql}</code>
                 <button onClick={() => onCopy(sql)} className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 p-2 rounded-md" title="Copiar SQL">
                     <CopyIcon size={16} />
                 </button>
             </div>
              <div className="flex justify-end pt-4">
                <button onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                    Fechar
                </button>
            </div>
        </div>
    );
};


interface DatabaseHealthCheckProps {
    addNotification: AddNotificationType;
    onClose: () => void;
}

const DatabaseHealthCheck: React.FC<DatabaseHealthCheckProps> = ({ addNotification, onClose }) => {
    const [sqlToCopy, setSqlToCopy] = useState<string | null>(null);

    const copyToClipboard = useCallback((sql: string) => {
        navigator.clipboard.writeText(sql);
        addNotification('SQL copiado para a área de transferência!', 'success');
    }, [addNotification]);
    
    return (
        <Modal title="Diagnóstico da Base de Dados" onClose={onClose} modalContentClassName="max-w-3xl" zIndex={60}>
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Os seguintes problemas de performance foram identificados. Para corrigi-los, gere o comando SQL e execute-o no Editor SQL do seu painel Supabase. Usar `CONCURRENTLY` evita bloquear a tabela durante a criação do índice.
                </p>
                <div className="border rounded-lg overflow-hidden">
                    <ul className="divide-y divide-gray-200 max-h-[50vh] overflow-y-auto">
                        {unindexedKeys.map((item, index) => (
                            <li key={index} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-start">
                                    <AlertTriangle className="text-yellow-500 mr-4 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-gray-800">Chave Estrangeira Sem Índice</h4>
                                        <p className="text-sm text-gray-600">
                                            Tabela: <code className="bg-gray-100 p-1 rounded text-xs">{item.table}</code>, Coluna: <code className="bg-gray-100 p-1 rounded text-xs">{item.column}</code>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSqlToCopy(generateSqlStatement(item))}
                                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm w-full sm:w-auto flex-shrink-0"
                                >
                                    Gerar Correção
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                {sqlToCopy && (
                     <SqlDisplay sql={sqlToCopy} onCopy={copyToClipboard} onClose={() => setSqlToCopy(null)} />
                )}
            </div>
        </Modal>
    );
};

export default DatabaseHealthCheck;