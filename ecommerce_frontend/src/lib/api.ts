/**
 * Lightweight API client for the ecommerce backend.
 * All calls are routed through safeFetch which protects the UI from failing on network errors.
 */

import type { AuthResponse, Category, Order, Product, ShippingAddress, ShippingOption } from "./types";

const API_BASE = (import.meta.env.PUBLIC_API_BASE_URL || "").replace(/\/+$/, "");
/** Optional dedicated shipping rate API URL if backend provides a separate endpoint */
const RATE_API = (import.meta.env.PUBLIC_SHIPPING_RATE_API_URL || "").replace(/\/+$/, "");

/** Emit a console warning in development when API_BASE isn't configured. */
function warnIfNoApi() {
  if (!API_BASE) {
    console.warn(
      "[API] PUBLIC_API_BASE_URL is not set. The UI will use demo fallback data. Configure it in your .env file."
    );
  }
}

/**
 * Internal: adds Authorization header if a token exists.
 */
function withAuth(headers: HeadersInit = {}): HeadersInit {
  try {
    const token = typeof localStorage !== "undefined" ? localStorage.getItem("auth_token") : null;
    return token ? { ...headers, Authorization: `Bearer ${token}` } : headers;
  } catch {
    return headers;
  }
}

/**
 * Internal: fetch wrapper that returns fallback data on error to keep UI responsive.
 */
async function safeFetch<T>(
  path: string,
  options: RequestInit = {},
  fallback: T
): Promise<T> {
  warnIfNoApi();
  if (!API_BASE) {
    return fallback;
  }
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return (await res.json()) as T;
  } catch (err) {
    console.warn(`[API] Falling back for ${path}:`, err);
    return fallback;
  }
}

/**
 * Demos: Minimal placeholder data for when backend is not available.
 */
const Demo = {
  categories: [
    { id: "c1", name: "All", slug: "all" },
    { id: "c2", name: "Electronics", slug: "electronics" },
    { id: "c3", name: "Home & Kitchen", slug: "home-kitchen" },
    { id: "c4", name: "Sports", slug: "sports" },
  ] as Category[],
  products: [
    {
      id: "p1",
      name: "Wireless Headphones",
      price: 99.99,
      imageUrl: "https://images.unsplash.com/photo-1518443732597-2fd5f18b0d5d?q=80&w=800&auto=format&fit=crop",
      categoryId: "c2",
      rating: 4.5,
      description: "Comfortable noise-cancelling wireless headphones.",
    },
    {
      id: "p2",
      name: "Smartwatch",
      price: 149.5,
      imageUrl: "https://images.unsplash.com/photo-1518085250887-2f903c200fee?q=80&w=800&auto=format&fit=crop",
      categoryId: "c2",
      rating: 4.2,
      description: "Track your health and notifications on the go.",
    },
    {
      id: "p3",
      name: "Stainless Steel Water Bottle",
      price: 24.0,
      imageUrl: "https://images.unsplash.com/photo-1578926374605-51ded8a53f79?q=80&w=800&auto=format&fit=crop",
      categoryId: "c4",
      rating: 4.8,
      description: "Keeps beverages cold for 24 hours.",
    },
    {
      id: "p4",
      name: "Ceramic Mug",
      price: 12.75,
      imageUrl: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=800&auto=format&fit=crop",
      categoryId: "c3",
      rating: 4.1,
      description: "Minimalist mug for your daily coffee ritual.",
    },
  ] as Product[],
  orders: [] as Order[],
};

/**
 * Compute a simple demo shipping options list when real-time rates are unavailable.
 * Uses subtotal heuristics so the UX remains realistic.
 */
function demoShippingOptions(subtotal: number): ShippingOption[] {
  const base = Math.max(4.99, Math.round((subtotal * 0.08 + Number.EPSILON) * 100) / 100);
  const expedited = Math.max(9.99, Math.round((subtotal * 0.12 + Number.EPSILON) * 100) / 100);
  const overnight = Math.max(19.99, Math.round((subtotal * 0.2 + Number.EPSILON) * 100) / 100);

  return [
    {
      id: "standard",
      carrier: "MockPost",
      service: "Ground",
      label: "Standard (5-7 business days)",
      estimatedDays: "5-7",
      amount: Number(base.toFixed(2)),
      currency: "USD",
      meta: { demo: true },
    },
    {
      id: "expedited",
      carrier: "MockPost",
      service: "Expedited",
      label: "Expedited (2-3 business days)",
      estimatedDays: "2-3",
      amount: Number(expedited.toFixed(2)),
      currency: "USD",
      meta: { demo: true },
    },
    {
      id: "overnight",
      carrier: "MockPost",
      service: "Overnight",
      label: "Overnight (1 business day)",
      estimatedDays: "1",
      amount: Number(overnight.toFixed(2)),
      currency: "USD",
      meta: { demo: true },
    },
  ];
}

// PUBLIC_INTERFACE
export async function getShippingRates(payload: {
  destination: ShippingAddress;
  cart: { productId: string; quantity: number; price?: number }[];
  /** Optional subtotal to improve fallback accuracy */
  subtotal?: number;
}): Promise<ShippingOption[]> {
  /**
   * Fetch available shipping options for the given destination and cart.
   * Attempts, in order:
   *  1) Dedicated rate API (PUBLIC_SHIPPING_RATE_API_URL) if provided;
   *  2) Backend endpoint at /shipping/rates on PUBLIC_API_BASE_URL;
   *  3) Demo fallback using subtotal heuristics (no network).
   */
  const subtotal =
    payload.subtotal ??
    payload.cart.reduce((sum, it) => sum + (it.price ?? 0) * it.quantity, 0);

  // Prefer a dedicated shipping rates API URL if configured
  if (RATE_API) {
    try {
      const res = await fetch(`${RATE_API}/rates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = (await res.json()) as ShippingOption[];
        if (Array.isArray(data) && data.length) return data;
      }
    } catch (err) {
      console.warn("[API] Rate API failed, falling back:", err);
    }
  }

  // Try backend integrated endpoint under PUBLIC_API_BASE_URL
  const backendOptions = await safeFetch<ShippingOption[]>(
    "/shipping/rates",
    { method: "POST", body: JSON.stringify(payload) },
    demoShippingOptions(subtotal)
  );
  return backendOptions;
}

// PUBLIC_INTERFACE
export async function getCategories(): Promise<Category[]> {
  /** Get all product categories. */
  return safeFetch<Category[]>("/categories", {}, Demo.categories);
}

// PUBLIC_INTERFACE
export async function searchProducts(params: {
  q?: string;
  category?: string;
  page?: number;
  pageSize?: number;
}): Promise<{ items: Product[]; total: number; page: number; pageSize: number }> {
  /** Search products by keyword and/or category. Supports pagination. */
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category && params.category !== "all") query.set("category", params.category);
  query.set("page", String(params.page ?? 1));
  query.set("pageSize", String(params.pageSize ?? 12));
  const path = `/products?${query.toString()}`;

  // Fallback: simple filter on demo data
  const fallbackFilter = (items: Product[]) => {
    const q = (params.q || "").toLowerCase().trim();
    const cat = params.category && params.category !== "all" ? params.category : undefined;
    let filtered = items;
    if (q) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q)
      );
    }
    if (cat) {
      filtered = filtered.filter((p) => p.categoryId === cat);
    }
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return { items: filtered.slice(start, end), total: filtered.length, page, pageSize };
  };

  return safeFetch(path, {}, fallbackFilter(Demo.products));
}

// PUBLIC_INTERFACE
export async function getProductById(id: string): Promise<Product | null> {
  /** Get a single product by its ID. Returns null if not found. */
  const fallback = Demo.products.find((p) => p.id === id) || null;
  return safeFetch<Product | null>(`/products/${id}`, {}, fallback);
}

// PUBLIC_INTERFACE
export async function login(email: string, password: string): Promise<AuthResponse | null> {
  /** Perform user login, returning token and user on success, null on error. */
  const body = JSON.stringify({ email, password });
  const res = await safeFetch<AuthResponse | null>(
    "/auth/login",
    { method: "POST", body },
    null
  );
  return res;
}

// PUBLIC_INTERFACE
export async function register(name: string, email: string, password: string): Promise<AuthResponse | null> {
  /** Perform user registration. Returns token and user on success, null on error. */
  const body = JSON.stringify({ name, email, password });
  const res = await safeFetch<AuthResponse | null>(
    "/auth/register",
    { method: "POST", body },
    null
  );
  return res;
}

// PUBLIC_INTERFACE
export async function getOrders(): Promise<Order[]> {
  /** Retrieve the current user's order history. */
  return safeFetch<Order[]>(
    "/orders",
    { headers: withAuth() },
    Demo.orders
  );
}

// PUBLIC_INTERFACE
export async function checkout(payload: {
  items: { productId: string; quantity: number }[];
  payment: { cardNumber: string; expiry: string; cvc: string; name: string; address?: string };
  /** Selected shipping details to be used for order fulfillment */
  shipping?: {
    address: ShippingAddress;
    option: ShippingOption;
  };
}): Promise<{ orderId: string } | null> {
  /**
   * Create an order from cart items and payment/shipping details.
   * Returns order ID on success. If backend is unavailable, returns a demo order ID.
   */
  const body = JSON.stringify(payload);
  const demo = { orderId: `demo_${Math.random().toString(36).slice(2, 10)}` };
  return safeFetch<{ orderId: string } | null>(
    "/orders/checkout",
    { method: "POST", headers: withAuth(), body },
    demo
  );
}
