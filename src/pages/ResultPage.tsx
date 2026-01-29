import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Home, RefreshCw } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { getTransactionStatus } from '../services/api';

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function ResultPage() {
  const navigate = useNavigate();
  const { transaction, updateTransaction, reset } = useCheckout();
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!transaction) {
      navigate('/');
    }
  }, [transaction, navigate]);

  if (!transaction) {
    return null;
  }

  const status = transaction.wompi_status || transaction.status.toUpperCase();
  const isApproved = status === 'APPROVED';
  const isDeclined = status === 'DECLINED' || status === 'ERROR' || status === 'VOIDED';
  const isPending = status === 'PENDING';

  const checkStatus = async () => {
    setChecking(true);
    try {
      const updated = await getTransactionStatus(transaction.transaction_id);
      updateTransaction(updated);
    } catch (err) {
      console.error('Error checking status:', err);
    } finally {
      setChecking(false);
    }
  };

  const handleGoHome = () => {
    reset();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700 text-center">
          {isApproved && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <h1 className="text-2xl font-bold text-green-400 mb-2">¡Pago exitoso!</h1>
              <p className="text-gray-400 mb-6">Tu pedido ha sido confirmado</p>
            </>
          )}

          {isDeclined && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">Pago rechazado</h1>
              <p className="text-gray-400 mb-6">No se pudo procesar tu pago</p>
            </>
          )}

          {isPending && (
            <>
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-12 h-12 text-yellow-500" />
              </div>
              <h1 className="text-2xl font-bold text-yellow-400 mb-2">Pago pendiente</h1>
              <p className="text-gray-400 mb-6">Tu pago está siendo procesado</p>
            </>
          )}

          <div className="bg-gray-700/50 rounded-xl p-4 mb-6 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Referencia</span>
                <span className="font-mono">{transaction.reference}</span>
              </div>
              {transaction.items && transaction.items.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Productos</span>
                  <span>{transaction.items.length} {transaction.items.length === 1 ? 'item' : 'items'}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-400">Total</span>
                <span className="font-semibold text-purple-400">
                  {formatPrice(transaction.total_cents)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Estado</span>
                <span className={`font-medium ${
                  isApproved ? 'text-green-400' : 
                  isDeclined ? 'text-red-400' : 'text-yellow-400'
                }`}>
                  {isApproved ? 'Aprobado' : isDeclined ? 'Rechazado' : 'Pendiente'}
                </span>
              </div>
              {transaction.wompi_transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-400">ID Wompi</span>
                  <span className="font-mono text-sm">{transaction.wompi_transaction_id}</span>
                </div>
              )}
              {transaction.finalized_at && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Fecha</span>
                  <span>{new Date(transaction.finalized_at).toLocaleString('es-CO')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {isPending && (
              <button
                onClick={checkStatus}
                disabled={checking}
                className="w-full py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-800 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                {checking ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    Verificar estado
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleGoHome}
              className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-5 h-5" />
              Volver al inicio
            </button>
          </div>
        </div>

        {isApproved && (
          <p className="text-center text-gray-500 text-sm mt-6">
            Recibirás un correo de confirmación con los detalles de tu pedido.
          </p>
        )}

        {isDeclined && (
          <p className="text-center text-gray-500 text-sm mt-6">
            Puedes intentar con otra tarjeta o contactar a tu banco.
          </p>
        )}
      </div>
    </div>
  );
}
