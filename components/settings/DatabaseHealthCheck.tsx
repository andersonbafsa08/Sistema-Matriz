
import React, { useState, useCallback } from 'react';
import { Modal, CopyIcon, XIcon, AlertTriangle } from '../../App';
import { AddNotificationType } from '../../types';


const unindexedKeys = [
    { table: 'colaboradores', fkey: 'colaboradores_user_id_fkey', column: 'user_id' },
    { table: 'historico', fkey: 'historico_user_id_fkey', column: 'user_id' },
    { table: 'hoteis', fkey: 'hoteis_user_id_fkey', column: 'user_id' },
    { table: 'rotas', fkey: 'rotas_user_id_fkey', column: 'user_id' },
    { table: 'solicitacoes', fkey: 'solicitacoes_user_id_fkey', column: 'user_id' },
    { table: 'stock_history', fkey: 'stock_history_user_id_fkey', column: 'user_id' },
    { table: 'stock_items', fkey: 'stock_items_user_id_fkey', column: 'user_id' },
    { table: 'veiculos', fkey: 'veiculos_user_id_fkey', column: 'user_id' }
];

const unusedIndexes = [
    { table: 'clientes', indexName: 'clientes_user_id_idx' },
    { table: 'hoteis', indexName: 'hoteis_client_id_idx' }
];

const generateCreateIndexSql = (item: typeof unindexedKeys[0]) => {
    const indexName = `${item.table}_${item.column}_idx`;
    return `CREATE INDEX CONCURRENTLY "${indexName}" ON "public"."${item.table}" USING btree ("${item.column}");`;
};

const generateDropIndexSql = (item: typeof unusedIndexes[0]) => {
    return `DROP INDEX CONCURRENTLY IF EXISTS "public"."${item.indexName}";`;
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
        <Modal title="Diagnóstico da Base de Dados" onClose={onClose} modalContentClassName="max-w-4xl" zIndex={60}>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <p className="text-sm text-gray-600">
                    Os seguintes problemas de performance foram identificados. Siga as instruções para corrigi-los e melhorar a performance do sistema.
                </p>

                {/* Section for Unused Indexes */}
                <div className="border rounded-lg overflow-hidden bg-gray-50 p-4 mt-6">
                    <h4 className="font-semibold text-gray-800 text-lg mb-2">Índices Não Utilizados</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        Os índices abaixo nunca foram utilizados e podem ser removidos para economizar espaço e melhorar o desempenho de escrita. Gere o comando SQL para remover o índice.
                        <a href="https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium ml-2">Saiba mais.</a>
                    </p>
                    <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                        {unusedIndexes.map((item, index) => (
                            <li key={`unused-${index}`} className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                                <div className="flex items-start">
                                    <AlertTriangle className="text-purple-500 mr-3 mt-1 flex-shrink-0" size={18} />
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">Índice não utilizado</p>
                                        <p className="text-sm text-gray-600">
                                            Tabela: <code className="bg-gray-100 p-1 rounded text-xs">{item.table}</code>, Índice: <code className="bg-gray-100 p-1 rounded text-xs">{item.indexName}</code>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSqlToCopy(generateDropIndexSql(item))}
                                    className="bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg text-sm w-full sm:w-auto flex-shrink-0"
                                >
                                    Gerar Comando
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Section for Unindexed Keys */}
                <div className="border rounded-lg overflow-hidden bg-gray-50 p-4 mt-6">
                     <h4 className="font-semibold text-gray-800 text-lg mb-2">Chaves Estrangeiras Sem Índice</h4>
                     <p className="text-sm text-gray-600 mb-4">
                        A falta de um índice em uma chave estrangeira pode deixar as consultas lentas. Para corrigir, gere o comando SQL e execute-o no Editor SQL do seu painel Supabase. Usar `CONCURRENTLY` evita bloquear a tabela durante a criação do índice.
                     </p>
                    <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                        {unindexedKeys.map((item, index) => (
                            <li key={index} className="p-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white">
                                <div className="flex items-start">
                                    <AlertTriangle className="text-yellow-500 mr-3 mt-1 flex-shrink-0" size={18} />
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">Índice ausente</p>
                                        <p className="text-sm text-gray-600">
                                            Tabela: <code className="bg-gray-100 p-1 rounded text-xs">{item.table}</code>, Coluna: <code className="bg-gray-100 p-1 rounded text-xs">{item.column}</code>
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSqlToCopy(generateCreateIndexSql(item))}
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
