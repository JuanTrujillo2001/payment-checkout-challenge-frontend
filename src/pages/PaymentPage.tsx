import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { processPayment } from '../services/api';

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function formatCardNumber(value: string): string {
  const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
  const matches = v.match(/\d{4,16}/g);
  const match = (matches && matches[0]) || '';
  const parts = [];
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4));
  }
  return parts.length ? parts.join(' ') : value;
}

export default function PaymentPage() {
  const navigate = useNavigate();
  const { transaction, updateTransaction } = useCheckout();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [cardData, setCardData] = useState({
    number: '',
    card_holder: '',
    exp_month: '',
    exp_year: '',
    cvc: '',
  });

  const [cardErrors, setCardErrors] = useState<Record<string, string>>({});

  if (!transaction) {
    navigate('/');
    return null;
  }

  const validateCard = () => {
    const errors: Record<string, string> = {};
    const cardNumber = cardData.number.replace(/\s/g, '');

    if (!cardNumber || cardNumber.length < 13) errors.number = 'Número de tarjeta inválido';
    if (!cardData.card_holder.trim()) errors.card_holder = 'Titular requerido';
    if (!cardData.exp_month || parseInt(cardData.exp_month) < 1 || parseInt(cardData.exp_month) > 12) {
      errors.exp_month = 'Mes inválido';
    }
    if (!cardData.exp_year || cardData.exp_year.length !== 2) errors.exp_year = 'Año inválido';
    if (!cardData.cvc || cardData.cvc.length < 3) errors.cvc = 'CVC inválido';

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateCard()) return;

    setLoading(true);
    setError(null);

    try {
      const result = await processPayment(transaction.transaction_id, {
        number: cardData.number.replace(/\s/g, ''),
        card_holder: cardData.card_holder.toUpperCase(),
        exp_month: cardData.exp_month.padStart(2, '0'),
        exp_year: cardData.exp_year,
        cvc: cardData.cvc,
      });

      updateTransaction(result);
      navigate('/checkout/result');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
        const errorMsg = axiosError.response?.data?.message || axiosError.response?.data?.error;
        setError(errorMsg || 'Error al procesar el pago');
      } else {
        setError('Error al procesar el pago');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'number') {
      newValue = formatCardNumber(value);
      if (newValue.replace(/\s/g, '').length > 16) return;
    }
    if (name === 'exp_month' && value.length > 2) return;
    if (name === 'exp_year' && value.length > 2) return;
    if (name === 'cvc' && value.length > 4) return;

    setCardData(prev => ({ ...prev, [name]: newValue }));
    if (cardErrors[name]) {
      setCardErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/checkout/summary')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al resumen
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Datos de pago</h1>
            <p className="text-gray-400 text-sm">Paso 3 de 3</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">Total a pagar</h2>
              <span className="text-2xl font-bold text-purple-400">
                {formatPrice(transaction.total_cents)}
              </span>
            </div>

            <div className="text-sm text-gray-400 mb-4">
              Referencia: <span className="text-white font-mono">{transaction.reference}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-400" />
                Tarjeta de crédito/débito
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Número de tarjeta</label>
                  <input
                    type="text"
                    name="number"
                    value={cardData.number}
                    onChange={handleCardChange}
                    placeholder="4242 4242 4242 4242"
                    className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                      cardErrors.number ? 'border-red-500' : 'border-gray-600'
                    } focus:border-purple-500 focus:outline-none font-mono text-lg`}
                  />
                  {cardErrors.number && <p className="text-red-400 text-sm mt-1">{cardErrors.number}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-1">Nombre del titular</label>
                  <input
                    type="text"
                    name="card_holder"
                    value={cardData.card_holder}
                    onChange={handleCardChange}
                    placeholder="JUAN PEREZ"
                    className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                      cardErrors.card_holder ? 'border-red-500' : 'border-gray-600'
                    } focus:border-purple-500 focus:outline-none uppercase`}
                  />
                  {cardErrors.card_holder && <p className="text-red-400 text-sm mt-1">{cardErrors.card_holder}</p>}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Mes</label>
                    <input
                      type="text"
                      name="exp_month"
                      value={cardData.exp_month}
                      onChange={handleCardChange}
                      placeholder="12"
                      className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                        cardErrors.exp_month ? 'border-red-500' : 'border-gray-600'
                      } focus:border-purple-500 focus:outline-none text-center font-mono`}
                    />
                    {cardErrors.exp_month && <p className="text-red-400 text-sm mt-1">{cardErrors.exp_month}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Año</label>
                    <input
                      type="text"
                      name="exp_year"
                      value={cardData.exp_year}
                      onChange={handleCardChange}
                      placeholder="29"
                      className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                        cardErrors.exp_year ? 'border-red-500' : 'border-gray-600'
                      } focus:border-purple-500 focus:outline-none text-center font-mono`}
                    />
                    {cardErrors.exp_year && <p className="text-red-400 text-sm mt-1">{cardErrors.exp_year}</p>}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-400 mb-1">CVC</label>
                    <input
                      type="text"
                      name="cvc"
                      value={cardData.cvc}
                      onChange={handleCardChange}
                      placeholder="123"
                      className={`w-full px-4 py-3 bg-gray-700 rounded-lg border ${
                        cardErrors.cvc ? 'border-red-500' : 'border-gray-600'
                      } focus:border-purple-500 focus:outline-none text-center font-mono`}
                    />
                    {cardErrors.cvc && <p className="text-red-400 text-sm mt-1">{cardErrors.cvc}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 flex items-center gap-3">
              <Lock className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-green-400 font-medium">Pago seguro con Wompi</p>
                <p className="text-gray-400">Tus datos están protegidos con encriptación SSL</p>
              </div>
            </div>

            <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30">
              <p className="text-sm text-blue-300">
                <strong>Tarjetas de prueba (Sandbox):</strong><br />
                ✅ Aprobada: 4242 4242 4242 4242<br />
                ❌ Rechazada: 4111 1111 1111 1111
              </p>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                  Procesando pago...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  Pagar {formatPrice(transaction.total_cents)}
                </>
              )}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
