import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, CheckCircle, XCircle, Clock, Package } from 'lucide-react';
import { getTransactionByReference, type OrderLookupResult } from '../services/api';

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('es-CO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export default function OrderLookupPage() {
  const navigate = useNavigate();
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderLookupResult | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reference.trim()) return;

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const result = await getTransactionByReference(reference.trim().toUpperCase());
      setOrder(result);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          setError('No se encontró ningún pedido con esa referencia');
        } else {
          setError('Error al buscar el pedido');
        }
      } else {
        setError('Error al buscar el pedido');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    const s = status.toUpperCase();
    if (s === 'APPROVED') {
      return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', label: 'Aprobado' };
    }
    if (s === 'DECLINED' || s === 'ERROR' || s === 'VOIDED') {
      return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/20', label: 'Rechazado' };
    }
    return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Pendiente' };
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a la tienda
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Consultar pedido</h1>
            <p className="text-gray-400 text-sm">Ingresa tu número de referencia</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Ej: TX-2026-0001"
              className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:border-purple-500 focus:outline-none font-mono uppercase"
            />
            <button
              type="submit"
              disabled={loading || !reference.trim()}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg font-medium flex items-center gap-2 transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Buscar
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400 mb-6">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-gray-400 text-sm">Referencia</p>
                  <p className="text-xl font-mono font-bold">{order.reference}</p>
                </div>
                {(() => {
                  const statusInfo = getStatusInfo(order.wompi_status || order.status);
                  const StatusIcon = statusInfo.icon;
                  return (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bg}`}>
                      <StatusIcon className={`w-5 h-5 ${statusInfo.color}`} />
                      <span className={`font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                    </div>
                  );
                })()}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Fecha de pedido</p>
                  <p>{order.created_at ? formatDate(order.created_at) : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-gray-400">Total</p>
                  <p className="text-purple-400 font-semibold">{formatPrice(order.total_cents)}</p>
                </div>
                {order.finalized_at && (
                  <div>
                    <p className="text-gray-400">Fecha de pago</p>
                    <p>{formatDate(order.finalized_at)}</p>
                  </div>
                )}
                {order.wompi_transaction_id && (
                  <div className={order.finalized_at ? '' : 'col-span-2'}>
                    <p className="text-gray-400">ID Wompi</p>
                    <p className="font-mono text-sm">{order.wompi_transaction_id}</p>
                  </div>
                )}
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Productos ({order.items.length})
                </h2>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.product_name}</p>
                        <p className="text-gray-400 text-sm">
                          {item.quantity} x {formatPrice(item.price_cents)}
                        </p>
                      </div>
                      <p className="text-purple-400 font-semibold">{formatPrice(item.subtotal_cents)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.customer && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h2 className="text-lg font-semibold mb-4">Cliente</h2>
                <div className="space-y-2 text-sm">
                  <p>{order.customer.full_name}</p>
                  <p className="text-gray-400">{order.customer.email}</p>
                </div>
              </div>
            )}

            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4">Desglose</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>{formatPrice(order.amount_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tarifa base</span>
                  <span>{formatPrice(order.base_fee_cents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Envío</span>
                  <span>{formatPrice(order.delivery_fee_cents)}</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-purple-400">{formatPrice(order.total_cents)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {!order && !error && !loading && (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Ingresa tu número de referencia para consultar el estado de tu pedido</p>
            <p className="text-sm mt-2">El formato es: TX-YYYY-NNNN</p>
          </div>
        )}
      </main>
    </div>
  );
}
