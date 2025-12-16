import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getRevenueStats } from '@/lib/stripe-revenue';

export async function POST(req: Request) {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.ALERT_FROM_EMAIL;
    // Remove global ALERT_TO_EMAIL usage

    if (!resendApiKey || !fromEmail) {
        return NextResponse.json(
            { error: 'Missing environment variables: RESEND_API_KEY or ALERT_FROM_EMAIL' },
            { status: 500 }
        );
    }

    try {
        const { stripeAccountId } = await req.json();

        // If no account ID provided, we can't route the alert correctly
        if (!stripeAccountId) {
            return NextResponse.json({ error: 'Missing stripeAccountId' }, { status: 400 });
        }

        // Look up the user's email
        // We'll dynamically import getUser to avoid issues if store.ts isn't perfect yet, 
        // but since I created it, static import is fine. 
        // Let's use the standard import I will add at the top.
        // Wait, I can't add imports at top with this tool easily in one go if I change the middle.
        // I'll assume I add the import separately or use `require`.
        const { getUser } = await import('@/lib/store');
        const user = await getUser(stripeAccountId);

        if (!user || !user.email) {
            return NextResponse.json({ error: 'User not found or missing email' }, { status: 404 });
        }

        const toEmail = user.email;

        const stats = await getRevenueStats(stripeAccountId);
        const resend = new Resend(resendApiKey);

        const isHighFee = stats.effectiveFeeRate > 3.5;

        const subject = isHighFee
            ? 'RevLeak Alert — Stripe Fees May Be Reducing Net Revenue'
            : 'RevLeak Alert — Revenue Check Complete';

        const insightText = isHighFee
            ? 'Why this matters:\nStripe fees are higher than average (> 3.5%). This is often caused by currency conversion (FX) fees or cross-border payments.'
            : 'Why this matters:\nFees are currently within a normal range.';

        const emailBody = `
RevLeak completed a revenue check on your Stripe account.

Revenue Summary:
Gross revenue: $${stats.gross.toFixed(2)}
Stripe fees: $${stats.fees.toFixed(2)}
Net revenue: $${stats.net.toFixed(2)}
Effective fee rate: ${stats.effectiveFeeRate}%

${insightText}

What RevLeak watches for:
• FX conversion spikes from international customers
• Failed payments that reduce net revenue
• Sudden fee increases from card mix changes
• Silent drops in net revenue despite stable sales

These issues often happen without obvious alerts inside Stripe.

What happens next:
RevLeak will continue monitoring your Stripe account and alert you if:
• Fees exceed your normal range
• Net revenue drops unexpectedly
• FX-related costs spike

You’ll only hear from RevLeak when something needs attention.

Many SaaS founders don’t notice these issues until thousands in revenue is already lost.
    `.trim();

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: toEmail,
            subject: subject,
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
