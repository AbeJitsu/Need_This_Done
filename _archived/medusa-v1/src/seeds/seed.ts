// ============================================================================
// Medusa Database Seed
// ============================================================================
// What: Seeds database with default region, store, and consultation products
// Why: Medusa requires at least one region to start properly
// How: Creates US region with USD currency, then adds consultation products

import { MedusaContainer } from "@medusajs/modules-sdk";

export default async function seed(container: MedusaContainer) {
  const storeService = container.resolve("storeService");
  const regionService = container.resolve("regionService");
  const countryService = container.resolve("countryService");
  const currencyService = container.resolve("currencyService");
  const productService = container.resolve("productService");
  const fulfillmentProviderService = container.resolve("fulfillmentProviderService");

  console.log("Seeding database...");

  // ============================================================================
  // Create Default Store
  // ============================================================================

  const stores = await storeService.list();
  let store;

  if (stores.length === 0) {
    console.log("Creating default store...");
    store = await storeService.create({
      name: "Need This Done",
      default_currency_code: "usd",
    });
    console.log("✓ Store created");
  } else {
    store = stores[0];
    console.log("✓ Store already exists");
  }

  // ============================================================================
  // Create Default Region (United States)
  // ============================================================================

  const regions = await regionService.list();
  let region;

  if (regions.length === 0) {
    console.log("Creating US region...");

    region = await regionService.create({
      name: "United States",
      currency_code: "usd",
      tax_rate: 0,
      payment_providers: ["manual"],
      fulfillment_providers: ["manual"],
      countries: ["us"],
    });

    console.log("✓ Region created with manual providers");
  } else {
    region = regions[0];
    console.log("✓ Region already exists");
  }

  // ============================================================================
  // Create Consultation Products
  // ============================================================================

  console.log("Creating consultation products...");

  const consultationProducts = [
    {
      title: "15-Minute Consultation",
      description: "Quick consultation session to discuss your project needs and get expert guidance.",
      handle: "15-min-consultation",
      is_giftcard: false,
      discountable: true,
      metadata: {
        requires_appointment: true,
        duration_minutes: 15,
        availability: "weekdays",
        timezone: "America/New_York",
      },
      variants: [
        {
          title: "Default",
          inventory_quantity: 100,
          manage_inventory: false,
          prices: [
            {
              amount: 2000, // $20.00
              currency_code: "usd",
            },
          ],
        },
      ],
    },
    {
      title: "30-Minute Consultation",
      description: "Standard consultation session for in-depth project planning and technical discussions.",
      handle: "30-min-consultation",
      is_giftcard: false,
      discountable: true,
      metadata: {
        requires_appointment: true,
        duration_minutes: 30,
        availability: "weekdays",
        timezone: "America/New_York",
      },
      variants: [
        {
          title: "Default",
          inventory_quantity: 100,
          manage_inventory: false,
          prices: [
            {
              amount: 3500, // $35.00
              currency_code: "usd",
            },
          ],
        },
      ],
    },
    {
      title: "55-Minute Consultation",
      description: "Extended consultation session for comprehensive project analysis and detailed recommendations.",
      handle: "55-min-consultation",
      is_giftcard: false,
      discountable: true,
      metadata: {
        requires_appointment: true,
        duration_minutes: 55,
        availability: "weekdays",
        timezone: "America/New_York",
      },
      variants: [
        {
          title: "Default",
          inventory_quantity: 100,
          manage_inventory: false,
          prices: [
            {
              amount: 5000, // $50.00
              currency_code: "usd",
            },
          ],
        },
      ],
    },
  ];

  for (const productData of consultationProducts) {
    // Check if product already exists
    const existing = await productService.listAndCount({
      handle: productData.handle,
    });

    if (existing[1] === 0) {
      await productService.create(productData);
      console.log(`✓ Created: ${productData.title}`);
    } else {
      console.log(`- Skipped (exists): ${productData.title}`);
    }
  }

  console.log("\nSeeding completed successfully!");
}
