import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import CartPage from '../../pages/CartPage';
import { CheckoutProvider } from '../../context/CheckoutContext';
import * as api from '../../services/api';

vi.mock('../../services/api');

// =============================================================================
// Test Data
// =============================================================================

const createMockCart = (itemCount = 2) => ({
  session_id: 'test-session',
  items: [
    {
      id: '1',
      product_id: 'prod-1',
      product_name: 'Gaming Mouse Pro',
      product_description: 'High precision mouse',
      price_cents: 15000000,
      quantity: itemCount,
      subtotal_cents: 15000000 * itemCount,
      stock: 10,
    },
  ],
  items_count: itemCount,
  subtotal_cents: 15000000 * itemCount,
  base_fee_cents: 500000,
  delivery_fee_cents: 1000000,
  total_cents: 15000000 * itemCount + 1500000,
});

const emptyCart = {
  session_id: 'test-session',
  items: [],
  items_count: 0,
  subtotal_cents: 0,
  base_fee_cents: 0,
  delivery_fee_cents: 0,
  total_cents: 0,
};

// =============================================================================
// Helper Functions
// =============================================================================

const renderCartPage = () => {
  return render(
    <BrowserRouter>
      <CheckoutProvider>
        <CartPage />
      </CheckoutProvider>
    </BrowserRouter>
  );
};


// =============================================================================
// Tests
// =============================================================================

describe('CartPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  describe('Empty Cart', () => {
    beforeEach(() => {
      vi.mocked(api.getCart).mockResolvedValue(emptyCart);
    });

    it('shows empty cart message', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Tu carrito está vacío')).toBeInTheDocument();
      });
    });

    it('shows link to products', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Ver productos')).toBeInTheDocument();
      });
    });

    it('shows empty cart icon', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Agrega productos para continuar')).toBeInTheDocument();
      });
    });
  });

  describe('Cart with Items', () => {
    beforeEach(() => {
      vi.mocked(api.getCart).mockResolvedValue(createMockCart(2));
    });

    it('shows cart items', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
      });
    });

    it('shows product description', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('High precision mouse')).toBeInTheDocument();
      });
    });

    it('shows item quantity', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('shows order summary', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Resumen del pedido')).toBeInTheDocument();
      });
    });

    it('shows subtotal with item count', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText(/Subtotal.*2 items/)).toBeInTheDocument();
      });
    });

    it('shows base fee', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Tarifa base')).toBeInTheDocument();
      });
    });

    it('shows delivery fee', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Envío')).toBeInTheDocument();
      });
    });

    it('shows pay button', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Pagar con tarjeta')).toBeInTheDocument();
      });
    });

    it('shows back to store link', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Seguir comprando')).toBeInTheDocument();
      });
    });
  });

  describe('Quantity Controls', () => {
    beforeEach(() => {
      vi.mocked(api.getCart).mockResolvedValue(createMockCart(2));
      vi.mocked(api.updateCartItem).mockResolvedValue(undefined);
      vi.mocked(api.removeFromCart).mockResolvedValue(undefined);
    });

    it('shows plus and minus buttons', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
      });

      const buttons = document.querySelectorAll('button');
      const plusButton = Array.from(buttons).find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-plus')
      );
      const minusButton = Array.from(buttons).find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-minus')
      );

      expect(plusButton).toBeTruthy();
      expect(minusButton).toBeTruthy();
    });

    it('calls updateCartItem when increasing quantity', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
      });

      const buttons = document.querySelectorAll('button');
      const plusButton = Array.from(buttons).find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-plus')
      );

      if (plusButton) {
        fireEvent.click(plusButton);
        await waitFor(() => {
          expect(api.updateCartItem).toHaveBeenCalledWith(
            expect.any(String),
            'prod-1',
            3
          );
        });
      }
    });

    it('calls updateCartItem when decreasing quantity', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
      });

      const buttons = document.querySelectorAll('button');
      const minusButton = Array.from(buttons).find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-minus')
      );

      if (minusButton) {
        fireEvent.click(minusButton);
        await waitFor(() => {
          expect(api.updateCartItem).toHaveBeenCalledWith(
            expect.any(String),
            'prod-1',
            1
          );
        });
      }
    });

    it('shows trash button for removing items', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
      });

      const buttons = document.querySelectorAll('button');
      const trashButton = Array.from(buttons).find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );

      expect(trashButton).toBeTruthy();
    });

    it('calls removeFromCart when clicking trash', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
      });

      const buttons = document.querySelectorAll('button');
      const trashButton = Array.from(buttons).find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      );

      if (trashButton) {
        fireEvent.click(trashButton);
        await waitFor(() => {
          expect(api.removeFromCart).toHaveBeenCalledWith(
            expect.any(String),
            'prod-1'
          );
        });
      }
    });
  });

  describe('Remove on Zero Quantity', () => {
    beforeEach(() => {
      vi.mocked(api.getCart).mockResolvedValue(createMockCart(1));
      vi.mocked(api.removeFromCart).mockResolvedValue(undefined);
    });

    it('calls removeFromCart when quantity reaches zero', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
      });

      const buttons = document.querySelectorAll('button');
      const minusButton = Array.from(buttons).find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-minus')
      );

      if (minusButton) {
        fireEvent.click(minusButton);
        await waitFor(() => {
          expect(api.removeFromCart).toHaveBeenCalledWith(
            expect.any(String),
            'prod-1'
          );
        });
      }
    });
  });

  describe('Payment Modal', () => {
    beforeEach(() => {
      vi.mocked(api.getCart).mockResolvedValue(createMockCart(1));
    });

    it('opens payment modal when clicking pay button', async () => {
      renderCartPage();

      await waitFor(() => {
        expect(screen.getByText('Pagar con tarjeta')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Pagar con tarjeta'));

      await waitFor(() => {
        expect(screen.getByText('Datos de la tarjeta')).toBeInTheDocument();
      });
    });
  });
});
