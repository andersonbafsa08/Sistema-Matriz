

// components/ClientModule.test.tsx
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientModule from './ClientModule';
import { render } from '../test-utils'; 
import { INITIAL_MOCK_DATA } from '../constants';
import { Client } from '../types';
import { Modal } from '../App'; 
import ClientForm from './client/ClientForm'; // Corrected import for ClientForm


// Mock useNotification from App.tsx
vi.mock('../App', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual, 
    useNotification: () => vi.fn(), 
  };
});

// Mock Redux store state for clients
const mockClients: Client[] = INITIAL_MOCK_DATA.clientes;

describe('ClientModule', () => {
  const mockAddNotificationGlobal = vi.fn();

  beforeEach(() => {
    mockAddNotificationGlobal.mockClear();
  });

  describe('ClientListPage', () => {
    it('renders the client list page with initial clients', () => {
      render(<ClientModule onNavigateToRequest={vi.fn()} addNotification={mockAddNotificationGlobal} />, {
        preloadedState: { clients: { clients: mockClients } }
      });
      expect(screen.getByRole('heading', { name: /Clientes \(\d+\)/i })).toBeInTheDocument();
      expect(screen.getByText(mockClients[0].cliente)).toBeInTheDocument();
      expect(screen.getByText(mockClients[1].cliente)).toBeInTheDocument();
    });

    it('filters clients based on search term', async () => {
      const user = userEvent.setup();
      render(<ClientModule onNavigateToRequest={vi.fn()} addNotification={mockAddNotificationGlobal} />, {
        preloadedState: { clients: { clients: mockClients } }
      });

      const searchInput = screen.getByPlaceholderText(/Pesquisar por nome ou cidade.../i);
      await act(async () => {
        await user.type(searchInput, mockClients[0].cliente.substring(0, 5));
      });
      

      expect(screen.getByText(mockClients[0].cliente)).toBeInTheDocument();
      expect(screen.queryByText(mockClients[1].cliente)).not.toBeInTheDocument();
    });

    it('opens the "Adicionar Cliente" modal when button is clicked', async () => {
      const user = userEvent.setup();
      render(<ClientModule onNavigateToRequest={vi.fn()} addNotification={mockAddNotificationGlobal} />, {
        preloadedState: { clients: { clients: mockClients } }
      });

      const addButton = screen.getByRole('button', { name: /Adicionar Cliente/i });
      await act(async () => {
        await user.click(addButton);
      });

      // ClientListPageContent now handles rendering ClientForm in its own Modal
      // So we check if the modal opened by ClientListPageContent is present
      expect(screen.getByRole('dialog', { name: /Adicionar Novo Cliente/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/Nome do Cliente/i)).toBeInTheDocument(); // Check for a field within ClientForm
    });
  });

  describe('ClientForm (within Modal - requires ClientListPage interaction or direct test)', () => {
    const mockOnFinished = vi.fn();

    beforeEach(() => {
        mockAddNotificationGlobal.mockClear();
        mockOnFinished.mockClear();
    });

    it('shows validation errors for empty required fields on submit (testing ClientForm directly)', async () => {
      const user = userEvent.setup();
      render(
        <Modal title="Test Form" onClose={vi.fn()}>
          {/* Render ClientForm directly for unit testing its behavior */}
          <ClientForm 
            onFinished={mockOnFinished} 
            addNotification={mockAddNotificationGlobal} 
          />
        </Modal>, 
        { preloadedState: { clients: { clients: [] } } } 
      );
      
      const saveButton = screen.getByRole('button', { name: /Salvar Cliente/i });
      await act(async () => {
        await user.click(saveButton);
      });

      expect(screen.getByText("Nome do Cliente é obrigatório.")).toBeInTheDocument();
      expect(screen.getByText("Cidade é obrigatória.")).toBeInTheDocument();
      expect(mockAddNotificationGlobal).toHaveBeenCalledWith("Por favor, corrija os erros no formulário.", "error");
      expect(mockOnFinished).not.toHaveBeenCalled();
    });

    it('shows validation error for invalid latitude format and range (testing ClientForm directly)', async () => {
        const user = userEvent.setup();
        render(
           <Modal title="Test Form" onClose={vi.fn()}>
             <ClientForm
                onFinished={mockOnFinished} 
                addNotification={mockAddNotificationGlobal} 
             />
           </Modal>, { preloadedState: { clients: { clients: [] } } }
        );

        await act(async () => {
            await user.type(screen.getByPlaceholderText(/Nome do Cliente/i), "Test Client");
            await user.type(screen.getByPlaceholderText(/Cidade/i), "Test City");
            await user.type(screen.getByPlaceholderText(/Latitude Final/i), "invalid-lat");
        });
        let saveButton = screen.getByRole('button', { name: /Salvar Cliente/i });
         await act(async () => { await user.click(saveButton); });
        expect(screen.getByText("Latitude em formato inválido.")).toBeInTheDocument();

        await act(async () => {
            await user.clear(screen.getByPlaceholderText(/Latitude Final/i));
            await user.type(screen.getByPlaceholderText(/Latitude Final/i), "91"); 
        });
        saveButton = screen.getByRole('button', { name: /Salvar Cliente/i });
        await act(async () => { await user.click(saveButton); });
        expect(screen.getByText("Latitude deve estar entre -90 e 90.")).toBeInTheDocument();
        expect(mockAddNotificationGlobal).toHaveBeenCalledWith("Por favor, corrija os erros no formulário.", "error");
    });


    it('submits successfully with valid data for a new client (testing ClientForm directly)', async () => {
      const user = userEvent.setup();
      const { store } = render(
        <Modal title="Test Form" onClose={vi.fn()}>
            <ClientForm onFinished={mockOnFinished} addNotification={mockAddNotificationGlobal} />
        </Modal>, { preloadedState: { clients: { clients: [] } } }
      );
    
      await act(async () => {
        await user.type(screen.getByPlaceholderText(/Nome do Cliente/i), "Novo Cliente Teste");
        await user.type(screen.getByPlaceholderText(/Cidade/i), "Cidade Teste");
        await user.type(screen.getByPlaceholderText(/Distância \(km\)/i), "100");
        await user.type(screen.getByPlaceholderText(/Latitude Final/i), "-10.123");
        await user.type(screen.getByPlaceholderText(/Longitude Final/i), "-20.456");
      });
      
      const saveButton = screen.getByRole('button', { name: /Salvar Cliente/i });
      await act(async () => {
        await user.click(saveButton);
      });

      expect(mockOnFinished).toHaveBeenCalled();
      expect(mockAddNotificationGlobal).toHaveBeenCalledWith("Cliente adicionado com sucesso!", "success"); // Success type
      
      const clientsInStore = store.getState().clients.clients;
      expect(clientsInStore.some(c => c.cliente === "NOVO CLIENTE TESTE")).toBe(true);
    });

     it('fills latitude and longitude on paste (testing ClientForm directly)', async () => {
        const user = userEvent.setup();
        render(
           <Modal title="Test Form" onClose={vi.fn()}>
             <ClientForm onFinished={mockOnFinished} addNotification={mockAddNotificationGlobal} />
           </Modal>, { preloadedState: { clients: { clients: [] } } }
        );

        const latInput = screen.getByPlaceholderText(/Latitude Final/i) as HTMLInputElement;
        const lonInput = screen.getByPlaceholderText(/Longitude Final/i) as HTMLInputElement;
        const pastedText = "-23.5505, -46.6333";

        await act(async () => {
            latInput.focus(); 
            const originalClipboard = navigator.clipboard;
            // @ts-ignore
            navigator.clipboard = {
                ...originalClipboard,
                readText: vi.fn().mockResolvedValue(pastedText), 
                writeText: vi.fn().mockResolvedValue(undefined), 
            };
            fireEvent.paste(latInput, { clipboardData: { getData: () => pastedText } });
            // @ts-ignore
            navigator.clipboard = originalClipboard;
        });
        
        await waitFor(() => {
            expect(latInput.value).toBe("-23.5505");
            expect(lonInput.value).toBe("-46.6333");
        });
    });
  });

   describe('ClientDetailPage', () => {
    it('renders client details and associated hotels', () => {
      const testClient = mockClients[0];
      const clientHotels = INITIAL_MOCK_DATA.hoteis.filter(h => h.client_id === testClient.id);

      render(
        <ClientModule onNavigateToRequest={vi.fn()} addNotification={mockAddNotificationGlobal} />, 
        { 
          route: `/clients/${testClient.id}`,
          preloadedState: { 
            clients: { clients: mockClients },
            hotels: { hotels: INITIAL_MOCK_DATA.hoteis },
            routes: { rotas: INITIAL_MOCK_DATA.rotas }
          }
        }
      );

      expect(screen.getByRole('heading', { name: new RegExp(testClient.cliente, 'i') })).toBeInTheDocument();
      expect(screen.getByText(new RegExp(testClient.cidade, 'i'))).toBeInTheDocument();
      
      if (clientHotels.length > 0) {
        expect(screen.getByRole('heading', { name: /Hotéis Cadastrados \(\d+\)/i })).toBeInTheDocument();
        clientHotels.forEach(hotel => {
          expect(screen.getByText(new RegExp(hotel.hotel, 'i'))).toBeInTheDocument();
        });
      } else {
        expect(screen.getByText(/Nenhum hotel cadastrado para este cliente/i)).toBeInTheDocument();
      }
    });

    it('navigates to /clients if client is not found', async () => {
        render( 
            <ClientModule onNavigateToRequest={vi.fn()} addNotification={mockAddNotificationGlobal} />, 
            { 
              route: `/clients/nonexistentclient`,
              preloadedState: { 
                clients: { clients: mockClients },
                hotels: { hotels: INITIAL_MOCK_DATA.hoteis },
                routes: { rotas: INITIAL_MOCK_DATA.rotas },
                navigation: { prefilledRequest: null }
              }
            }
        );
        
        await waitFor(() => {
            expect(mockAddNotificationGlobal).toHaveBeenCalledWith("Cliente não encontrado. Retornando para a lista.", "error");
        });
        await waitFor(() => {
             expect(screen.getByRole('heading', { name: /Clientes \(\d+\)/i })).toBeInTheDocument();
        });

    });
  });
});