# KeyForge

Mechanical keyboard e-commerce web app: product catalog, cart, checkout, order
tracking, JWT authentication, and an admin dashboard with analytics.

| Layer    | Tech                                             |
| -------- | ------------------------------------------------ |
| Frontend | React 19, Vite (rolldown), React Router 7, Context API |
| Backend  | FastAPI, Motor (async MongoDB), bcrypt, PyJWT    |
| Hosting  | Vercel (static frontend + Python serverless API) |

## Project structure

```
KeyForgeBuild/
├── api/                  # Vercel serverless entry point (imports Backend.main.app)
├── Backend/              # FastAPI application (package: Backend)
│   ├── main.py           # App factory: CORS, static assets, routers, health check
│   ├── database.py       # Motor client + database handle
│   ├── security.py       # Password hashing, JWT issue/verify, auth dependencies
│   ├── schemas.py        # Pydantic models + shared order-status constants
│   ├── utils.py          # Shared serializers and stock adjustment
│   ├── routers/          # auth, products, orders, admin
│   ├── seed.py           # Product seeding script
│   ├── promote_admin.py  # Grants admin role to a user
│   └── requirements.txt
├── Frontend/             # Self-contained Vite React app
│   ├── index.html
│   ├── vite.config.js    # Dev server + /api proxy to localhost:5000
│   ├── main.jsx / App.jsx / App.css
│   ├── components/       # Navbar, ProductCard, AdminCharts, ...
│   ├── context/          # Auth, Cart, Theme providers
│   ├── pages/            # Home, Checkout, MyOrders, AdminDashboard, ...
│   ├── services/         # API layer (http client, products, admin)
│   ├── constants.js      # Shared order-status constants
│   ├── utils/            # Small helpers (shortId)
│   ├── assets/           # Product images (served by the backend)
│   └── public/           # Static files copied verbatim by Vite
├── package.json          # Root orchestrator scripts (dev:all, build, seed)
├── vercel.json           # Deployment config
└── .env.example          # Template for local environment variables
```

## Prerequisites

- Node.js 20+
- Python 3.11+
- A MongoDB database (Atlas or local)

## Setup

```bash
# 1. Install JS dependencies (root tooling + frontend)
npm run setup

# 2. Create the Python virtual environment and install backend deps
python -m venv Backend/.venv
Backend\.venv\Scripts\pip install -r Backend/requirements.txt

# 3. Configure environment variables
copy .env.example .env
# then edit .env with your MONGODB_URI and JWT_SECRET

# 4. (First time only) seed the product catalog
npm run seed
```

> On macOS/Linux use `Backend/.venv/bin/python` and `Backend/.venv/bin/pip` instead.

## Development

```bash
npm run dev:all     # frontend (http://localhost:5173) + API (http://localhost:5000) together
npm run dev         # frontend only (proxies /api to localhost:5000)
npm run dev:server  # backend only (uvicorn with --reload)
```

## Useful commands

| Command                              | What it does                          |
| ------------------------------------ | ------------------------------------- |
| `npm run build`                      | Production build of the frontend      |
| `npm run lint`                       | ESLint over the frontend              |
| `npm run seed`                       | Replaces all products with seed data  |
| `Backend\.venv\Scripts\python -m Backend.promote_admin <email>` | Makes a signed-up user an admin |

## Environment variables

Defined in `.env` at the repo root (see `.env.example`).

| Variable         | Required | Description                                  |
| ---------------- | -------- | -------------------------------------------- |
| `MONGODB_URI`    | yes      | MongoDB connection string (database name in the URI is used) |
| `JWT_SECRET`     | yes      | Secret for signing JWTs                      |
| `JWT_EXPIRY_DAYS`| no       | Token lifetime in days (default: 7)          |
| `CORS_ORIGINS`   | no       | Comma-separated allowed origins (default: `*`) |

## API overview

All endpoints are prefixed with `/api`.

| Method & path                  | Auth  | Description                      |
| ------------------------------ | ----- | -------------------------------- |
| `GET /products`                | —     | List products (`?search=`, `?category=`) |
| `GET /products/categories`     | —     | Distinct categories              |
| `GET /products/{id}`           | —     | Single product                   |
| `POST /auth/signup`            | —     | Register, returns JWT + user     |
| `POST /auth/login`             | —     | Login, returns JWT + user        |
| `GET /auth/me`                 | JWT   | Current user                     |
| `POST /orders`                 | JWT   | Place order (totals computed server-side) |
| `GET /orders`                  | JWT   | Current user's orders            |
| `POST /orders/{id}/cancel`     | JWT   | Cancel a pending/confirmed order |
| `GET /admin/products`          | admin | All products                     |
| `POST /admin/products`         | admin | Create product                   |
| `PUT /admin/products/{id}`     | admin | Update product                   |
| `DELETE /admin/products/{id}`  | admin | Delete product                   |
| `GET /admin/orders`            | admin | All orders with user emails      |
| `PUT /admin/orders/{id}`       | admin | Update order status              |
| `GET /admin/stats`             | admin | Dashboard chart data             |
| `GET /health`                  | —     | Health check                     |

## Deployment (Vercel)

`vercel.json` builds two targets:

1. **`api/index.py`** — the FastAPI app as a Python serverless function.
   Env vars `MONGODB_URI` and `JWT_SECRET` must be set in the Vercel project.
2. **`Frontend/package.json`** — static frontend build served with SPA fallback.

Product images are stored in MongoDB as absolute `/src/assets/...` URLs and are
served by the API function from `Frontend/assets/`.
