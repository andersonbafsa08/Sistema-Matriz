import React, { useState, useCallback } from 'react';
import { MockData, AddNotificationType, Client, ClientObservacoes, AttachmentFile } from '../../types';
import { Spinner, Upload as UploadIcon, FileText, Download as DownloadIcon } from '../../App'; 

interface ImportWizardContentProps {
    onClose: () => void;
    importFullData: (data: MockData) => void;
    addNotification: AddNotificationType;
}
const ImportWizardContent: React.FC<ImportWizardContentProps> = ({ onClose, importFullData, addNotification }) => {
    const [isImporting, setIsImporting] = useState(false);
    const [fileName, setFileName] = useState<string | null>(null);

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) {
            setFileName(null);
            return;
        }
        setFileName(file.name);
    }, []);
    
    const triggerFileImport = useCallback(() => {
        const fileInput = document.getElementById('excel-file-input') as HTMLInputElement;
        if (fileInput?.files?.length) {
            const file = fileInput.files[0];
            if (typeof window.XLSX === 'undefined') { addNotification("Biblioteca (XLSX) não carregada.", "error"); return; }
            setIsImporting(true);
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const { read, utils } = window.XLSX;
                    const data = new Uint8Array(event.target!.result as ArrayBuffer);
                    const workbook = read(data, {type: 'array'});
                    if (workbook.SheetNames.length === 0) { addNotification("Arquivo Excel vazio ou inválido.", "error"); setIsImporting(false); return; }

                    const importedData: Partial<MockData> = {};
                    const sheetToKeyMap: Record<string, keyof MockData> = {
                        'Clientes': 'clientes', 'Hoteis': 'hoteis', 'Colaboradores': 'colaboradores',
                        'Solicitacoes': 'solicitacoes', 'Historico': 'historico', 'Rotas': 'rotas',
                        'Veiculos': 'veiculos', 'Diarias': 'diarias',
                        'StockItems': 'stockItems', 'StockHistory': 'stockHistory'
                    };

                    for (const sheetName of workbook.SheetNames) {
                        const key = sheetToKeyMap[sheetName];
                        if (key) {
                            const worksheet = workbook.Sheets[sheetName];
                            const jsonDataRaw = utils.sheet_to_json(worksheet, { header: 1, defval: "" });

                            if (!jsonDataRaw || jsonDataRaw.length < 1) { 
                                (importedData as any)[key] = []; continue;
                            }
                            const headers = jsonDataRaw[0] as string[];
                            const rows = jsonDataRaw.slice(1);

                            (importedData as any)[key] = rows.map((rowArray: any[]) => {
                                const newRow: any = {};
                                headers.forEach((header, index) => {
                                    newRow[header] = rowArray[index] === undefined ? "" : rowArray[index];
                                });

                                if (key === 'hoteis') {
                                    newRow.quarto_ind = Number(newRow.quarto_ind || 0);
                                    newRow.quarto_dup = Number(newRow.quarto_dup || 0);
                                    newRow.quarto_tri = Number(newRow.quarto_tri || 0);
                                }
                                if (key === 'solicitacoes' || key === 'historico') {
                                    newRow.quant_equipe = Number(newRow.quant_equipe || 1);
                                    newRow.quant_diarias = Number(newRow.quant_diarias || 0);
                                    newRow.valor_diaria = Number(newRow.valor_diaria || 0);
                                    newRow.valor_total = Number(newRow.valor_total || 0);
                                    
                                    const parseAttachments = (namesStr: string): AttachmentFile[] => {
                                        if (namesStr && typeof namesStr === 'string') {
                                            try { return JSON.parse(namesStr).map((name: string) => ({name, data:''})); } catch (e) { /* ignore */ }
                                        }
                                        return [];
                                    };
                                    newRow.nf_attachments = parseAttachments(newRow.nf_attachments_names);
                                    newRow.pix_attachments = parseAttachments(newRow.pix_attachments_names);
                                    delete newRow.nf_attachments_names; 
                                    delete newRow.pix_attachments_names;

                                    if (key === 'historico') {
                                        newRow.attachments_status = Number(newRow.attachments_status || 0) as 0 | 1;
                                    }
                                }
                                if (key === 'clientes') {
                                     newRow.searchableKeywords = [
                                        ...(String(newRow.cliente || '').toLowerCase().split(' ').filter(Boolean)),
                                        ...(String(newRow.cidade || '').toLowerCase().split(' ').filter(Boolean))
                                    ];
                                    newRow.observacoes = {
                                        sismografia: newRow.observacoes_sismografia || '',
                                        granulometria: newRow.observacoes_granulometria || '',
                                        carro_tracado: newRow.observacoes_carro_tracado || '',
                                        carro_passeio: newRow.observacoes_carro_passeio || '',
                                        observacao: newRow.observacoes_observacao || '',
                                    } as ClientObservacoes;
                                    delete newRow.observacoes_sismografia; delete newRow.observacoes_granulometria;
                                    delete newRow.observacoes_carro_tracado; delete newRow.observacoes_carro_passeio;
                                    delete newRow.observacoes_observacao;
                                }
                                if (key === 'veiculos') {
                                    newRow.isLocado = newRow.isLocado === 'TRUE' || newRow.isLocado === true;
                                }
                                if (key === 'diarias') {
                                    newRow.total_cafes = Number(newRow.total_cafes || 0);
                                    newRow.total_almocos = Number(newRow.total_almocos || 0);
                                    newRow.total_jantas = Number(newRow.total_jantas || 0);
                                    newRow.total_pernoites = Number(newRow.total_pernoites || 0);
                                    newRow.valor_total_refeicoes = Number(newRow.valor_total_refeicoes || 0);
                                    newRow.valor_total_pernoites = Number(newRow.valor_total_pernoites || 0);
                                    newRow.valor_total_geral = Number(newRow.valor_total_geral || 0);
                                }
                                if (key === 'stockItems') {
                                    newRow.quantidade = Number(newRow.quantidade || 0);
                                }
                                if (key === 'stockHistory') {
                                    if (newRow.items && typeof newRow.items === 'string') {
                                        try {
                                            newRow.items = JSON.parse(newRow.items);
                                        } catch (e) {
                                            newRow.items = [];
                                        }
                                    } else {
                                        newRow.items = [];
                                    }
                                }
                                return newRow;
                            });
                        }
                    }
                    importFullData(importedData as MockData); 
                    onClose(); 
                } catch (error) { 
                    console.error("Import error:", error); 
                    addNotification("Erro ao importar. Verifique o formato do arquivo e das planilhas (nomes das abas e colunas). Use o template.", "error", {duration: 7000});
                } finally { 
                    setIsImporting(false); 
                    setFileName(null); 
                    if (fileInput) fileInput.value = '';
                }
            };
            reader.onerror = () => { 
                addNotification("Erro ao ler o arquivo.", "error"); 
                setIsImporting(false); 
                setFileName(null); 
                if (fileInput) fileInput.value = ''; 
            }
            reader.readAsArrayBuffer(file);
        } else {
            addNotification("Por favor, selecione um arquivo Excel para importar.", "info");
        }
    }, [addNotification, importFullData, onClose]);

    const handleDownloadTemplate = useCallback(() => {
        if (typeof window.XLSX === 'undefined') { addNotification("Biblioteca (XLSX) não carregada.", "error"); return; }
        try {
            const { utils, writeFile } = window.XLSX;
            const wb = utils.book_new();

            const templateClientes = [{ id: 'cliente_exemplo_1', cliente: 'NOME CLIENTE EXEMPLO', cidade: 'CIDADE EXEMPLO', distancia: '100', lat_final: '-23.12345', lon_final: '-46.54321', observacoes_sismografia: 'Detalhes sismo', observacoes_granulometria:'Detalhes granulo', observacoes_carro_tracado:'Detalhes carro traçado', observacoes_carro_passeio:'Detalhes carro passeio', observacoes_observacao:'Observação geral' }];
            const templateHoteis = [{ id: 'hotel_exemplo_1', client_id: 'cliente_exemplo_1', hotel: 'NOME HOTEL EXEMPLO', cnpj: '11222333000144', telefone: '11999998888', dados_pag: 'pix@exemplo.com', quarto_ind: 150.50, quarto_dup: 250.00, quarto_tri: 320.75 }];
            const templateColaboradores = [{ id: 'colab_exemplo_1', nome: 'NOME COLABORADOR', cpf: '11122233344', data_nasc: '1990-01-15', pix: 'colab@pix.com', banco: 'BANCO EXEMPLO', telefone: '11988887777', filial: 'FILIAL EXEMPLO', funcao: 'Técnico', funcao_outros: '' }];
            const templateSolicitacoes = [{ id: 'sol_exemplo_1', solicitante: 'SOLICITANTE EXEMPLO', data_solicitacao: '2024-01-20', centro_custo: 'CENTRO CUSTO XYZ', equipe_members: 'NOME COLABORADOR', quant_equipe: 1, hotel_name: 'NOME HOTEL EXEMPLO', client_name: 'NOME CLIENTE EXEMPLO', check_in: '2024-02-01', check_out: '2024-02-05', quant_diarias: 4, valor_diaria: 150.50, valor_total: 602.00, pix: 'pix@exemplo.com', cnpj: '11222333000144', nf: 'NF123', nf_attachments_names: '[]', pix_attachments_names: '[]' }];
            const templateHistorico = [{ id: 'hist_exemplo_1', solicitante: 'SOLICITANTE EXEMPLO HIST', data_solicitacao: '2023-12-01', centro_custo: 'CC HISTORICO', equipe_members: 'NOME COLABORADOR HIST', quant_equipe: 1, hotel_name: 'HOTEL HISTORICO', client_name: 'CLIENTE HISTORICO', check_in: '2023-12-05', check_out: '2023-12-10', quant_diarias: 5, valor_diaria: 100, valor_total: 500, pix: 'pix@hotelhist.com', cnpj: '44555666000177', nf_number: 'NFHIST123', attachments_status: 0, nf_attachments_names: '[]', pix_attachments_names: '[]' }];
            const templateRotas = [{ id: 'rota_exemplo_1', filial: 'SEDE EXEMPLO', default_latitude: '-23.5505', default_longitude: '-46.6333', isDefault: true }];

            const sheetDataMap = {
                'Clientes': templateClientes, 'Hoteis': templateHoteis, 'Colaboradores': templateColaboradores,
                'Solicitacoes': templateSolicitacoes, 'Historico': templateHistorico, 'Rotas': templateRotas
            };
            
            for(const [sheetName, data] of Object.entries(sheetDataMap)) {
                const ws = utils.json_to_sheet(data);
                utils.book_append_sheet(wb, ws, sheetName);
            }

            writeFile(wb, "matriz_template_importacao.xlsx");
            addNotification("Template de importação baixado!", 'success');
        } catch (e) {
            console.error(e);
            addNotification("Erro ao gerar template.", "error");
        }
    }, [addNotification]);

    return (
        <div className="space-y-6">
            <p className="text-sm text-gray-600">
                Selecione um arquivo Excel (.xlsx) para importar. Certifique-se de que o arquivo segue o formato e as abas do template.
                As abas devem ser: <code className="text-xs bg-gray-100 p-1 rounded">Clientes</code>, <code className="text-xs bg-gray-100 p-1 rounded">Hoteis</code>, <code className="text-xs bg-gray-100 p-1 rounded">Colaboradores</code>, <code className="text-xs bg-gray-100 p-1 rounded">Solicitacoes</code>, <code className="text-xs bg-gray-100 p-1 rounded">Historico</code>, <code className="text-xs bg-gray-100 p-1 rounded">Rotas</code>, etc.
                <br/><strong>Atenção:</strong> A importação substituirá todos os dados existentes na aplicação.
            </p>

            <div className="flex flex-col items-center space-y-4">
                 <button 
                    onClick={handleDownloadTemplate}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center justify-center transition-colors"
                >
                    <DownloadIcon size={18} className="mr-2"/> Baixar Template de Importação
                </button>
                
                <label className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg cursor-pointer flex items-center justify-center transition-colors">
                    <UploadIcon size={20} className="mr-2"/> Selecionar Arquivo Excel
                    <input id="excel-file-input" type="file" className="hidden" accept=".xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" onChange={handleFileChange} />
                </label>
                {fileName && <p className="text-sm text-gray-500 flex items-center"><FileText size={16} className="mr-2 text-green-500"/> {fileName}</p>}
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t">
                <button type="button" onClick={onClose} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg">
                    Cancelar
                </button>
                <button
                    type="button"
                    onClick={triggerFileImport}
                    disabled={isImporting || !fileName}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg flex items-center justify-center min-w-[150px] min-h-[40px] disabled:opacity-50"
                >
                    {isImporting ? <Spinner /> : 'Importar Dados'}
                </button>
            </div>
        </div>
    );
};
export default ImportWizardContent;