import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function GET() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
        return NextResponse.json(
            { error: 'Missing environment variable: STRIPE_SECRET_KEY' },
            { status: 500 }
        );
    }

    try {
        const stripe = new Stripe(stripeSecretKey, {
            apiVersion: '2025-11-17.clover',
        });

        // Fetch latest 100 balance transactions
        const transactions = await stripe.balanceTransactions.list({
            limit: 100,
        });

        let gross = 0;
        let fees = 0;
        let net = 0;

        for (const txn of transactions.data) {
            gross += txn.amount;
            fees += txn.fee;
            net += txn.net;
        }

        // Convert from cents to major currency units (e.g., dollars)
        return NextResponse.json({
            gross: gross / 100,
            fees: fees / 100,
            net: net / 100,
        });
    } catch (error) {
        console.error('Stripe API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred while fetching revenue data' },
            { status: 500 }
        );
    }
}
