import { supabase } from '@/lib/supabase';

interface UserData {
    stripeAccountId: string;
    email: string;
    createdAt?: string;
}

export async function saveUser(stripeAccountId: string, email: string) {
    // Upsert user by stripe_account_id
    const { error } = await supabase
        .from('users')
        .upsert(
            {
                stripe_account_id: stripeAccountId,
                email: email,
                updated_at: new Date().toISOString(),
            },
            { onConflict: 'stripe_account_id' }
        );

    if (error) {
        console.error('Supabase saveUser error:', error);
        throw new Error('Failed to save user');
    }
}

export async function getUser(stripeAccountId: string): Promise<UserData | null> {
    const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('stripe_account_id', stripeAccountId)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        console.error('Supabase getUser error:', error);
        return null; // Fail safe
    }

    return {
        stripeAccountId: data.stripe_account_id,
        email: data.email,
        createdAt: data.created_at,
    };
}
