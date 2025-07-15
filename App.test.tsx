

// App.test.tsx
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, act, findByRole } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App'; // Adjust path if App.tsx is elsewhere
import { render } from './test-utils'; // Custom render (corrected import)


// Mock useNotification to prevent errors during tests
// No longer needed as the custom render provides the context
/*
vi.mock('./App', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useNotification: () => vi.fn(), // Simple mock for addNotification
  };
});
*/

describe('App Component', () => {
  it('renders the main page by default', () => {
    render(<App />);
    expect(screen.getByText(/Bem-vindo ao Sistema Matriz/i)).toBeInTheDocument();
  });

  it('renders Navbar', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument(); // Navbar is a <header>
    expect(screen.getByText('Matriz')).toBeInTheDocument();
  });

  it('navigates to Clients page when "Clientes" link is clicked', async () => {
    render(<App />);
    const user = userEvent.setup();
    
    // Find the "Clientes" link. It might be nested.
    // Ensure the link is visible before clicking, especially with responsive designs.
    const clientsLink = screen.getAllByRole('link', { name: /clientes/i }).find(link => {
        // This checks if the link is part of the main navigation, not a card link
        return (link.closest('nav') || link.closest('header'));
    });
    expect(clientsLink).toBeInTheDocument();

    if (clientsLink) {
        await act(async () => {
         await user.click(clientsLink);
        });
        // Check for an element unique to the ClientModule's ClientListPage
        expect(screen.getByRole('heading', { name: /Clientes \(\d+\)/i })).toBeInTheDocument();
    }
  });

  it('navigates to "Solicitações de Hotéis" page when "Solicitações" link is clicked', async () => {
    render(<App />);
    const user = userEvent.setup();
    
    const requestsLink = screen.getByRole('link', { name: /solicitações/i });
    await user.click(requestsLink);

    expect(screen.getByRole('heading', { name: /Solicitações de Hotéis/i })).toBeInTheDocument();
  });

  it('navigates to Colaboradores page when "Colaboradores" link is clicked', async () => {
    render(<App />);
    const user = userEvent.setup();

    const collabLink = await screen.findByRole('link', { name: /colaboradores/i });
    await user.click(collabLink);

    expect(screen.getByRole('heading', { name: /Colaboradores/i })).toBeInTheDocument();
  });


  it('opens the Settings panel when Settings icon is clicked', async () => {
    render(<App />);
    const user = userEvent.setup();
    const settingsButton = screen.getByRole('button', { name: /configurações/i });
    expect(settingsButton).toBeInTheDocument();

    await user.click(settingsButton);
    expect(await screen.findByRole('heading', { name: /Configurações/i })).toBeInTheDocument();
  });

  it('shows back button on a sub-page and navigates back', async () => {
    render(<App />, { route: '/clients/client_1'});
    const user = userEvent.setup();
    
    // Check if client detail page loads (or a part of it, since client_1 might not exist in default mock)
    // For this test, let's assume navigating to /clients first, then to a detail if possible,
    // or directly test the back button presence if the route is set.
    
    const backButton = screen.getByRole('button', { name: /voltar/i });
    expect(backButton).toBeInTheDocument();

    await act(async () => {
        await user.click(backButton);
    });
    // Should navigate back to /clients (or / if coming from direct /clients/client_1)
    // If we started at /clients/client_1, going back takes to /
     expect(screen.getByText(/Bem-vindo ao Sistema Matriz/i)).toBeInTheDocument();
  });
});