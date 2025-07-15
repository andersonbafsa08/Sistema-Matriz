
import React, { useState, useCallback } from 'react';
import { Modal, CopyIcon, XIcon, AlertTriangle } from '../../App';
import { AddNotificationType } from '../../types';

// Hardcoded data for unindexed keys from a previous prompt
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

// Hardcoded data from the new CSV prompt for RLS issues
const rlsPolicyIssues = [
  { table: 'clientes', policyName: 'Enable read access for own data' },
  { table: 'clientes', policyName: 'Enable insert for authenticated users' },
  { table: 'clientes', policyName: 'Enable update for own data' },
  { table: 'clientes', policyName: 'Enable delete for own data' },
  { table: 'colaboradores', policyName: 'Enable read access for own data' },
  { table: 'colaboradores', policyName: 'Enable insert for authenticated users' },
  { table: 'colaboradores', policyName: 'Enable update for own data' },
  { table: 'colaboradores', policyName: 'Enable delete for own data' },
  { table: 'diaria_settings', policyName: 'Enable read access for own data' },
  { table: 'diaria_settings', policyName: 'Enable insert for authenticated users' },
  { table: 'diaria_settings', policyName: 'Enable update for own data' },
  { table: 'diaria_settings', policyName: 'Enable delete for own data' },
  { table: 'diarias', policyName: 'Enable read access for own data' },
  { table: 'diarias', policyName: 'Enable insert for authenticated users' },
  { table: 'diarias', policyName: 'Enable update for own data' },
  { table: 'diarias', policyName: 'Enable delete for own data' },
  { table: 'historico', policyName: 'Enable read access for own data' },
  { table: 'historico', policyName: 'Enable insert for authenticated users' },
  { table: 'historico', policyName: 'Enable update for own data' },
  { table: 'historico', policyName: 'Enable delete for own data' },
  { table: 'hoteis', policyName: 'Enable read access for own data' },
  { table: 'hoteis', policyName: 'Enable insert for authenticated users' },
  { table: 'hoteis', policyName: 'Enable update for own data' },
  { table: 'hoteis', policyName: 'Enable delete for own data' },
  { table: 'rotas', policyName: 'Enable read access for own data' },
  { table: 'rotas', policyName: 'Enable insert for authenticated users' },
  { table: 'rotas', policyName: 'Enable update for own data' },
  { table: 'rotas', policyName: 'Enable delete for own data' },
  { table: 'solicitacoes', policyName: 'Enable read access for own data' },
  { table: 'solicitacoes', policyName: 'Enable insert for authenticated users' },
  { table: 'solicitacoes', policyName: 'Enable update for own data' },
  { table: 'solicitacoes', policyName: 'Enable delete for own data' },
  { table: 'stock_history', policyName: 'Enable read access for own data' },
  { table: 'stock_history', policyName: 'Enable insert for authenticated users' },
  { table: 'stock_history', policyName: 'Enable update for own data' },
  { table: 'stock_history', policyName: 'Enable delete for own data' },
  { table: 'stock_items', policyName: 'Enable read access for own data' },
  { table: 'stock_items', policyName: 'Enable insert for authenticated users' },
  { table: 'stock_items', policyName: 'Enable update for own data' },
  { table: 'stock_items', policyName: 'Enable delete for own data' },
  { table: 'stock_pdf_settings', policyName: 'Enable read access for own data' },
  { table: 'stock_pdf_settings', policyName: 'Enable insert for authenticated users' },
  { table: 'stock_pdf_settings', policyName: 'Enable update for own data' },
  { table: 'stock_pdf_settings', policyName: 'Enable delete for own data' },
  { table: 'veiculos', policyName: 'Enable read access for own data' },
  { table: 'veiculos', policyName: 'Enable insert for authenticated users' },
  { table: 'veiculos', policyName: 'Enable update for own data' },
  { table: 'veiculos', policyName: 'Enable delete for own data' }
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
        <Modal title="Diagnóstico da Base de Dados" onClose={onClose} modalContentClassName="max-w-4xl" zIndex={60}>
            <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                <p className="text-sm text-gray-600">
                    Os seguintes problemas de performance foram identificados. Siga as instruções para corrigi-los e melhorar a performance do sistema.
                </p>

                {/* Section for RLS Policy Issues */}
                <div className="border rounded-lg overflow-hidden bg-gray-50 p-4">
                    <h4 className="font-semibold text-gray-800 text-lg mb-2">Performance de Políticas RLS</h4>
                    <p className="text-sm text-gray-600 mb-4">
                        As políticas abaixo são ineficientes. Para corrigi-las, vá para a seção <a href="https://supabase.com/dashboard/project/_/auth/policies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Authentication &gt; Policies</a> do seu painel Supabase, encontre a política e edite sua expressão. Envolva a chamada de função (ex: <code className="text-xs bg-gray-200 p-1 rounded">auth.uid()</code>) em um <code className="text-xs bg-gray-200 p-1 rounded">SELECT</code> (ex: <code className="text-xs bg-gray-200 p-1 rounded">(select auth.uid())</code>).
                        <a href="https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium ml-2">Saiba mais.</a>
                    </p>
                    <ul className="divide-y divide-gray-200 border rounded-lg overflow-hidden">
                        {rlsPolicyIssues.map((item, index) => (
                             <li key={`rls-${index}`} className="p-3 flex justify-between items-center bg-white">
                                <div className="flex items-start">
                                    <AlertTriangle className="text-orange-500 mr-3 mt-1 flex-shrink-0" size={18} />
                                    <div>
                                        <p className="text-sm text-gray-800">
                                            Tabela: <code className="bg-gray-100 p-1 rounded text-xs">{item.table}</code>
                                        </p>
                                        <p className="font-semibold text-gray-600 text-sm">
                                           Política: <span className="text-indigo-600">{item.policyName}</span>
                                        </p>
                                    </div>
                                </div>
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
