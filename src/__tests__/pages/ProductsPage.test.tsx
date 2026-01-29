import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import ProductsPage from '../../pages/ProductsPage';
import { CheckoutProvider } from '../../context/CheckoutContext';
import * as api from '../../services/api';

vi.mock('../../services/api');

// =============================================================================
// Test Data
// =============================================================================

const mockProducts = [
  {
    id: 'prod-1',
    name: 'Gaming Mouse Pro',
    description: 'High precision gaming mouse',
    price_cents: 15000000,
    stock: 10,
  },
  {
    id: 'prod-2',
    name: 'Gaming Mouse Lite',
    description: 'Budget gaming mouse',
    price_cents: 8000000,
    stock: 0,
  },
];

const createMockCart = (itemsCount = 0) => ({
  session_id: 'test-session',
  items: [],
  items_count: itemsCount,
  subtotal_cents: 0,
  base_fee_cents: 500,
  delivery_fee_cents: 1000,
  total_cents: 1500,
});

// =============================================================================
// Helper Functions
// =============================================================================

const renderProductsPage = () => {
  return render(
    <BrowserRouter>
      <CheckoutProvider>
        <ProductsPage />
      </CheckoutProvider>
    </BrowserRouter>
  );
};


// =============================================================================
// Tests
// =============================================================================

describe('ProductsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.getProducts).mockResolvedValue(mockProducts);
    vi.mocked(api.getCart).mockResolvedValue(createMockCart());
  });

  it('shows loading state initially', () => {
    vi.mocked(api.getProducts).mockImplementation(() => new Promise(() => {}));
    
    renderProductsPage();
    
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders products after loading', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
    });

    expect(screen.getByText('Gaming Mouse Lite')).toBeInTheDocument();
    expect(screen.getByText('High precision gaming mouse')).toBeInTheDocument();
  });

  it('shows error state when fetch fails', async () => {
    vi.mocked(api.getProducts).mockRejectedValue(new Error('Network error'));

    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('Error al cargar los productos')).toBeInTheDocument();
    });

    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('shows out of stock for products with 0 stock', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getAllByText('Agotado').length).toBeGreaterThan(0);
    });
  });

  it('shows available stock count', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('10 disponibles')).toBeInTheDocument();
    });
  });

  it('formats prices correctly', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText(/\$\s*150[.,]000/)).toBeInTheDocument();
    });
  });

  it('shows cart button with item count', async () => {
    vi.mocked(api.getCart).mockResolvedValue(createMockCart(3));

    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('3')).toBeInTheDocument();
    });
  });

  it('calls addToCart when add button clicked', async () => {
    vi.mocked(api.addToCart).mockResolvedValue(undefined);

    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
    });

    const addButtons = screen.getAllByText('Agregar al carrito');
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(api.addToCart).toHaveBeenCalled();
    });
  });

  it('disables add button for out of stock products', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getAllByText('Agotado').length).toBeGreaterThan(0);
    });

    const agotadoButtons = screen.getAllByText('Agotado');
    const agotadoButton = agotadoButtons.find(el => el.closest('button'));
    expect(agotadoButton?.closest('button')).toBeDisabled();
  });

  it('shows header with store name', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText('Pulsar Gaming Store')).toBeInTheDocument();
    });
  });

  it('shows product count', async () => {
    renderProductsPage();

    await waitFor(() => {
      expect(screen.getByText(/Productos disponibles \(2\)/)).toBeInTheDocument();
    });
  });
});
