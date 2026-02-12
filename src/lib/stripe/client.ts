import Stripe from 'stripe';

// Lazy initialization to avoid crashing at build time when STRIPE_SECRET_KEY is missing
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
    if (!_stripe) {
        const key = process.env.STRIPE_SECRET_KEY;
        if (!key) {
            throw new Error('STRIPE_SECRET_KEY is not configured');
        }
        _stripe = new Stripe(key, {
            apiVersion: '2025-12-15.clover',
            typescript: true,
        });
    }
    return _stripe;
}

/** @deprecated Use getStripe() instead — this can crash at build time */
export const stripe = (() => {
    try {
        return new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_placeholder_for_build', {
            apiVersion: '2025-12-15.clover',
            typescript: true,
        });
    } catch {
        return null as unknown as Stripe;
    }
})();
