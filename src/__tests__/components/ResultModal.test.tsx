import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import ResultModal from '../../components/ResultModal';
import type { PaymentResult } from '../../components/PaymentModal';
import * as api from '../../services/api';

vi.mock('../../services/api');

const mockResult: PaymentResult = {
  transaction_id: 'tx-123',
  reference: 'TX-2026-001',
  status: 'approved',
  wompi_status: 'APPROVED',
  total_cents: 150000,
};

describe('ResultModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <ResultModal isOpen={false} onClose={vi.fn()} result={null} error={null} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders approved state correctly', () => {
    render(
      <ResultModal isOpen={true} onClose={vi.fn()} result={mockResult} error={null} />
    );

    expect(screen.getByText('¡Pago exitoso!')).toBeInTheDocument();
    expect(screen.getByText('Tu pedido ha sido confirmado')).toBeInTheDocument();
    expect(screen.getByText('Volver a la tienda')).toBeInTheDocument();
  });

  it('renders declined state correctly', () => {
    const declinedResult: PaymentResult = {
      ...mockResult,
      status: 'declined',
      wompi_status: 'DECLINED',
    };

    render(
      <ResultModal isOpen={true} onClose={vi.fn()} result={declinedResult} error={null} />
    );

    expect(screen.getByText('Pago rechazado')).toBeInTheDocument();
    expect(screen.getByText('No se pudo procesar tu pago')).toBeInTheDocument();
  });

  it('renders pending state correctly', () => {
    const pendingResult: PaymentResult = {
      ...mockResult,
      status: 'pending',
      wompi_status: 'PENDING',
    };

    render(
      <ResultModal isOpen={true} onClose={vi.fn()} result={pendingResult} error={null} />
    );

    expect(screen.getByText('Pago pendiente')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    render(
      <ResultModal 
        isOpen={true} 
        onClose={vi.fn()} 
        result={null} 
        error="Payment failed" 
      />
    );

    expect(screen.getByText('Error en el pago')).toBeInTheDocument();
  });

  it('shows test cards when tokenization error', () => {
    render(
      <ResultModal 
        isOpen={true} 
        onClose={vi.fn()} 
        result={null} 
        error="Card tokenization failed" 
      />
    );

    expect(screen.getByText('Tarjetas de prueba válidas:')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <ResultModal isOpen={true} onClose={onClose} result={mockResult} error={null} />
    );

    fireEvent.click(screen.getByText('Volver a la tienda'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose when backdrop clicked', () => {
    const onClose = vi.fn();
    render(
      <ResultModal isOpen={true} onClose={onClose} result={mockResult} error={null} />
    );

    const backdrop = document.querySelector('.bg-black\\/70');
    if (backdrop) {
      fireEvent.click(backdrop);
      expect(onClose).toHaveBeenCalled();
    }
  });

  it('formats price correctly', () => {
    render(
      <ResultModal isOpen={true} onClose={vi.fn()} result={mockResult} error={null} />
    );

    // 150000 cents = $1,500 COP
    expect(screen.getByText(/\$\s*1[.,]500/)).toBeInTheDocument();
  });

  it('shows reference save message when approved', () => {
    render(
      <ResultModal isOpen={true} onClose={vi.fn()} result={mockResult} error={null} />
    );

    expect(screen.getByText(/Guarda tu referencia/)).toBeInTheDocument();
  });

  it('polls for status when pending', async () => {
    const pendingResult: PaymentResult = {
      ...mockResult,
      status: 'pending',
      wompi_status: 'PENDING',
    };

    const approvedStatus = {
      transaction_id: 'tx-123',
      reference: 'TX-2026-001',
      status: 'approved',
      wompi_status: 'APPROVED',
      total_cents: 150000,
      amount_cents: 100000,
      base_fee_cents: 5000,
      delivery_fee_cents: 10000,
    };

    vi.mocked(api.getTransactionStatus).mockResolvedValue(approvedStatus);

    const onStatusUpdate = vi.fn();

    render(
      <ResultModal 
        isOpen={true} 
        onClose={vi.fn()} 
        result={pendingResult} 
        error={null}
        onStatusUpdate={onStatusUpdate}
      />
    );

    await waitFor(() => {
      expect(api.getTransactionStatus).toHaveBeenCalledWith('tx-123');
    }, { timeout: 3000 });
  });
});
