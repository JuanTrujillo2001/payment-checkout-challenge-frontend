import axios from 'axios';
import type { Product, Customer, Delivery, CardData, Transaction, Cart } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://payment-checkout-challenge-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get('/products');
  return response.data;
};

// Cart endpoints
export const getCart = async (sessionId: string): Promise<Cart> => {
  const response = await api.get(`/cart/${sessionId}`);
  return response.data;
};

export const addToCart = async (sessionId: string, productId: string, quantity: number = 1): Promise<void> => {
  await api.post(`/cart/${sessionId}/items`, { product_id: productId, quantity });
};

export const updateCartItem = async (sessionId: string, productId: string, quantity: number): Promise<void> => {
  await api.put(`/cart/${sessionId}/items/${productId}`, { quantity });
};

export const removeFromCart = async (sessionId: string, productId: string): Promise<void> => {
  await api.delete(`/cart/${sessionId}/items/${productId}`);
};

export const clearCart = async (sessionId: string): Promise<void> => {
  await api.delete(`/cart/${sessionId}`);
};

// Transaction endpoints
export const createTransaction = async (data: {
  product_id: string;
  quantity: number;
  customer: Customer;
  delivery: Delivery;
}): Promise<Transaction> => {
  const response = await api.post('/transactions', data);
  return response.data;
};

export const createTransactionFromCart = async (data: {
  session_id: string;
  customer: Customer;
  delivery: Delivery;
}): Promise<Transaction> => {
  const response = await api.post('/transactions/from-cart', data);
  return response.data;
};

export const getTransaction = async (id: string): Promise<Transaction> => {
  const response = await api.get(`/transactions/${id}`);
  return response.data;
};

export const processPayment = async (
  transactionId: string,
  card: CardData,
  installments: number = 1
): Promise<Transaction> => {
  const response = await api.post(`/transactions/${transactionId}/pay`, {
    card,
    installments,
  });
  return response.data;
};

export const getTransactionStatus = async (id: string): Promise<Transaction> => {
  const response = await api.get(`/transactions/${id}/status`);
  return response.data;
};

export interface OrderLookupResult {
  transaction_id: string;
  reference: string;
  status: string;
  amount_cents: number;
  base_fee_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  wompi_transaction_id: string | null;
  wompi_status: string;
  created_at: string;
  finalized_at: string | null;
  customer: {
    full_name: string;
    email: string;
  } | null;
  items: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price_cents: number;
    subtotal_cents: number;
  }>;
}

export const getTransactionByReference = async (reference: string): Promise<OrderLookupResult> => {
  const response = await api.get(`/transactions/reference/${reference}`);
  return response.data;
};

export default api;
