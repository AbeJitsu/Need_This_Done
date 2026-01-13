// ============================================================================
// Medusa v2 API Client
// ============================================================================
// What: Wrapper around Medusa v2 backend API with error handling and retry logic
// Why: v2 has different API structure than v1 - publishable key auth, different endpoints
// How: Fetch wrapper with retry logic, publishable key header, and type safety
//
// Key v2 differences from v1:
// - Requires x-publishable-api-key header for store API
// - Cart completion endpoint: /store/carts/:id/complete (not /complete-cart)
// - Order response: { order } (not { type, data })
// - Cart creation requires region_id

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL || process.env.MEDUSA_BACKEND_URL;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;
const DEFAULT_REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

interface MedusaError {
  message: string;
  code?: string;
  status?: number;
}

// ============================================================================
// Retry Logic with Publishable Key
// ============================================================================

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 0
): Promise<Response> {
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add publishable API key for store endpoints
    if (PUBLISHABLE_KEY && url.includes('/store/')) {
      headers['x-publishable-api-key'] = PUBLISHABLE_KEY;
    }

    const finalOptions: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, finalOptions);

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
// Product Types (v2)
// ============================================================================

interface ProductVariant {
  id: string;
  title: string;
  product_id: string;
  sku?: string;
  barcode?: string;
  ean?: string;
  upc?: string;
  inventory_quantity?: number;
  manage_inventory?: boolean;
  allow_backorder?: boolean;
  prices: Array<{
    id: string;
    amount: number;
    currency_code: string;
    price_list_id?: string;
  }>;
  options?: Array<{
    id: string;
    value: string;
    option_id: string;
  }>;
  calculated_price?: {
    calculated_amount: number;
    original_amount: number;
    currency_code: string;
  };
}

interface ProductImage {
  id: string;
  url: string;
  alt?: string;
}

interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  handle: string;
  status: 'draft' | 'proposed' | 'published' | 'rejected';
  thumbnail?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  options?: Array<{
    id: string;
    title: string;
    values: Array<{ id: string; value: string }>;
  }>;
  metadata?: {
    requires_appointment?: boolean;
    duration_minutes?: number;
    [key: string]: unknown;
  };
  created_at: string;
  updated_at: string;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  count: number;
  offset: number;
  limit: number;
}

// ============================================================================
// Product API (v2)
// ============================================================================

export const products = {
  /**
   * List products with optional pagination
   * GET /store/products
   */
  list: async (params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit !== undefined) queryParams.append('limit', params.limit.toString());
    if (params?.offset !== undefined) queryParams.append('offset', params.offset.toString());

    const queryString = queryParams.toString();
    const url = `${MEDUSA_URL}/store/products${queryString ? `?${queryString}` : ''}`;

    const response = await fetchWithRetry(url);
    const data = await handleResponse<{ products: Product[]; count: number; offset: number; limit: number }>(response);

    return {
      data: data.products || [],
      count: data.count ?? 0,
      offset: data.offset ?? 0,
      limit: data.limit ?? 20,
    };
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
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/products?handle=${encodeURIComponent(handle)}`
    );
    const data = await handleResponse<{ products: Product[] }>(response);
    return data.products?.[0] || null;
  },
};

// ============================================================================
// Cart Types (v2)
// ============================================================================

interface LineItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  title: string;
  description?: string;
  thumbnail?: string;
  unit_price: number;
  subtotal: number;
  total: number;
  tax_total?: number;
  discount_total?: number;
  variant?: ProductVariant;
  product?: Product;
}

interface Cart {
  id: string;
  region_id: string;
  customer_id?: string;
  email?: string;
  currency_code: string;
  items: LineItem[];
  subtotal: number;
  total: number;
  tax_total: number;
  discount_total: number;
  shipping_total: number;
  item_total: number;
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country_code?: string;
    phone?: string;
  };
  billing_address?: {
    first_name?: string;
    last_name?: string;
    address_1?: string;
    address_2?: string;
    city?: string;
    province?: string;
    postal_code?: string;
    country_code?: string;
    phone?: string;
  };
  payment_collection?: {
    id: string;
    status: string;
    payment_sessions?: Array<{
      id: string;
      provider_id: string;
      status: string;
    }>;
  };
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Cart API (v2)
// ============================================================================

export const carts = {
  /**
   * Create new cart
   * POST /store/carts
   * Note: v2 requires region_id
   */
  create: async (regionId?: string): Promise<Cart> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/carts`, {
      method: 'POST',
      body: JSON.stringify({
        region_id: regionId || DEFAULT_REGION_ID,
      }),
    });
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Retrieve cart by ID
   * GET /store/carts/:id
   */
  get: async (cartId: string): Promise<Cart> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/carts/${cartId}`);
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Update cart (email, addresses, etc.)
   * POST /store/carts/:id
   */
  update: async (
    cartId: string,
    updates: {
      email?: string;
      shipping_address?: Cart['shipping_address'];
      billing_address?: Cart['billing_address'];
    }
  ): Promise<Cart> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/carts/${cartId}`, {
      method: 'POST',
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
      method: 'POST',
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
  updateItem: async (cartId: string, lineItemId: string, quantity: number): Promise<Cart> => {
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/carts/${cartId}/line-items/${lineItemId}`,
      {
        method: 'POST',
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
        method: 'DELETE',
      }
    );
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Initialize payment collection for cart
   * POST /store/carts/:id/payment-collections
   */
  initializePayment: async (cartId: string): Promise<Cart> => {
    const response = await fetchWithRetry(
      `${MEDUSA_URL}/store/carts/${cartId}/payment-collections`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );
    const data = await handleResponse<{ cart: Cart }>(response);
    return data.cart;
  },

  /**
   * Complete cart and create order
   * POST /store/carts/:id/complete
   * Note: v2 uses /complete (not /complete-cart)
   */
  complete: async (cartId: string): Promise<{ order: Order; cart?: Cart }> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/carts/${cartId}/complete`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
    // v2 returns { type: "order", order: Order } on success
    // or { type: "cart", cart: Cart } if more steps needed
    const data = await handleResponse<{ type: string; order?: Order; cart?: Cart }>(response);

    if (data.type === 'order' && data.order) {
      return { order: data.order };
    }

    // Cart needs more steps (e.g., payment)
    if (data.cart) {
      return { order: undefined as unknown as Order, cart: data.cart };
    }

    throw new Error('Unexpected response from cart completion');
  },
};

// ============================================================================
// Order Types (v2)
// ============================================================================

interface Order {
  id: string;
  display_id: number;
  status: 'pending' | 'completed' | 'archived' | 'canceled' | 'requires_action';
  email: string;
  currency_code: string;
  items: LineItem[];
  subtotal: number;
  total: number;
  tax_total: number;
  discount_total: number;
  shipping_total: number;
  shipping_address?: Cart['shipping_address'];
  billing_address?: Cart['billing_address'];
  created_at: string;
  updated_at: string;
}

// ============================================================================
// Order API (v2)
// ============================================================================

export const orders = {
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
   * List customer orders (requires authentication)
   * GET /store/orders
   */
  list: async (): Promise<Order[]> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/orders`);
    const data = await handleResponse<{ orders: Order[] }>(response);
    return data.orders || [];
  },
};

// ============================================================================
// Region API (v2)
// ============================================================================

interface Region {
  id: string;
  name: string;
  currency_code: string;
  countries: Array<{
    iso_2: string;
    name: string;
  }>;
}

export const regions = {
  /**
   * List available regions
   * GET /store/regions
   */
  list: async (): Promise<Region[]> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/regions`);
    const data = await handleResponse<{ regions: Region[] }>(response);
    return data.regions || [];
  },

  /**
   * Get region by ID
   * GET /store/regions/:id
   */
  get: async (regionId: string): Promise<Region> => {
    const response = await fetchWithRetry(`${MEDUSA_URL}/store/regions/${regionId}`);
    const data = await handleResponse<{ region: Region }>(response);
    return data.region;
  },
};

// ============================================================================
// Export Client
// ============================================================================

export const medusaClientV2 = {
  products,
  carts,
  orders,
  regions,
};

export type {
  Product,
  ProductVariant,
  ProductImage,
  Cart,
  LineItem,
  Order,
  Region,
  MedusaError,
  PaginationParams,
  PaginatedResponse,
};
