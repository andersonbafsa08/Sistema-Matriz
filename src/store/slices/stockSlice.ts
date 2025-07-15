

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { StockItem } from '../../../types';

interface StockState {
    items: StockItem[];
}

const initialState: StockState = {
    items: [],
};

const stockSlice = createSlice({
    name: 'stock',
    initialState,
    reducers: {
        setStockItems: (state, action: PayloadAction<StockItem[]>) => {
            state.items = action.payload;
        },
        addStockItem: (state, action: PayloadAction<StockItem>) => {
            state.items.push(action.payload);
        },
        updateStockItem: (state, action: PayloadAction<StockItem>) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index !== -1) {
                state.items[index] = action.payload;
            }
        },
        deleteStockItem: (state, action: PayloadAction<string>) => {
             state.items = state.items.filter(item => item.id !== action.payload);
        },
        updateStockQuantities: (state, action: PayloadAction<{ id: string; quantityChange: number }[]>) => {
             action.payload.forEach(({ id, quantityChange }) => {
                const index = state.items.findIndex(item => item.id === id);
                if (index !== -1) {
                    state.items[index].quantidade += quantityChange; // can be negative for exits
                }
            });
        },
        clearStock: (state) => {
            state.items = [];
        },
    },
});

export const { setStockItems, addStockItem, updateStockItem, deleteStockItem, updateStockQuantities, clearStock } = stockSlice.actions;
export default stockSlice.reducer;
