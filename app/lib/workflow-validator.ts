import { z } from 'zod';

// ============================================================================
// WORKFLOW VALIDATION SCHEMAS
// ============================================================================
// What: Type-safe validation for workflow automation definitions
// Why: Prevents invalid workflows from being saved/executed, ensures data integrity
// How: Zod schemas for nodes, edges, triggers, conditions, actions, and full workflows
//
// Usage:
//   const result = validateWorkflow(data);
//   if (!result.valid) {
//     console.error(result.errors);
//     return;
//   }
//   // data is now type-safe
//
// ============================================================================

// ============================================================================
// REACT FLOW SCHEMAS - Node and Edge Definitions
// ============================================================================

/**
 * React Flow node representing a workflow step (trigger, condition, or action)
 */
export const WorkflowNodeSchema = z.object({
  id: z
    .string()
    .min(1, 'Node ID is required')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Node ID must contain only alphanumeric, dash, and underscore characters'),
  type: z.enum(['trigger', 'condition', 'action']),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
  data: z.object({
    label: z
      .string()
      .min(1, 'Node label is required')
      .max(100, 'Node label must be 100 characters or less'),
    config: z.record(z.string(), z.unknown()).optional(),
  }),
});

export type WorkflowNode = z.infer<typeof WorkflowNodeSchema>;

/**
 * React Flow edge representing a connection between nodes
 */
export const WorkflowEdgeSchema = z.object({
  id: z
    .string()
    .min(1, 'Edge ID is required'),
  source: z
    .string()
    .min(1, 'Source node ID is required'),
  target: z
    .string()
    .min(1, 'Target node ID is required'),
  sourceHandle: z
    .string()
    .optional()
    .describe('Handle on source node (e.g., "true" or "false" for condition nodes)'),
  label: z
    .string()
    .max(100, 'Edge label must be 100 characters or less')
    .optional(),
});

export type WorkflowEdge = z.infer<typeof WorkflowEdgeSchema>;

// ============================================================================
// TRIGGER TYPE SCHEMAS
// ============================================================================

/**
 * Trigger configurations by type
 */
export const TriggerConfigByTypeSchema = {
  'product.out_of_stock': z.object({
    productId: z.string().uuid('Product ID must be a valid UUID').optional(),
  }).describe('Trigger when product runs out of stock (optional: specific product)'),

  'product.back_in_stock': z.object({
    productId: z.string().uuid('Product ID must be a valid UUID').optional(),
  }).describe('Trigger when product is restocked'),

  'product.created': z.object({}).describe('Trigger when a new product is added'),

  'product.updated': z.object({
    productId: z.string().uuid('Product ID must be a valid UUID').optional(),
  }).describe('Trigger when product details change'),

  'order.placed': z.object({
    minAmount: z
      .number()
      .nonnegative('Minimum amount must be non-negative')
      .optional(),
    maxAmount: z
      .number()
      .nonnegative('Maximum amount must be non-negative')
      .optional(),
  }).describe('Trigger when order is placed (optional: filter by amount)'),

  'order.fulfilled': z.object({}).describe('Trigger when order is shipped'),

  'order.cancelled': z.object({}).describe('Trigger when order is cancelled'),

  'order.refunded': z.object({}).describe('Trigger when order is refunded'),

  'customer.signup': z.object({}).describe('Trigger when customer signs up'),

  'customer.first_purchase': z.object({}).describe('Trigger on first purchase'),

  'inventory.low_stock': z.object({
    threshold: z
      .number()
      .int('Threshold must be an integer')
      .positive('Threshold must be greater than 0'),
  }).describe('Trigger when product inventory falls below threshold'),

  'manual': z.object({}).describe('Manual trigger - workflow runs only when explicitly triggered'),
};

/**
 * Union of all trigger config schemas
 */
export const TriggerConfigSchema = z.union([
  TriggerConfigByTypeSchema['product.out_of_stock'],
  TriggerConfigByTypeSchema['product.back_in_stock'],
  TriggerConfigByTypeSchema['product.created'],
  TriggerConfigByTypeSchema['product.updated'],
  TriggerConfigByTypeSchema['order.placed'],
  TriggerConfigByTypeSchema['order.fulfilled'],
  TriggerConfigByTypeSchema['order.cancelled'],
  TriggerConfigByTypeSchema['order.refunded'],
  TriggerConfigByTypeSchema['customer.signup'],
  TriggerConfigByTypeSchema['customer.first_purchase'],
  TriggerConfigByTypeSchema['inventory.low_stock'],
  TriggerConfigByTypeSchema['manual'],
]);

export type TriggerConfig = z.infer<typeof TriggerConfigSchema>;

export const TRIGGER_TYPES = [
  'product.out_of_stock',
  'product.back_in_stock',
  'product.created',
  'product.updated',
  'order.placed',
  'order.fulfilled',
  'order.cancelled',
  'order.refunded',
  'customer.signup',
  'customer.first_purchase',
  'inventory.low_stock',
  'manual',
] as const;

export type TriggerType = (typeof TRIGGER_TYPES)[number];

// ============================================================================
// CONDITION SCHEMA
// ============================================================================

/**
 * Condition for conditional branching in workflows
 * Compares event data field to a value
 */
export const ConditionConfigSchema = z.object({
  field: z
    .string()
    .min(1, 'Field is required')
    .describe('Event data field to compare (e.g., "totalAmount", "items.length")'),
  operator: z.enum(['eq', 'neq', 'gt', 'gte', 'lt', 'lte', 'contains', 'not_contains']),
  value: z.union([z.string(), z.number(), z.boolean()]),
}).describe('Condition to branch workflow execution');

export type ConditionConfig = z.infer<typeof ConditionConfigSchema>;

// ============================================================================
// ACTION TYPE SCHEMAS
// ============================================================================

/**
 * Action configurations by type
 */
export const ActionConfigByTypeSchema = {
  send_email: z.object({
    templateId: z.string().uuid().optional(),
    subject: z
      .string()
      .min(1, 'Subject is required')
      .max(200, 'Subject must be 200 characters or less'),
    body: z
      .string()
      .min(1, 'Body is required'),
    toField: z
      .string()
      .min(1, 'Recipient field is required')
      .describe('Event data field containing email address (e.g., "customer.email")'),
  }).describe('Send email notification'),

  tag_customer: z.object({
    tag: z
      .string()
      .min(1, 'Tag is required')
      .max(50, 'Tag must be 50 characters or less'),
  }).describe('Add tag to customer'),

  tag_order: z.object({
    tag: z
      .string()
      .min(1, 'Tag is required')
      .max(50, 'Tag must be 50 characters or less'),
  }).describe('Add tag to order'),

  tag_product: z.object({
    tag: z
      .string()
      .min(1, 'Tag is required')
      .max(50, 'Tag must be 50 characters or less'),
  }).describe('Add tag to product'),

  webhook: z.object({
    url: z
      .string()
      .url('URL must be a valid HTTP(S) URL'),
    method: z.enum(['GET', 'POST', 'PUT']),
    headers: z
      .record(z.string(), z.string())
      .optional()
      .describe('Optional HTTP headers'),
    bodyTemplate: z
      .string()
      .optional()
      .describe('Optional JSON template for request body'),
  }).describe('Send webhook to external URL'),

  update_product_status: z.object({
    status: z
      .string()
      .min(1, 'Status is required')
      .max(50, 'Status must be 50 characters or less'),
  }).describe('Update product status'),

  create_notification: z.object({
    message: z
      .string()
      .min(1, 'Message is required')
      .max(500, 'Message must be 500 characters or less'),
    priority: z.enum(['low', 'medium', 'high']),
  }).describe('Create in-app notification'),
};

/**
 * Union of all action config schemas
 */
export const ActionConfigSchema = z.union([
  ActionConfigByTypeSchema.send_email,
  ActionConfigByTypeSchema.tag_customer,
  ActionConfigByTypeSchema.tag_order,
  ActionConfigByTypeSchema.tag_product,
  ActionConfigByTypeSchema.webhook,
  ActionConfigByTypeSchema.update_product_status,
  ActionConfigByTypeSchema.create_notification,
]);

export type ActionConfig = z.infer<typeof ActionConfigSchema>;

export const ACTION_TYPES = [
  'send_email',
  'tag_customer',
  'tag_order',
  'tag_product',
  'webhook',
  'update_product_status',
  'create_notification',
] as const;

export type ActionType = (typeof ACTION_TYPES)[number];

// ============================================================================
// WORKFLOW SCHEMAS
// ============================================================================

/**
 * Schema for creating a new workflow
 */
export const CreateWorkflowSchema = z.object({
  name: z
    .string()
    .min(1, 'Workflow name is required')
    .max(100, 'Workflow name must be 100 characters or less'),
  description: z
    .string()
    .max(500, 'Description must be 500 characters or less')
    .optional(),
  trigger_type: z.enum(TRIGGER_TYPES),
  trigger_config: TriggerConfigSchema.optional(),
  nodes: z
    .array(WorkflowNodeSchema)
    .min(1, 'Workflow must have at least one node')
    .max(100, 'Workflow cannot have more than 100 nodes'),
  edges: z
    .array(WorkflowEdgeSchema)
    .max(200, 'Workflow cannot have more than 200 edges'),
}).describe('Create a new workflow automation');

export type CreateWorkflow = z.infer<typeof CreateWorkflowSchema>;

/**
 * Schema for updating an existing workflow
 */
export const UpdateWorkflowSchema = CreateWorkflowSchema.partial().extend({
  status: z.enum(['draft', 'active', 'paused', 'archived']).optional(),
});

export type UpdateWorkflow = z.infer<typeof UpdateWorkflowSchema>;

/**
 * Full workflow schema returned from database (includes metadata)
 */
export const WorkflowSchema = CreateWorkflowSchema.extend({
  id: z.string().uuid('Workflow ID must be a valid UUID'),
  status: z.enum(['draft', 'active', 'paused', 'archived']),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  created_by: z.string().uuid(),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

// ============================================================================
// ACTION TYPE REGISTRY
// ============================================================================

/**
 * Registry of all available workflow actions with metadata for UI
 */
export const WORKFLOW_ACTIONS: Array<{
  type: ActionType;
  label: string;
  description: string;
  category: 'communication' | 'tagging' | 'integration' | 'notification';
  configSchema: z.ZodSchema;
  icon: string;
}> = [
  {
    type: 'send_email',
    label: 'Send Email',
    description: 'Send email notification to customer or admin',
    category: 'communication',
    configSchema: ActionConfigByTypeSchema.send_email,
    icon: 'Mail',
  },
  {
    type: 'tag_customer',
    label: 'Tag Customer',
    description: 'Add a tag to the customer profile',
    category: 'tagging',
    configSchema: ActionConfigByTypeSchema.tag_customer,
    icon: 'Tag',
  },
  {
    type: 'tag_order',
    label: 'Tag Order',
    description: 'Add a tag to the order',
    category: 'tagging',
    configSchema: ActionConfigByTypeSchema.tag_order,
    icon: 'Tag',
  },
  {
    type: 'tag_product',
    label: 'Tag Product',
    description: 'Add a tag to the product',
    category: 'tagging',
    configSchema: ActionConfigByTypeSchema.tag_product,
    icon: 'Tag',
  },
  {
    type: 'webhook',
    label: 'Call Webhook',
    description: 'Send data to external system via HTTP',
    category: 'integration',
    configSchema: ActionConfigByTypeSchema.webhook,
    icon: 'Share2',
  },
  {
    type: 'update_product_status',
    label: 'Update Product Status',
    description: 'Change product status (e.g., active, discontinued)',
    category: 'tagging',
    configSchema: ActionConfigByTypeSchema.update_product_status,
    icon: 'ToggleRight',
  },
  {
    type: 'create_notification',
    label: 'Create Notification',
    description: 'Create an in-app notification',
    category: 'notification',
    configSchema: ActionConfigByTypeSchema.create_notification,
    icon: 'Bell',
  },
];

// ============================================================================
// CONDITION OPERATORS REGISTRY
// ============================================================================

/**
 * Registry of condition operators available for workflow conditions
 */
export const CONDITION_OPERATORS: Array<{
  value: string;
  label: string;
  description: string;
  applicableTo: ('string' | 'number' | 'boolean')[];
}> = [
  {
    value: 'eq',
    label: 'Equals',
    description: 'Field equals the specified value',
    applicableTo: ['string', 'number', 'boolean'],
  },
  {
    value: 'neq',
    label: 'Not Equals',
    description: 'Field does not equal the specified value',
    applicableTo: ['string', 'number', 'boolean'],
  },
  {
    value: 'gt',
    label: 'Greater Than',
    description: 'Field is greater than the specified value',
    applicableTo: ['number'],
  },
  {
    value: 'gte',
    label: 'Greater Than or Equal',
    description: 'Field is greater than or equal to the specified value',
    applicableTo: ['number'],
  },
  {
    value: 'lt',
    label: 'Less Than',
    description: 'Field is less than the specified value',
    applicableTo: ['number'],
  },
  {
    value: 'lte',
    label: 'Less Than or Equal',
    description: 'Field is less than or equal to the specified value',
    applicableTo: ['number'],
  },
  {
    value: 'contains',
    label: 'Contains',
    description: 'Field contains the specified string (case-sensitive)',
    applicableTo: ['string'],
  },
  {
    value: 'not_contains',
    label: 'Does Not Contain',
    description: 'Field does not contain the specified string',
    applicableTo: ['string'],
  },
];

// ============================================================================
// TRIGGER TYPE REGISTRY
// ============================================================================

/**
 * Registry of all available workflow triggers with metadata for UI
 */
export const WORKFLOW_TRIGGER_REGISTRY: Array<{
  type: TriggerType;
  label: string;
  description: string;
  configSchema: z.ZodSchema;
  icon: string;
  category: 'product' | 'order' | 'customer' | 'inventory' | 'manual';
}> = [
  {
    type: 'product.out_of_stock',
    label: 'Product Out of Stock',
    description: 'Trigger when a product runs out of inventory',
    configSchema: TriggerConfigByTypeSchema['product.out_of_stock'],
    icon: 'AlertTriangle',
    category: 'product',
  },
  {
    type: 'product.back_in_stock',
    label: 'Product Back in Stock',
    description: 'Trigger when an out-of-stock product is restocked',
    configSchema: TriggerConfigByTypeSchema['product.back_in_stock'],
    icon: 'PackageCheck',
    category: 'product',
  },
  {
    type: 'product.created',
    label: 'New Product Added',
    description: 'Trigger when a new product is created',
    configSchema: TriggerConfigByTypeSchema['product.created'],
    icon: 'PackagePlus',
    category: 'product',
  },
  {
    type: 'product.updated',
    label: 'Product Updated',
    description: 'Trigger when product details change',
    configSchema: TriggerConfigByTypeSchema['product.updated'],
    icon: 'PackageSearch',
    category: 'product',
  },
  {
    type: 'order.placed',
    label: 'Order Placed',
    description: 'Trigger when a customer completes a purchase',
    configSchema: TriggerConfigByTypeSchema['order.placed'],
    icon: 'ShoppingCart',
    category: 'order',
  },
  {
    type: 'order.fulfilled',
    label: 'Order Shipped',
    description: 'Trigger when an order is fulfilled',
    configSchema: TriggerConfigByTypeSchema['order.fulfilled'],
    icon: 'Truck',
    category: 'order',
  },
  {
    type: 'order.cancelled',
    label: 'Order Cancelled',
    description: 'Trigger when an order is cancelled',
    configSchema: TriggerConfigByTypeSchema['order.cancelled'],
    icon: 'XCircle',
    category: 'order',
  },
  {
    type: 'order.refunded',
    label: 'Order Refunded',
    description: 'Trigger when a payment is refunded',
    configSchema: TriggerConfigByTypeSchema['order.refunded'],
    icon: 'RotateCcw',
    category: 'order',
  },
  {
    type: 'customer.signup',
    label: 'Customer Signed Up',
    description: 'Trigger when a new customer creates an account',
    configSchema: TriggerConfigByTypeSchema['customer.signup'],
    icon: 'UserPlus',
    category: 'customer',
  },
  {
    type: 'customer.first_purchase',
    label: 'First Purchase',
    description: 'Trigger when a customer makes their first order',
    configSchema: TriggerConfigByTypeSchema['customer.first_purchase'],
    icon: 'Award',
    category: 'customer',
  },
  {
    type: 'inventory.low_stock',
    label: 'Low Stock Alert',
    description: 'Trigger when inventory falls below threshold',
    configSchema: TriggerConfigByTypeSchema['inventory.low_stock'],
    icon: 'AlertCircle',
    category: 'inventory',
  },
  {
    type: 'manual',
    label: 'Manual Trigger',
    description: 'Run this workflow manually from the dashboard',
    configSchema: TriggerConfigByTypeSchema['manual'],
    icon: 'Play',
    category: 'manual',
  },
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

/**
 * Validate a complete workflow definition
 *
 * @param data - Workflow data to validate
 * @returns Object with valid flag and optional errors array
 */
export function validateWorkflow(data: unknown): { valid: boolean; errors?: string[] } {
  const result = CreateWorkflowSchema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate trigger configuration for a specific trigger type
 *
 * @param triggerType - Type of trigger
 * @param config - Configuration object to validate
 * @returns Object with valid flag and optional errors array
 */
export function validateTriggerConfig(
  triggerType: string,
  config: unknown
): { valid: boolean; errors?: string[] } {
  // Check if trigger type exists
  if (!TRIGGER_TYPES.includes(triggerType as TriggerType)) {
    return { valid: false, errors: [`Unknown trigger type: ${triggerType}`] };
  }

  const schema =
    TriggerConfigByTypeSchema[triggerType as keyof typeof TriggerConfigByTypeSchema];

  if (!schema) {
    return { valid: false, errors: [`No schema defined for trigger type: ${triggerType}`] };
  }

  const result = schema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate action configuration for a specific action type
 *
 * @param actionType - Type of action
 * @param config - Configuration object to validate
 * @returns Object with valid flag and optional errors array
 */
export function validateActionConfig(
  actionType: string,
  config: unknown
): { valid: boolean; errors?: string[] } {
  // Check if action type exists
  if (!ACTION_TYPES.includes(actionType as ActionType)) {
    return { valid: false, errors: [`Unknown action type: ${actionType}`] };
  }

  const schema = ActionConfigByTypeSchema[actionType as keyof typeof ActionConfigByTypeSchema];

  if (!schema) {
    return { valid: false, errors: [`No schema defined for action type: ${actionType}`] };
  }

  const result = schema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate a condition configuration
 *
 * @param config - Condition configuration to validate
 * @returns Object with valid flag and optional errors array
 */
export function validateConditionConfig(config: unknown): { valid: boolean; errors?: string[] } {
  const result = ConditionConfigSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate workflow nodes
 *
 * @param nodes - Array of workflow nodes to validate
 * @returns Object with valid flag and optional errors array
 */
export function validateWorkflowNodes(nodes: unknown): { valid: boolean; errors?: string[] } {
  const result = z.array(WorkflowNodeSchema).safeParse(nodes);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Validate workflow edges
 *
 * @param edges - Array of workflow edges to validate
 * @returns Object with valid flag and optional errors array
 */
export function validateWorkflowEdges(edges: unknown): { valid: boolean; errors?: string[] } {
  const result = z.array(WorkflowEdgeSchema).safeParse(edges);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join('.')}: ` : '';
      return `${path}${issue.message}`;
    });
    return { valid: false, errors };
  }

  return { valid: true };
}

/**
 * Get action metadata by type
 *
 * @param actionType - Type of action to look up
 * @returns Action metadata or undefined if not found
 */
export function getActionMetadata(actionType: string) {
  return WORKFLOW_ACTIONS.find((action) => action.type === actionType);
}

/**
 * Get trigger metadata by type
 *
 * @param triggerType - Type of trigger to look up
 * @returns Trigger metadata or undefined if not found
 */
export function getTriggerMetadata(triggerType: string) {
  return WORKFLOW_TRIGGER_REGISTRY.find((trigger) => trigger.type === triggerType);
}

/**
 * Get condition operator metadata by value
 *
 * @param operatorValue - Operator value to look up
 * @returns Operator metadata or undefined if not found
 */
export function getOperatorMetadata(operatorValue: string) {
  return CONDITION_OPERATORS.find((op) => op.value === operatorValue);
}

// ============================================================================
// USAGE EXAMPLES
// ============================================================================
//
// Example 1: Validate complete workflow
// ──────────────────────────────────────
// const workflowData = {
//   name: 'Email customers on signup',
//   trigger_type: 'customer_signup',
//   nodes: [...],
//   edges: [...]
// };
// const result = validateWorkflow(workflowData);
// if (!result.valid) {
//   console.error('Validation errors:', result.errors);
//   return;
// }
// // workflowData is now validated
//
// Example 2: Validate trigger configuration
// ──────────────────────────────────────────
// const triggerConfig = { threshold: 10 };
// const result = validateTriggerConfig('inventory_low_stock', triggerConfig);
// if (!result.valid) {
//   console.error('Invalid trigger config:', result.errors);
// }
//
// Example 3: Validate action configuration
// ──────────────────────────────────────────
// const actionConfig = {
//   subject: 'Low Stock Alert',
//   body: 'Product {{product_name}} is low on stock',
//   toField: 'admin.email'
// };
// const result = validateActionConfig('send_email', actionConfig);
// if (!result.valid) {
//   console.error('Invalid action config:', result.errors);
// }
//
// Example 4: Get metadata for UI
// ──────────────────────────────
// const action = getActionMetadata('send_email');
// console.log(action?.label);  // "Send Email"
// console.log(action?.icon);   // "Mail"
//
