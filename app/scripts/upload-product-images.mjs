#!/usr/bin/env node

// ============================================================================
// Upload Product Images to Supabase Storage
// ============================================================================
// This script uploads consultation product images to the Supabase Storage bucket
// and outputs the public URLs for use in the seed script.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
  console.error('\nUsage:');
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_ANON_KEY=your-anon-key node scripts/upload-product-images.mjs');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Image files to upload
const images = [
  {
    path: '/tmp/product-images/consultation-15min.jpg',
    storagePath: 'consultation-15min.jpg',
    productName: '15-Minute Consultation'
  },
  {
    path: '/tmp/product-images/consultation-30min.jpg',
    storagePath: 'consultation-30min.jpg',
    productName: '30-Minute Consultation'
  },
  {
    path: '/tmp/product-images/consultation-55min.jpg',
    storagePath: 'consultation-55min.jpg',
    productName: '55-Minute Consultation'
  }
];

async function uploadImages() {
  console.log('🚀 Starting product image upload to Supabase Storage\n');

  const uploadedUrls = [];

  for (const image of images) {
    try {
      console.log(`📤 Uploading ${image.productName}...`);

      // Read the file
      const fileBuffer = readFileSync(image.path);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(image.storagePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true // Overwrite if exists
        });

      if (error) {
        console.error(`❌ Error uploading ${image.productName}:`, error.message);
        continue;
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(image.storagePath);

      console.log(`✅ Uploaded successfully: ${image.productName}`);
      console.log(`   URL: ${publicUrl}\n`);

      uploadedUrls.push({
        productName: image.productName,
        url: publicUrl
      });

    } catch (err) {
      console.error(`❌ Error uploading ${image.productName}:`, err.message);
    }
  }

  // Print summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Upload Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  uploadedUrls.forEach(({ productName, url }) => {
    console.log(`${productName}:`);
    console.log(`  ${url}\n`);
  });

  console.log('✅ All images uploaded successfully!');
  console.log('\n💡 Next step: Update the seed script with these URLs');
}

// Run the upload
uploadImages().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
