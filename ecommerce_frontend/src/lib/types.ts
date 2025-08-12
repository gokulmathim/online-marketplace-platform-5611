export type ID = string;

export interface Category {
  id: ID;
  name: string;
  slug: string;
}

export interface Product {
  id: ID;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: ID;
  stock?: number;
  rating?: number;
  tags?: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: ID;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

export interface Order {
  id: ID;
  createdAt: string;
  status: "pending" | "paid" | "shipped" | "completed" | "cancelled";
  total: number;
  items: OrderItem[];
}

export interface User {
  id: ID;
  email: string;
  name?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Shipping types
 */

// PUBLIC_INTERFACE
export interface ShippingAddress {
  /** Full name of the recipient (optional if managed elsewhere) */
  name?: string;
  /** First address line (street, number) */
  line1: string;
  /** Second address line (apt/suite) */
  line2?: string;
  /** City or locality */
  city: string;
  /** State/Province/Region (optional for some countries) */
  state?: string;
  /** Postal/ZIP code */
  postalCode: string;
  /** ISO 3166-1 alpha-2 country code (e.g., 'US', 'CA') */
  country: string;
  /** Contact phone (optional, some couriers may require) */
  phone?: string;
}

// PUBLIC_INTERFACE
export interface ShippingOption {
  /** Unique identifier of the shipping option for selection */
  id: string;
  /** Carrier (e.g., UPS, FedEx, DHL, USPS) */
  carrier: string;
  /** Service name/level (e.g., Ground, 2-Day, Overnight) */
  service: string;
  /** Human-friendly label for UI display */
  label: string;
  /** Estimated delivery days or human string (e.g., '2-3 business days') */
  estimatedDays: string;
  /** Price for this shipping option */
  amount: number;
  /** Currency code (default 'USD' if omitted) */
  currency?: string;
  /** Arbitrary metadata for integration (e.g., rateId) */
  meta?: Record<string, unknown>;
}
