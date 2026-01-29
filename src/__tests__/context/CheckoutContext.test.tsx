import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CheckoutProvider, useCheckout } from '../../context/CheckoutContext';
import * as api from '../../services/api';

vi.mock('../../services/api');

const mockCart = {
  session_id: 'test-session',
  items: [
    {
      id: '1',
      product_id: 'prod-1',
      product_name: 'Test Product',
      product_description: 'Description',
      price_cents: 10000,
      quantity: 2,
      subtotal_cents: 20000,
      stock: 10,
    },
  ],
  items_count: 2,
  subtotal_cents: 20000,
  base_fee_cents: 500,
  delivery_fee_cents: 1000,
  total_cents: 21500,
};

const TestComponent = () => {
  const {
    cart,
    customer,
    delivery,
    transaction,
    cartLoading,
    setCustomerData,
    setDeliveryData,
    setTransaction,
    updateTransaction,
  } = useCheckout();

  return (
    <div>
      <div data-testid="cart-loading">{cartLoading ? 'loading' : 'loaded'}</div>
      <div data-testid="cart-items">{cart?.items_count ?? 0}</div>
      <div data-testid="customer-name">{customer?.full_name ?? 'no-customer'}</div>
      <div data-testid="delivery-city">{delivery?.city ?? 'no-delivery'}</div>
      <div data-testid="transaction-status">{transaction?.status ?? 'no-transaction'}</div>
      <button
        data-testid="set-customer"
        onClick={() =>
          setCustomerData({
            full_name: 'John Doe',
            identity_document: 12345678,
            email: 'john@test.com',
            phone: '1234567890',
          })
        }
      >
        Set Customer
      </button>
      <button
        data-testid="set-delivery"
        onClick={() =>
          setDeliveryData({
            address: '123 Main St',
            city: 'Bogotá',
            country: 'CO',
          })
        }
      >
        Set Delivery
      </button>
      <button
        data-testid="set-transaction"
        onClick={() =>
          setTransaction({
            transaction_id: 'tx-1',
            reference: 'TX-001',
            status: 'PENDING',
            amount_cents: 10000,
            base_fee_cents: 500,
            delivery_fee_cents: 1000,
            total_cents: 11500,
          })
        }
      >
        Set Transaction
      </button>
      <button
        data-testid="update-transaction"
        onClick={() => updateTransaction({ status: 'APPROVED' })}
      >
        Update Transaction
      </button>
    </div>
  );
};

describe('CheckoutContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.mocked(api.getCart).mockResolvedValue(mockCart);
  });

  it('provides initial state', async () => {
    render(
      <CheckoutProvider>
        <TestComponent />
      </CheckoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cart-loading')).toHaveTextContent('loaded');
    });

    expect(screen.getByTestId('customer-name')).toHaveTextContent('no-customer');
    expect(screen.getByTestId('delivery-city')).toHaveTextContent('no-delivery');
    expect(screen.getByTestId('transaction-status')).toHaveTextContent('no-transaction');
  });

  it('fetches cart on mount', async () => {
    render(
      <CheckoutProvider>
        <TestComponent />
      </CheckoutProvider>
    );

    await waitFor(() => {
      expect(api.getCart).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(screen.getByTestId('cart-items')).toHaveTextContent('2');
    });
  });

  it('sets customer data', async () => {
    render(
      <CheckoutProvider>
        <TestComponent />
      </CheckoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cart-loading')).toHaveTextContent('loaded');
    });

    act(() => {
      screen.getByTestId('set-customer').click();
    });

    expect(screen.getByTestId('customer-name')).toHaveTextContent('John Doe');
  });

  it('sets delivery data', async () => {
    render(
      <CheckoutProvider>
        <TestComponent />
      </CheckoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cart-loading')).toHaveTextContent('loaded');
    });

    act(() => {
      screen.getByTestId('set-delivery').click();
    });

    expect(screen.getByTestId('delivery-city')).toHaveTextContent('Bogotá');
  });

  it('sets transaction', async () => {
    render(
      <CheckoutProvider>
        <TestComponent />
      </CheckoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cart-loading')).toHaveTextContent('loaded');
    });

    act(() => {
      screen.getByTestId('set-transaction').click();
    });

    expect(screen.getByTestId('transaction-status')).toHaveTextContent('PENDING');
  });

  it('updates transaction', async () => {
    render(
      <CheckoutProvider>
        <TestComponent />
      </CheckoutProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('cart-loading')).toHaveTextContent('loaded');
    });

    act(() => {
      screen.getByTestId('set-transaction').click();
    });

    expect(screen.getByTestId('transaction-status')).toHaveTextContent('PENDING');

    act(() => {
      screen.getByTestId('update-transaction').click();
    });

    expect(screen.getByTestId('transaction-status')).toHaveTextContent('APPROVED');
  });

  it('generates and stores session id in localStorage', async () => {
    render(
      <CheckoutProvider>
        <TestComponent />
      </CheckoutProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem('cart_session_id')).toBeTruthy();
    });
  });

  it('reuses existing session id from localStorage', async () => {
    localStorage.setItem('cart_session_id', 'existing-session-id');

    render(
      <CheckoutProvider>
        <TestComponent />
      </CheckoutProvider>
    );

    await waitFor(() => {
      expect(api.getCart).toHaveBeenCalledWith('existing-session-id');
    });
  });
});

describe('useCheckout hook', () => {
  it('throws error when used outside provider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestComponent />);
    }).toThrow('useCheckout must be used within a CheckoutProvider');

    consoleError.mockRestore();
  });
});
