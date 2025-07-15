



import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HistoryRequest } from '../../types';

interface HistoryState {
    historico: HistoryRequest[];
}

const initialState: HistoryState = {
    historico: [],
};

const historySlice = createSlice({
    name: 'history',
    initialState,
    reducers: {
        setHistory: (state, action: PayloadAction<HistoryRequest[]>) => {
            state.historico = [...action.payload].sort((a,b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime());
        },
        addHistoryItem: (state, action: PayloadAction<HistoryRequest>) => {
            state.historico.push(action.payload);
            state.historico.sort((a,b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime());
        },
        addMultipleHistoryItems: (state, action: PayloadAction<HistoryRequest[]>) => {
            state.historico.push(...action.payload);
            state.historico.sort((a,b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime());
        },
        updateHistoryItem: (state, action: PayloadAction<HistoryRequest>) => {
            const index = state.historico.findIndex(h => h.id === action.payload.id);
            if (index !== -1) {
                state.historico[index] = action.payload;
                // No re-sort needed if only one item is updated, order is by data_solicitacao
            }
        },
        deleteHistoryItemReducer: (state, action: PayloadAction<string>) => { 
            state.historico = state.historico.filter(h => h.id !== action.payload);
        },
        restoreHistoryItem: (state, action: PayloadAction<HistoryRequest>) => {
            if (!state.historico.some(h => h.id === action.payload.id)) {
                state.historico.push(action.payload);
                state.historico.sort((a,b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime());
            }
        },
        deleteMultipleHistoryItemsReducer: (state, action: PayloadAction<string[]>) => {
            const idsToDelete = new Set(action.payload);
            state.historico = state.historico.filter(h => !idsToDelete.has(h.id));
        },
        clearHistory: (state) => {
            state.historico = [];
        }
    },
});

export const { 
    setHistory, addHistoryItem, addMultipleHistoryItems, updateHistoryItem, deleteHistoryItemReducer,
    restoreHistoryItem, deleteMultipleHistoryItemsReducer, clearHistory
} = historySlice.actions;
export default historySlice.reducer;
