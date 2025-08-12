# Ecommerce Frontend (Astro)

A modern, minimalistic light-themed ecommerce UI built with Astro.

Features:
- Product catalog and search
- Category side menu
- Shopping cart (drawer + full page)
- User authentication (login/register modals)
- Checkout/payment interface (demo)
- Order history (requires auth)
- Responsive design
- Layout with header/nav, side menu, main content, cart drawer, authentication modals, and footer

Tech:
- Astro 5
- Vanilla JS and Astro components
- REST API integration (configurable via env)

## Getting started

1) Install dependencies:
   npm install

2) Configure environment:
   Copy .env.example to .env and set:
   - PUBLIC_API_BASE_URL=https://your-backend-api.example.com
   - PUBLIC_SHIPPING_RATE_API_URL=https://your-shipping-rate-service.example.com  # optional; if absent, demo rates are used
   - PUBLIC_DEFAULT_SHIPPING_ORIGIN_COUNTRY=US                                   # optional; used by backend rate calculation
   - PUBLIC_DEFAULT_SHIPPING_ORIGIN_POSTAL=10001                                  # optional; used by backend rate calculation
   - PUBLIC_ENABLE_SHIPPING_DEMO=true                                             # optional; enables fallback demo rates in UI

3) Run locally:
   npm run dev

Visit http://localhost:3000

## API integration

All network requests use the PUBLIC_API_BASE_URL environment variable. If not set, the UI will use demo fallback data and remain functional.

Expected endpoints (typical):
- GET /categories
- GET /products?q=&category=&page=&pageSize=
- GET /products/:id
- POST /auth/login { email, password }
- POST /auth/register { name, email, password }
- GET /orders (auth required)
- POST /orders/checkout (auth required) {
    items: [{ productId, quantity }],
    payment: { ... },
    shipping: {
      address: { line1, line2?, city, state?, postalCode, country, name?, phone? },
      option: { id, carrier, service, label, estimatedDays, amount, currency?, meta? }
    }
  }
- POST /shipping/rates { destination, cart, subtotal? } -> ShippingOption[]

Shipping rate integration:
- If PUBLIC_SHIPPING_RATE_API_URL is set, the UI will call POST {PUBLIC_SHIPPING_RATE_API_URL}/rates with the same payload as /shipping/rates.
- If neither is available, the UI gracefully falls back to demo rate calculation (no external calls, for local development).

Security note:
- Do NOT expose courier provider secret keys in the frontend. Integrate with couriers (Shippo, ShipEngine, EasyPost, etc.) on your backend and expose a single rates endpoint to the UI.

## Shipping UI and real-time rates

- The Checkout page now includes:
  - Shipping address form
  - "Get shipping rates" action to fetch real-time rates (or demo fallback)
  - A selectable list of shipping options (standard/expedited/overnight by default in demo)
  - Order summary updates (Subtotal, Shipping, Total) and the Pay button amount updates to include shipping.

- Backend integration options:
  - Implement POST /shipping/rates on your backend to aggregate courier quotes (Shippo, ShipEngine, EasyPost, etc.) and return an array of ShippingOption.
  - Alternatively, set PUBLIC_SHIPPING_RATE_API_URL to a server-side service you control that returns rates with the same payload/shape.

- The frontend never uses courier provider secret keys directly.

## Notes

- Cart and auth are stored in localStorage.
- Minimal styling defined in src/styles/global.css with colors:
  - primary: #0052cc
  - secondary: #36b37e
  - accent: #ffab00
