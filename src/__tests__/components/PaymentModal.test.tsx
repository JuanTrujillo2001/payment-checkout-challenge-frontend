import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import PaymentModal from '../../components/PaymentModal';
import type { Cart } from '../../types';
import * as api from '../../services/api';

vi.mock('../../services/api');

// =============================================================================
// Test Data
// =============================================================================

const createMockCart = (overrides?: Partial<Cart>): Cart => ({
  session_id: 'test-session',
  items: [
    {
      id: '1',
      product_id: 'prod-1',
      product_name: 'Gaming Mouse Pro',
      product_description: 'High precision mouse',
      price_cents: 15000000,
      quantity: 1,
      subtotal_cents: 15000000,
      stock: 10,
    },
  ],
  items_count: 1,
  subtotal_cents: 15000000,
  base_fee_cents: 500000,
  delivery_fee_cents: 1000000,
  total_cents: 16500000,
  ...overrides,
});

const validFormData = {
  cardNumber: '4242424242424242',
  cardHolder: 'JUAN PEREZ',
  expMonth: '12',
  expYear: '28',
  cvc: '123',
  fullName: 'Juan Pérez',
  identityDocument: '1234567890',
  email: 'juan@email.com',
  phone: '3001234567',
  address: 'Calle 123 #45-67',
  city: 'Bogotá',
};

// =============================================================================
// Helper Functions
// =============================================================================

interface RenderModalOptions {
  isOpen?: boolean;
  cart?: Cart;
  sessionId?: string;
  onClose?: Mock;
  onSuccess?: Mock;
  onError?: Mock;
}

const renderModal = (options: RenderModalOptions = {}) => {
  const defaultProps = {
    isOpen: true,
    cart: createMockCart(),
    sessionId: 'test-session',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
  };

  const props = { ...defaultProps, ...options };

  const result = render(
    <PaymentModal
      isOpen={props.isOpen}
      onClose={props.onClose}
      cart={props.cart}
      sessionId={props.sessionId}
      onSuccess={props.onSuccess}
      onError={props.onError}
    />
  );

  return { ...result, props };
};

const fillCardForm = () => {
  fireEvent.change(screen.getByPlaceholderText('4242 4242 4242 4242'), {
    target: { value: validFormData.cardNumber },
  });
  fireEvent.change(screen.getByPlaceholderText('JUAN PEREZ'), {
    target: { value: validFormData.cardHolder },
  });
  fireEvent.change(screen.getByPlaceholderText('12'), {
    target: { value: validFormData.expMonth },
  });
  fireEvent.change(screen.getByPlaceholderText('28'), {
    target: { value: validFormData.expYear },
  });
  fireEvent.change(screen.getByPlaceholderText('123'), {
    target: { value: validFormData.cvc },
  });
};

const fillCustomerForm = () => {
  fireEvent.change(screen.getByPlaceholderText('Juan Pérez'), {
    target: { value: validFormData.fullName },
  });
  fireEvent.change(screen.getByPlaceholderText('1234567890'), {
    target: { value: validFormData.identityDocument },
  });
  fireEvent.change(screen.getByPlaceholderText('juan@email.com'), {
    target: { value: validFormData.email },
  });
  fireEvent.change(screen.getByPlaceholderText('3001234567'), {
    target: { value: validFormData.phone },
  });
};

const fillDeliveryForm = () => {
  fireEvent.change(screen.getByPlaceholderText('Calle 123 #45-67'), {
    target: { value: validFormData.address },
  });
  fireEvent.change(screen.getByPlaceholderText('Bogotá'), {
    target: { value: validFormData.city },
  });
};

const fillAllForms = () => {
  fillCardForm();
  fillCustomerForm();
  fillDeliveryForm();
};

// =============================================================================
// Tests
// =============================================================================

describe('PaymentModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders nothing when closed', () => {
      const { container } = renderModal({ isOpen: false });
      expect(container.firstChild).toBeNull();
    });

    it('renders modal when open', () => {
      renderModal();
      expect(screen.getByText('Pagar con tarjeta')).toBeInTheDocument();
    });

    it('shows cart summary', () => {
      renderModal();
      expect(screen.getByText(/Tu carrito/)).toBeInTheDocument();
      expect(screen.getByText(/Gaming Mouse Pro/)).toBeInTheDocument();
    });

    it('shows card form section', () => {
      renderModal();
      expect(screen.getByText('Datos de la tarjeta')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('4242 4242 4242 4242')).toBeInTheDocument();
    });

    it('shows customer form section', () => {
      renderModal();
      expect(screen.getByText('Datos del cliente')).toBeInTheDocument();
    });

    it('shows delivery form section', () => {
      renderModal();
      expect(screen.getByText('Datos de envío')).toBeInTheDocument();
    });

    it('shows continue button', () => {
      renderModal();
      expect(screen.getByText('Continuar al resumen')).toBeInTheDocument();
    });
  });

  describe('Card Input', () => {
    it('formats card number with spaces', () => {
      renderModal();
      const input = screen.getByPlaceholderText('4242 4242 4242 4242');
      fireEvent.change(input, { target: { value: '4111111111111111' } });
      expect((input as HTMLInputElement).value).toBe('4111 1111 1111 1111');
    });

    it('detects Visa card', () => {
      renderModal();
      const input = screen.getByPlaceholderText('4242 4242 4242 4242');
      fireEvent.change(input, { target: { value: '4242424242424242' } });
      expect(screen.getByText('VISA')).toBeInTheDocument();
    });

    it('detects Mastercard', () => {
      renderModal();
      const input = screen.getByPlaceholderText('4242 4242 4242 4242');
      fireEvent.change(input, { target: { value: '5111111111111118' } });
      expect(screen.getByText('MC')).toBeInTheDocument();
    });

    it('limits month to 2 digits', () => {
      renderModal();
      const input = screen.getByPlaceholderText('12');
      fireEvent.change(input, { target: { value: '123' } });
      expect((input as HTMLInputElement).value).toBe('12');
    });

    it('limits CVC to 4 digits', () => {
      renderModal();
      const input = screen.getByPlaceholderText('123');
      fireEvent.change(input, { target: { value: '12345' } });
      expect((input as HTMLInputElement).value).toBe('1234');
    });
  });

  describe('Form Validation', () => {
    it('shows error for invalid card number', () => {
      renderModal();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      expect(screen.getByText('Número de tarjeta inválido')).toBeInTheDocument();
    });

    it('does not advance to summary with empty form', () => {
      renderModal();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      // Should still be on card step
      expect(screen.getByText('Pagar con tarjeta')).toBeInTheDocument();
      expect(screen.queryByText('Confirmar pago')).not.toBeInTheDocument();
    });

    it('validates all required fields before advancing', () => {
      renderModal();
      // Only fill card, not customer or delivery
      fillCardForm();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      // Should still be on card step due to missing fields
      expect(screen.getByText('Pagar con tarjeta')).toBeInTheDocument();
    });
  });

  describe('Navigation Flow', () => {
    it('advances to summary when form is valid', () => {
      renderModal();
      fillAllForms();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      
      expect(screen.getByText('Confirmar pago')).toBeInTheDocument();
      expect(screen.getByText('Desglose')).toBeInTheDocument();
    });

    it('shows back button in summary step', () => {
      renderModal();
      fillAllForms();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      
      expect(screen.getByText('Volver')).toBeInTheDocument();
    });

    it('returns to card step when clicking back', () => {
      renderModal();
      fillAllForms();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      fireEvent.click(screen.getByText('Volver'));
      
      expect(screen.getByText('Pagar con tarjeta')).toBeInTheDocument();
    });

    it('shows payment button with total in summary', () => {
      renderModal();
      fillAllForms();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      
      expect(screen.getByText(/Pagar.*165[.,]000/)).toBeInTheDocument();
    });
  });

  describe('Payment Flow', () => {
    it('calls API and onSuccess on successful payment', async () => {
      const mockTransaction = {
        transaction_id: 'tx-123',
        reference: 'TX-2026-0001',
        status: 'approved',
        total_cents: 16500000,
        wompi_status: 'APPROVED',
      };

      vi.mocked(api.createTransactionFromCart).mockResolvedValue(mockTransaction as any);
      vi.mocked(api.processPayment).mockResolvedValue(mockTransaction as any);

      const { props } = renderModal();
      fillAllForms();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      fireEvent.click(screen.getByText(/Pagar.*165[.,]000/));

      // Should show processing state
      await waitFor(() => {
        expect(screen.getByText('Procesando pago...')).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(api.createTransactionFromCart).toHaveBeenCalledWith({
          session_id: 'test-session',
          customer: expect.objectContaining({
            full_name: validFormData.fullName,
            email: validFormData.email,
          }),
          delivery: expect.objectContaining({
            address: validFormData.address,
            city: validFormData.city,
          }),
        });
      });

      await waitFor(() => {
        expect(props.onSuccess).toHaveBeenCalledWith(
          expect.objectContaining({
            transaction_id: 'tx-123',
            reference: 'TX-2026-0001',
          })
        );
      });
    });

    it('calls onError on API failure', async () => {
      const error = {
        response: {
          data: { message: 'Card declined' },
        },
      };

      vi.mocked(api.createTransactionFromCart).mockRejectedValue(error);

      const { props } = renderModal();
      fillAllForms();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      fireEvent.click(screen.getByText(/Pagar.*165[.,]000/));

      await waitFor(() => {
        expect(props.onError).toHaveBeenCalledWith('Card declined');
      });
    });

    it('calls onError with generic message on unknown error', async () => {
      vi.mocked(api.createTransactionFromCart).mockRejectedValue(new Error('Network error'));

      const { props } = renderModal();
      fillAllForms();
      fireEvent.click(screen.getByText('Continuar al resumen'));
      fireEvent.click(screen.getByText(/Pagar.*165[.,]000/));

      await waitFor(() => {
        expect(props.onError).toHaveBeenCalledWith('Error al procesar el pago');
      });
    });
  });

  describe('Modal Behavior', () => {
    it('resets form when reopened', () => {
      const { rerender, props } = renderModal();

      const cardInput = screen.getByPlaceholderText('4242 4242 4242 4242');
      fireEvent.change(cardInput, { target: { value: '4242424242424242' } });

      // Close modal
      rerender(
        <PaymentModal
          isOpen={false}
          onClose={props.onClose}
          cart={props.cart}
          sessionId={props.sessionId}
          onSuccess={props.onSuccess}
          onError={props.onError}
        />
      );

      // Reopen modal
      rerender(
        <PaymentModal
          isOpen={true}
          onClose={props.onClose}
          cart={props.cart}
          sessionId={props.sessionId}
          onSuccess={props.onSuccess}
          onError={props.onError}
        />
      );

      const newCardInput = screen.getByPlaceholderText('4242 4242 4242 4242');
      expect((newCardInput as HTMLInputElement).value).toBe('');
    });
  });
});
