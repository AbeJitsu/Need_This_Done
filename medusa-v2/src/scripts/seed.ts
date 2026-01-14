import { CreateInventoryLevelInput, ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
import {
  createWorkflow,
  transform,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import {
  createApiKeysWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresStep,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ApiKey } from "../../.medusa/types/query-entry-points";

const updateStoreCurrencies = createWorkflow(
  "update-store-currencies",
  (input: {
    supported_currencies: { currency_code: string; is_default?: boolean }[];
    store_id: string;
  }) => {
    const normalizedInput = transform({ input }, (data) => {
      return {
        selector: { id: data.input.store_id },
        update: {
          supported_currencies: data.input.supported_currencies.map(
            (currency) => {
              return {
                currency_code: currency.currency_code,
                is_default: currency.is_default ?? false,
              };
            }
          ),
        },
      };
    });

    const stores = updateStoresStep(normalizedInput);

    return new WorkflowResponse(stores);
  }
);

export default async function seedDemoData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const link = container.resolve(ContainerRegistrationKeys.LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = ["us"];

  logger.info("Seeding store data...");
  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Default Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Default Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoreCurrencies(container).run({
    input: {
      store_id: store.id,
      supported_currencies: [
        {
          currency_code: "usd",
          is_default: true,
        },
      ],
    },
  });

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });

  logger.info("Seeding region data...");
  const regionModuleService = container.resolve(Modules.REGION);
  let existingRegions = await regionModuleService.listRegions({
    currency_code: "usd",
  });

  let region;
  if (existingRegions.length) {
    region = existingRegions[0];
    logger.info("Region already exists, skipping creation.");
  } else {
    const { result: regionResult } = await createRegionsWorkflow(container).run({
      input: {
        regions: [
          {
            name: "United States",
            currency_code: "usd",
            countries,
            payment_providers: ["pp_system_default"],
          },
        ],
      },
    });
    region = regionResult[0];
  }
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");
  const taxModuleService = container.resolve(Modules.TAX);
  const existingTaxRegions = await taxModuleService.listTaxRegions({
    country_code: "us",
  });

  if (!existingTaxRegions.length) {
    await createTaxRegionsWorkflow(container).run({
      input: countries.map((country_code) => ({
        country_code,
        provider_id: "tp_system",
      })),
    });
  } else {
    logger.info("Tax regions already exist, skipping creation.");
  }
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");
  const stockLocationModuleService = container.resolve(Modules.STOCK_LOCATION);
  let existingStockLocations = await stockLocationModuleService.listStockLocations({
    name: "Need This Done HQ",
  });

  let stockLocation;
  if (existingStockLocations.length) {
    stockLocation = existingStockLocations[0];
    logger.info("Stock location already exists, skipping creation.");
  } else {
    const { result: stockLocationResult } = await createStockLocationsWorkflow(
      container
    ).run({
      input: {
        locations: [
          {
            name: "Need This Done HQ",
            address: {
              city: "New York",
              country_code: "US",
              address_1: "",
            },
          },
        ],
      },
    });
    stockLocation = stockLocationResult[0];
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        default_location_id: stockLocation.id,
      },
    },
  });

  await link.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  logger.info("Seeding fulfillment data...");
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  });
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;

  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [
            {
              name: "Default Shipping Profile",
              type: "default",
            },
          ],
        },
      });
    shippingProfile = shippingProfileResult[0];
  }

  const existingFulfillmentSets = await fulfillmentModuleService.listFulfillmentSets({
    name: "US Service Delivery",
  });

  let fulfillmentSet;
  if (existingFulfillmentSets.length) {
    fulfillmentSet = existingFulfillmentSets[0];
    logger.info("Fulfillment set already exists, skipping creation.");
  } else {
    fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
      name: "US Service Delivery",
      type: "shipping",
      service_zones: [
        {
          name: "United States",
          geo_zones: [
            {
              country_code: "us",
              type: "country",
            },
          ],
        },
      ],
    });

    await link.create({
      [Modules.STOCK_LOCATION]: {
        stock_location_id: stockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_set_id: fulfillmentSet.id,
      },
    });

    // Only create shipping options if fulfillment set is new
    await createShippingOptionsWorkflow(container).run({
      input: [
        {
          name: "Digital Delivery",
          price_type: "flat",
          provider_id: "manual_manual",
          service_zone_id: fulfillmentSet.service_zones[0].id,
          shipping_profile_id: shippingProfile.id,
          type: {
            label: "Digital",
            description: "Instant access after booking.",
            code: "digital",
          },
          prices: [
            {
              currency_code: "usd",
              amount: 0,
            },
            {
              region_id: region.id,
              amount: 0,
            },
          ],
          rules: [
            {
              attribute: "enabled_in_store",
              value: "true",
              operator: "eq",
            },
            {
              attribute: "is_return",
              value: "false",
              operator: "eq",
            },
          ],
        },
      ],
    });
  }
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  let publishableApiKey: ApiKey | null = null;
  const { data } = await query.graph({
    entity: "api_key",
    fields: ["id"],
    filters: {
      type: "publishable",
    },
  });

  publishableApiKey = data?.[0];

  if (!publishableApiKey) {
    const {
      result: [publishableApiKeyResult],
    } = await createApiKeysWorkflow(container).run({
      input: {
        api_keys: [
          {
            title: "Need This Done Storefront",
            type: "publishable",
            created_by: "",
          },
        ],
      },
    });

    publishableApiKey = publishableApiKeyResult as ApiKey;
  }

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  // Check if category exists
  const productModuleService = container.resolve(Modules.PRODUCT);
  const existingCategories = await productModuleService.listProductCategories({
    name: "Consultations",
  });

  let consultationsCategory;
  if (existingCategories.length) {
    consultationsCategory = existingCategories[0];
    logger.info("Category already exists, skipping creation.");
  } else {
    const { result: categoryResult } = await createProductCategoriesWorkflow(
      container
    ).run({
      input: {
        product_categories: [
          {
            name: "Consultations",
            is_active: true,
          },
        ],
      },
    });
    consultationsCategory = categoryResult.find((cat) => cat.name === "Consultations")!;
  }

  // Check if products exist
  const existingProducts = await productModuleService.listProducts({
    handle: ["15-min-consultation", "30-min-consultation", "55-min-consultation"],
  });

  if (existingProducts.length >= 3) {
    logger.info("Products already exist, skipping creation.");
  } else {
    await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "15-Minute Consultation",
          category_ids: [consultationsCategory.id],
          description:
            "Quick consultation session to discuss your project needs and get expert guidance.",
          handle: "15-min-consultation",
          weight: 0,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          thumbnail: "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-15min.jpg",
          images: [
            {
              url: "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-15min.jpg",
            },
          ],
          metadata: {
            requires_appointment: true,
            duration_minutes: 15,
            availability: "weekdays",
            timezone: "America/New_York",
          },
          options: [
            {
              title: "Type",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CONSULT-15",
              manage_inventory: false,
              options: { Type: "Standard" },
              metadata: {
                base_price_usd: 2000,
              },
              prices: [
                {
                  amount: 2000,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "30-Minute Consultation",
          category_ids: [consultationsCategory.id],
          description:
            "Standard consultation session for in-depth project planning and technical discussions.",
          handle: "30-min-consultation",
          weight: 0,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          thumbnail: "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-30min.jpg",
          images: [
            {
              url: "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-30min.jpg",
            },
          ],
          metadata: {
            requires_appointment: true,
            duration_minutes: 30,
            availability: "weekdays",
            timezone: "America/New_York",
          },
          options: [
            {
              title: "Type",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CONSULT-30",
              manage_inventory: false,
              options: { Type: "Standard" },
              metadata: {
                base_price_usd: 3500,
              },
              prices: [
                {
                  amount: 3500,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
        {
          title: "55-Minute Consultation",
          category_ids: [consultationsCategory.id],
          description:
            "Extended consultation session for comprehensive project analysis and detailed recommendations.",
          handle: "55-min-consultation",
          weight: 0,
          status: ProductStatus.PUBLISHED,
          shipping_profile_id: shippingProfile.id,
          thumbnail: "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-55min.jpg",
          images: [
            {
              url: "https://oxhjtmozsdstbokwtnwa.supabase.co/storage/v1/object/public/product-images/consultation-55min.jpg",
            },
          ],
          metadata: {
            requires_appointment: true,
            duration_minutes: 55,
            availability: "weekdays",
            timezone: "America/New_York",
          },
          options: [
            {
              title: "Type",
              values: ["Standard"],
            },
          ],
          variants: [
            {
              title: "Standard",
              sku: "CONSULT-55",
              manage_inventory: false,
              options: { Type: "Standard" },
              metadata: {
                base_price_usd: 5000,
              },
              prices: [
                {
                  amount: 5000,
                  currency_code: "usd",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  }
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels: CreateInventoryLevelInput[] = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 1000000,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
