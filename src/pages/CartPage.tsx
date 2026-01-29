import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, CreditCard, ArrowLeft } from 'lucide-react';
import { useCheckout } from '../context/CheckoutContext';
import { CartItem, OrderSummary, EmptyState, PaymentModal, ResultModal } from '../components';
import { Button, Card } from '../components/ui';
import type { PaymentResult } from '../components/PaymentModal';

export default function CartPage() {
  const navigate = useNavigate();
  const { cart, sessionId, updateQuantity, removeFromCart, cartLoading, refreshCart } = useCheckout();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const handleUpdateQuantity = async (productId: string, newQuantity: number, maxStock: number) => {
    try {
      if (newQuantity <= 0) {
        await removeFromCart(productId);
      } else if (newQuantity <= maxStock) {
        await updateQuantity(productId, newQuantity);
      }
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart(productId);
    } catch (err) {
      console.error('Error removing item:', err);
    }
  };

  const isEmpty = !cart || cart.items.length === 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Seguir comprando
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Tu carrito</h1>

        {isEmpty ? (
          <EmptyState
            icon={ShoppingBag}
            title="Tu carrito está vacío"
            description="Agrega productos para continuar"
            actionLabel="Ver productos"
            onAction={() => navigate('/')}
          />
        ) : (
          <div className="space-y-6">
            <Card className="divide-y divide-gray-700">
              {cart.items.map((item) => (
                <CartItem
                  key={item.id}
                  item={item}
                  disabled={cartLoading}
                  onUpdateQuantity={(qty) => handleUpdateQuantity(item.product_id, qty, item.stock)}
                  onRemove={() => handleRemove(item.product_id)}
                />
              ))}
            </Card>

            <OrderSummary
              itemsCount={cart.items_count}
              subtotalCents={cart.subtotal_cents}
              baseFeeCents={cart.base_fee_cents}
              deliveryFeeCents={cart.delivery_fee_cents}
              totalCents={cart.total_cents}
            />

            <Button
              size="lg"
              icon={<CreditCard className="w-5 h-5" />}
              onClick={() => setShowPaymentModal(true)}
              className="w-full"
            >
              Pagar con tarjeta
            </Button>
          </div>
        )}
      </main>

      {cart && cart.items.length > 0 && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          cart={cart}
          sessionId={sessionId}
          onSuccess={(result) => {
            setPaymentResult(result);
            setPaymentError(null);
            setShowPaymentModal(false);
            setShowResultModal(true);
            refreshCart();
          }}
          onError={(error) => {
            setPaymentError(error);
            setPaymentResult(null);
            setShowPaymentModal(false);
            setShowResultModal(true);
          }}
        />
      )}

      <ResultModal
        isOpen={showResultModal}
        onClose={() => {
          const isApproved = paymentResult?.status === 'approved' || 
                             paymentResult?.wompi_status?.toUpperCase() === 'APPROVED';
          
          if (isApproved) {
            refreshCart();
            navigate('/');
            return;
          }

          setShowResultModal(false);
          setPaymentResult(null);
          setPaymentError(null);
        }}
        result={paymentResult}
        error={paymentError}
        onStatusUpdate={(updatedResult) => {
          setPaymentResult(updatedResult);
          const isApproved = updatedResult.status === 'approved' || 
                             updatedResult.wompi_status?.toUpperCase() === 'APPROVED';
          if (isApproved) {
            refreshCart();
          }
        }}
      />
    </div>
  );
}
