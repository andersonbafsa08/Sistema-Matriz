import React, { useState, useCallback, useMemo, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../src/store/store';
import { StockControlFeaturesProps, PdfSettings, StockItem, StockHistoryItem } from '../../types';
import { Modal, FileExport } from '../../App';
import StockTables from './StockTables';
import HistorySection from './HistorySection';
import EntryForm from './EntryForm';
import ExitForm from './ExitForm';
import ExportModal from './SettingsModal';
import { generateStockPdf, generateDetailedHistoryPdf, exportStockToExcel, exportDetailedHistoryToExcel } from '../../src/utils/pdfUtils';


const StockControlPageContent: React.FC<StockControlFeaturesProps> = ({ addNotification }) => {
    const stock = useSelector((state: RootState) => state.stock.items);
    const history = useSelector((state: RootState) => state.stockHistory.history);
    const collaborators = useSelector((state: RootState) => state.collaborators.collaborators);
    const pdfSettings = useSelector((state: RootState) => state.stockSettings.settings);


    const [isEntryModalOpen, setEntryModalOpen] = useState(false);
    const [isExitModalOpen, setExitModalOpen] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [exportTarget, setExportTarget] = useState<'UNIFORME' | 'EPI'>('UNIFORME');
    const [activeTab, setActiveTab] = useState<'uniformes' | 'epis' | 'historico'>('uniformes');

    const openEntryModal = useCallback(() => setEntryModalOpen(true), []);
    const closeEntryModal = useCallback(() => setEntryModalOpen(false), []);

    const openExitModal = useCallback(() => setExitModalOpen(true), []);
    const closeExitModal = useCallback(() => setExitModalOpen(false), []);
    
    const openExportModal = useCallback((target: 'UNIFORME' | 'EPI') => {
        setExportTarget(target);
        setShowExportModal(true);
    }, []);
    const closeExportModal = useCallback(() => setShowExportModal(false), []);


    const handleExport = useCallback((options: {
        format: 'PDF' | 'EXCEL';
        type: 'UNIFORME' | 'EPI';
        style: 'SIMPLES' | 'DETALHADO';
        period: { start: string; end: string };
    }) => {
        const { format, type, style, period } = options;
        if (style === 'SIMPLES') {
            if (format === 'PDF') {
                generateStockPdf(stock, history, type, period, pdfSettings, addNotification);
            } else {
                exportStockToExcel(stock, history, type, period, addNotification);
            }
        } else { // DETALHADO
            if (format === 'PDF') {
                generateDetailedHistoryPdf(history, type, period, pdfSettings, addNotification);
            } else {
                exportDetailedHistoryToExcel(history, type, period, addNotification);
            }
        }
    }, [stock, history, pdfSettings, addNotification]);


    const { uniformes, epis } = useMemo(() => {
        const sortedStock = [...stock].sort((a, b) => a.tipo.localeCompare(b.tipo) || a.tamanho.localeCompare(b.tamanho));
        return {
            uniformes: sortedStock.filter(item => item.classe === 'UNIFORME'),
            epis: sortedStock.filter(item => item.classe === 'EPI'),
        };
    }, [stock]);
    
    const TabButton: React.FC<{tabName: 'uniformes'|'epis'|'historico', children: ReactNode}> = ({tabName, children}) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`py-3 px-6 font-semibold transition-colors ${activeTab === tabName ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-600 border-b-2 border-transparent hover:bg-gray-50'}`}
            aria-current={activeTab === tabName ? 'page' : undefined}
        >
            {children}
        </button>
    );

    const ActionButtons = () => (
        <div className="flex justify-end gap-2">
            <button onClick={openEntryModal} className="bg-green-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center space-x-2"><span>Entrada</span></button>
            <button onClick={openExitModal} className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 flex items-center justify-center space-x-2"><span>Saída</span></button>
            <button onClick={() => openExportModal(activeTab === 'uniformes' ? 'UNIFORME' : 'EPI')} className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 flex items-center justify-center space-x-2">
                <FileExport size={16} className="mr-1"/>
                <span>Exportar</span>
            </button>
        </div>
    );

    return (
        <div className="w-full">
            <header className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-bold text-gray-800">Controle de Estoque</h2>
            </header>
            
            <div className="sticky top-[76px] z-30">
                <div className="flex border-b bg-white rounded-t-lg shadow">
                    <TabButton tabName="uniformes">Uniformes</TabButton>
                    <TabButton tabName="epis">EPIs</TabButton>
                    <TabButton tabName="historico">Histórico</TabButton>
                </div>
                 {activeTab !== 'historico' && (
                    <div className="bg-gray-100 p-2 border-b shadow-sm">
                        <ActionButtons />
                    </div>
                )}
            </div>


            <div className="mt-4">
                {activeTab === 'uniformes' && (
                    <StockTables stock={uniformes} title="Estoque de Uniformes" history={history} />
                )}
                {activeTab === 'epis' && (
                    <StockTables stock={epis} title="Estoque de EPIs" history={history} />
                )}
                {activeTab === 'historico' && <HistorySection history={history} collaborators={collaborators} addNotification={addNotification} />}
            </div>

            {isEntryModalOpen && (
                <Modal title="Entrada no Estoque" onClose={closeEntryModal}>
                    <EntryForm onFinished={closeEntryModal} addNotification={addNotification} itemClass={activeTab === 'uniformes' ? 'UNIFORME' : 'EPI'} />
                </Modal>
            )}

            {isExitModalOpen && (
                <Modal title="Saída de Itens" onClose={closeExitModal}>
                    <ExitForm onFinished={closeExitModal} addNotification={addNotification} itemClass={activeTab === 'uniformes' ? 'UNIFORME' : 'EPI'} />
                </Modal>
            )}

            {showExportModal && (
                <ExportModal
                    onClose={closeExportModal}
                    onExport={handleExport}
                    itemClass={exportTarget}
                />
            )}
        </div>
    );
};

export default StockControlPageContent;