export type ProductCategory = 
  | 'Mobile Games'
  | 'PC Games'
  | 'Console'
  | 'Gift Cards'
  | 'Subscriptions'
  | 'Game Points';

export interface Game {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo_url: string;
  banner_url: string;
  category: ProductCategory | string;
  active: boolean;
  featured: boolean;
  sort_order: number;
  publisher?: string;
  starting_price?: number;
  badges?: string[];
}

export type ProductFieldType = 'text' | 'number' | 'select' | 'email';

export interface ProductFieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  options?: { label: string; value: string }[];
  helperText?: string;
}

export interface ProductField {
  id: string;
  product_id?: string;
  game_id?: string;
  field_name: string;
  field_label: string;
  field_type: ProductFieldType;
  placeholder: string;
  required: boolean;
  validation_rules?: ProductFieldValidation;
  sort_order: number;
}

export interface Product {
  id: string;
  game_id: string;
  name: string;
  slug: string;
  description: string;
  product_type: string;
  denomination: string;
  price: number;
  discount_price?: number | null;
  currency: string;
  image_url: string;
  active: boolean;
  featured: boolean;
  sort_order: number;
  delivery_type: 'instant_api' | 'manual' | 'voucher';
  bonus_text?: string;
}

export type PaymentMethodId = 'gcash' | 'maya' | 'grabpay' | 'card' | 'qrph' | 'bank_transfer';

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  type: 'E-Wallet' | 'Credit/Debit' | 'QR' | 'Bank';
  fee_percentage: number;
  fee_flat: number;
  icon: string;
  popular?: boolean;
}

export type OrderPaymentStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type OrderFulfillmentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'MANUAL_REVIEW';
export type OrderStatus = 'PENDING_PAYMENT' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';

export interface OrderEvent {
  id: string;
  order_id: string;
  status: string;
  message: string;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  user_id?: string | null;
  email: string;
  phone?: string | null;
  game_id: string;
  game_name?: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  discount: number;
  payment_fee: number;
  total: number;
  currency: string;
  payment_method: string;
  payment_reference?: string | null;
  payment_status: OrderPaymentStatus;
  fulfillment_status: OrderFulfillmentStatus;
  order_status: OrderStatus;
  customer_data: Record<string, string>;
  internal_notes?: string | null;
  created_at: string;
  updated_at: string;
  events?: OrderEvent[];
}
