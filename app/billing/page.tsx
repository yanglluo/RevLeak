import Link from "next/link";
import { PricingSection } from "@/components/PricingSection";

export default function BillingPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <Link href="/" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 transition-colors">
                        ← Back to Home
                    </Link>
                </div>

                <div className="max-w-3xl mx-auto text-center mb-12">
                    <h1 className="text-3xl font-bold mb-4">Enable Ongoing Monitoring</h1>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                        <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                            Billing and subscriptions are being rolled out. Early users can reply to the onboarding email to enable monitoring.
                        </p>
                    </div>
                </div>

                <PricingSection />
            </div>
        </main>
    );
}
