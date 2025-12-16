import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getRevenueStats } from '@/lib/stripe-revenue';

export async function GET() {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.ALERT_FROM_EMAIL;
    const toEmail = process.env.ALERT_TO_EMAIL;

    if (!resendApiKey || !fromEmail || !toEmail) {
        return NextResponse.json(
            { error: 'Missing environment variables: RESEND_API_KEY, ALERT_FROM_EMAIL, or ALERT_TO_EMAIL' },
            { status: 500 }
        );
    }

    try {
        const stats = await getRevenueStats();
        const resend = new Resend(resendApiKey);

        const emailBody = `
RevLeak completed a revenue check on your Stripe account.

Gross revenue: $${stats.gross.toFixed(2)}
Fees: $${stats.fees.toFixed(2)}
Net revenue: $${stats.net.toFixed(2)}

RevLeak monitors these numbers daily and alerts you when unusual changes occur.
    `.trim();

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: 'RevLeak Alert – Revenue Check Complete',
            text: emailBody,
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: 'Alert email sent successfully',
            data,
        });
    } catch (error) {
        console.error('Alert error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'An error occurred while sending the alert' },
            { status: 500 }
        );
    }
}
