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
- POST /orders/checkout (auth required) { items: [{productId, quantity}], payment: { ... } }

Auth token must be returned as { token, user } and will be sent with Authorization: Bearer <token> header.

## Notes

- Cart and auth are stored in localStorage.
- Minimal styling defined in src/styles/global.css with colors:
  - primary: #0052cc
  - secondary: #36b37e
  - accent: #ffab00
