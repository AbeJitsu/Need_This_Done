# Shop Pages

See `.claude/rules/medusa-products.md` for product management rules.

## Shop vs Pricing Page

| Page | Collections | API |
|------|-------------|-----|
| Shop | All products | `medusaClient.products.list()` |
| Pricing | `website-packages`, `website-addons`, `automation-services` | `/api/pricing/products` |

## Product Metadata

```typescript
product.metadata?.requires_appointment  // Needs scheduling
product.metadata?.type                  // package, addon, service, subscription
```
