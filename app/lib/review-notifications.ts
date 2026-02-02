import React from 'react';
import { sendEmailWithRetry } from './email';
import ReviewApprovedEmail from '@/emails/ReviewApprovedEmail';
import ReviewRejectedEmail from '@/emails/ReviewRejectedEmail';

// ============================================================================
// Review Notification Helpers
// ============================================================================
// What: Send email notifications when reviews are approved or rejected
// Why: Keep customers informed about their review status
// How: Template-based emails via Resend with retry logic

/**
 * Send an email to the reviewer when their review is approved
 *
 * @param reviewerEmail - Email address of the reviewer
 * @param reviewerName - Name to use in the email greeting
 * @param productTitle - Name of the product being reviewed
 * @param productImage - URL to product image (optional)
 * @param rating - Star rating (1-5)
 * @param reviewTitle - Title of the review (optional)
 * @param productUrl - URL to the product page (optional)
 * @returns Email ID if sent successfully, null otherwise
 */
export async function sendReviewApprovedEmail(
  reviewerEmail: string,
  reviewerName: string | undefined | null,
  productTitle: string,
  productImage: string | undefined | null,
  rating: number,
  reviewTitle: string | undefined | null,
  productUrl?: string
): Promise<string | null> {
  try {
    const emailId = await sendEmailWithRetry(
      reviewerEmail,
      'Your Review Has Been Approved! 🎉',
      React.createElement(ReviewApprovedEmail, {
        customerName: reviewerName || undefined,
        customerEmail: reviewerEmail,
        productTitle,
        productImage: productImage || undefined,
        rating,
        reviewTitle: reviewTitle || undefined,
        productUrl,
      }),
      { maxRetries: 3 }
    );

    if (emailId) {
      console.log(`[Review Notification] Approved email sent to ${reviewerEmail} (ID: ${emailId})`);
    } else {
      console.error(`[Review Notification] Failed to send approved email to ${reviewerEmail}`);
    }

    return emailId;
  } catch (error) {
    console.error('[Review Notification] Error sending approved email:', error);
    return null;
  }
}

/**
 * Send an email to the reviewer when their review is rejected
 *
 * @param reviewerEmail - Email address of the reviewer
 * @param reviewerName - Name to use in the email greeting
 * @param productTitle - Name of the product being reviewed
 * @param rating - Star rating (1-5)
 * @param rejectionReason - Reason for rejection (optional)
 * @param productUrl - URL to the product page (optional)
 * @returns Email ID if sent successfully, null otherwise
 */
export async function sendReviewRejectedEmail(
  reviewerEmail: string,
  reviewerName: string | undefined | null,
  productTitle: string,
  rating: number,
  rejectionReason?: string | null,
  productUrl?: string
): Promise<string | null> {
  try {
    const emailId = await sendEmailWithRetry(
      reviewerEmail,
      'Update on Your Review Submission',
      React.createElement(ReviewRejectedEmail, {
        customerName: reviewerName || undefined,
        customerEmail: reviewerEmail,
        productTitle,
        rating,
        rejectionReason: rejectionReason || undefined,
        productUrl,
      }),
      { maxRetries: 3 }
    );

    if (emailId) {
      console.log(`[Review Notification] Rejected email sent to ${reviewerEmail} (ID: ${emailId})`);
    } else {
      console.error(`[Review Notification] Failed to send rejected email to ${reviewerEmail}`);
    }

    return emailId;
  } catch (error) {
    console.error('[Review Notification] Error sending rejected email:', error);
    return null;
  }
}
