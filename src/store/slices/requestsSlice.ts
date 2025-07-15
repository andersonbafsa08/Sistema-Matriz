

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Request } from '../../types'; // Request type for solicitacoes

interface RequestsState {
    solicitacoes: Request[];
}

const initialState: RequestsState = {
    solicitacoes: [],
};

const requestsSlice = createSlice({
    name: 'requests',
    initialState,
    reducers: {
        setRequests: (state, action: PayloadAction<Request[]>) => {
            state.solicitacoes = [...action.payload].sort((a, b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime());
        },
        addRequest: (state, action: PayloadAction<Request>) => {
            state.solicitacoes.unshift(action.payload);
        },
        updateRequest: (state, action: PayloadAction<Request>) => {
            const index = state.solicitacoes.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.solicitacoes[index] = action.payload;
            }
        },
        deleteRequestReducer: (state, action: PayloadAction<string>) => {
            state.solicitacoes = state.solicitacoes.filter(r => r.id !== action.payload);
        },
        restoreRequest: (state, action: PayloadAction<Request>) => {
            if (!state.solicitacoes.some(r => r.id === action.payload.id)) {
                state.solicitacoes.push(action.payload);
                state.solicitacoes.sort((a, b) => new Date(b.data_solicitacao).getTime() - new Date(a.data_solicitacao).getTime());
            }
        },
        removeMultipleRequestsReducer: (state, action: PayloadAction<string[]>) => {
            const idsToRemove = new Set(action.payload);
            state.solicitacoes = state.solicitacoes.filter(r => !idsToRemove.has(r.id));
        },
        deleteMultipleRequestsReducer: (state, action: PayloadAction<string[]>) => {
            const idsToDelete = new Set(action.payload);
            state.solicitacoes = state.solicitacoes.filter(r => !idsToDelete.has(r.id));
        },
        clearRequests: (state) => {
            state.solicitacoes = [];
        }
    },
});

export const { 
    setRequests, 
    addRequest,
    updateRequest,
    deleteRequestReducer,
    restoreRequest,
    removeMultipleRequestsReducer,
    deleteMultipleRequestsReducer,
    clearRequests
} = requestsSlice.actions;
export default requestsSlice.reducer;
