import Link from "next/link";

export default function ConnectPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background text-foreground">
            <div className="max-w-md w-full text-center space-y-8">
                <h1 className="text-3xl font-bold tracking-tight">
                    Stripe connection coming next
                </h1>

                <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                    <button
                        disabled
                        className="w-full rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Connect Stripe
                    </button>
                    <p className="mt-4 text-sm text-gray-500">
                        We are currently adding the final touches to our secure integration.
                    </p>
                </div>

                <Link
                    href="/"
                    className="inline-block text-sm text-gray-600 dark:text-gray-400 hover:underline"
                >
                    ← Back to Home
                </Link>
            </div>
        </main>
    );
}
