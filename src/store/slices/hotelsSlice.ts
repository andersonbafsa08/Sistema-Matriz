



import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Hotel } from '../../types';

interface HotelsState {
    hotels: Hotel[];
}

const initialState: HotelsState = {
    hotels: [],
};

const hotelsSlice = createSlice({
    name: 'hotels',
    initialState,
    reducers: {
        setHotels: (state, action: PayloadAction<Hotel[]>) => {
            state.hotels = action.payload;
        },
        addHotel: (state, action: PayloadAction<Hotel>) => {
            state.hotels.push(action.payload);
            // Consider sorting if needed, e.g., by hotel name or client_id then hotel name
        },
        updateHotel: (state, action: PayloadAction<Hotel>) => {
            const index = state.hotels.findIndex(h => h.id === action.payload.id);
            if (index !== -1) {
                state.hotels[index] = action.payload;
            }
        },
        deleteHotelReducer: (state, action: PayloadAction<string>) => { // Renamed
            state.hotels = state.hotels.filter(h => h.id !== action.payload);
        },
        deleteHotelsByClientId: (state, action: PayloadAction<string>) => { // client_id
            state.hotels = state.hotels.filter(h => h.client_id !== action.payload);
        },
        restoreHotel: (state, action: PayloadAction<Hotel>) => {
            if (!state.hotels.some(h => h.id === action.payload.id)) {
                state.hotels.push(action.payload);
                // Consider re-sorting if a specific order is desired
            }
        },
        clearHotels: (state) => {
            state.hotels = [];
        }
    },
});

export const { setHotels, addHotel, updateHotel, deleteHotelReducer, deleteHotelsByClientId, restoreHotel, clearHotels } = hotelsSlice.actions;
export default hotelsSlice.reducer;
