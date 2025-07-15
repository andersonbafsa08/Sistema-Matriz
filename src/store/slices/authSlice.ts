
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthSession, AuthUser } from '../../../types';

interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: true, // Start with loading true to check for existing session
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUserAndSession: (
      state,
      action: PayloadAction<{ user: AuthUser | null; session: AuthSession | null }>
    ) => {
      state.user = action.payload.user;
      state.session = action.payload.session;
      state.loading = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.session = null;
      state.loading = false;
    },
  },
});

export const { setUserAndSession, setLoading, clearAuth } = authSlice.actions;
export default authSlice.reducer;
