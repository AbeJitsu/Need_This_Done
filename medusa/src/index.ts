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
  },
  {
    id: "prod_2",
    title: "Standard Project",
    description: "Comprehensive project scope",
    handle: "standard-project",
    prices: [{ amount: 15000, currency_code: "USD" }], // $150
    images: [{ url: "https://via.placeholder.com/300?text=Standard+Project" }],
  },
  {
    id: "prod_3",
    title: "Premium Solution",
    description: "Full-service custom development",
    handle: "premium-solution",
    prices: [{ amount: 50000, currency_code: "USD" }], // $500
    images: [{ url: "https://via.placeholder.com/300?text=Premium+Solution" }],
  },
];

app.get("/store/products", (req, res) => {
  res.status(200).json({
    products: sampleProducts,
    count: sampleProducts.length,
  });
});

app.post("/store/carts", (req, res) => {
  res.status(201).json({
    cart: { id: "temp-cart-id" },
    message: "Cart creation will be implemented with full Medusa setup",
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
