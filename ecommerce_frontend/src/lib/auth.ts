/**
 * Client-side auth utilities for managing token and user state.
 */
import type { User } from "./types";

// PUBLIC_INTERFACE
export function getAuthToken(): string | null {
  /** Retrieves the current auth token from localStorage. */
  try {
    return localStorage.getItem("auth_token");
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function getCurrentUser<T = unknown>(): T | null {
  /** Retrieves the current user object from localStorage. */
  try {
    const raw = localStorage.getItem("auth_user");
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function setAuth(token: string, user: User): void {
  /** Sets the auth token and user in localStorage and emits an auth:changed event. */
  try {
    localStorage.setItem("auth_token", token);
    localStorage.setItem("auth_user", JSON.stringify(user));
    window.dispatchEvent(new CustomEvent("auth:changed", { detail: { token, user } }));
  } catch {
    // ignore
  }
}

// PUBLIC_INTERFACE
export function clearAuth(): void {
  /** Clears auth token and user info from localStorage and emits an auth:changed event. */
  try {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    window.dispatchEvent(new CustomEvent("auth:changed", { detail: { token: null, user: null } }));
  } catch {
    // ignore
  }
}
