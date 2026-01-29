import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import OrderLookupPage from '../../pages/OrderLookupPage';
import * as api from '../../services/api';

vi.mock('../../services/api');

const mockOrder = {
  transaction_id: 'tx-123',
  reference: 'TX-2026-0001',
  status: 'approved',
  wompi_status: 'APPROVED',
  total_cents: 16500000,
  amount_cents: 15000000,
  base_fee_cents: 500000,
  delivery_fee_cents: 1000000,
  created_at: '2026-01-29T10:00:00Z',
  finalized_at: '2026-01-29T10:05:00Z',
  wompi_transaction_id: 'wompi-abc123',
  items: [
    {
      product_id: 'prod-1',
      product_name: 'Gaming Mouse Pro',
      quantity: 1,
      price_cents: 15000000,
      subtotal_cents: 15000000,
    },
  ],
  customer: {
    full_name: 'Juan Perez',
    email: 'juan@test.com',
  },
};

const renderPage = () => {
  return render(
    <BrowserRouter>
      <OrderLookupPage />
    </BrowserRouter>
  );
};

describe('OrderLookupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders search form', () => {
    renderPage();

    expect(screen.getByText('Consultar pedido')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: TX-2026-0001')).toBeInTheDocument();
    expect(screen.getByText('Buscar')).toBeInTheDocument();
  });

  it('shows initial empty state', () => {
    renderPage();

    expect(screen.getByText(/El formato es: TX-YYYY-NNNN/)).toBeInTheDocument();
  });

  it('shows back button', () => {
    renderPage();

    expect(screen.getByText('Volver a la tienda')).toBeInTheDocument();
  });

  it('disables search button when input is empty', () => {
    renderPage();

    const searchButton = screen.getByText('Buscar').closest('button');
    expect(searchButton).toBeDisabled();
  });

  it('enables search button when input has value', () => {
    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'TX-2026-0001' } });

    const searchButton = screen.getByText('Buscar').closest('button');
    expect(searchButton).not.toBeDisabled();
  });

  it('searches for order when form submitted', async () => {
    vi.mocked(api.getTransactionByReference).mockResolvedValue(mockOrder);

    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'TX-2026-0001' } });

    const form = input.closest('form');
    fireEvent.submit(form!);

    await waitFor(() => {
      expect(api.getTransactionByReference).toHaveBeenCalledWith('TX-2026-0001');
    });
  });

  it('displays order details when found', async () => {
    vi.mocked(api.getTransactionByReference).mockResolvedValue(mockOrder);

    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'TX-2026-0001' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('TX-2026-0001')).toBeInTheDocument();
    });

    expect(screen.getByText('Aprobado')).toBeInTheDocument();
    expect(screen.getByText('Gaming Mouse Pro')).toBeInTheDocument();
    expect(screen.getByText('Juan Perez')).toBeInTheDocument();
  });

  it('shows error when order not found', async () => {
    const error = { response: { status: 404 } };
    vi.mocked(api.getTransactionByReference).mockRejectedValue(error);

    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'TX-9999-9999' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('No se encontró ningún pedido con esa referencia')).toBeInTheDocument();
    });
  });

  it('shows generic error on API failure', async () => {
    vi.mocked(api.getTransactionByReference).mockRejectedValue(new Error('Network error'));

    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'TX-2026-0001' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Error al buscar el pedido')).toBeInTheDocument();
    });
  });

  it('shows declined status correctly', async () => {
    const declinedOrder = {
      ...mockOrder,
      status: 'declined',
      wompi_status: 'DECLINED',
    };
    vi.mocked(api.getTransactionByReference).mockResolvedValue(declinedOrder);

    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'TX-2026-0001' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Rechazado')).toBeInTheDocument();
    });
  });

  it('shows pending status correctly', async () => {
    const pendingOrder = {
      ...mockOrder,
      status: 'pending',
      wompi_status: 'PENDING',
    };
    vi.mocked(api.getTransactionByReference).mockResolvedValue(pendingOrder);

    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'TX-2026-0001' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
    });
  });

  it('converts reference to uppercase', async () => {
    vi.mocked(api.getTransactionByReference).mockResolvedValue(mockOrder);

    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'tx-2026-0001' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(api.getTransactionByReference).toHaveBeenCalledWith('TX-2026-0001');
    });
  });

  it('shows order breakdown', async () => {
    vi.mocked(api.getTransactionByReference).mockResolvedValue(mockOrder);

    renderPage();

    const input = screen.getByPlaceholderText('Ej: TX-2026-0001');
    fireEvent.change(input, { target: { value: 'TX-2026-0001' } });
    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(screen.getByText('Desglose')).toBeInTheDocument();
    });

    expect(screen.getByText('Subtotal')).toBeInTheDocument();
    expect(screen.getByText('Tarifa base')).toBeInTheDocument();
    expect(screen.getByText('Envío')).toBeInTheDocument();
  });
});
