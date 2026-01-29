import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, X, Loader2 } from 'lucide-react';
import type { PaymentResult } from './PaymentModal';
import { getTransactionStatus } from '../services/api';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PaymentResult | null;
  error: string | null;
  onStatusUpdate?: (newResult: PaymentResult) => void;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function ResultModal({ isOpen, onClose, result, error, onStatusUpdate }: ResultModalProps) {
  const [currentResult, setCurrentResult] = useState<PaymentResult | null>(result);
  const [isPolling, setIsPolling] = useState(false);

  // Sincronizar con prop result
  useEffect(() => {
    setCurrentResult(result);
  }, [result]);

  // Polling automático cuando está PENDING
  useEffect(() => {
    if (!isOpen || !currentResult?.transaction_id) return;

    const isApproved = currentResult.wompi_status?.toUpperCase() === 'APPROVED' || currentResult.status === 'approved';
    const isDeclined = currentResult.wompi_status?.toUpperCase() === 'DECLINED' || 
                       currentResult.wompi_status?.toUpperCase() === 'ERROR' ||
                       currentResult.status === 'declined';
    const isPending = !isApproved && !isDeclined;

    if (!isPending) return;

    setIsPolling(true);
    const pollInterval = setInterval(async () => {
      try {
        const status = await getTransactionStatus(currentResult.transaction_id);
        const newIsApproved = status.status === 'approved' || status.wompi_status?.toUpperCase() === 'APPROVED';
        const newIsDeclined = status.status === 'declined' || 
                              status.wompi_status?.toUpperCase() === 'DECLINED' ||
                              status.wompi_status?.toUpperCase() === 'ERROR';

        if (newIsApproved || newIsDeclined) {
          const updatedResult: PaymentResult = {
            ...currentResult,
            status: status.status,
            wompi_status: status.wompi_status,
          };
          setCurrentResult(updatedResult);
          setIsPolling(false);
          clearInterval(pollInterval);
          onStatusUpdate?.(updatedResult);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 2000); // Cada 2 segundos

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [isOpen, currentResult?.transaction_id, currentResult?.status, currentResult?.wompi_status, onStatusUpdate]);

  if (!isOpen) return null;

  const isApproved = currentResult?.wompi_status?.toUpperCase() === 'APPROVED' || currentResult?.status === 'approved';
  const isDeclined = currentResult?.wompi_status?.toUpperCase() === 'DECLINED' || 
                     currentResult?.wompi_status?.toUpperCase() === 'ERROR' ||
                     currentResult?.status === 'declined';
  const isPending = !isApproved && !isDeclined && !error;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative bg-gray-800 rounded-2xl w-full max-w-md mx-4 border border-gray-700 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="p-8 text-center">
          {error ? (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Error en el pago</h2>
              <p className="text-gray-400 mb-4">
                {error.toLowerCase().includes('tokenization') 
                  ? 'La tarjeta ingresada no es válida para el entorno de pruebas.'
                  : error}
              </p>
              {error.toLowerCase().includes('tokenization') && (
                <div className="bg-gray-700/50 rounded-lg p-4 mb-6 text-left text-sm">
                  <p className="text-gray-300 font-medium mb-2">Tarjetas de prueba válidas:</p>
                  <div className="space-y-1 font-mono text-gray-400">
                    <p>✓ <span className="text-green-400">4242 4242 4242 4242</span> (Visa - Aprobada)</p>
                    <p>✓ <span className="text-green-400">4111 1111 1111 1111</span> (Visa - Aprobada)</p>
                    <p>✗ <span className="text-red-400">4012 8888 8888 1881</span> (Visa - Rechazada)</p>
                  </div>
                  <p className="text-gray-500 text-xs mt-2">CVC: cualquier 3 dígitos • Fecha: cualquier fecha futura</p>
                </div>
              )}
            </>
          ) : isApproved ? (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-green-400 mb-2">¡Pago exitoso!</h2>
              <p className="text-gray-400 mb-6">Tu pedido ha sido confirmado</p>
            </>
          ) : isDeclined ? (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Pago rechazado</h2>
              <p className="text-gray-400 mb-6">No se pudo procesar tu pago</p>
            </>
          ) : isPending ? (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                {isPolling ? (
                  <Loader2 className="w-12 h-12 text-yellow-500 animate-spin" />
                ) : (
                  <Clock className="w-12 h-12 text-yellow-500" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">Pago pendiente</h2>
              <p className="text-gray-400 mb-6">
                {isPolling ? 'Verificando estado del pago...' : 'Tu pago está siendo procesado'}
              </p>
            </>
          ) : null}

          {result && (
            <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Referencia</span>
                  <span className="font-mono text-white">{result.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total</span>
                  <span className="font-semibold text-purple-400">
                    {formatPrice(result.total_cents)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Estado</span>
                  <span className={`font-medium flex items-center gap-2 ${
                    isApproved ? 'text-green-400' : 
                    isDeclined ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    {isApproved ? 'Aprobado' : isDeclined ? 'Rechazado' : 'Pendiente'}
                    {isPending && isPolling && <Loader2 className="w-4 h-4 animate-spin" />}
                  </span>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-white transition-colors"
          >
            {isApproved ? 'Volver a la tienda' : 'Cerrar'}
          </button>

          {isApproved && (
            <p className="text-gray-500 text-sm mt-4">
              Guarda tu referencia: <span className="font-mono">{result?.reference}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
