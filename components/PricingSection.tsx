import Link from 'next/link';
import { PRICING_PLANS } from '@/lib/pricing';

export function PricingSection() {
    return (
        <section className="py-20 bg-gray-50 dark:bg-zinc-900/30">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold tracking-tight mb-4">Pricing</h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400">
                        See where money is leaking for free. Pay only to keep monitoring it.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {PRICING_PLANS.map((plan) => (
                        <div
                            key={plan.name}
                            className={`relative p-8 rounded-2xl border ${plan.recommended
                                    ? 'border-indigo-600 dark:border-indigo-500 bg-white dark:bg-zinc-900 shadow-xl scale-105 z-10'
                                    : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-900 shadow-sm'
                                } flex flex-col`}
                        >
                            {plan.recommended && (
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                                    Recommended
                                </div>
                            )}
                            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                            <div className="text-3xl font-bold mb-6">{plan.price}</div>
                            <ul className="mb-8 space-y-3 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start text-sm text-gray-600 dark:text-gray-300">
                                        <svg className="w-5 h-5 text-green-500 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                href="/billing"
                                className={`block text-center py-2.5 px-4 rounded-lg font-semibold transition-colors ${plan.recommended
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-500'
                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                Enable Monitoring
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
