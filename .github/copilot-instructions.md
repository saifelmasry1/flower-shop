## Quick Orientation for AI Coding Agents

This repo is a full-stack React + Node.js e-commerce sample (Flower Shop). Below are the essential, actionable details an AI agent needs to be productive here.

**Architecture:**
- **Frontend:** `client/` — Vite + React (ESM). Entry: `client/src/main.jsx`. Uses `Axios` and `react-router-dom`.
- **Backend:** `server/` — Express (ESM) + Mongoose. Entry: `server/server.js`. Routes live in `server/routes/` and models in `server/models/`.
- **Dev/runtime:** Project supports local runs and Docker (see `docker-compose.yml`, `client/Dockerfile`, `server/Dockerfile`). The server gracefully falls back to in-repo mock data when MongoDB is unavailable.

**Important commands**
- Start backend (nodemon): `cd server; npm run dev` (runs `server.js` with `nodemon`).
- Seed DB: `cd server; npm run seed` (writes product documents to MongoDB).
- Start frontend: `cd client; npm run dev` (Vite dev server).
- Build frontend: `cd client; npm run build`.

**Environment & configuration**
- Server expects environment vars in `server/.env`: `PORT`, `MONGODB_URI`, `NODE_ENV`.
- `package.json` files use `type: "module"` → use `import`/`export` style.

**API surface & conventions**
- Health: `GET /api/health` — quick check the server is running.
- Products: `GET /api/products` supports query params: `?category=`, `?featured=true`, `?limit=`.
- Orders: `POST /api/orders` returns created order populated with product refs. Status update: `PATCH /api/orders/:id/status` (valid statuses: `pending, processing, shipped, delivered, cancelled`).
- Routes return JSON and use standard HTTP status codes. Update/delete endpoints use `runValidators: true` and expect validated payloads.

**Data-model specifics (important when editing/validating payloads)**
- `server/models/Product.js`: `category` enum = `['roses','tulips','orchids','mixed','seasonal']`. `price` is Number >= 0.
- `server/models/Order.js`: `items` contain `{ product: ObjectId ref 'Product', quantity, price }` and `status` enum as above.

**Notable implementation patterns**
- MongoDB fallback: `server/routes/products.js` attempts DB queries and falls back to `mockProducts` if the DB is unavailable. Be careful when changing product-listing logic — preserve fallback behavior or update both branches.
- Sorting: most list endpoints sort by `createdAt: -1`.
- Update semantics: `findByIdAndUpdate(..., { new: true, runValidators: true })` is used — maintain validator usage on updates.

**Frontend patterns to follow**
- Cart state is in `client/src/context/CartContext.jsx` and persists to `localStorage`. Keep changes that touch cart shape compatible with that file.
- Pages live in `client/src/pages/` (e.g., `Products.jsx`, `ProductDetail.jsx`, `Cart.jsx`). Components follow simple presentational + page separation (see `client/src/components/`).

**Debugging tips**
- If the backend starts but products appear empty, check `MongoDB` connectivity — server logs a warning and will use mock data instead of failing.
- Use `GET /api/health` to confirm server up before running frontend.

**When changing APIs**
- Update route handlers in `server/routes/*` and corresponding model constraints in `server/models/*`.
- If altering shape of order or product payloads, update `client/src` components that construct these payloads (search for `.post('/api/orders'` or axios calls in `client/src`).

**Files to inspect first for most tasks**
- `server/server.js`, `server/routes/products.js`, `server/routes/orders.js`, `server/models/*.js`, `server/seed.js`
- `client/src/context/CartContext.jsx`, `client/src/pages/*`, `client/package.json`, `client/vite.config.js`

If anything here is unclear or you want the instructions to favour more/less autonomy (e.g., strict test-first edits vs. quick patches), tell me which tone to adopt and I will iterate.
