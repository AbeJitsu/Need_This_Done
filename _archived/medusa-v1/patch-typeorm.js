/**
 * Patches Medusa's PaymentProviderService and FulfillmentProviderService
 * to work with TypeORM 0.3.23+ which rejects empty criteria in update()
 *
 * The issue: model.update({}, { is_installed: false }) throws:
 *   "TypeORMError: Empty criteria(s) are not allowed for the update method"
 *
 * Solution: Replace with createQueryBuilder pattern that updates all records
 */

const fs = require('fs');
const path = require('path');

const filesToPatch = [
  '/app/node_modules/@medusajs/medusa/dist/services/payment-provider.js',
  '/app/node_modules/@medusajs/medusa/dist/services/fulfillment-provider.js',
  '/app/node_modules/@medusajs/medusa/dist/services/notification.js',
  '/app/node_modules/@medusajs/medusa/dist/services/tax-provider.js',
  '/app/node_modules/@medusajs/medusa/dist/services/batch-job.js'
];

// Multiple patterns to catch different variable names across services
const patterns = [
  {
    old: 'model.update({}, { is_installed: false })',
    new: 'model.createQueryBuilder().update().set({ is_installed: false }).execute()'
  },
  {
    old: 'fulfillmentProviderRepo.update({}, { is_installed: false })',
    new: 'fulfillmentProviderRepo.createQueryBuilder().update().set({ is_installed: false }).execute()'
  },
  {
    old: 'repo.update({}, { is_installed: false })',
    new: 'repo.createQueryBuilder().update().set({ is_installed: false }).execute()'
  }
];

filesToPatch.forEach(filePath => {
  try {
    if (fs.existsSync(filePath)) {
      let content = fs.readFileSync(filePath, 'utf8');
      let patched = false;

      patterns.forEach(({ old, new: replacement }) => {
        if (content.includes(old)) {
          content = content.replace(new RegExp(escapeRegex(old), 'g'), replacement);
          patched = true;
        }
      });

      if (patched) {
        fs.writeFileSync(filePath, content);
        console.log(`✓ Patched: ${path.basename(filePath)}`);
      } else {
        console.log(`- Skipped (pattern not found): ${path.basename(filePath)}`);
      }
    } else {
      console.log(`- File not found: ${filePath}`);
    }
  } catch (err) {
    console.error(`✗ Error patching ${filePath}:`, err.message);
  }
});

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

console.log('Patch complete.');
