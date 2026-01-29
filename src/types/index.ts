export interface Product {
  id: string;
  name: string;
  description: string;
  price_cents: number;
  stock: number;
  image_url?: string;
}

export interface Customer {
  full_name: string;
  identity_document: number;
  email: string;
  phone: string;
}

export interface Delivery {
  address: string;
  city: string;
  country: string;
}

export interface CardData {
  number: string;
  cvc: string;
  exp_month: string;
  exp_year: string;
  card_holder: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_description: string;
  price_cents: number;
  quantity: number;
  subtotal_cents: number;
  stock: number;
  image_url?: string;
}

export interface Cart {
  session_id: string;
  items: CartItem[];
  items_count: number;
  subtotal_cents: number;
  base_fee_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
}

export interface Transaction {
  transaction_id: string;
  reference: string;
  status: string;
  amount_cents: number;
  base_fee_cents: number;
  delivery_fee_cents: number;
  total_cents: number;
  items?: Array<{
    product_id: string;
    product_name: string;
    quantity: number;
    price_cents: number;
    subtotal_cents: number;
  }>;
  wompi_transaction_id?: string;
  wompi_status?: string;
  finalized_at?: string;
}

export interface CheckoutState {
  sessionId: string;
  cart: Cart | null;
  customer: Customer | null;
  delivery: Delivery | null;
  transaction: Transaction | null;
}
