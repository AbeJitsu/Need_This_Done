import { EventEmitter } from 'events';

// ============================================================================
// WORKFLOW EVENTS SYSTEM
// ============================================================================
// Central event bus for workflow automation triggers.
//
// When something happens in the e-commerce store (order placed, product
// out of stock, etc.), an event is emitted here. The workflow automation
// system listens for these events and executes triggered workflows.
//
// This is a singleton EventEmitter - one global instance for the entire app.
// Type-safe with explicit event signatures for each trigger type.
//
// Example usage:
//   emitWorkflowEvent('order.placed', { orderId: '123', customerId: '456', ... })
//   onWorkflowEvent('order.placed', async (data) => { ... })

// ============================================================================
// TYPE DEFINITIONS - Event Payload Schemas
// ============================================================================
// Each event type has a strictly-typed payload shape
// The workflow engine uses this to validate and structure data

export interface WorkflowEventMap {
  // Product inventory events
  'product.out_of_stock': {
    productId: string;
    productName: string;
    variantId?: string;
    variantName?: string;
    timestamp: number;
  };

  'product.back_in_stock': {
    productId: string;
    productName: string;
    variantId?: string;
    variantName?: string;
    quantityRestocked: number;
    timestamp: number;
  };

  'product.created': {
    productId: string;
    productName: string;
    description?: string;
    price: number;
    currency: string;
    timestamp: number;
  };

  'product.updated': {
    productId: string;
    productName: string;
    changedFields: string[];
    timestamp: number;
  };

  // Order events
  'order.placed': {
    orderId: string;
    customerId: string;
    customerEmail: string;
    customerName: string;
    totalAmount: number;
    currency: string;
    items: Array<{
      productId: string;
      productName: string;
      variantId?: string;
      quantity: number;
      unitPrice: number;
    }>;
    timestamp: number;
  };

  'order.fulfilled': {
    orderId: string;
    customerId: string;
    customerEmail: string;
    trackingNumber?: string;
    shippingCarrier?: string;
    timestamp: number;
  };

  'order.cancelled': {
    orderId: string;
    customerId: string;
    customerEmail: string;
    reason?: string;
    timestamp: number;
  };

  'order.refunded': {
    orderId: string;
    customerId: string;
    customerEmail: string;
    refundAmount: number;
    currency: string;
    reason?: string;
    timestamp: number;
  };

  // Customer events
  'customer.signup': {
    customerId: string;
    email: string;
    name: string;
    phone?: string;
    timestamp: number;
  };

  'customer.first_purchase': {
    customerId: string;
    customerEmail: string;
    customerName: string;
    orderId: string;
    totalAmount: number;
    currency: string;
    timestamp: number;
  };

  // Inventory events
  'inventory.low_stock': {
    productId: string;
    productName: string;
    variantId?: string;
    currentQuantity: number;
    lowStockThreshold: number;
    timestamp: number;
  };

  // Manual trigger (admin-initiated workflows)
  manual: {
    workflowId: string;
    workflowName: string;
    triggeredBy: string; // Admin user ID
    customData?: Record<string, unknown>;
    timestamp: number;
  };
}

// Type-safe event name union - ensures only valid events can be emitted
export type WorkflowEventName = keyof WorkflowEventMap;

// ============================================================================
// SINGLETON EVENT EMITTER INSTANCE
// ============================================================================
// One global instance for the entire application
// Handles all workflow trigger events

class WorkflowEventBus extends EventEmitter {
  private static instance: WorkflowEventBus;

  private constructor() {
    super();
    // Increase max listeners to accommodate multiple workflow handlers
    this.setMaxListeners(50);
  }

  static getInstance(): WorkflowEventBus {
    if (!WorkflowEventBus.instance) {
      WorkflowEventBus.instance = new WorkflowEventBus();
    }
    return WorkflowEventBus.instance;
  }
}

// Get the singleton instance
const workflowEventBus = WorkflowEventBus.getInstance();

// ============================================================================
// EVENT EMISSION HELPER - Type-safe event emitting
// ============================================================================
// Use this to emit events from anywhere in the codebase
// TypeScript ensures you provide the correct data shape for each event type

/**
 * Emit a workflow trigger event
 *
 * @param event - Event type (e.g., 'order.placed', 'product.out_of_stock')
 * @param data - Event payload (type-checked based on event type)
 *
 * @example
 * emitWorkflowEvent('order.placed', {
 *   orderId: '123',
 *   customerId: '456',
 *   customerEmail: 'user@example.com',
 *   customerName: 'John Doe',
 *   totalAmount: 9999,
 *   currency: 'USD',
 *   items: [{ productId: '789', productName: 'T-Shirt', quantity: 2, unitPrice: 2999 }],
 *   timestamp: Date.now()
 * });
 */
export function emitWorkflowEvent<T extends WorkflowEventName>(
  event: T,
  data: WorkflowEventMap[T]
): void {
  // Log all events for debugging and audit trails
  console.log(`[WorkflowEvent] ${event}`, {
    ...data,
    timestamp: new Date(data.timestamp).toISOString(),
  });

  // Emit to the event bus
  // Handlers registered with onWorkflowEvent() will be triggered
  workflowEventBus.emit(event, data);
}

// ============================================================================
// EVENT LISTENER REGISTRATION - Type-safe event handlers
// ============================================================================
// Use this to register handlers that respond to workflow trigger events

/**
 * Register an async handler for a workflow trigger event
 *
 * The handler is called whenever the specified event is emitted.
 * Handlers are called in the order they were registered.
 *
 * @param event - Event type to listen for
 * @param handler - Async function that processes the event
 *
 * @returns Function to remove the listener (cleanup)
 *
 * @example
 * onWorkflowEvent('order.placed', async (data) => {
 *   // This runs whenever an order is placed
 *   console.log(`New order: ${data.orderId}`);
 *
 *   // Find and execute workflows triggered by 'order.placed'
 *   const workflows = await getTriggeredWorkflows('order.placed');
 *   for (const workflow of workflows) {
 *     await executeWorkflow(workflow, data);
 *   }
 * });
 */
export function onWorkflowEvent<T extends WorkflowEventName>(
  event: T,
  handler: (data: WorkflowEventMap[T]) => Promise<void>
): () => void {
  // Create a wrapper that handles errors gracefully
  const safeHandler = async (data: WorkflowEventMap[T]) => {
    try {
      await handler(data);
    } catch (error) {
      console.error(`[WorkflowEvent] Handler failed for '${event}':`, error);
      // Don't rethrow - let other handlers continue
    }
  };

  // Register the handler on the event bus
  workflowEventBus.on(event, safeHandler);

  // Return cleanup function
  return () => {
    workflowEventBus.off(event, safeHandler);
  };
}

// ============================================================================
// WORKFLOW TRIGGER DEFINITIONS
// ============================================================================
// Human-readable metadata about each trigger type
// Used by the UI to let admins create workflows
// Includes sample data for test runs

export interface WorkflowTriggerDefinition {
  // Unique identifier for this trigger type
  type: WorkflowEventName;

  // Human-readable label (shown in UI)
  label: string;

  // Detailed description of what triggers this
  description: string;

  // Category for organizing triggers in UI
  category: 'product' | 'order' | 'customer' | 'inventory' | 'manual';

  // Sample data for test runs (matches WorkflowEventMap[type])
  sampleData: Record<string, unknown>;
}

/**
 * All supported workflow triggers with metadata
 * Used by workflow builder UI to let admins configure triggers
 */
export const WORKFLOW_TRIGGERS: WorkflowTriggerDefinition[] = [
  // ========================================================================
  // PRODUCT INVENTORY TRIGGERS
  // ========================================================================
  {
    type: 'product.out_of_stock',
    label: 'Product Out of Stock',
    description: 'Triggered when a product\'s inventory reaches 0',
    category: 'product',
    sampleData: {
      productId: 'prod_example_123',
      productName: 'Premium T-Shirt',
      variantId: 'var_blue_large',
      variantName: 'Blue / Large',
      timestamp: Date.now(),
    },
  },

  {
    type: 'product.back_in_stock',
    label: 'Product Back in Stock',
    description: 'Triggered when an out-of-stock product is restocked',
    category: 'product',
    sampleData: {
      productId: 'prod_example_123',
      productName: 'Premium T-Shirt',
      variantId: 'var_blue_large',
      variantName: 'Blue / Large',
      quantityRestocked: 50,
      timestamp: Date.now(),
    },
  },

  {
    type: 'product.created',
    label: 'New Product Added',
    description: 'Triggered when a new product is created in the catalog',
    category: 'product',
    sampleData: {
      productId: 'prod_new_456',
      productName: 'New Summer Collection',
      description: 'Fresh designs for the summer season',
      price: 4999,
      currency: 'USD',
      timestamp: Date.now(),
    },
  },

  {
    type: 'product.updated',
    label: 'Product Updated',
    description: 'Triggered when product details are changed',
    category: 'product',
    sampleData: {
      productId: 'prod_example_123',
      productName: 'Premium T-Shirt',
      changedFields: ['price', 'description', 'inventory'],
      timestamp: Date.now(),
    },
  },

  // ========================================================================
  // ORDER TRIGGERS
  // ========================================================================
  {
    type: 'order.placed',
    label: 'Order Placed',
    description: 'Triggered when a customer completes a purchase',
    category: 'order',
    sampleData: {
      orderId: 'ord_example_789',
      customerId: 'cust_example_123',
      customerEmail: 'john@example.com',
      customerName: 'John Doe',
      totalAmount: 14997,
      currency: 'USD',
      items: [
        {
          productId: 'prod_example_123',
          productName: 'Premium T-Shirt',
          variantId: 'var_blue_large',
          quantity: 2,
          unitPrice: 4999,
        },
        {
          productId: 'prod_example_456',
          productName: 'Cotton Socks',
          quantity: 3,
          unitPrice: 999,
        },
      ],
      timestamp: Date.now(),
    },
  },

  {
    type: 'order.fulfilled',
    label: 'Order Shipped',
    description: 'Triggered when an order is fulfilled and shipped',
    category: 'order',
    sampleData: {
      orderId: 'ord_example_789',
      customerId: 'cust_example_123',
      customerEmail: 'john@example.com',
      trackingNumber: 'TRK123456789',
      shippingCarrier: 'FedEx',
      timestamp: Date.now(),
    },
  },

  {
    type: 'order.cancelled',
    label: 'Order Cancelled',
    description: 'Triggered when an order is cancelled by customer or system',
    category: 'order',
    sampleData: {
      orderId: 'ord_example_789',
      customerId: 'cust_example_123',
      customerEmail: 'john@example.com',
      reason: 'Customer requested cancellation',
      timestamp: Date.now(),
    },
  },

  {
    type: 'order.refunded',
    label: 'Order Refunded',
    description: 'Triggered when an order payment is refunded',
    category: 'order',
    sampleData: {
      orderId: 'ord_example_789',
      customerId: 'cust_example_123',
      customerEmail: 'john@example.com',
      refundAmount: 14997,
      currency: 'USD',
      reason: 'Customer requested full refund',
      timestamp: Date.now(),
    },
  },

  // ========================================================================
  // CUSTOMER TRIGGERS
  // ========================================================================
  {
    type: 'customer.signup',
    label: 'Customer Signed Up',
    description: 'Triggered when a new customer creates an account',
    category: 'customer',
    sampleData: {
      customerId: 'cust_new_456',
      email: 'jane@example.com',
      name: 'Jane Smith',
      phone: '+1-555-0100',
      timestamp: Date.now(),
    },
  },

  {
    type: 'customer.first_purchase',
    label: 'Customer First Purchase',
    description: 'Triggered when a new customer makes their first purchase',
    category: 'customer',
    sampleData: {
      customerId: 'cust_new_456',
      customerEmail: 'jane@example.com',
      customerName: 'Jane Smith',
      orderId: 'ord_first_purchase_123',
      totalAmount: 7999,
      currency: 'USD',
      timestamp: Date.now(),
    },
  },

  // ========================================================================
  // INVENTORY TRIGGERS
  // ========================================================================
  {
    type: 'inventory.low_stock',
    label: 'Low Stock Alert',
    description: 'Triggered when product inventory falls below a configured threshold',
    category: 'inventory',
    sampleData: {
      productId: 'prod_example_123',
      productName: 'Premium T-Shirt',
      variantId: 'var_blue_large',
      currentQuantity: 5,
      lowStockThreshold: 10,
      timestamp: Date.now(),
    },
  },

  // ========================================================================
  // MANUAL TRIGGERS
  // ========================================================================
  {
    type: 'manual',
    label: 'Manual Trigger',
    description: 'Manually triggered by an admin user via the dashboard',
    category: 'manual',
    sampleData: {
      workflowId: 'wf_test_123',
      workflowName: 'Test Workflow',
      triggeredBy: 'admin_user_456',
      customData: {
        additionalContext: 'Any custom data from the admin',
      },
      timestamp: Date.now(),
    },
  },
];

// ============================================================================
// HELPER UTILITIES
// ============================================================================

/**
 * Get a trigger definition by type
 * Useful for displaying trigger info in the UI
 */
export function getTriggerDefinition(
  type: WorkflowEventName
): WorkflowTriggerDefinition | undefined {
  return WORKFLOW_TRIGGERS.find((t) => t.type === type);
}

/**
 * Get all triggers in a specific category
 * Useful for organizing triggers in the UI
 */
export function getTriggersByCategory(
  category: WorkflowTriggerDefinition['category']
): WorkflowTriggerDefinition[] {
  return WORKFLOW_TRIGGERS.filter((t) => t.category === category);
}

/**
 * Get sample data for a trigger type
 * Used for test runs and workflow preview
 */
export function getSampleData(
  type: WorkflowEventName
): Record<string, unknown> | undefined {
  const trigger = getTriggerDefinition(type);
  return trigger?.sampleData;
}

// ============================================================================
// DEBUG & MONITORING UTILITIES
// ============================================================================

/**
 * Get event listener count for monitoring/debugging
 * Useful for checking if handlers are properly registered
 */
export function getEventListenerCount(event: WorkflowEventName): number {
  const listeners = workflowEventBus.listeners(event);
  return listeners.length;
}

/**
 * Get all registered event types that have listeners
 * Useful for monitoring active triggers
 */
export function getActiveEventTypes(): WorkflowEventName[] {
  const eventNames = workflowEventBus.eventNames() as WorkflowEventName[];
  return eventNames.filter((event) => getEventListenerCount(event) > 0);
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
//
// 1. Emit an event when something happens:
//
//    emitWorkflowEvent('order.placed', {
//      orderId: order.id,
//      customerId: customer.id,
//      customerEmail: customer.email,
//      customerName: customer.name,
//      totalAmount: order.total,
//      currency: 'USD',
//      items: order.items,
//      timestamp: Date.now()
//    });
//
// 2. Listen for events in the workflow engine:
//
//    onWorkflowEvent('order.placed', async (data) => {
//      const workflows = await db.workflows.findMany({
//        where: { trigger: 'order.placed', enabled: true }
//      });
//
//      for (const workflow of workflows) {
//        await executeWorkflow(workflow, data);
//      }
//    });
//
// 3. Get trigger options for UI:
//
//    const triggers = WORKFLOW_TRIGGERS.filter(t => t.category === 'order');
//    // Renders dropdown: "Order Placed", "Order Shipped", etc.
//
// 4. Test a workflow with sample data:
//
//    const sampleData = getSampleData('order.placed');
//    await executeWorkflow(workflow, sampleData);
