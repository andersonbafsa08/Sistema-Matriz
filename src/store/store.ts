
import { configureStore } from '@reduxjs/toolkit';
import clientsReducer from './slices/clientsSlice';
import hotelsReducer from './slices/hotelsSlice';
import collaboratorsReducer from './slices/collaboratorsSlice';
import requestsReducer from './slices/requestsSlice';
import historyReducer from './slices/historySlice';
import routesReducer from './slices/routesSlice';
import navigationReducer from './slices/navigationSlice';
import stockSlice from './slices/stockSlice';
import stockHistorySlice from './slices/stockHistorySlice';
import stockSettingsSlice from './slices/stockSettingsSlice';
import fleetReducer from './slices/fleetSlice';
import diariasReducer from './slices/diariasSlice';
import diariaSettingsReducer from './slices/diariaSettingsSlice';
import authReducer from './slices/authSlice';


export const store = configureStore({
  reducer: {
    auth: authReducer,
    clients: clientsReducer,
    hotels: hotelsReducer,
    collaborators: collaboratorsReducer,
    requests: requestsReducer,
    history: historyReducer,
    routes: routesReducer,
    navigation: navigationReducer,
    stock: stockSlice,
    stockHistory: stockHistorySlice,
    stockSettings: stockSettingsSlice,
    vehicles: fleetReducer,
    diarias: diariasReducer,
    diariaSettings: diariaSettingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types, useful for Supabase session objects
        ignoredActions: ['auth/setUserAndSession'],
        // Ignore these paths in the state
        ignoredPaths: ['auth.session', 'auth.user'],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
