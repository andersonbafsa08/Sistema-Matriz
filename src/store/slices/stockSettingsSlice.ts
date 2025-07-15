

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PdfSettings } from '../../../types';

interface StockSettingsState {
    settings: PdfSettings | null;
}

const initialState: StockSettingsState = {
    settings: null,
};

const stockSettingsSlice = createSlice({
    name: 'stockSettings',
    initialState,
    reducers: {
        setStockPdfSettings: (state, action: PayloadAction<PdfSettings>) => {
            state.settings = action.payload;
        },
        updateStockPdfSettings: (state, action: PayloadAction<Partial<PdfSettings>>) => {
             if (state.settings) {
                state.settings = { ...state.settings, ...action.payload };
            } else {
                state.settings = action.payload as PdfSettings;
            }
        },
        clearStockSettings: (state) => {
            state.settings = null;
        },
    },
});

export const { setStockPdfSettings, updateStockPdfSettings, clearStockSettings } = stockSettingsSlice.actions;
export default stockSettingsSlice.reducer;
