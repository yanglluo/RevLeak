'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useEffect, useRef, useState } from 'react';

interface RevenueStats {
    gross: number;
    fees: number;
    net: number;
    effectiveFeeRate: number;
}

function CallbackContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const oauthError = searchParams.get('error');
    const oauthErrorDescription = searchParams.get('error_description');

    // 🔒 HARD GUARD — prevents double OAuth exchange
    const hasExchanged = useRef(false);

    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState<RevenueStats | null>(null);

    const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
    const [alertEmail, setAlertEmail] = useState('');
    const [emailInput, setEmailInput] = useState('');
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    const [isSendingAlert, setIsSendingAlert] = useState(false);
    const [alertStatus, setAlertStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [alertMessage, setAlertMessage] = useState('');

    // 🚀 OAuth exchange + revenue fetch (ONCE)
    useEffect(() => {
        if (!code || hasExchanged.current) return;
        hasExchanged.current = true;

        const init = async () => {
            setIsLoading(true);
            try {
                // 1️⃣ Exchange OAuth code
                const exchangeRes = await fetch('/api/stripe/exchange', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code }),
                });

                const exchangeData = await exchangeRes.json();
                if (!exchangeRes.ok || exchangeData.error) {
                    throw new Error(exchangeData.error || 'Failed to connect account');
                }

                const { connectedAccountId, email } = exchangeData;

                setConnectedAccountId(connectedAccountId);
                setAlertEmail(email);
                setEmailInput(email);

                // 2️⃣ Fetch revenue stats for this connected account
                const statsRes = await fetch(
                    `/api/stripe/check-revenue?stripeAccountId=${connectedAccountId}`
                );

                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }
            } catch (err) {
                setAlertStatus('error');
                setAlertMessage(
                    err instanceof Error ? err.message : 'Failed to connect account'
                );
            } finally {
                setIsLoading(false);
            }
        };

        init();
    }, [code]);

    // ✏️ Update alert email
    const handleUpdateEmail = async () => {
        if (!connectedAccountId) return;
        try {
            const res = await fetch('/api/user/update-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    stripeAccountId: connectedAccountId,
                    email: emailInput,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to update email');
            }

            setAlertEmail(emailInput);
            setIsEditingEmail(false);
        } catch {
            alert('Failed to update email');
        }
    };

    // 📩 Send test alert
    const handleSendAlert = async () => {
        if (!connectedAccountId) return;

        setIsSendingAlert(true);
        setAlertStatus('idle');
        setAlertMessage('');

        try {
            const res = await fetch('/api/alerts/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stripeAccountId: connectedAccountId }),
            });

            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || 'Failed to send alert');
            }

            setAlertStatus('success');
            setAlertMessage('Test alert sent! Check your inbox.');
        } catch (err) {
            setAlertStatus('error');
            setAlertMessage(
                err instanceof Error ? err.message : 'Failed to send alert'
            );
        } finally {
            setIsSendingAlert(false);
        }
    };

    // 🧨 Stripe OAuth error
    if (oauthError) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Connection Failed</h1>
                <p className="text-gray-600">
                    {oauthErrorDescription || 'Stripe authorization failed.'}
                </p>
                <Link href="/connect" className="text-indigo-600 hover:underline">
                    Try Again
                </Link>
            </div>
        );
    }

    // ⏳ Loading
    if (isLoading) {
        return <p className="text-center text-gray-500">Connecting your Stripe account…</p>;
    }

    // ❌ Error
    if (alertStatus === 'error' && !connectedAccountId) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Failed to connect account</h1>
                <p className="text-gray-600">{alertMessage}</p>
            </div>
        );
    }

    const isHighFee = stats && stats.effectiveFeeRate > 3.5;

    return (
        <div className="text-center space-y-8">
            <h1 className="text-2xl font-bold text-green-600">Connection Successful!</h1>

            {/* Email */}
            <div className="bg-gray-50 p-3 rounded-lg border text-sm">
                {isEditingEmail ? (
                    <div className="flex gap-2 justify-center">
                        <input
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            className="border px-2 py-1 rounded"
                        />
                        <button onClick={handleUpdateEmail} className="text-indigo-600 font-semibold">
                            Save
                        </button>
                        <button onClick={() => setIsEditingEmail(false)} className="text-gray-400">
                            Cancel
                        </button>
                    </div>
                ) : (
                    <p>
                        Alerts will be sent to <strong>{alertEmail}</strong>
                        <button
                            onClick={() => setIsEditingEmail(true)}
                            className="ml-2 text-xs text-indigo-600 hover:underline"
                        >
                            (Change)
                        </button>
                    </p>
                )}
            </div>

            {/* Revenue Snapshot */}
            {stats && (
                <div className="text-left bg-gray-50 p-4 rounded-lg border space-y-2 text-sm">
                    <p>Gross: ${stats.gross.toFixed(2)}</p>
                    <p className="text-red-500">Fees: -${stats.fees.toFixed(2)}</p>
                    <p className="text-green-600">Net: ${stats.net.toFixed(2)}</p>
                    <p className={isHighFee ? 'text-red-500' : ''}>
                        Effective Fee Rate: {stats.effectiveFeeRate}%
                    </p>
                </div>
            )}

            {/* Test Alert */}
            <button
                onClick={handleSendAlert}
                disabled={isSendingAlert}
                className="w-full bg-black text-white py-3 rounded disabled:opacity-50"
            >
                {isSendingAlert ? 'Sending…' : '📩 Send Me a Test Revenue Alert'}
            </button>

            {alertStatus !== 'idle' && (
                <p className={`text-sm ${alertStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                    {alertMessage}
                </p>
            )}

            {/* Upsell */}
            <div className="bg-indigo-50 p-6 rounded-lg border">
                <p className="font-semibold mb-2">🚨 Keep RevLeak Monitoring Your Revenue</p>
                <p className="text-sm mb-4">Plans start at $49/month.</p>
                <Link
                    href="/billing"
                    className="block text-center bg-indigo-600 text-white py-2 rounded"
                >
                    Enable Ongoing Monitoring
                </Link>
            </div>

            <Link href="/" className="text-sm text-gray-500 hover:underline">
                Return to Dashboard
            </Link>
        </div>
    );
}

export default function ConnectCallbackPage() {
    return (
        <main className="flex min-h-screen items-center justify-center p-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl border shadow-sm">
                <Suspense fallback={<p className="text-center">Loading…</p>}>
                    <CallbackContent />
                </Suspense>
            </div>
        </main>
    );
}
