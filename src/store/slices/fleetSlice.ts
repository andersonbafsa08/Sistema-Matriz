

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vehicle } from '../../../types';

interface FleetState {
    vehicles: Vehicle[];
}

const initialState: FleetState = {
    vehicles: [],
};

const fleetSlice = createSlice({
    name: 'fleet',
    initialState,
    reducers: {
        setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
            state.vehicles = action.payload;
        },
        addVehicle: (state, action: PayloadAction<Vehicle>) => {
            state.vehicles.push(action.payload);
        },
        updateVehicle: (state, action: PayloadAction<Vehicle>) => {
            const index = state.vehicles.findIndex(v => v.id === action.payload.id);
            if (index !== -1) {
                state.vehicles[index] = action.payload;
            }
        },
        deleteVehicleReducer: (state, action: PayloadAction<string>) => {
            state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
        },
        clearFleet: (state) => {
            state.vehicles = [];
        }
    },
});

export const { setVehicles, addVehicle, updateVehicle, deleteVehicleReducer, clearFleet } = fleetSlice.actions;
export default fleetSlice.reducer;
