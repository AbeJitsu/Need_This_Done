import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { sendEmailWithRetry } from '@/lib/email';
import WaitlistBackInStockEmail from '@/emails/WaitlistBackInStockEmail';
import * as React from 'react';

// ============================================================================
// Admin API - Notify Waitlist Customers
// ============================================================================
// What: Manually trigger waitlist notifications when inventory is updated
// Why: Allow admins to notify customers when products return to stock
// How: Admin posts product ID, system sends emails to all pending waitlist entries
//
// Protected: Admin authentication required
// Usage: POST /api/admin/products/notify-waitlist
//   { productId: "uuid" }

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Check admin role
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://needthisdone.com';

    // Get product details from medusa
    const medusaUrl = process.env.MEDUSA_SERVER_URL || 'http://localhost:9000';
    const medusaToken = process.env.MEDUSA_ADMIN_API_TOKEN;

    let productTitle = 'Product';
    let productImage: string | undefined;

    try {
      const medusaResponse = await fetch(`${medusaUrl}/admin/products/${productId}`, {
        headers: {
          'Authorization': `Bearer ${medusaToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (medusaResponse.ok) {
        const medusaData = await medusaResponse.json();
        productTitle = medusaData.product?.title || 'Product';
        productImage = medusaData.product?.thumbnail || undefined;
      }
    } catch (error) {
      console.error('Error fetching product from Medusa:', error);
      // Continue with default title if Medusa fetch fails
    }

    // Find all pending waitlist entries for this product
    const { data: waitlistItems, error: queryError } = await supabase
      .from('product_waitlist')
      .select('id, email, customer_name')
      .eq('product_id', productId)
      .eq('status', 'pending');

    if (queryError) {
      console.error('Error fetching waitlist entries:', queryError);
      return NextResponse.json(
        { error: 'Failed to fetch waitlist entries' },
        { status: 500 }
      );
    }

    if (!waitlistItems || waitlistItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending waitlist entries for this product',
        notifications_sent: 0,
      });
    }

    // Send notifications to all customers on waitlist
    let notificationsSent = 0;
    const failedEmails: string[] = [];

    for (const customer of waitlistItems) {
      try {
        // Create email component
        const emailComponent = React.createElement(WaitlistBackInStockEmail, {
          customerEmail: customer.email,
          customerName: customer.customer_name,
          productTitle: productTitle,
          productImage: productImage,
          productUrl: `${siteUrl}/shop/${productId}`,
        });

        // Send email with retry logic (returns email ID or null)
        const emailId = await sendEmailWithRetry(
          customer.email,
          `${productTitle} is back in stock!`,
          emailComponent,
          { maxRetries: 3 }
        );

        if (emailId) {
          // Mark waitlist entry as notified
          const { error: updateError } = await supabase
            .from('product_waitlist')
            .update({
              status: 'notified',
              notified_at: new Date().toISOString(),
            })
            .eq('id', customer.id);

          if (!updateError) {
            notificationsSent++;
            console.log(`[Waitlist] Notified ${customer.email} (Email ID: ${emailId})`);
          } else {
            console.error('Error updating waitlist status:', updateError);
            failedEmails.push(customer.email);
          }
        } else {
          console.error(`Failed to send email to ${customer.email}`);
          failedEmails.push(customer.email);
        }
      } catch (error) {
        console.error(`Error sending notification to ${customer.email}:`, error);
        failedEmails.push(customer.email);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Waitlist notifications processed',
      notifications_sent: notificationsSent,
      total_entries: waitlistItems.length,
      failed_emails: failedEmails,
    });
  } catch (error) {
    console.error('[Admin API] Notify waitlist error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process waitlist notifications',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
