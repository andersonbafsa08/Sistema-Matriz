
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Request as AppRequest } from '../../types';

interface NavigationState {
    prefilledRequest: Partial<AppRequest> | null;
}

const initialState: NavigationState = {
    prefilledRequest: null,
};

const navigationSlice = createSlice({
    name: 'navigation',
    initialState,
    reducers: {
        setPrefilledRequestDataReducer: (state, action: PayloadAction<Partial<AppRequest> | null>) => {
            state.prefilledRequest = action.payload;
        },
        clearPrefilledRequestDataReducer: (state) => {
            state.prefilledRequest = null;
        },
    },
});

export const { 
    setPrefilledRequestDataReducer, 
    clearPrefilledRequestDataReducer,
} = navigationSlice.actions;
export default navigationSlice.reducer;