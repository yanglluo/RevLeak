'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';

interface RevenueStats {
    gross: number;
    fees: number;
    net: number;
    effectiveFeeRate: number;
}

function CallbackContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const [isSending, setIsSending] = useState(false);
    const [alertStatus, setAlertStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [alertMessage, setAlertMessage] = useState('');
    const [stats, setStats] = useState<RevenueStats | null>(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // New state for account & email
    const [connectedAccountId, setConnectedAccountId] = useState<string | null>(null);
    const [alertEmail, setAlertEmail] = useState<string>('');
    const [isEditingEmail, setIsEditingEmail] = useState(false);
    const [emailInput, setEmailInput] = useState('');

    useEffect(() => {
        if (code && !connectedAccountId) {
            const initConnection = async () => {
                setIsLoadingStats(true);
                try {
                    // 1. Exchange code for account ID & Email
                    const exchangeRes = await fetch('/api/stripe/exchange', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code }),
                    });

                    if (!exchangeRes.ok) {
                        const errData = await exchangeRes.json();
                        throw new Error(errData.error || 'Failed to exchange authorization code');
                    }

                    const { connectedAccountId, email } = await exchangeRes.json();
                    setConnectedAccountId(connectedAccountId);
                    setAlertEmail(email);
                    setEmailInput(email);

                    // 2. Fetch revenue stats for this account
                    const statsRes = await fetch(`/api/stripe/check-revenue?stripeAccountId=${connectedAccountId}`);
                    if (statsRes.ok) {
                        const data = await statsRes.json();
                        setStats(data);
                    }
                } catch (err) {
                    console.error('Connection failed', err);
                    setAlertStatus('error');
                    setAlertMessage(err instanceof Error ? err.message : 'Failed to connect account.');
                } finally {
                    setIsLoadingStats(false);
                }
            };
            initConnection();
        }
    }, [code, connectedAccountId]);

    const handleUpdateEmail = async () => {
        if (!connectedAccountId) return;
        try {
            const res = await fetch('/api/user/update-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stripeAccountId: connectedAccountId, email: emailInput }),
            });
            if (res.ok) {
                setAlertEmail(emailInput);
                setIsEditingEmail(false);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update email');
        }
    };

    const handleSendAlert = async () => {
        if (!connectedAccountId) return;

        setIsSending(true);
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
        } catch (error) {
            setAlertStatus('error');
            setAlertMessage(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setIsSending(false);
        }
    };

    if (error) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-2xl font-bold text-red-600">Connection Failed</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    {errorDescription || 'An error occurred during connection.'}
                </p>
                <p className="text-sm text-gray-500">Error code: {error}</p>
                <div className="pt-4">
                    <Link href="/connect" className="text-indigo-600 hover:text-indigo-500 hover:underline">
                        Try Again
                    </Link>
                </div>
            </div>
        );
    }

    if (!code) {
        return (
            <div className="text-center space-y-4">
                <h1 className="text-xl font-bold text-yellow-600">No Code Received</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    The callback URL was accessed without an authorization code.
                </p>
                <div className="pt-4">
                    <Link href="/connect" className="text-indigo-600 hover:text-indigo-500 hover:underline">
                        Go to Connect
                    </Link>
                </div>
            </div>
        );
    }

    const isHighFee = stats && stats.effectiveFeeRate > 3.5;

    return (
        <div className="text-center space-y-8">
            <div className="space-y-4">
                <h1 className="text-2xl font-bold text-green-600">Connection Successful!</h1>

                {/* Email Confirmation / Editor */}
                <div className="text-sm bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg inline-block border border-gray-100 dark:border-gray-800">
                    {isEditingEmail ? (
                        <div className="flex items-center gap-2">
                            <input
                                type="email"
                                value={emailInput}
                                onChange={(e) => setEmailInput(e.target.value)}
                                className="px-2 py-1 rounded border dark:bg-zinc-900 border-gray-300 dark:border-gray-700"
                            />
                            <button onClick={handleUpdateEmail} className="text-xs font-semibold text-indigo-600">Save</button>
                            <button onClick={() => setIsEditingEmail(false)} className="text-xs text-gray-400">Cancel</button>
                        </div>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">
                            RevLeak will send alerts to <span className="font-semibold text-gray-900 dark:text-white">{alertEmail || '...'}</span>
                            <button
                                onClick={() => setIsEditingEmail(true)}
                                className="ml-2 text-xs text-indigo-600 hover:underline"
                            >
                                (Change)
                            </button>
                        </p>
                    )}
                </div>
            </div>

            {isLoadingStats && <p className="text-sm text-gray-500">Analyzing revenue data...</p>}

            {stats && (
                <div className="text-left space-y-6">
                    {/* Revenue Snapshot */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Revenue Snapshot (Last 7 Days)</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500">Gross Revenue</p>
                                <p className="font-medium">${stats.gross.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Stripe Fees</p>
                                <p className="font-medium text-red-500">-${stats.fees.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Net Revenue</p>
                                <p className="font-medium text-green-600">${stats.net.toFixed(2)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500">Effective Fee Rate</p>
                                <p className={`font-medium ${isHighFee ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                    {stats.effectiveFeeRate}%
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Why RevLeak Exists */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Why RevLeak Exists</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Stripe shows you what happened. RevLeak focuses on what quietly reduces what you keep.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            RevLeak continuously monitors fees, FX costs, and failed payments so you don’t have to manually dig through Stripe reports.
                        </p>
                    </div>

                    {/* Findings & Action */}
                    <div className={`p-4 rounded-xl border ${isHighFee ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'}`}>
                        <h3 className={`text-sm font-semibold mb-2 ${isHighFee ? 'text-amber-800 dark:text-amber-400' : 'text-blue-800 dark:text-blue-400'}`}>
                            What RevLeak Found
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            {isHighFee
                                ? "Your fee rate looks higher than average (> 3.5%). This is commonly caused by cross-border payments or FX conversion fees."
                                : "Stripe fees are within a normal range. RevLeak will continue monitoring for any unexpected spikes."}
                        </p>

                        <h3 className={`text-sm font-semibold mb-2 ${isHighFee ? 'text-amber-800 dark:text-amber-400' : 'text-blue-800 dark:text-blue-400'}`}>
                            What You Can Do
                        </h3>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                            {isHighFee
                                ? "Review your recent international transactions. Consider enabling local currency pricing or adding a settlement currency to reduce FX costs."
                                : "Even when everything looks normal, RevLeak keeps watching for changes that could impact your net revenue."}
                        </p>
                    </div>
                </div>
            )}

            <div className="pt-2 pb-2">
                <button
                    onClick={handleSendAlert}
                    disabled={isSending || !connectedAccountId}
                    className="w-full rounded-md bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSending ? 'Sending…' : '📩 Send Me a Test Revenue Alert'}
                </button>
                {alertStatus !== 'idle' && (
                    <p className={`mt-3 text-sm ${alertStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {alertMessage}
                    </p>
                )}
            </div>

            {/* Paywall / Upsell */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800">
                <h3 className="text-base font-bold text-indigo-900 dark:text-indigo-300 mb-2">
                    🚨 Keep RevLeak Monitoring Your Revenue
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    RevLeak will continue checking your Stripe revenue and alert you when fees, FX, or payment issues quietly reduce net revenue.
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-4">
                    Plans start at $49/month.
                </p>
                <Link
                    href="/billing"
                    className="block w-full text-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Enable Ongoing Monitoring
                </Link>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                    Return to Dashboard
                </Link>
            </div>
        </div>
    );
}

export default function ConnectCallbackPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
            <div className="max-w-md w-full bg-white dark:bg-gray-900/50 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                <Suspense fallback={<div className="text-center text-gray-500">Loading connection details...</div>}>
                    <CallbackContent />
                </Suspense>
            </div>
        </main>
    );
}
