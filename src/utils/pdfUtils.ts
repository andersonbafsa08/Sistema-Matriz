import { StockHistoryItem, Collaborator, PdfSettings, AddNotificationType, StockItem } from '../types';

const addWatermark = (doc: any) => {
    const pageCount = doc.internal.getNumberOfPages();
    const watermarkText = `Gerado: ${new Date().toLocaleDateString('pt-BR')}`;
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8);
    doc.setTextColor(150);
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(watermarkText, doc.internal.pageSize.width - 14, doc.internal.pageSize.height - 10, { align: 'right' });
    }
    doc.setTextColor(0); // Reset text color
    doc.setFont('helvetica', 'normal'); // Reset font style
}

// Correctly parses a 'YYYY-MM-DD' string into a local Date object at midnight
const parseDateAsLocal = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
};


export const generateReceiptPdf = (
    historyItem: StockHistoryItem,
    collaborator: Collaborator,
    settings: PdfSettings,
    addNotification: AddNotificationType
) => {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        if (settings.logoURL && !settings.logoURL.includes('AAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')) {
           doc.addImage(settings.logoURL, 'PNG', 14, 15, 12, 12);
        }
        
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.text(settings.headerTitle || 'CONTROLE DE DISTRIBUIÇÃO', 30, 22);

        doc.autoTable({
            startY: 30,
            theme: 'plain',
            body: [
                [{content: `Filial: ${settings.branchName || 'N/A'}`, styles: { halign: 'left', fontStyle: 'bold'}}, {content: `Gestor: ${settings.managerName || 'N/A'}`, styles: { halign: 'right', fontStyle: 'bold'}}],
                [{content: `NOME: ${collaborator.nome}`, styles: { halign: 'left', fontStyle: 'bold'}}, ''],
                [{content: `FUNÇÃO: ${collaborator.funcao_outros || collaborator.funcao || 'N/A'}`, styles: { halign: 'left', fontStyle: 'bold'}}, ''],
            ],
        });

        const tableData = (historyItem.items as any[]).map(item => {
            // Use item-specific date if available (from combined receipt), otherwise fall back to transaction date
            const itemDate = item.dataSaida
                ? new Date(item.dataSaida).toLocaleDateString('pt-BR')
                : new Date(historyItem.data).toLocaleDateString('pt-BR');
            return [
                itemDate,
                item.tipo,
                item.tamanho,
                item.quantidade,
                ''
            ];
        });

        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 5,
            head: [['Data', 'Item', 'Tamanho', 'Quantidade', 'Assinatura']],
            body: tableData,
            theme: 'grid',
            headStyles: { fillColor: [230, 230, 230], textColor: [0, 0, 0], fontStyle: 'bold' },
            bodyStyles: { valign: 'middle', minCellHeight: 20 },
            columnStyles: { 4: { cellWidth: 60 } }
        });

        const finalY = doc.lastAutoTable.finalY;
        doc.setFontSize(10);
        doc.text("Pelo presente, declaro ter recebido o(s) item(ns) acima descrito(s), novo(s) e em perfeitas", 14, finalY + 15);
        doc.text("condições de uso, e que fui treinado para sua correta utilização.", 14, finalY + 20);

        addWatermark(doc);

        const dataRecibo = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        const fileName = `${collaborator.nome.replace(/ /g, '_')}_${dataRecibo}.pdf`;
        doc.save(fileName);

    } catch (error) {
        console.error("Erro ao gerar PDF:", error);
        const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
        addNotification(`Erro ao gerar PDF: ${message}`, "error");
    }
};

const calculateStockForPeriod = (
    currentStock: StockItem[],
    history: StockHistoryItem[],
    period: { start: string, end: string }
): StockItem[] => {
    if (!period.end) return currentStock; // If no end date, return current stock

    const stockMap = new Map(currentStock.map(item => [item.id, { ...item }]));
    const periodEndDate = parseDateAsLocal(period.end);
    periodEndDate.setHours(23, 59, 59, 999);

    history.forEach(transaction => {
        const transactionDate = new Date(transaction.data);
        if (transactionDate > periodEndDate) {
            // This transaction happened AFTER the report period, so we reverse it.
            transaction.items.forEach(item => {
                const currentItem = stockMap.get(item.id);
                if (currentItem) {
                    if (transaction.idColaborador === 'SYSTEM_ENTRY') {
                        // It was an entry, so we subtract to get the past value.
                        currentItem.quantidade -= item.quantidade;
                    } else {
                        // It was an exit, so we add back to get the past value.
                        currentItem.quantidade += item.quantidade;
                    }
                    stockMap.set(item.id, currentItem);
                }
            });
        }
    });

    return Array.from(stockMap.values());
};

export const generateStockPdf = (
    stock: StockItem[],
    history: StockHistoryItem[],
    exportType: 'UNIFORME' | 'EPI',
    period: { start: string, end: string },
    settings: PdfSettings,
    addNotification: AddNotificationType
) => {
    try {
        const stockForReport = calculateStockForPeriod(stock, history, period);

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        if (settings.logoURL && !settings.logoURL.includes('AAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')) {
           doc.addImage(settings.logoURL, 'PNG', 14, 15, 12, 12);
        }
        
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Relatório Simples", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        doc.setFontSize(10);
        const periodText = (period.start || period.end) 
            ? `Período: ${period.start ? parseDateAsLocal(period.start).toLocaleDateString('pt-BR') : '...'} a ${period.end ? parseDateAsLocal(period.end).toLocaleDateString('pt-BR') : 'hoje'}`
            : `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
        doc.text(periodText, doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });

        const itemsToExport = stockForReport.filter(i => i.classe === exportType).map(i => [i.tipo, i.tamanho, i.quantidade]);
        
        if (itemsToExport.length === 0) {
             addNotification("Nenhum item em estoque para a categoria e período selecionados.", "info");
             return;
        }

        doc.autoTable({
            startY: 35,
            head: [[exportType === 'UNIFORME' ? 'Uniformes' : 'EPIs', 'Tamanho', 'Quantidade']],
            body: itemsToExport,
            theme: 'striped',
            headStyles: { fillColor: exportType === 'UNIFORME' ? [63, 81, 181] : [244, 67, 54], fontStyle: 'bold' },
        });

        addWatermark(doc);
        doc.save(`Relatorio_Simples_${exportType}_${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (error) {
        console.error("Erro ao exportar estoque para PDF:", error);
        const message = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
        addNotification(`Erro ao exportar estoque: ${message}`, "error");
    }
};

export const generateDetailedHistoryPdf = (
    history: StockHistoryItem[],
    exportType: 'UNIFORME' | 'EPI' | 'AMBOS',
    period: { start: string, end: string },
    settings: PdfSettings,
    addNotification: AddNotificationType
) => {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const filteredHistory = history.filter(item => {
            const itemDate = new Date(item.data);
            const startDate = period.start ? parseDateAsLocal(period.start) : null;
            const endDate = period.end ? parseDateAsLocal(period.end) : null;
            if (endDate) endDate.setHours(23, 59, 59, 999);
            
            const isAfterStart = startDate ? itemDate >= startDate : true;
            const isBeforeEnd = endDate ? itemDate <= endDate : true;
            
            return isAfterStart && isBeforeEnd;
        });

        const tableBody = filteredHistory
            .flatMap(item => {
                const isEntry = item.idColaborador === 'SYSTEM_ENTRY';
                const collaboratorName = isEntry ? 'ENTRADA NO ESTOQUE' : item.nomeColaborador;
                return item.items.map(subItem => ({
                    ...subItem,
                    data: item.data,
                    isEntry: isEntry,
                    collaboratorName,
                }));
            })
            .filter(item => exportType === 'AMBOS' || item.classe === exportType)
            .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());

        if (tableBody.length === 0) {
            addNotification("Nenhum registro encontrado para os filtros selecionados.", "info");
            return;
        }

        if (settings.logoURL && !settings.logoURL.includes('AAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')) {
           doc.addImage(settings.logoURL, 'PNG', 14, 15, 12, 12);
        }

        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Relatório Detalhado", doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
        const periodText = (period.start || period.end) 
            ? `Período: ${period.start ? parseDateAsLocal(period.start).toLocaleDateString('pt-BR') : '...'} a ${period.end ? parseDateAsLocal(period.end).toLocaleDateString('pt-BR') : 'hoje'}`
            : `Gerado em: ${new Date().toLocaleDateString('pt-BR')}`;
        doc.setFontSize(10);
        doc.text(periodText, doc.internal.pageSize.getWidth() / 2, 26, { align: 'center' });


        doc.autoTable({
            startY: 30,
            head: [['Data', 'Tipo', 'Colaborador/Origem', 'Item', 'Tamanho', 'Qtd.']],
            body: tableBody.map(item => [
                new Date(item.data).toLocaleDateString('pt-BR'),
                item.isEntry ? 'ENTRADA' : 'SAÍDA',
                item.collaboratorName,
                item.tipo,
                item.tamanho,
                item.quantidade,
            ]),
            theme: 'grid',
            headStyles: { fillColor: [63, 81, 181], fontStyle: 'bold' },
            willDrawCell: (data: any) => {
                 const row = data.row.index;
                 const item = tableBody[row];
                 if (item) {
                     if (item.isEntry) {
                        doc.setFillColor(220, 255, 220); // Light Green
                     } else {
                        doc.setFillColor(255, 220, 220); // Light Red
                     }
                 }
            }
        });
        
        addWatermark(doc);
        doc.save(`Relatorio_Detalhado_${new Date().toISOString().slice(0, 10)}.pdf`);

    } catch (error) {
        console.error("Erro ao gerar PDF detalhado:", error);
        addNotification("Erro ao gerar relatório detalhado.", "error");
    }
};

const exportToExcel = (data: any[], fileName: string, addNotification: AddNotificationType) => {
     if (typeof window.XLSX === 'undefined') {
        addNotification("Biblioteca de exportação (XLSX) não está disponível.", "error");
        return;
    }
    try {
        const { utils, writeFile } = window.XLSX;
        const ws = utils.json_to_sheet(data);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Dados");
        writeFile(wb, `${fileName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
        addNotification("Dados exportados para Excel com sucesso!", "success");
    } catch (error) {
        console.error("Erro ao exportar para Excel:", error);
        addNotification("Erro ao exportar dados para Excel.", "error");
    }
};

export const exportStockToExcel = (
    stock: StockItem[],
    history: StockHistoryItem[],
    exportType: 'UNIFORME' | 'EPI',
    period: { start: string, end: string },
    addNotification: AddNotificationType
) => {
    const stockForReport = calculateStockForPeriod(stock, history, period);
    const data = stockForReport
        .filter(item => item.classe === exportType)
        .map(({ id, ...rest }) => rest); // Exclude id from export
    if (data.length === 0) {
        addNotification("Nenhum item em estoque para a categoria e período selecionados.", "info");
        return;
    }
    exportToExcel(data, `Relatorio_Simples_${exportType}`, addNotification);
};

export const exportDetailedHistoryToExcel = (
    history: StockHistoryItem[],
    exportType: 'UNIFORME' | 'EPI' | 'AMBOS',
    period: { start: string, end: string },
    addNotification: AddNotificationType
) => {
    const data = history.filter(item => {
            const itemDate = new Date(item.data);
            const startDate = period.start ? parseDateAsLocal(period.start) : null;
            const endDate = period.end ? parseDateAsLocal(period.end) : null;
            if (endDate) endDate.setHours(23,59,59,999);
            const isAfterStart = startDate ? itemDate >= startDate : true;
            const isBeforeEnd = endDate ? itemDate <= endDate : true;
            return isAfterStart && isBeforeEnd;
        })
        .flatMap(item => {
            const isEntry = item.idColaborador === 'SYSTEM_ENTRY';
            const collaboratorName = isEntry ? 'ENTRADA NO ESTOQUE' : item.nomeColaborador;
            return item.items.map(subItem => ({
                Data: new Date(item.data).toLocaleDateString('pt-BR'),
                'Tipo Transação': isEntry ? 'ENTRADA' : 'SAÍDA',
                'Colaborador/Origem': collaboratorName,
                Classe: subItem.classe,
                Item: subItem.tipo,
                Tamanho: subItem.tamanho,
                Quantidade: subItem.quantidade
            }))
        })
        .filter(item => exportType === 'AMBOS' || item.Classe === exportType)
        .sort((a, b) => new Date(a.Data.split('/').reverse().join('-')).getTime() - new Date(b.Data.split('/').reverse().join('-')).getTime());

    if (data.length === 0) {
        addNotification("Nenhum registro encontrado para os filtros selecionados.", "info");
        return;
    }
    exportToExcel(data, "Relatorio_Detalhado", addNotification);
};
