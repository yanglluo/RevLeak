import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    const appUrl = process.env.APP_URL;

    if (!stripeSecretKey || !appUrl) {
        return NextResponse.json(
            { error: 'Missing environment variables: STRIPE_SECRET_KEY or APP_URL' },
            { status: 500 }
        );
    }

    try {
        const { plan } = await req.json();

        // 🔍 DEBUG LOGS (temporary)
        console.log('PLAN RECEIVED:', plan);
        console.log('PRICE_STARTER:', process.env.PRICE_STARTER);
        console.log('PRICE_GROWTH:', process.env.PRICE_GROWTH);
        console.log('PRICE_PRO:', process.env.PRICE_PRO);

        let priceId;
        switch (plan) {
            case 'starter':
                priceId = process.env.PRICE_STARTER;
                break;
            case 'growth':
                priceId = process.env.PRICE_GROWTH;
                break;
            case 'pro':
                priceId = process.env.PRICE_PRO;
                break;
            default:
                return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 });
        }

        if (!priceId) {
            return NextResponse.json(
                { error: `Missing Price ID for plan: ${plan}` },
                { status: 500 }
            );
        }

        const stripe = new Stripe(stripeSecretKey, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiVersion: '2025-11-17.clover' as any,
        });

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            success_url: `${appUrl}/monitoring-enabled?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${appUrl}/billing`,
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
