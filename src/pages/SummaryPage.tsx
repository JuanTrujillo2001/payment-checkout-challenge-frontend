import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Package, Truck, Shield } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { createTransactionFromCart } from '../services/api';

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

export default function SummaryPage() {
  const navigate = useNavigate();
  const { sessionId, cart, customer, delivery, setTransaction } = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!cart || cart.items.length === 0 || !customer || !delivery) {
    navigate('/');
    return null;
  }

  const handleCreateTransaction = async () => {
    setLoading(true);
    setError(null);

    try {
      const transaction = await createTransactionFromCart({
        session_id: sessionId,
        customer,
        delivery,
      });
      setTransaction(transaction);
      navigate('/checkout/payment');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Error al crear la transacción');
      } else {
        setError('Error al crear la transacción');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/checkout/customer')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver a datos
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Resumen de tu pedido</h1>
            <p className="text-gray-400 text-sm">Paso 2 de 3</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-400" />
              Productos ({cart.items_count} {cart.items_count === 1 ? 'item' : 'items'})
            </h2>
            <div className="space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.product_name}</p>
                    <p className="text-gray-400 text-sm">Cantidad: {item.quantity}</p>
                  </div>
                  <p className="text-lg font-semibold text-purple-400">{formatPrice(item.subtotal_cents)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Truck className="w-5 h-5 text-purple-400" />
              Envío
            </h2>
            <div className="text-gray-300">
              <p>{customer.full_name}</p>
              <p className="text-gray-400">{delivery.address}</p>
              <p className="text-gray-400">{delivery.city}, {delivery.country}</p>
              <p className="text-gray-400 mt-2">{customer.email}</p>
              <p className="text-gray-400">{customer.phone}</p>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold mb-4">Desglose del pago</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{formatPrice(cart.subtotal_cents)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Tarifa base</span>
                <span>{formatPrice(cart.base_fee_cents)}</span>
              </div>
              <div className="flex justify-between text-gray-300">
                <span>Envío</span>
                <span>{formatPrice(cart.delivery_fee_cents)}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="text-purple-400">{formatPrice(cart.total_cents)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 flex items-center gap-3">
            <Shield className="w-6 h-6 text-green-400 flex-shrink-0" />
            <p className="text-sm text-gray-400">
              Tu pago será procesado de forma segura a través de Wompi. 
              No almacenamos los datos de tu tarjeta.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
              {error}
            </div>
          )}

          <button
            onClick={handleCreateTransaction}
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                Creando orden...
              </>
            ) : (
              <>
                <CreditCard className="w-5 h-5" />
                Continuar al pago
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
