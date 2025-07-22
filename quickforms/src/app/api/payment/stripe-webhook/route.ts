import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/firebaseAdmin';

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

  let event: Stripe.Event;

  try {
    const body = await request.text();
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return NextResponse.json({ message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  /**
   * Helper: update user document
   */
  const updateUserByCustomerId = async (
    customerId: string,
    data: Partial<{ subscriptionTier: string; subscriptionStatus: string }>
  ) => {
    const userSnapshot = await db
      .collection('users')
      .where('stripeCustomerId', '==', customerId)
      .get();

    if (!userSnapshot.empty) {
      const userDoc = userSnapshot.docs[0];
      await userDoc.ref.update(data);
    } else {
      console.warn(`No user found for customer ${customerId}`);
    }
  };

  switch (event.type) {
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | null;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await updateUserByCustomerId(subscription.customer as string, {
          subscriptionTier: 'pro',
        });
      }

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const subscriptionId = invoice.subscription as string | null;

      if (subscriptionId) {
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);

        await updateUserByCustomerId(subscription.customer as string, {
          subscriptionStatus: 'past_due',
        });
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;

      const userSnapshot = await db
        .collection('users')
        .where('stripeSubscriptionId', '==', subscription.id)
        .get();

      if (!userSnapshot.empty) {
        const userDoc = userSnapshot.docs[0];
        await userDoc.ref.update({ subscriptionTier: 'free' });
      } else {
        console.warn(`No user found for subscription ${subscription.id}`);
      }

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
