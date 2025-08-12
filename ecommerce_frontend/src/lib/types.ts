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
