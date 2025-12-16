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

    useEffect(() => {
        if (code) {
            const fetchStats = async () => {
                setIsLoadingStats(true);
                try {
                    const res = await fetch('/api/stripe/check-revenue');
                    if (res.ok) {
                        const data = await res.json();
                        setStats(data);
                    }
                } catch (err) {
                    console.error('Failed to fetch stats', err);
                } finally {
                    setIsLoadingStats(false);
                }
            };
            fetchStats();
        }
    }, [code]);

    const handleSendAlert = async () => {
        setIsSending(true);
        setAlertStatus('idle');
        setAlertMessage('');

        try {
            const res = await fetch('/api/alerts/send');
            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to send alert');
            }

            setAlertStatus('success');
            setAlertMessage('Test alert sent to your email');
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
            <div className="space-y-2">
                <h1 className="text-2xl font-bold text-green-600">Connection Successful!</h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Stripe has successfully authorized your account.
                </p>
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
                    disabled={isSending}
                    className="w-full rounded-md bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSending ? 'Sending Alert...' : '📩 Send Me a Test Revenue Alert'}
                </button>
                {alertStatus !== 'idle' && (
                    <p className={`mt-3 text-sm ${alertStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {alertMessage}
                    </p>
                )}
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
