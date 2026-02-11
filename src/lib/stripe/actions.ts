'use server';

import { createClient } from '@/lib/supabase/server';
import { stripe } from './client';

export async function createStripeCustomer(email: string, name: string, organizationId: string) {
    const supabase = await createClient();

    // 1. Create Stripe Customer
    const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
            organizationId,
        },
    });

    // 2. Update Supabase
    const { error } = await supabase
        .from('organizations')
        .update({ stripe_customer_id: customer.id })
        .eq('id', organizationId);

    if (error) {
        console.error('Failed to link Stripe Customer to Org:', error);
        throw new Error('Database update failed');
    }

    return customer.id;
}

export async function createSubscription(customerId: string, priceId: string) {
    const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: { save_default_payment_method: 'on_subscription' },
        expand: ['latest_invoice.payment_intent'],
    });

    return subscription;
}
