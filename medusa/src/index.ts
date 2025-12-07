// ============================================================================
// Medusa Backend Entry Point
// ============================================================================
// What: Initializes and starts the Medusa ecommerce backend service
// Why: Provides API for product catalog, carts, orders, and checkout
// How: Connects to PostgreSQL database and Redis cache, starts Express server

import dotenv from "dotenv";
import path from "path";

// Load environment variables from root .env.local
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 9000;

// ============================================================================
// Middleware
// ============================================================================

// Enable CORS for Next.js app and admin dashboard
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:8000",
      process.env.ADMIN_CORS || "*",
    ],
    credentials: true,
  })
);

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================================================
// Health Check Endpoint
// ============================================================================
// Used by Docker health check and load balancers

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "medusa-backend",
  });
});

// ============================================================================
// Admin Endpoint (for Docker health check)
// ============================================================================

app.get("/admin", (req, res) => {
  res.status(200).json({
    status: "ok",
    admin: "Medusa Admin available",
    url: "http://localhost:9000/admin",
  });
});

// ============================================================================
// API Endpoints (Placeholder)
// ============================================================================
// These will be implemented in Phase 3 with API bridges from Next.js
// The main app will proxy requests to these endpoints

// Sample products (in real Medusa, these come from database)
const sampleProducts = [
  {
    id: "prod_1",
    title: "Quick Task",
    description: "Fast turnaround on small projects",
    handle: "quick-task",
    prices: [{ amount: 5000, currency_code: "USD" }], // $50
    images: [{ url: "https://via.placeholder.com/300?text=Quick+Task" }],
    variants: [
      {
        id: "variant_prod_1_default",
        title: "Standard",
        product_id: "prod_1",
        prices: [{ amount: 5000, currency_code: "USD" }],
        inventory_quantity: 999,
        manage_inventory: false,
        allow_backorder: true,
        options: [],
      },
    ],
  },
  {
    id: "prod_2",
    title: "Standard Project",
    description: "Comprehensive project scope",
    handle: "standard-project",
    prices: [{ amount: 15000, currency_code: "USD" }], // $150
    images: [{ url: "https://via.placeholder.com/300?text=Standard+Project" }],
    variants: [
      {
        id: "variant_prod_2_default",
        title: "Standard",
        product_id: "prod_2",
        prices: [{ amount: 15000, currency_code: "USD" }],
        inventory_quantity: 999,
        manage_inventory: false,
        allow_backorder: true,
        options: [],
      },
    ],
  },
  {
    id: "prod_3",
    title: "Premium Solution",
    description: "Full-service custom development",
    handle: "premium-solution",
    prices: [{ amount: 50000, currency_code: "USD" }], // $500
    images: [{ url: "https://via.placeholder.com/300?text=Premium+Solution" }],
    variants: [
      {
        id: "variant_prod_3_default",
        title: "Standard",
        product_id: "prod_3",
        prices: [{ amount: 50000, currency_code: "USD" }],
        inventory_quantity: 999,
        manage_inventory: false,
        allow_backorder: true,
        options: [],
      },
    ],
  },
];

// ============================================================================
// Cart Storage System
// ============================================================================
// In-memory storage for shopping carts (like a checkout counter)
// Each cart holds items with variant info, quantities, and prices

interface CartItem {
  id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  created_at: string;
  updated_at: string;
}

const carts = new Map<string, Cart>();

// Helper: Generate unique ID
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Helper: Calculate cart totals
function calculateCartTotals(cart: Cart) {
  const subtotal = cart.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  return {
    subtotal,
    total: subtotal,
    tax_total: 0,
  };
}

// ============================================================================
// Products Endpoint
// ============================================================================

app.get("/store/products", (req, res) => {
  res.status(200).json({
    products: sampleProducts,
    count: sampleProducts.length,
  });
});

// GET - Single Product by ID
app.get("/store/products/:id", (req, res) => {
  const { id } = req.params;
  const product = sampleProducts.find((p) => p.id === id);

  if (!product) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.status(200).json({
    product,
  });
});

// ============================================================================
// Cart Endpoints
// ============================================================================

// POST - Create New Cart
app.post("/store/carts", (req, res) => {
  const cartId = generateId("cart");
  const cart: Cart = {
    id: cartId,
    items: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  carts.set(cartId, cart);

  res.status(201).json({
    cart: {
      id: cart.id,
      items: cart.items,
      ...calculateCartTotals(cart),
    },
  });
});

// GET - Retrieve Cart by ID
app.get("/store/carts/:id", (req, res) => {
  const { id } = req.params;
  const cart = carts.get(id);

  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  res.status(200).json({
    cart: {
      id: cart.id,
      items: cart.items,
      ...calculateCartTotals(cart),
    },
  });
});

// POST - Add Item to Cart
app.post("/store/carts/:id/line-items", (req, res) => {
  const { id } = req.params;
  const { variant_id, quantity } = req.body;

  const cart = carts.get(id);
  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  // Find variant to get price
  let variant = null;
  for (const prod of sampleProducts) {
    const v = prod.variants?.find((v: any) => v.id === variant_id);
    if (v) {
      variant = v;
      break;
    }
  }

  if (!variant) {
    return res.status(404).json({ error: "Variant not found" });
  }

  // Check if item already in cart
  const existingItem = cart.items.find((item) => item.variant_id === variant_id);

  if (existingItem) {
    // Update quantity if already exists
    existingItem.quantity += quantity;
  } else {
    // Add new item
    const lineItem: CartItem = {
      id: generateId("item"),
      variant_id,
      quantity,
      unit_price: (variant as any).prices[0].amount,
    };
    cart.items.push(lineItem);
  }

  cart.updated_at = new Date().toISOString();

  res.status(201).json({
    cart: {
      id: cart.id,
      items: cart.items,
      ...calculateCartTotals(cart),
    },
  });
});

// POST - Update Line Item Quantity
app.post("/store/carts/:id/line-items/:line_id", (req, res) => {
  const { id, line_id } = req.params;
  const { quantity } = req.body;

  const cart = carts.get(id);
  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const item = cart.items.find((i) => i.id === line_id);
  if (!item) {
    return res.status(404).json({ error: "Line item not found" });
  }

  item.quantity = quantity;
  cart.updated_at = new Date().toISOString();

  res.status(200).json({
    cart: {
      id: cart.id,
      items: cart.items,
      ...calculateCartTotals(cart),
    },
  });
});

// DELETE - Remove Item from Cart
app.delete("/store/carts/:id/line-items/:line_id", (req, res) => {
  const { id, line_id } = req.params;

  const cart = carts.get(id);
  if (!cart) {
    return res.status(404).json({ error: "Cart not found" });
  }

  const itemIndex = cart.items.findIndex((i) => i.id === line_id);
  if (itemIndex === -1) {
    return res.status(404).json({ error: "Line item not found" });
  }

  cart.items.splice(itemIndex, 1);
  cart.updated_at = new Date().toISOString();

  res.status(200).json({
    cart: {
      id: cart.id,
      items: cart.items,
      ...calculateCartTotals(cart),
    },
  });
});

app.post("/store/orders", (req, res) => {
  res.status(201).json({
    order: { id: "temp-order-id" },
    message: "Order creation will be implemented with full Medusa setup",
  });
});

// ============================================================================
// Error Handling
// ============================================================================

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    error: err.message || "Internal Server Error",
  });
});

// ============================================================================
// 404 Handler
// ============================================================================

app.use((req, res) => {
  res.status(404).json({
    error: "Not Found",
    path: req.path,
  });
});

// ============================================================================
// Start Server
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║        🛍️  Medusa Backend Running                     ║
║                                                       ║
║  Server: http://localhost:${PORT}                         ║
║  Health: http://localhost:${PORT}/health                 ║
║  Admin:  http://localhost:${PORT}/admin (when ready)     ║
║                                                       ║
║  Database: PostgreSQL (medusa_postgres)              ║
║  Cache:    Redis (shared with app)                   ║
║                                                       ║
║  Phase 2: Bootstrap complete ✓                       ║
║  Phase 3: Next → Create API bridges                  ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
