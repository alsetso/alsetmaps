-- Simple Accounts, Search, and Credit System

-- Accounts Table
CREATE TABLE public.accounts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id uuid NOT NULL,
    first_name text,
    last_name text,
    phone text,
    email text NOT NULL,
    stripe_customer_id text,
    role text DEFAULT 'buyer' CHECK (role IN ('seller', 'buyer', 'investor', 'wholesaler', 'realtor', 'lender')),
    created_at timestamp with time zone DEFAULT NOW()
);

-- Credits Table
CREATE TABLE public.credits (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    available_credits integer DEFAULT 10,
    created_at timestamp with time zone DEFAULT NOW()
);

-- Search History Table
CREATE TABLE public.search_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES public.accounts(id) ON DELETE SET NULL,
    search_address text NOT NULL,
    search_type text DEFAULT 'basic' CHECK (search_type IN ('basic', 'smart')),
    credits_used integer DEFAULT 1,
    created_at timestamp with time zone DEFAULT NOW()
);

-- Basic Indexes
CREATE INDEX idx_accounts_auth_user_id ON public.accounts(auth_user_id);
CREATE INDEX idx_accounts_email ON public.accounts(email);
CREATE INDEX idx_accounts_stripe_customer_id ON public.accounts(stripe_customer_id);
CREATE INDEX idx_credits_user_id ON public.credits(user_id);
CREATE INDEX idx_search_history_user_id ON public.search_history(user_id);

-- Enable RLS
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;

-- Simple RLS Policies
CREATE POLICY "Users can view own account" ON public.accounts FOR SELECT USING (auth.uid()::text = auth_user_id::text);
CREATE POLICY "Users can create own account" ON public.accounts FOR INSERT WITH CHECK (auth.uid()::text = auth_user_id::text);
CREATE POLICY "Users can update own account" ON public.accounts FOR UPDATE USING (auth.uid()::text = auth_user_id::text);

-- Credits table policies - simple and direct
CREATE POLICY "Users can view own credits" ON public.credits FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = credits.user_id 
        AND accounts.auth_user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert own credits" ON public.credits FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = credits.user_id 
        AND accounts.auth_user_id = auth.uid()
    )
);
CREATE POLICY "Users can update own credits" ON public.credits FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = credits.user_id 
        AND accounts.auth_user_id = auth.uid()
    )
);
CREATE POLICY "Users can delete own credits" ON public.credits FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = credits.user_id 
        AND accounts.auth_user_id = auth.uid()
    )
);

CREATE POLICY "Users can view own search history" ON public.search_history FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.accounts 
        WHERE accounts.id = search_history.user_id 
        AND accounts.auth_user_id::text = auth.uid()::text
    )
);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON public.accounts TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.credits TO authenticated;
GRANT SELECT, INSERT ON public.search_history TO authenticated;
