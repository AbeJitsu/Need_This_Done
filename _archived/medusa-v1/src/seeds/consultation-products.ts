// ============================================================================
// Consultation Products Seed
// ============================================================================
// What: Seeds consultation product offerings into the Medusa database
// Why: Provides appointment booking options for customers
// How: Creates 3 consultation tiers with metadata for appointment tracking

import { Product, ProductVariant } from "@medusajs/medusa";

export default async function seedConsultationProducts({ container }: any) {
  const productService = container.resolve("productService");
  const productVariantService = container.resolve("productVariantService");
  const regionService = container.resolve("regionService");

  console.log("Starting consultation products seed...");

  // ============================================================================
  // Get Default Region
  // ============================================================================
  // Products need to be associated with a region for pricing

  const regions = await regionService.list({});
  let defaultRegion = regions[0];

  if (!defaultRegion) {
    // Create default USD region if none exists
    console.log("Creating default USD region...");
    defaultRegion = await regionService.create({
      name: "United States",
      currency_code: "usd",
      tax_rate: 0,
      payment_providers: ["manual"],
      fulfillment_providers: ["manual"],
      countries: ["us"],
    });
  }

  console.log(`Using region: ${defaultRegion.name} (${defaultRegion.currency_code})`);

  // ============================================================================
  // Consultation Product Data
  // ============================================================================
  // Each consultation requires appointment scheduling
  // Metadata flag: requires_appointment = true

  const consultationProducts = [
    {
      title: "15-Minute Consultation",
      subtitle: "Quick chat to discuss your project needs",
      description:
        "Perfect for getting initial guidance, clarifying requirements, or answering specific questions. Available Monday-Friday, 8:30 AM - 6:30 PM ET.",
      handle: "15-min-consultation",
      is_giftcard: false,
      discountable: false,
      metadata: {
        requires_appointment: true,
        duration_minutes: 15,
        availability: "weekdays",
        timezone: "America/New_York",
      },
      prices: [
        {
          amount: 2000, // $20.00
          currency_code: "usd",
          region_id: defaultRegion.id,
        },
      ],
      options: [
        {
          title: "Type",
          values: ["Video Call"],
        },
      ],
    },
    {
      title: "30-Minute Consultation",
      subtitle: "Detailed discussion for project planning",
      description:
        "Ideal for exploring project scope, discussing technical requirements, and getting detailed recommendations. Available Monday-Friday, 8:30 AM - 6:30 PM ET.",
      handle: "30-min-consultation",
      is_giftcard: false,
      discountable: false,
      metadata: {
        requires_appointment: true,
        duration_minutes: 30,
        availability: "weekdays",
        timezone: "America/New_York",
      },
      prices: [
        {
          amount: 3500, // $35.00
          currency_code: "usd",
          region_id: defaultRegion.id,
        },
      ],
      options: [
        {
          title: "Type",
          values: ["Video Call"],
        },
      ],
    },
    {
      title: "55-Minute Consultation",
      subtitle: "In-depth strategy session",
      description:
        "Comprehensive consultation for complex projects, architecture planning, or detailed technical guidance. Available Monday-Friday, 8:30 AM - 6:30 PM ET.",
      handle: "55-min-consultation",
      is_giftcard: false,
      discountable: false,
      metadata: {
        requires_appointment: true,
        duration_minutes: 55,
        availability: "weekdays",
        timezone: "America/New_York",
      },
      prices: [
        {
          amount: 5000, // $50.00
          currency_code: "usd",
          region_id: defaultRegion.id,
        },
      ],
      options: [
        {
          title: "Type",
          values: ["Video Call"],
        },
      ],
    },
  ];

  // ============================================================================
  // Create Products
  // ============================================================================

  for (const productData of consultationProducts) {
    try {
      // Check if product already exists
      const existing = await productService.list({
        handle: productData.handle,
      });

      if (existing.length > 0) {
        console.log(`✓ Product already exists: ${productData.title}`);
        continue;
      }

      // Create the product
      const product = await productService.create(productData);

      console.log(`✓ Created product: ${product.title} (${product.handle})`);
      console.log(`  Price: $${productData.prices[0].amount / 100}`);
      console.log(`  Duration: ${productData.metadata.duration_minutes} minutes`);
    } catch (error) {
      console.error(`✗ Failed to create product: ${productData.title}`);
      console.error(error);
    }
  }

  console.log("\n✓ Consultation products seed completed!");
}
