import { NextResponse } from 'next/server';
import { saveUser } from '@/lib/store';

export async function POST(req: Request) {
    try {
        const { stripeAccountId, email } = await req.json();

        if (!stripeAccountId || !email) {
            return NextResponse.json({ error: 'Missing account ID or email' }, { status: 400 });
        }

        saveUser(stripeAccountId, email);

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json(
            { error: 'Failed to update email' },
            { status: 500 }
        );
    }
}
