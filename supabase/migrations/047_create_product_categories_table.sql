-- ============================================================================
-- Create Product Categories Management Table
-- ============================================================================
-- What: Admin-managed product categories for customization and organization
-- Why: Allow admins to create, edit, delete, and reorder product categories
-- When: Used in product filtering, management, and customer discovery

CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  handle TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT, -- Icon name from heroicons or similar
  color TEXT, -- Tailwind color for UI display (e.g. 'emerald', 'blue')
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for sorting and filtering
CREATE INDEX idx_product_categories_sort_order
ON product_categories(sort_order, is_active);

CREATE INDEX idx_product_categories_handle
ON product_categories(handle, is_active);

-- Table to map products to categories (many-to-many relationship)
CREATE TABLE IF NOT EXISTS product_category_mappings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID NOT NULL REFERENCES product_categories(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL, -- Medusa product ID (string)
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Prevent duplicate category assignments for a product
CREATE UNIQUE INDEX idx_product_category_unique
ON product_category_mappings(category_id, product_id);

-- Index for finding products in a category
CREATE INDEX idx_product_category_mappings_category
ON product_category_mappings(category_id);

CREATE INDEX idx_product_category_mappings_product
ON product_category_mappings(product_id);

-- Add updated_at trigger for categories
CREATE OR REPLACE FUNCTION update_product_categories_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_product_categories_timestamp ON product_categories;
CREATE TRIGGER trigger_product_categories_timestamp
BEFORE UPDATE ON product_categories
FOR EACH ROW
EXECUTE FUNCTION update_product_categories_timestamp();
