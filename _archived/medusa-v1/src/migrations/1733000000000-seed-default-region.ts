import { MigrationInterface, QueryRunner } from "typeorm";

export class SeedDefaultRegion1733000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Check if store exists, if not create one
    const storeExists = await queryRunner.query(
      `SELECT id FROM store LIMIT 1`
    );

    if (storeExists.length === 0) {
      await queryRunner.query(`
        INSERT INTO store (id, name, default_currency_code, created_at, updated_at)
        VALUES ('store_01JETHD9QAXKD', 'Need This Done', 'usd', NOW(), NOW())
      `);
    }

    // Check if region exists
    const regionExists = await queryRunner.query(
      `SELECT id FROM region WHERE id = 'reg_01JETHD9QAXKD' LIMIT 1`
    );

    if (regionExists.length === 0) {
      // First, ensure payment provider exists in payment_provider table
      // This is required before the PaymentProviderService can update it
      await queryRunner.query(`
        INSERT INTO payment_provider (id, is_installed)
        VALUES ('manual', true)
        ON CONFLICT (id) DO UPDATE SET is_installed = true
      `);

      // Ensure fulfillment provider exists
      await queryRunner.query(`
        INSERT INTO fulfillment_provider (id, is_installed)
        VALUES ('manual', true)
        ON CONFLICT (id) DO UPDATE SET is_installed = true
      `);

      // Insert region (based on Medusa test helpers approach)
      await queryRunner.query(`
        INSERT INTO region (id, name, currency_code, tax_rate, created_at, updated_at)
        VALUES ('reg_01JETHD9QAXKD', 'United States', 'usd', 0, NOW(), NOW())
      `);

      // Link payment provider to region
      await queryRunner.query(`
        INSERT INTO region_payment_providers (region_id, provider_id)
        VALUES ('reg_01JETHD9QAXKD', 'manual')
      `);

      // Link fulfillment provider to region
      await queryRunner.query(`
        INSERT INTO region_fulfillment_providers (region_id, provider_id)
        VALUES ('reg_01JETHD9QAXKD', 'manual')
      `);

      // Add US country to region
      await queryRunner.query(`
        UPDATE country
        SET region_id = 'reg_01JETHD9QAXKD'
        WHERE iso_2 = 'us'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Clean up in reverse order
    await queryRunner.query(`UPDATE country SET region_id = NULL WHERE region_id = 'reg_01JETHD9QAXKD'`);
    await queryRunner.query(`DELETE FROM region_fulfillment_providers WHERE region_id = 'reg_01JETHD9QAXKD'`);
    await queryRunner.query(`DELETE FROM region_payment_providers WHERE region_id = 'reg_01JETHD9QAXKD'`);
    await queryRunner.query(`DELETE FROM region WHERE id = 'reg_01JETHD9QAXKD'`);
    await queryRunner.query(`DELETE FROM store WHERE id = 'store_01JETHD9QAXKD'`);
  }
}
