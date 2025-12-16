import Link from "next/link";

export default function MonitoringEnabledPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-green-600">
                    Monitoring Active
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300">
                    Thank you for enabling RevLeak monitoring. We are now watching your Stripe account for revenue leaks.
                </p>

                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-100 dark:border-gray-800 text-left">
                    <h3 className="text-sm font-semibold mb-3">What happens next:</h3>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start">
                            <span className="mr-2">⚡️</span>
                            <span>We check your revenue daily for hidden fees and FX spikes.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">📩</span>
                            <span>You&apos;ll get an alert only when something needs attention.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">🔒</span>
                            <span>RevLeak remains read-only and never modifies your data.</span>
                        </li>
                    </ul>
                </div>

                <div className="pt-8">
                    <Link
                        href="/"
                        className="text-indigo-600 hover:text-indigo-500 font-medium hover:underline"
                    >
                        Return to Dashboard
                    </Link>
                </div>
            </div>
        </main>
    );
}
