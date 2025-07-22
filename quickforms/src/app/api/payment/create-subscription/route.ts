import { NextResponse } from 'next/server';
import { auth, db } from '@/lib/firebaseAdmin';
import { stripe } from '@/lib/stripe';

export async function POST(request: Request) {
    try {
        const token = request.headers.get('Authorization')?.split('Bearer ')[1];
        if (!token) {
            return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
        }

        const decodedToken = await auth.verifyIdToken(token);
        const uid = decodedToken.uid;
        const email = decodedToken.email;
        const userRef = db.collection('users').doc(uid);

        const { paymentMethodId } = await request.json();
        if (!paymentMethodId) {
             return NextResponse.json({ message: 'Payment method ID is required' }, { status: 400 });
        }

        // 1. Create a customer in Stripe
        const customer = await stripe.customers.create({
            email: email,
            payment_method: paymentMethodId,
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // 2. Create the subscription with a 14-day trial
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: process.env.STRIPE_PRICE_ID }], // Your $19/month price ID from Stripe Dashboard
            trial_period_days: 14,
            expand: ['latest_invoice.payment_intent'],
        });

        // 3. Save the customer and subscription IDs to your user document
        await userRef.update({
            stripeCustomerId: customer.id,
            stripeSubscriptionId: subscription.id,
            subscriptionTier: 'pro', // Upgrade the user
        });

        return NextResponse.json({ success: true, subscriptionId: subscription.id });

    } catch (error: any) {
        console.error("Create Subscription API Error:", error);
        return NextResponse.json({ message: `An internal server error occurred: ${error.message}` }, { status: 500 });
    }
}
