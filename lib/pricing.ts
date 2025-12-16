export const PRICING_PLANS = [
    {
        id: 'starter',
        name: 'Starter',
        price: '$49/month',
        features: [
            'Weekly revenue monitoring',
            'Email alerts when Stripe fees or net revenue change',
            'Revenue snapshot & explanations',
        ],
        recommended: false,
    },
    {
        id: 'growth',
        name: 'Growth',
        price: '$99/month',
        features: [
            'Daily revenue monitoring',
            'More sensitive alerts for fee and FX spikes',
            'Clear explanations and suggested actions',
        ],
        recommended: true,
    },
    {
        id: 'pro',
        name: 'Pro',
        price: '$149/month',
        features: [
            'Advanced monitoring for global Stripe accounts',
            'Higher alert frequency',
            'Priority access to new leak detectors',
        ],
        recommended: false,
    },
];
