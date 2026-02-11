import { createStripeCustomer, createSubscription } from '@/lib/stripe/actions';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { requireResourceAccess } from '@/lib/auth/authorization';
import { handleAPIError } from '@/lib/error-handler';
import { createLogger } from '@/lib/logger';
import { z } from 'zod';

const logger = createLogger({ agent: 'proposals-api' });

const ParamsSchema = z.object({
    id: z.string().uuid('Invalid proposal ID format')
});

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    // 1. Validate params (await in Next.js 16)
    const resolvedParams = await params;
    const { id: proposalId } = ParamsSchema.parse(resolvedParams);

    try {

        // 2. Verify authorization - user must have admin/owner role
        const auth = await requireResourceAccess('proposals', proposalId, ['admin', 'owner']);

        logger.info('Proposal acceptance requested', {
            proposalId,
            userId: auth.userId,
            organizationId: auth.organizationId
        });

        const supabase = await createClient();

        // 3. Get Proposal Details
        const { data: proposal, error: proposalError } = await supabase
            .from('proposals')
            .select('*, organization:organizations(*)')
            .eq('id', proposalId)
            .eq('organization_id', auth.organizationId) // Double-check ownership
            .single();

        if (proposalError || !proposal) {
            logger.warn('Proposal not found', { proposalId });
            return NextResponse.json({ error: 'Proposal not found' }, { status: 404 });
        }

        if (proposal.status === 'accepted') {
            logger.warn('Proposal already accepted', { proposalId });
            return NextResponse.json({ error: 'Proposal already accepted' }, { status: 400 });
        }

        const org = proposal.organization;

        // 4. Validate proposal has pricing information
        if (!proposal.stripe_price_id) {
            logger.error('Proposal missing Stripe price ID', { proposalId });
            return NextResponse.json({
                error: 'Proposal is missing pricing information. Please contact support.'
            }, { status: 400 });
        }

        let stripeCustomerId = org.stripe_customer_id;

        // 5. Create Stripe Customer if needed
        if (!stripeCustomerId) {
            logger.info('Creating Stripe customer', { organizationId: org.id });
            stripeCustomerId = await createStripeCustomer(
                org.email,
                org.name,
                org.id
            );
        }

        // 6. Validate price exists in Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
        try {
            await stripe.prices.retrieve(proposal.stripe_price_id);
        } catch (err) {
            logger.error('Invalid Stripe price ID', {
                proposalId,
                priceId: proposal.stripe_price_id,
                error: err
            });
            return NextResponse.json({
                error: 'Invalid pricing configuration. Please contact support.'
            }, { status: 400 });
        }

        // 7. Create Subscription
        logger.info('Creating Stripe subscription', {
            proposalId,
            priceId: proposal.stripe_price_id,
            customerId: stripeCustomerId
        });

        const subscription = await createSubscription(stripeCustomerId, proposal.stripe_price_id);

        // 8. Update Proposal Status
        const { error: updateError } = await supabase
            .from('proposals')
            .update({
                status: 'accepted',
                accepted_at: new Date().toISOString(),
                stripe_subscription_id: subscription.id
            })
            .eq('id', proposalId)
            .eq('organization_id', auth.organizationId); // Ensure ownership

        if (updateError) {
            logger.error('Failed to update proposal status', { proposalId, error: updateError });
            return NextResponse.json({ error: 'Failed to update proposal status' }, { status: 500 });
        }

        // 9. Safely access client_secret
        const invoice = subscription.latest_invoice as Stripe.Invoice;
        const paymentIntentField = (invoice as any)?.payment_intent;
        const paymentIntent = (typeof paymentIntentField === 'string'
            ? null
            : paymentIntentField) as Stripe.PaymentIntent | null;

        logger.info('Proposal accepted successfully', {
            proposalId,
            subscriptionId: subscription.id,
            organizationId: auth.organizationId
        });

        return NextResponse.json({
            success: true,
            subscriptionId: subscription.id,
            clientSecret: paymentIntent?.client_secret
        });

    } catch (error) {
        // Use error handler to sanitize and log properly
        const { error: sanitizedError, statusCode } = handleAPIError(error, {
            service: 'proposals-accept',
            proposalId
        });

        return NextResponse.json({ error: sanitizedError.message }, { status: statusCode });
    }
}
