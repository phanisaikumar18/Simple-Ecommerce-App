# Simple E-commerce API

A Node.js + Express REST API for a simple e-commerce platform with user authentication, roles (customer/admin), product listing, cart management, and order creation.

## Features
- User registration & login (JWT authentication)
- Customer & admin roles
- Product listing with pagination & search
- Cart management (add, update, remove items)
- Order creation from cart
- Admin product management (add, update, delete)
- Basic frontend (optional)

## Getting Started

### Prerequisites
- Node.js
- MySQL

### Installation
1. Clone the repo and navigate to the project folder.
2. Install dependencies:
   ```sh
   npm install
   ```
3. Create a `.env` file in the root with your DB and JWT settings:
   ```env
   JWT_SECRET=your_jwt_secret
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=your_db_name
   ```
4. Set up your MySQL database and tables (see `/config/db.js` for connection).
5. Start the server:
   ```sh
   node server.js
   ```

## API Endpoints
- `POST /api/auth/register` — Register a new user
- `POST /api/auth/login` — Login and get JWT
- `GET /api/products` — List products (with pagination/search)
- `POST /api/cart/add` — Add item to cart (auth required)
- `POST /api/orders/create` — Create order from cart (auth required)
- Admin endpoints: `POST/PUT/DELETE /api/products` (admin only)

## License
MIT
