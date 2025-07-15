

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Diaria } from '../../../types';

interface DiariasState {
    diarias: Diaria[];
}

const initialState: DiariasState = {
    diarias: [],
};

const diariasSlice = createSlice({
    name: 'diarias',
    initialState,
    reducers: {
        setDiarias: (state, action: PayloadAction<Diaria[]>) => {
            state.diarias = action.payload;
        },
        addDiaria: (state, action: PayloadAction<Diaria>) => {
            state.diarias.push(action.payload);
        },
        updateDiaria: (state, action: PayloadAction<Diaria>) => {
            const index = state.diarias.findIndex(d => d.id === action.payload.id);
            if (index !== -1) {
                state.diarias[index] = action.payload;
            }
        },
        deleteDiaria: (state, action: PayloadAction<string>) => {
            state.diarias = state.diarias.filter(d => d.id !== action.payload);
        },
        clearDiarias: (state) => {
            state.diarias = [];
        },
    },
});

export const { setDiarias, addDiaria, updateDiaria, deleteDiaria, clearDiarias } = diariasSlice.actions;
export default diariasSlice.reducer;
