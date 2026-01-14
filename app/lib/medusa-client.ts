// ============================================================================
// Medusa API Client
// ============================================================================
// What: Wrapper around Medusa backend API with error handling and retry logic
// Why: Centralizes communication with Medusa, handles auth, and provides type safety
// How: Fetch wrapper with retry logic, cookie management, and error handling

// NEXT_PUBLIC_MEDUSA_URL is your Railway Medusa backend URL
const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || process.env.MEDUSA_BACKEND_URL;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface MedusaError {
  message: string;
  code?: string;
  status?: number;
}

// ============================================================================
// Retry Logic
// ============================================================================
// What: Retry failed requests with exponential backoff
// Why: Handles temporary network issues and service unavailability
// How: Wait, then retry up to MAX_RETRIES times

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 0
): Promise<Response> {
  try {
    const finalOptions = {
      ...options,
      // Removed credentials: "include" to test if it's causing response filtering
      headers: {
        "Content-Type": "application/json",
        ...(PUBLISHABLE_KEY && { "x-publishable-api-key": PUBLISHABLE_KEY }),
        ...options.headers,
      },
    };

    const response = await fetch(url, finalOptions as RequestInit);

    // Success - return response
    if (response.ok) return response;

    // Server errors (5xx) - retry
    if (response.status >= 500 && retries < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (retries + 1)));
      return fetchWithRetry(url, options, retries + 1);
    }

    return response;
  } catch (error) {
    // Network errors - retry
    if (retries < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (retries + 1)));
      return fetchWithRetry(url, options, retries + 1);
    }
    throw error;
  }
}

// ============================================================================
// Response Handler
// ============================================================================
// What: Parse and validate API responses
// Why: Consistent error handling and type safety
// How: Check status, parse JSON, handle errors

async function handleResponse<T>(response: Response): Promise<T> {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const error: MedusaError = {
      message: data?.message || `HTTP ${response.status}`,
      code: data?.code,
      status: response.status,
    };
    throw error;
  }

  return data as T;
}

// ============================================================================
// Product API
// ============================================================================
// What: Fetch products from Medusa catalog
// Why: Display products in storefront
// How: Query Medusa product endpoints

interface ProductVariant {
  id: string;
  title: string;
  product_id: string;
  prices?: { amount: number; currency_code: string }[];
  calculated_price?: {
    calculated_amount: number;
    currency_code: string;
    original_amount: number;
  };
  inventory_quantity?: number;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
  options?: any[];
  metadata?: { base_price_usd?: number; [key: string]: any };
}

interface Product {
  id: string;
  title: string;
  description?: string;
  handle: string;
  prices?: { amount: number; currency_code: string }[];
  images?: { url: string }[];
  variants?: ProductVariant[];
  metadata?: {
    requires_appointment?: boolean;
    duration_minutes?: number;
    [key: string]: any;
  };
}

// ============================================================================
// Pagination Types
// ============================================================================

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface PaginatedProducts {
  products: Product[];
  count: number;
}

export const products = {
  /**
   * List products with optional pagination
   * GET /store/products
   *
   * @param params - Optional pagination params (limit, offset)
   * @returns Products array (for backwards compatibility) or paginated response
   *
   * Examples:
   * - products.list() - returns all products (array)
   * - products.list({ limit: 10, offset: 0 }) - returns paginated response
   */
  list: async (params?: PaginationParams): Promise<Product[] | PaginatedProducts> => {
    // Build URL with pagination params
    const queryParams = new URLSearchParams();

    // Get default region for pricing context
    const regionsResponse = await fetchWithRetry(`${MEDUSA_URL}/store/regions`);
    const regionsData = await handleResponse<{ regions: { id: string }[] }>(regionsResponse);
    if (regionsData.regions?.[0]) {
      queryParams.append('region_id', regionsData.regions[0].id);
    }

    // Add pagination if provided
    if (params) {
      if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
      if (params.offset !== undefined) queryParams.append('offset', params.offset.toString());
    }

    const url = `${MEDUSA_URL}/store/products?${queryParams.toString()}`;

    const response = await fetchWithRetry(url);
    const data = await handleResponse<{ products: Product[]; count?: number }>(response);

    // Return paginated response if params were provided, array otherwise (backwards compatible)
    if (params) {
      return {
        products: data.products || [],
        count: data.count ?? data.products?.length ?? 0,
      };
    }
    return data.products || [];
  },

  /**
   * Get single product by ID
   * GET /store/products/:id
   */
  get: async (id: string): Promise<Product> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/products/${id}`);
    const data = await handleResponse<{ product: Product }>(response);
    return data.product;
  },

  /**
   * Get single product by handle
   * GET /store/products?handle=:handle
   */
  getByHandle: async (handle: string): Promise<Product | null> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/products?handle=${encodeURIComponent(handle)}`);
    const data = await handleResponse<{ products: Product[] }>(response);
    return data.products?.[0] || null;
  },
};

// ============================================================================
// Cart API
// ============================================================================
// What: Manage shopping carts
// Why: Store items user wants to purchase
// How: Create, update, and retrieve cart state

interface LineItem {
  id?: string;
  variant_id: string;
  quantity: number;
  title?: string;         // Product title from Medusa cart expansion
  description?: string;   // Product description
  unit_price?: number;    // Price per unit in cents
  thumbnail?: string;     // Product thumbnail URL
  variant?: ProductVariant;
  product?: Product;
}

interface Cart {
  id: string;
  items: LineItem[];
  subtotal: number;
  total: number;
  tax_total?: number;
}

export const carts = {
  /**
   * Create new cart
   * POST /store/carts
   */
  create: async (): Promise<Cart> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/carts`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Retrieve cart by ID with product metadata
   * GET /store/carts/:id?expand=items.variant.product
   */
  get: async (cartId: string): Promise<Cart> => {
    // Expand items to include variant and product with metadata
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/carts/${cartId}?expand=items.variant.product`
    );
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Update cart details (email, shipping address, etc.)
   * POST /store/carts/:id
   */
  update: async (cartId: string, updates: { email?: string }): Promise<Cart> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/carts/${cartId}`, {
      method: "POST",
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Add item to cart
   * POST /store/carts/:id/line-items
   */
  addItem: async (cartId: string, variantId: string, quantity: number): Promise<Cart> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/carts/${cartId}/line-items`, {
      method: "POST",
      body: JSON.stringify({
        variant_id: variantId,
        quantity,
      }),
    });
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Update line item quantity
   * POST /store/carts/:id/line-items/:line_id
   */
  updateItem: async (
    cartId: string,
    lineItemId: string,
    quantity: number
  ): Promise<Cart> => {
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/carts/${cartId}/line-items/${lineItemId}`,
      {
        method: "POST",
        body: JSON.stringify({ quantity }),
      }
    );
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Remove item from cart
   * DELETE /store/carts/:id/line-items/:line_id
   */
  removeItem: async (cartId: string, lineItemId: string): Promise<Cart> => {
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/carts/${cartId}/line-items/${lineItemId}`,
      {
        method: "DELETE",
      }
    );
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Initialize payment sessions for cart
   * POST /store/carts/:id/payment-sessions
   * Returns available payment providers
   */
  initializePaymentSessions: async (cartId: string): Promise<Cart> => {
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/carts/${cartId}/payment-sessions`,
      {
        method: "POST",
        body: JSON.stringify({}),
      }
    );
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Select payment session provider
   * POST /store/carts/:id/payment-session
   * Required before completing cart
   */
  selectPaymentSession: async (cartId: string, providerId: string): Promise<Cart> => {
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/carts/${cartId}/payment-session`,
      {
        method: "POST",
        body: JSON.stringify({ provider_id: providerId }),
      }
    );
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },
};

// ============================================================================
// Order API
// ============================================================================
// What: Create and retrieve orders
// Why: Process checkouts and track order history
// How: Complete cart as order, fetch order details

interface Order {
  id: string;
  cart_id: string;
  customer_id?: string;
  email: string;
  items: LineItem[];
  total: number;
  status: "pending" | "completed" | "canceled";
  created_at: string;
}

export const orders = {
  /**
   * Create order from cart
   * POST /store/carts/:id/complete-cart
   * Note: Medusa v1 returns { type: "order", data: Order } not { order: Order }
   */
  create: async (cartId: string): Promise<Order> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/carts/${cartId}/complete-cart`, {
      method: "POST",
      body: JSON.stringify({}),
    });
    const data = await handleResponse<{ type: string; data: Order }>(response);
    return data.data;
  },

  /**
   * Get order by ID
   * GET /store/orders/:id
   */
  get: async (orderId: string): Promise<Order> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/orders/${orderId}`);
    const data = await handleResponse<{ order: Order }>(response);
    return data.order;
  },

  /**
   * List orders by email (guest orders)
   * GET /store/orders?email=:email
   */
  listByEmail: async (email: string): Promise<Order[]> => {
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/orders?email=${encodeURIComponent(email)}`
    );
    const data = await handleResponse<{ orders: Order[] }>(response);
    return data.orders || [];
  },
};

// ============================================================================
// Admin API (for creating products, managing inventory)
// ============================================================================
// What: Admin endpoints for product management
// Why: Create/edit products and manage inventory in admin dashboard
// How: Authenticated requests with admin JWT

interface AdminProduct {
  id: string;
  title: string;
  description?: string;
  handle: string;
  prices: { amount: number; currency_code: string }[];
}

export const admin = {
  /**
   * Create product (admin only)
   * POST /admin/products
   * Requires auth token in header
   */
  createProduct: async (
    token: string,
    product: Partial<AdminProduct>
  ): Promise<AdminProduct> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/admin/products`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(product),
    });
    const data = await handleResponse<{ product: AdminProduct }>(response);
    return data.product;
  },

  /**
   * Update product (admin only)
   * POST /admin/products/:id
   */
  updateProduct: async (
    token: string,
    productId: string,
    updates: Partial<AdminProduct>
  ): Promise<AdminProduct> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/admin/products/${productId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ product: AdminProduct }>(response);
    return data.product;
  },

  /**
   * Delete product (admin only)
   * DELETE /admin/products/:id
   */
  deleteProduct: async (token: string, productId: string): Promise<void> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/admin/products/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    await handleResponse<{ success: boolean }>(response);
  },
};

// ============================================================================
// Export client
// ============================================================================

export const medusaClient = {
  products,
  carts,
  orders,
  admin,
};

export type { Product, ProductVariant, Cart, LineItem, Order, AdminProduct, MedusaError, PaginationParams, PaginatedProducts };
