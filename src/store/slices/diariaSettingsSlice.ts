

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DiariaSettings } from '../../../types';

interface DiariaSettingsState {
    settings: DiariaSettings | null;
}

const initialState: DiariaSettingsState = {
    settings: null,
};

const diariaSettingsSlice = createSlice({
    name: 'diariaSettings',
    initialState,
    reducers: {
        setDiariaSettings: (state, action: PayloadAction<DiariaSettings>) => {
            state.settings = action.payload;
        },
        updateDiariaSettings: (state, action: PayloadAction<Partial<DiariaSettings>>) => {
            if (state.settings) {
                state.settings = { ...state.settings, ...action.payload };
            } else {
                state.settings = action.payload as DiariaSettings;
            }
        },
        clearDiariaSettings: (state) => {
            state.settings = null;
        },
    },
});

export const { setDiariaSettings, updateDiariaSettings, clearDiariaSettings } = diariaSettingsSlice.actions;
export default diariaSettingsSlice.reducer;
