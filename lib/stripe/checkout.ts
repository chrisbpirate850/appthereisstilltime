'use client';

import { db } from '@/lib/firebase/config';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';

interface CheckoutSessionData {
  price?: string;
  line_items?: Array<{
    price: string;
    quantity: number;
  }>;
  mode?: 'payment' | 'subscription';
  success_url: string;
  cancel_url: string;
  allow_promotion_codes?: boolean;
  trial_from_plan?: boolean;
  metadata?: Record<string, string>;
}

/**
 * Create a Stripe Checkout session for a subscription
 * The Firebase extension will populate the checkout URL
 */
export async function createCheckoutSession(
  userId: string,
  priceId: string,
  mode: 'payment' | 'subscription' = 'subscription'
): Promise<string> {
  try {
    const checkoutSessionData: CheckoutSessionData = {
      price: priceId,
      mode,
      success_url: `${window.location.origin}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: window.location.origin,
      allow_promotion_codes: true,
    };

    // Create checkout session doc in Firestore
    // The extension will add the `url` field
    const docRef = await addDoc(
      collection(db, 'customers', userId, 'checkout_sessions'),
      checkoutSessionData
    );

    console.log('✅ Checkout session created:', docRef.id);

    // Wait for the extension to add the checkout URL
    return new Promise((resolve, reject) => {
      const unsubscribe = onSnapshot(docRef, (snap) => {
        const data = snap.data();

        if (data?.error) {
          unsubscribe();
          reject(new Error(data.error.message));
        }

        if (data?.url) {
          unsubscribe();
          resolve(data.url);
        }
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        unsubscribe();
        reject(new Error('Checkout session creation timed out'));
      }, 10000);
    });
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    throw error;
  }
}

/**
 * Create a customer portal link for managing subscriptions
 */
export async function createPortalLink(
  returnUrl: string = window.location.origin
): Promise<string> {
  try {
    const functionUrl = `https://us-central1-there-is-still-time.cloudfunctions.net/ext-firestore-stripe-payments-createPortalLink`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        returnUrl,
        locale: 'auto',
      }),
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    return data.url;
  } catch (error) {
    console.error('❌ Error creating portal link:', error);
    throw error;
  }
}
