



import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Client } from '../../types';

interface ClientsState {
    clients: Client[];
}

const initialState: ClientsState = {
    clients: [],
};

const clientsSlice = createSlice({
    name: 'clients',
    initialState,
    reducers: {
        setClients: (state, action: PayloadAction<Client[]>) => {
            state.clients = [...action.payload].sort((a, b) => a.cliente.localeCompare(b.cliente));
        },
        addClient: (state, action: PayloadAction<Client>) => {
            state.clients.push(action.payload);
            state.clients.sort((a, b) => a.cliente.localeCompare(b.cliente));
        },
        updateClient: (state, action: PayloadAction<Client>) => {
            const index = state.clients.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.clients[index] = action.payload;
                state.clients.sort((a, b) => a.cliente.localeCompare(b.cliente));
            }
        },
        deleteClientReducer: (state, action: PayloadAction<string>) => { // Renamed to avoid conflict
            state.clients = state.clients.filter(c => c.id !== action.payload);
        },
        restoreClient: (state, action: PayloadAction<Client>) => {
            // Avoid duplicates if undo is clicked multiple times or item already exists
            if (!state.clients.some(c => c.id === action.payload.id)) {
                state.clients.push(action.payload);
                state.clients.sort((a, b) => a.cliente.localeCompare(b.cliente));
            }
        },
        clearClients: (state) => {
            state.clients = [];
        },
    },
});

export const { setClients, addClient, updateClient, deleteClientReducer, restoreClient, clearClients } = clientsSlice.actions;
export default clientsSlice.reducer;
