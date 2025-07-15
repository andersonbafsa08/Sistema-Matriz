

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StockHistoryItem } from '../../../types';

interface StockHistoryState {
    history: StockHistoryItem[];
}

const initialState: StockHistoryState = {
    history: [],
};

const stockHistorySlice = createSlice({
    name: 'stockHistory',
    initialState,
    reducers: {
        setStockHistory: (state, action: PayloadAction<StockHistoryItem[]>) => {
            state.history = action.payload;
        },
        addStockHistoryEntry: (state, action: PayloadAction<StockHistoryItem>) => {
            state.history.unshift(action.payload); // Add to the beginning
        },
        deleteStockHistoryEntry: (state, action: PayloadAction<string>) => {
            state.history = state.history.filter(item => item.id !== action.payload);
        },
        updateStockHistoryEntry: (state, action: PayloadAction<StockHistoryItem>) => {
            const index = state.history.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.history[index] = action.payload;
            }
        },
        clearStockHistory: (state) => {
            state.history = [];
        }
    },
});

export const { 
    setStockHistory, 
    addStockHistoryEntry,
    deleteStockHistoryEntry,
    updateStockHistoryEntry,
    clearStockHistory
} = stockHistorySlice.actions;
export default stockHistorySlice.reducer;
