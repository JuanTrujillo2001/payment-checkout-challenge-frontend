import { useState, useEffect } from 'react';
import { X, CreditCard, Truck, Shield, Loader2, Package } from 'lucide-react';
import type { Customer, Delivery, CardData, Cart } from '../types';
import { createTransactionFromCart, processPayment } from '../services/api';
import { Input, Button } from './ui';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  cart: Cart;
  sessionId: string;
  onSuccess: (result: PaymentResult) => void;
  onError: (error: string) => void;
}

export interface PaymentResult {
  transaction_id: string;
  reference: string;
  status: string;
  total_cents: number;
  wompi_status?: string;
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(cents / 100);
}

function detectCardType(number: string): 'visa' | 'mastercard' | null {
  const cleaned = number.replace(/\s/g, '');
  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) return 'mastercard';
  return null;
}

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, '').slice(0, 16);
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

export default function PaymentModal({ isOpen, onClose, cart, sessionId, onSuccess, onError }: PaymentModalProps) {
  const [step, setStep] = useState<'card' | 'summary' | 'processing'>('card');
  const [loading, setLoading] = useState(false);
  
  // Card data
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [cvc, setCvc] = useState('');
  
  // Customer data
  const [fullName, setFullName] = useState('');
  const [identityDocument, setIdentityDocument] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  // Delivery data
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Colombia');

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setStep('card');
      setLoading(false);
      setCardNumber('');
      setCardHolder('');
      setExpMonth('');
      setExpYear('');
      setCvc('');
      setFullName('');
      setIdentityDocument('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCity('');
      setCountry('Colombia');
      setErrors({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const cardType = detectCardType(cardNumber);

  const validateCard = (): boolean => {
    const newErrors: Record<string, string> = {};
    const cleanedNumber = cardNumber.replace(/\s/g, '');
    
    if (cleanedNumber.length < 13 || cleanedNumber.length > 19) {
      newErrors.cardNumber = 'Número de tarjeta inválido';
    } else if (!cardType) {
      newErrors.cardNumber = 'Solo aceptamos tarjetas Visa o Mastercard';
    }
    if (!cardHolder.trim()) newErrors.cardHolder = 'Nombre requerido';
    if (!expMonth || parseInt(expMonth) < 1 || parseInt(expMonth) > 12) {
      newErrors.expMonth = 'Mes inválido';
    }
    if (!expYear || expYear.length !== 2) newErrors.expYear = 'Año inválido';
    if (!cvc || cvc.length < 3) newErrors.cvc = 'CVC inválido';
    
    // Customer validation
    if (!fullName.trim()) newErrors.fullName = 'Nombre requerido';
    if (!identityDocument.trim()) newErrors.identityDocument = 'Documento requerido';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Email inválido';
    if (!phone.trim()) newErrors.phone = 'Teléfono requerido';
    
    // Delivery validation
    if (!address.trim()) newErrors.address = 'Dirección requerida';
    if (!city.trim()) newErrors.city = 'Ciudad requerida';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleContinueToSummary = () => {
    if (validateCard()) {
      setStep('summary');
    }
  };

  const handlePayment = async () => {
    setStep('processing');
    setLoading(true);

    try {
      const customer: Customer = {
        full_name: fullName,
        identity_document: parseInt(identityDocument),
        email,
        phone,
      };

      const delivery: Delivery = {
        address,
        city,
        country,
      };

      const cardData: CardData = {
        number: cardNumber.replace(/\s/g, ''),
        cvc,
        exp_month: expMonth.padStart(2, '0'),
        exp_year: expYear,
        card_holder: cardHolder.toUpperCase(),
      };

      // 1. Create transaction from cart in PENDING
      const transaction = await createTransactionFromCart({
        session_id: sessionId,
        customer,
        delivery,
      });

      // 2. Call Wompi API to complete payment
      const result = await processPayment(transaction.transaction_id, cardData, 1);

      // 3. Show result
      onSuccess({
        transaction_id: result.transaction_id,
        reference: result.reference,
        status: result.status,
        total_cents: result.total_cents,
        wompi_status: result.wompi_status,
      });

    } catch (err: unknown) {
      console.error('Payment error:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { data?: { message?: string } } };
        onError(axiosError.response?.data?.message || 'Error al procesar el pago');
      } else {
        onError('Error al procesar el pago');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setStep('card');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      <div className="relative bg-gray-800 rounded-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-purple-400" />
            {step === 'card' && 'Pagar con tarjeta'}
            {step === 'summary' && 'Confirmar pago'}
            {step === 'processing' && 'Procesando...'}
          </h2>
          {!loading && (
            <button onClick={handleClose} className="text-gray-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          )}
        </div>

        <div className="p-6">
          {step === 'card' && (
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Tu carrito ({cart.items_count} {cart.items_count === 1 ? 'item' : 'items'})
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-300">{item.quantity}x {item.product_name}</span>
                      <span className="text-purple-400">{formatPrice(item.subtotal_cents)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gray-600 mt-3 pt-3 flex justify-between font-semibold">
                  <span>Total</span>
                  <span className="text-purple-400">{formatPrice(cart.total_cents)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-400" />
                  Datos de la tarjeta
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Número de tarjeta</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        placeholder="4242 4242 4242 4242"
                        className={`w-full px-4 py-3 bg-gray-700 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 ${errors.cardNumber ? 'border-red-500' : 'border-gray-600'}`}
                      />
                      {cardType && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {cardType === 'visa' && (
                            <div className="bg-white px-2 py-1 rounded text-blue-600 font-bold text-xs">VISA</div>
                          )}
                          {cardType === 'mastercard' && (
                            <div className="bg-gradient-to-r from-red-500 to-yellow-500 px-2 py-1 rounded text-white font-bold text-xs">MC</div>
                          )}
                        </div>
                      )}
                    </div>
                    {errors.cardNumber && <p className="text-red-400 text-sm mt-1">{errors.cardNumber}</p>}
                  </div>

                  <Input
                    label="Nombre en la tarjeta"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    placeholder="JUAN PEREZ"
                    error={errors.cardHolder}
                    className="uppercase"
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <Input
                      label="Mes"
                      value={expMonth}
                      onChange={(e) => setExpMonth(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="12"
                      error={errors.expMonth}
                    />
                    <Input
                      label="Año"
                      value={expYear}
                      onChange={(e) => setExpYear(e.target.value.replace(/\D/g, '').slice(0, 2))}
                      placeholder="28"
                      error={errors.expYear}
                    />
                    <Input
                      label="CVC"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="123"
                      error={errors.cvc}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Datos del cliente</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Nombre completo"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Juan Pérez"
                      error={errors.fullName}
                    />
                    <Input
                      label="Documento"
                      value={identityDocument}
                      onChange={(e) => setIdentityDocument(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567890"
                      error={errors.identityDocument}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="juan@email.com"
                      error={errors.email}
                    />
                    <Input
                      label="Teléfono"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="3001234567"
                      error={errors.phone}
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-purple-400" />
                  Datos de envío
                </h3>
                <div className="space-y-4">
                  <Input
                    label="Dirección"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Calle 123 #45-67"
                    error={errors.address}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Ciudad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Bogotá"
                      error={errors.city}
                    />
                    <Input
                      label="País"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button size="lg" onClick={handleContinueToSummary} className="w-full">
                Continuar al resumen
              </Button>
            </div>
          )}

          {step === 'summary' && (
            <div className="space-y-6">
              <div className="bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-400" />
                  Productos
                </h3>
                <div className="space-y-2">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <p className="text-white">{item.product_name}</p>
                        <p className="text-gray-400 text-sm">Cantidad: {item.quantity}</p>
                      </div>
                      <p className="text-purple-400 font-semibold">{formatPrice(item.subtotal_cents)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Desglose</h3>
                <div className="space-y-2 text-sm">
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
                  <div className="border-t border-gray-600 pt-2 flex justify-between text-lg font-semibold text-white">
                    <span>Total</span>
                    <span className="text-purple-400">{formatPrice(cart.total_cents)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-xl p-4">
                <h3 className="font-semibold text-white mb-3">Método de pago</h3>
                <div className="flex items-center gap-3">
                  {cardType === 'visa' && (
                    <div className="bg-white px-2 py-1 rounded text-blue-600 font-bold text-xs">VISA</div>
                  )}
                  {cardType === 'mastercard' && (
                    <div className="bg-gradient-to-r from-red-500 to-yellow-500 px-2 py-1 rounded text-white font-bold text-xs">MC</div>
                  )}
                  <span className="text-gray-300">**** **** **** {cardNumber.slice(-4)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-400 bg-gray-700/30 rounded-lg p-3">
                <Shield className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p>Tu pago será procesado de forma segura a través de Wompi.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="secondary" size="lg" onClick={() => setStep('card')} className="flex-1">
                  Volver
                </Button>
                <Button size="lg" onClick={handlePayment} className="flex-1">
                  Pagar {formatPrice(cart.total_cents)}
                </Button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 text-center">
              <Loader2 className="w-16 h-16 text-purple-500 animate-spin mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-white mb-2">Procesando pago...</h3>
              <p className="text-gray-400">Por favor espera mientras procesamos tu transacción</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
