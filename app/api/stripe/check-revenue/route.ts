import { NextResponse } from 'next/server';
import { getRevenueStats } from '@/lib/stripe-revenue';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const stripeAccountId = searchParams.get('stripeAccountId') || undefined;

        const stats = await getRevenueStats(stripeAccountId);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stripe API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred while fetching revenue data' },
            { status: 500 }
        );
    }
}
