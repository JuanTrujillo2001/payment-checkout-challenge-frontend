import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Customer, Delivery, Transaction, Cart, CheckoutState } from '../types';
import { getCart, addToCart as apiAddToCart, updateCartItem, removeFromCart as apiRemoveFromCart } from '../services/api';

function generateSessionId(): string {
  const stored = localStorage.getItem('cart_session_id');
  if (stored) return stored;
  const newId = crypto.randomUUID();
  localStorage.setItem('cart_session_id', newId);
  return newId;
}

interface CheckoutContextType extends CheckoutState {
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  refreshCart: () => Promise<void>;
  setCustomerData: (customer: Customer) => void;
  setDeliveryData: (delivery: Delivery) => void;
  setTransaction: (transaction: Transaction) => void;
  updateTransaction: (transaction: Partial<Transaction>) => void;
  reset: () => void;
  cartLoading: boolean;
}

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export function CheckoutProvider({ children }: { children: ReactNode }) {
  const [sessionId] = useState<string>(generateSessionId);
  const [cart, setCart] = useState<Cart | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [transaction, setTransactionState] = useState<Transaction | null>(null);
  const [cartLoading, setCartLoading] = useState(false);

  const refreshCart = async () => {
    try {
      setCartLoading(true);
      const cartData = await getCart(sessionId);
      setCart(cartData);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setCartLoading(false);
    }
  };

  useEffect(() => {
    refreshCart();
  }, [sessionId]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      setCartLoading(true);
      await apiAddToCart(sessionId, productId, quantity);
      await refreshCart();
    } catch (err) {
      console.error('Error adding to cart:', err);
      throw err;
    } finally {
      setCartLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    try {
      setCartLoading(true);
      await updateCartItem(sessionId, productId, quantity);
      await refreshCart();
    } catch (err) {
      console.error('Error updating quantity:', err);
      throw err;
    } finally {
      setCartLoading(false);
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setCartLoading(true);
      await apiRemoveFromCart(sessionId, productId);
      await refreshCart();
    } catch (err) {
      console.error('Error removing from cart:', err);
      throw err;
    } finally {
      setCartLoading(false);
    }
  };

  const setCustomerData = (customerData: Customer) => {
    setCustomer(customerData);
  };

  const setDeliveryData = (deliveryData: Delivery) => {
    setDelivery(deliveryData);
  };

  const setTransaction = (transactionData: Transaction) => {
    setTransactionState(transactionData);
  };

  const updateTransaction = (transactionData: Partial<Transaction>) => {
    setTransactionState(prev => prev ? { ...prev, ...transactionData } : null);
  };

  const reset = () => {
    setCustomer(null);
    setDelivery(null);
    setTransactionState(null);
    localStorage.removeItem('cart_session_id');
    window.location.reload();
  };

  return (
    <CheckoutContext.Provider
      value={{
        sessionId,
        cart,
        customer,
        delivery,
        transaction,
        addToCart,
        updateQuantity,
        removeFromCart,
        refreshCart,
        setCustomerData,
        setDeliveryData,
        setTransaction,
        updateTransaction,
        reset,
        cartLoading,
      }}
    >
      {children}
    </CheckoutContext.Provider>
  );
}

export function useCheckout() {
  const context = useContext(CheckoutContext);
  if (context === undefined) {
    throw new Error('useCheckout must be used within a CheckoutProvider');
  }
  return context;
}
