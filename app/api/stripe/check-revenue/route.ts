import { NextResponse } from 'next/server';
import { getRevenueStats } from '@/lib/stripe-revenue';

export async function GET() {
    try {
        const stats = await getRevenueStats();
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Stripe API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred while fetching revenue data' },
            { status: 500 }
        );
    }
}
