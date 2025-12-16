'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState } from 'react';

function CallbackContent() {
    const searchParams = useSearchParams();
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    const [isSending, setIsSending] = useState(false);
    const [alertStatus, setAlertStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [alertMessage, setAlertMessage] = useState('');

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

    return (
        <div className="text-center space-y-6">
            <h1 className="text-2xl font-bold text-green-600">Connection Successful!</h1>
            <p className="text-gray-600 dark:text-gray-400">
                Stripe has successfully authorized your account.
            </p>

            <div className="text-left bg-gray-100 dark:bg-gray-900 rounded-lg p-4 w-full overflow-hidden">
                <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Authorization Code</p>
                <code className="block text-sm font-mono break-all text-indigo-600 dark:text-indigo-400 bg-white dark:bg-black p-3 rounded border border-gray-200 dark:border-gray-800">
                    {code}
                </code>
            </div>

            <div className="pt-2 pb-2">
                <button
                    onClick={handleSendAlert}
                    disabled={isSending}
                    className="w-full rounded-md bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-white px-4 py-3 text-sm font-semibold shadow-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    {isSending ? 'Sending Alert...' : 'Send Me a Test Revenue Alert'}
                </button>
                {alertStatus !== 'idle' && (
                    <p className={`mt-3 text-sm ${alertStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                        {alertMessage}
                    </p>
                )}
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                <Link href="/" className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-500 transition-colors">
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
