

// test-utils.tsx
import '@testing-library/jest-dom/vitest';
import React, { ReactElement, ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore, EnhancedStore } from '@reduxjs/toolkit';
import { RootState } from './src/store/store'; // Adjust path as necessary

// Import your root reducer or individual reducers
import authReducer from './src/store/slices/authSlice';
import clientsReducer from './src/store/slices/clientsSlice';
import hotelsReducer from './src/store/slices/hotelsSlice';
import collaboratorsReducer from './src/store/slices/collaboratorsSlice';
import requestsReducer from './src/store/slices/requestsSlice';
import historyReducer from './src/store/slices/historySlice';
import routesReducer from './src/store/slices/routesSlice';
import navigationReducer from './src/store/slices/navigationSlice';
import stockReducer from './src/store/slices/stockSlice';
import stockHistoryReducer from './src/store/slices/stockHistorySlice';
import stockSettingsReducer from './src/store/slices/stockSettingsSlice';
import vehiclesReducer from './src/store/slices/fleetSlice';
import diariasReducer from './src/store/slices/diariasSlice';
import diariaSettingsReducer from './src/store/slices/diariaSettingsSlice';
import { INITIAL_MOCK_DATA } from './constants';


interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: EnhancedStore<RootState>;
  route?: string;
}

function renderWithProviders(
  ui: ReactElement,
  {
    preloadedState = {
        auth: { user: null, session: null, loading: false },
        clients: { clients: INITIAL_MOCK_DATA.clientes },
        hotels: { hotels: INITIAL_MOCK_DATA.hoteis },
        collaborators: { collaborators: INITIAL_MOCK_DATA.colaboradores },
        requests: { solicitacoes: INITIAL_MOCK_DATA.solicitacoes },
        history: { historico: INITIAL_MOCK_DATA.historico },
        routes: { rotas: INITIAL_MOCK_DATA.rotas },
        navigation: { prefilledRequest: null },
        stock: { items: INITIAL_MOCK_DATA.stockItems },
        stockHistory: { history: INITIAL_MOCK_DATA.stockHistory },
        stockSettings: { settings: INITIAL_MOCK_DATA.stockPdfSettings },
        vehicles: { vehicles: INITIAL_MOCK_DATA.veiculos },
        diarias: { diarias: INITIAL_MOCK_DATA.diarias },
        diariaSettings: { settings: INITIAL_MOCK_DATA.diariaSettings },
    },
    store = configureStore({
      reducer: {
        auth: authReducer,
        clients: clientsReducer,
        hotels: hotelsReducer,
        collaborators: collaboratorsReducer,
        requests: requestsReducer,
        history: historyReducer,
        routes: routesReducer,
        navigation: navigationReducer,
        stock: stockReducer,
        stockHistory: stockHistoryReducer,
        stockSettings: stockSettingsReducer,
        vehicles: vehiclesReducer,
        diarias: diariasReducer,
        diariaSettings: diariaSettingsReducer,
      },
      preloadedState,
    }),
    route = '/',
    ...renderOptions
  }: ExtendedRenderOptions = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: ReactNode }): JSX.Element {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
}

// Re-export everything from testing-library
export * from '@testing-library/react';
// Override render method
export { renderWithProviders as render };