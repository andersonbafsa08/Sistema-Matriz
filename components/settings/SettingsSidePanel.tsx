import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { SettingsFeaturesProps, MockData, Client, Hotel, Collaborator, Request as AppRequest, HistoryRequest, Rota, ClientObservacoes, AttachmentFile, Diaria, Vehicle, StockItem, StockHistoryItem } from '../../types';
import { Modal, Download as DownloadIconOriginal, Upload as UploadIconOriginal, XIcon, Wrench, DatabaseIcon } from '../../App'; 

import LocationForm from './LocationForm';
import SupportPanel from './SupportPanel';
import ImportWizardContent from './ImportWizardContent';
import SettingsSection from './SettingsSection'; 
import PdfSettingsForm from '../stock/PdfSettingsForm';
import DatabaseHealthCheck from './DatabaseHealthCheck';


interface SettingsSidePanelProps extends SettingsFeaturesProps {
    onClose: () => void;
}


const SettingsSidePanel: React.FC<SettingsSidePanelProps> = ({ addNotification, importFullData, onClose }) => {
    const allData = useSelector((state: RootState) => ({
        clientes: state.clients.clients,
        hoteis: state.hotels.hotels,
        colaboradores: state.collaborators.collaborators,
        solicitacoes: state.requests.solicitacoes,
        historico: state.history.historico,
        rotas: state.routes.rotas,
        veiculos: state.vehicles.vehicles,
        diarias: state.diarias.diarias,
        diariaSettings: state.diariaSettings.settings,
        stockItems: state.stock.items,
        stockHistory: state.stockHistory.history,
        stockPdfSettings: state.stockSettings.settings,
    }));
    const pdfSettings = useSelector((state: RootState) => state.stockSettings.settings);

    const [showLocationForm, setShowLocationForm] = useState(false);
    const [showImportWizard, setShowImportWizard] = useState(false);
    const [showPdfSettings, setShowPdfSettings] = useState(false);
    const [showDbHealth, setShowDbHealth] = useState(false);

    const panelRef = useRef<HTMLDivElement>(null);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        setTimeout(onClose, 300); // Match transition duration
    }, [onClose]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') handleClose();
        };
        // Prevent panel from closing when a modal is open
        if (!showLocationForm && !showImportWizard && !showPdfSettings && !showDbHealth) {
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, showLocationForm, showImportWizard, showPdfSettings, showDbHealth]);
    
    const handleExportFullData = useCallback(() => {
        if (typeof window.XLSX === 'undefined') {
            addNotification("Biblioteca de exportação (XLSX) não está disponível.", "error");
            return;
        }
        try {
            const { utils, writeFile } = window.XLSX;
            const wb = utils.book_new();
            
            const sheetMap: { name: string; key: keyof Omit<MockData, 'stockPdfSettings' | 'diariaSettings'> }[] = [
                { name: 'Clientes', key: 'clientes' }, { name: 'Hoteis', key: 'hoteis' },
                { name: 'Colaboradores', key: 'colaboradores' }, { name: 'Solicitacoes', key: 'solicitacoes' },
                { name: 'Historico', key: 'historico' }, { name: 'Rotas', key: 'rotas' },
                { name: 'Veiculos', key: 'veiculos' },
                { name: 'Diarias', key: 'diarias' },
                { name: 'StockItems', key: 'stockItems' },
                { name: 'StockHistory', key: 'stockHistory'},
            ];

            sheetMap.forEach(item => {
                let dataToExport: any[] = allData[item.key] as any[];
                if (item.key === 'clientes') {
                    dataToExport = (dataToExport as Client[]).map(({ searchableKeywords, observacoes, ...rest }) => ({
                        ...rest,
                        observacoes_sismografia: observacoes?.sismografia || '', observacoes_granulometria: observacoes?.granulometria || '',
                        observacoes_carro_tracado: observacoes?.carro_tracado || '', observacoes_carro_passeio: observacoes?.carro_passeio || '',
                        observacoes_observacao: observacoes?.observacao || '',
                    }));
                }
                if (item.key === 'historico' || item.key === 'solicitacoes') {
                    dataToExport = (dataToExport as (HistoryRequest | AppRequest)[]).map(reqItem => ({
                        ...reqItem,
                        nf_attachments_names: JSON.stringify(reqItem.nf_attachments.map((att: AttachmentFile) => att.name)),
                        pix_attachments_names: JSON.stringify(reqItem.pix_attachments.map((att: AttachmentFile) => att.name)),
                        nf_attachments: undefined, pix_attachments: undefined,
                    }));
                }
                 if (item.key === 'stockHistory') {
                    dataToExport = (dataToExport as StockHistoryItem[]).map(histItem => {
                        return { ...histItem, items: JSON.stringify(histItem.items) };
                    });
                }
                const ws = utils.json_to_sheet(dataToExport as any[]);
                utils.book_append_sheet(wb, ws, item.name);
            });
            
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            writeFile(wb, `matriz_backup_completo_${dateStr}.xlsx`);
            addNotification("Backup completo exportado com sucesso!", 'success');
        } catch (error) {
            console.error("Export error:", error);
            addNotification("Erro ao exportar dados.", "error");
        }
    }, [allData, addNotification]);

    return (
        <>
            {/* The backdrop div has been removed to prevent screen darkening and incorrect closing */}
            <div 
                ref={panelRef}
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-gray-50 shadow-xl flex flex-col z-50 settings-panel-enter${isClosing ? '-active' : ''} ${!isClosing ? 'settings-panel-enter-active' : ''}`}
                role="dialog" aria-modal="true"
            >
                <header className="flex justify-between items-center p-4 border-b bg-white flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800">Configurações</h2>
                    <button onClick={handleClose} className="p-1 rounded-full hover:bg-gray-200">
                        <XIcon size={24} />
                    </button>
                </header>
                <main className="flex-grow p-4 sm:p-6 overflow-y-auto space-y-6">
                    <SettingsSection title="Diagnóstico" description="Verificar a saúde e performance da base de dados.">
                        <button onClick={() => setShowDbHealth(true)} className="w-full bg-yellow-100 hover:bg-yellow-200 text-yellow-800 font-semibold p-3 rounded-lg flex items-center justify-center space-x-2">
                            <DatabaseIcon size={18}/>
                            <span>Verificar Base de Dados</span>
                        </button>
                    </SettingsSection>
                    <SettingsSection title="Configurações de Rota" description="Defina as filiais para cálculo de distância.">
                        <button onClick={() => setShowLocationForm(true)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold p-3 rounded-lg flex items-center justify-center space-x-2">
                           Gerenciar Rotas
                        </button>
                    </SettingsSection>
                     <SettingsSection title="Uniformes / EPIs" description="Ajustes para geração de recibos.">
                        <button onClick={() => setShowPdfSettings(true)} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold p-3 rounded-lg flex items-center justify-center space-x-2">
                           <span>Configurar PDF do Recibo</span>
                       </button>
                    </SettingsSection>
                    <SettingsSection title="Dados da Aplicação" description="Importe e exporte todos os dados.">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button onClick={() => setShowImportWizard(true)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
                                <UploadIconOriginal size={20} className="mr-2"/> Importar
                            </button>
                            <button onClick={handleExportFullData} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors">
                               <DownloadIconOriginal size={20} className="mr-2"/> Exportar
                            </button>
                        </div>
                    </SettingsSection>
                    <SettingsSection title="Suporte" description="Contato para suporte técnico.">
                        <SupportPanel />
                    </SettingsSection>
                </main>
            </div>
            
            {showLocationForm && (
                <Modal title="Gerenciar Rotas e Filiais" onClose={() => setShowLocationForm(false)} zIndex={60}>
                    <LocationForm onFinished={() => setShowLocationForm(false)} addNotification={addNotification}/>
                </Modal>
            )}
            {showImportWizard && (
                 <Modal title="Importar Dados da Aplicação" onClose={() => setShowImportWizard(false)} zIndex={60}>
                    <ImportWizardContent onClose={() => setShowImportWizard(false)} importFullData={importFullData} addNotification={addNotification}/>
                </Modal>
            )}
            {showPdfSettings && (
                <Modal title="Configurar PDF do Recibo" onClose={() => setShowPdfSettings(false)} zIndex={60}>
                    <PdfSettingsForm currentSettings={pdfSettings} addNotification={addNotification} onFinished={() => setShowPdfSettings(false)} />
                </Modal>
            )}
            {showDbHealth && (
                <DatabaseHealthCheck
                    addNotification={addNotification}
                    onClose={() => setShowDbHealth(false)}
                />
            )}
        </>
    );
};

export default SettingsSidePanel;