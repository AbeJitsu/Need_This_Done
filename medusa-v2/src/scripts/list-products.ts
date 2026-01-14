import { ExecArgs } from "@medusajs/framework/types";
import { Modules } from "@medusajs/framework/utils";

export default async function listProducts({ container }: ExecArgs) {
  const productService = container.resolve(Modules.PRODUCT);
  const products = await productService.listProducts({});

  console.log("\n=== PRODUCTS IN DATABASE ===\n");
  console.log(`Total products: ${products.length}\n`);

  for (const product of products) {
    console.log(`- ${product.title}`);
    console.log(`  Handle: ${product.handle}`);
    console.log(`  Status: ${product.status}`);
    console.log("");
  }
}
