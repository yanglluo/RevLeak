import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { saveUser, getUser } from '@/lib/store';

export async function POST(req: Request) {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
        return NextResponse.json(
            { error: 'Missing STRIPE_SECRET_KEY' },
            { status: 500 }
        );
    }

    try {
        const { code } = await req.json();

        if (!code) {
            return NextResponse.json(
                { error: 'Missing authorization code' },
                { status: 400 }
            );
        }

        const stripe = new Stripe(stripeSecretKey, {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            apiVersion: '2025-11-17.clover' as any,
        });

        // 🔐 Exchange OAuth code (single-use)
        const response = await stripe.oauth.token({
            grant_type: 'authorization_code',
            code,
        });

        const connectedAccountId = response.stripe_user_id;
        if (!connectedAccountId) {
            throw new Error('Failed to get connected account ID');
        }

        // 🔁 Idempotency: return existing user if already saved
        const existingUser = await getUser(connectedAccountId);
        if (existingUser) {
            return NextResponse.json({
                connectedAccountId,
                email: existingUser.email,
            });
        }

        // Fetch account email
        const account = await stripe.accounts.retrieve(connectedAccountId);
        const email = account.email || '';

        if (!email) {
            throw new Error('Connected Stripe account has no email');
        }

        // Persist mapping
        await saveUser(connectedAccountId, email);

        return NextResponse.json({
            connectedAccountId,
            email,
        });
    } catch (error) {
        console.error('Stripe OAuth Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'OAuth exchange failed' },
            { status: 500 }
        );
    }
}
