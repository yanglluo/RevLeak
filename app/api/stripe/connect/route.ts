import { NextResponse } from 'next/server';

export async function GET() {
    const clientId = process.env.STRIPE_CONNECT_CLIENT_ID;
    const appUrl = process.env.APP_URL;

    if (!clientId || !appUrl) {
        return NextResponse.json(
            { error: 'Missing environment variables: STRIPE_CONNECT_CLIENT_ID or APP_URL' },
            { status: 500 }
        );
    }

    const redirectUri = `${appUrl}/connect/callback`;
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        scope: 'read_write',
        redirect_uri: redirectUri,
    });

    return NextResponse.redirect(`https://connect.stripe.com/oauth/authorize?${params.toString()}`);
}
