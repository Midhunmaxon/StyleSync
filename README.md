# StyleSync — Project Handoff

This document is a snapshot of the repository's current progress and a copy-ready brief for an AI coding assistant continuing the work. Treat the code in this repository as the source of truth; verify behavior before extending it.

## Copy-ready continuation prompt

> You are continuing development of **StyleSync**, a MERN-stack fashion e-commerce application. First inspect the existing implementation and follow its conventions. Do not replace working features or assume that a UI, schema, or API is fully integrated just because it exists.
>
> ### Project status
> - The React/Vite frontend has a fashion storefront, product catalog and detail page, login and registration screens, a browser-persisted cart, and a checkout form.
> - The Express backend connects to MongoDB and has product, outfit, registration, and login APIs.
> - Product data and complete-look recommendations are intended to come from the backend.
> - Cart persistence currently uses `localStorage`; the backend has a Cart model but no cart API routes.
> - Checkout currently collects delivery details and displays a simulated order-ready message. It does not create an order or process payment.
>
> ### Existing routes and capabilities
> - Frontend routes are declared in `frontend/src/main.jsx`: `/`, `/products`, `/product/:id`, `/cart`, `/payment`, `/login`, and `/register`.
> - The home page loads all products, trending products, featured products, and complete looks. It also contains category, benefits, newsletter, and footer sections.
> - The catalog fetches products and supports client-side category, text search, price, style, occasion, and rating filtering, plus sorting. Cart and wishlist controls are present.
> - Product details fetch a product by ID, allow image/size/color/quantity selection, and provide add-to-cart and buy-now flows.
> - Registration and login call the backend. Passwords are hashed on registration; login returns a JWT which the frontend stores in `localStorage`.
> - Product APIs include list, single-product, search, filter, trending, featured, and authenticated create/update/delete operations.
> - Complete looks are generated from in-stock products matching style and occasion, grouped into tops, bottoms, and shoes, and limited by an optional total budget.
>
> ### Important unfinished work and caveats
> - No real order creation, payment provider, or order history is implemented.
> - The cart is not synchronized to MongoDB, despite `backend/models/Cart.js` existing.
> - Wishlist state is currently in frontend component state; do not treat it as persistent account data.
> - The frontend calls `http://localhost:5000` directly in multiple places. There is no shared environment-based API configuration yet.
> - The home-page shipping announcement says free shipping above ₹1499; cart and checkout calculations use ₹3000. Confirm the intended threshold before changing it.
> - `frontend/src/main.jsx` imports `./pages/Products.jsx`, while the checked-in filename is `frontend/src/pages/products.jsx`. Windows may resolve this case-insensitively; verify/fix this before relying on case-sensitive systems.
> - Product and outfit screens depend on suitable MongoDB data. No seed-data workflow is documented here.
> - There is no `.env.example` currently. The backend needs `MONGO_URI` and `JWT_SECRET`; `PORT` is optional and defaults to `5000`.
> - Frontend scripts include `dev`, `build`, and `lint`. Backend scripts include `start` and `dev`; no test script is defined in either package manifest.
>
> ### Development instructions
> 1. Ask for the next feature or bug to implement if it has not been specified; do not choose a major product direction on the user's behalf.
> 2. Trace the relevant frontend and backend flow before editing. Preserve existing behavior and visual conventions.
> 3. Implement the smallest complete change across every affected layer. Keep loading, empty, validation, and error states explicit.
> 4. Run the narrowest relevant build/lint/test checks available. Report commands run, results, and any checks that could not be performed.
> 5. Finish with a concise summary of changes, remaining limitations, and the best next step. Do not claim an integration works unless it has been verified.

## Project overview

StyleSync is a fashion e-commerce web application using a React/Vite frontend and an Express/MongoDB backend.

## Repository map

```text
frontend/
  src/
    App.jsx                 Home/storefront page
    main.jsx                React Router setup
    services/productApi.js  Shared home-page product/look requests
    pages/
      products.jsx          Product catalog
      productDetails.jsx    Product detail and buy-now entry
      Cart.jsx              Local-storage cart
      Buy.jsx               Checkout form (no order/payment API)
      Login.jsx             Login screen
      Register.jsx          Registration screen
    assets/
  package.json              Frontend scripts and dependencies

backend/
  server.js                 Server startup and database connection
  app.js                    Express middleware and API mounting
  config/db.js              Mongoose connection
  models/                   User, Product, and Cart schemas
  controllers/              Product, outfit, registration, and login logic
  routes/                   Auth, product, and outfit endpoints
  middlewares/authMiddleware.js
  package.json              Backend scripts and dependencies
```

## Local development

Use two terminals. Install dependencies in each application folder if they are not already installed.

Backend (create `backend/.env` locally; do not commit secrets):

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_long_random_secret
PORT=5000
```

```powershell
cd backend
npm install
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

The Vite development server defaults to `http://localhost:5173`; the backend defaults to port `5000`. The frontend currently expects the backend at `http://localhost:5000`.

## Suggested next-step sequence

These are candidates, not assumed requirements. Confirm the user's priority before starting a substantial feature:

1. Verify frontend build/lint and backend startup; resolve the filename-case import issue.
2. Add a documented product seed-data workflow so catalog, featured/trending sections, and complete looks can be exercised consistently.
3. Decide whether to implement persistent user carts and wishlists, or keep them browser-local.
4. Implement a real order lifecycle and payment integration only after checkout requirements and provider are chosen.
5. Add focused automated tests around whichever end-to-end flow is implemented next.


## AI Stylist

StyleSync includes an optional AI Stylist at `/ai-stylist`. It uses the backend to interpret a natural-language fashion request and recommend only products that exist in the MongoDB catalogue. The OpenAI API key stays on the backend.

### Backend AI setup

Create `backend/.env` and add:

```env
MONGO_URI=mongodb://localhost:27017/StyleSync
JWT_SECRET=your_secret
PORT=5000
OPENAI_API_KEY=your_openai_api_key
OPENAI_MODEL=gpt-5.4-mini
```

Then start the backend normally with `npm run dev`. The frontend AI Stylist is available from the home-page navigation or `/ai-stylist`.


## StyleSync completed application architecture

### Customer
- Login/register required before entering the storefront.
- Secure JWT authentication in an HttpOnly cookie.
- Individual customer profile.
- MongoDB-backed cart per customer.
- Product browsing, filters, product details and AI Stylist.
- Demo checkout without a real payment gateway.
- Orders are created in MongoDB and inventory is reduced.
- Order success page and My Orders history.
- Customer logout.

### Admin
- Separate `/admin/login` portal.
- Admin role checked by backend middleware.
- Add/edit/delete products.
- Multiple product image URLs (one per line).
- Inventory and catalogue flags.
- Customer order list and order-status management.

### Order lifecycle
`Cart -> Checkout -> POST /api/orders -> MongoDB Order -> clear cart -> Order Success -> My Orders`

Payment is intentionally not integrated. Orders use `Cash on Delivery` / `Pending` as the demo payment state.

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and add real values.
2. Copy `frontend/.env.example` to `frontend/.env`.
3. In `backend` run `npm install`.
4. In `frontend` run `npm install`.
5. Create the first admin:
   `npm run create:admin`
6. If old products are missing images:
   `npm run backfill:images`
7. Start backend:
   `npm run dev`
8. Start frontend:
   `npm run dev`

## Production deployment

### MongoDB Atlas
Create a production database and put its connection string in the backend `MONGO_URI`.

### Backend
Deploy the `backend` folder to Render (or another Node host).
Set:
- `NODE_ENV=production`
- `MONGO_URI`
- `JWT_SECRET`
- `FRONTEND_URL=https://your-frontend-domain`
- AI variables if AI Stylist is used.

### Frontend
Deploy the `frontend` folder to Vercel.
Set:
- `VITE_API_URL=https://your-backend-domain`

After deployment, test login, refresh, cart, checkout, orders, profile, admin product CRUD and logout.
