



import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Rota } from '../../types';

interface RoutesState {
    rotas: Rota[];
}

const initialState: RoutesState = {
    rotas: [],
};

const routesSlice = createSlice({
    name: 'routes',
    initialState,
    reducers: {
        setRoutes: (state, action: PayloadAction<Rota[]>) => {
            state.rotas = action.payload;
        },
        addRoute: (state, action: PayloadAction<Rota>) => {
            state.rotas.push(action.payload);
        },
        updateRoute: (state, action: PayloadAction<Rota>) => {
            const index = state.rotas.findIndex(r => r.id === action.payload.id);
            if (index !== -1) {
                state.rotas[index] = action.payload;
            }
        },
        deleteRoute: (state, action: PayloadAction<string>) => {
            state.rotas = state.rotas.filter(r => r.id !== action.payload);
        },
        clearRoutes: (state) => {
            state.rotas = [];
        },
    },
});

export const { setRoutes, addRoute, updateRoute, deleteRoute, clearRoutes } = routesSlice.actions;
export default routesSlice.reducer;
