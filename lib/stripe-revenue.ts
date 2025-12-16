import Stripe from 'stripe';

export async function getRevenueStats() {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
        throw new Error('Missing environment variable: STRIPE_SECRET_KEY');
    }

    const stripe = new Stripe(stripeSecretKey, {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        apiVersion: '2025-11-17.clover' as any, // Cast to any to avoid type mismatch issues if types are outdated
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

    const grossAmount = gross / 100;
    const feesAmount = fees / 100;
    const netAmount = net / 100;

    // Calculate effective fee rate as a percentage
    // Avoid division by zero
    const effectiveFeeRate = gross > 0 ? (fees / gross) * 100 : 0;

    // Convert from cents to major currency units (e.g., dollars)
    return {
        gross: grossAmount,
        fees: feesAmount,
        net: netAmount,
        effectiveFeeRate: parseFloat(effectiveFeeRate.toFixed(2)),
    };
}
