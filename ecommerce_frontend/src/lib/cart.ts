/**
 * Simple cart store backed by localStorage and DOM CustomEvents.
 * UI components can subscribe to `cart:updated` to react to changes.
 */

import type { CartItem, Product } from "./types";

const CART_KEY = "cart_items";

// PUBLIC_INTERFACE
export function getCart(): CartItem[] {
  /** Returns the current cart items from localStorage. */
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

// PUBLIC_INTERFACE
export function setCart(items: CartItem[]): void {
  /** Replaces the cart items and emits a cart update event. */
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("cart:updated", { detail: items }));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function addToCart(product: Product, quantity = 1): void {
  /** Adds a product to the cart (or increments its quantity). */
  const cart = getCart();
  const idx = cart.findIndex((ci) => ci.product.id === product.id);
  if (idx >= 0) {
    cart[idx].quantity += quantity;
  } else {
    cart.push({ product, quantity });
  }
  setCart(cart);
}

// PUBLIC_INTERFACE
export function removeFromCart(productId: string): void {
  /** Removes a product from the cart by ID. */
  const cart = getCart().filter((ci) => ci.product.id !== productId);
  setCart(cart);
}

// PUBLIC_INTERFACE
export function updateQuantity(productId: string, quantity: number): void {
  /** Updates the quantity for a product in the cart. Removes if quantity <= 0. */
  const cart = getCart();
  const idx = cart.findIndex((ci) => ci.product.id === productId);
  if (idx >= 0) {
    if (quantity <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].quantity = quantity;
    }
    setCart(cart);
  }
}

// PUBLIC_INTERFACE
export function clearCart(): void {
  /** Empties the cart. */
  setCart([]);
}

// PUBLIC_INTERFACE
export function cartTotal(): number {
  /** Calculates the current cart subtotal. */
  return getCart().reduce((sum, ci) => sum + ci.product.price * ci.quantity, 0);
}

// PUBLIC_INTERFACE
export function cartCount(): number {
  /** Total number of items (sum of quantities) in the cart. */
  return getCart().reduce((sum, ci) => sum + ci.quantity, 0);
}
