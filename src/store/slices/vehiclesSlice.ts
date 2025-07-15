
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Vehicle } from '../../../types';

interface VehiclesState {
    vehicles: Vehicle[];
}

const initialState: VehiclesState = {
    vehicles: [],
};

const vehiclesSlice = createSlice({
    name: 'vehicles_placeholder',
    initialState,
    reducers: {
        setVehicles: (state, action: PayloadAction<Vehicle[]>) => {
            state.vehicles = action.payload;
        },
    },
});

export const { setVehicles } = vehiclesSlice.actions;
export default vehiclesSlice.reducer;
