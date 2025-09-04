-- Complete migration to drop auth-related functions and triggers
-- Run this in your Supabase SQL editor

BEGIN;

-- Drop the trigger first (must be done before the function)
DROP TRIGGER IF EXISTS on_auth_user_email_confirmation ON auth.users;

-- Drop the trigger function
DROP FUNCTION IF EXISTS public.handle_email_confirmation() CASCADE;

-- Drop the auth user created function
DROP FUNCTION IF EXISTS public.handle_auth_user_created() CASCADE;

-- Alternative: If the functions are in a different schema, try these:
-- DROP FUNCTION IF EXISTS auth.handle_email_confirmation() CASCADE;
-- DROP FUNCTION IF EXISTS auth.handle_auth_user_created() CASCADE;

-- Verify the drops were successful
DO $$
DECLARE
    func_count INTEGER;
    trigger_count INTEGER;
BEGIN
    -- Check if functions still exist
    SELECT COUNT(*) INTO func_count 
    FROM pg_proc p 
    JOIN pg_namespace n ON p.pronamespace = n.oid 
    WHERE n.nspname = 'public' 
    AND (p.proname = 'handle_email_confirmation' OR p.proname = 'handle_auth_user_created');
    
    -- Check if trigger still exists
    SELECT COUNT(*) INTO trigger_count 
    FROM pg_trigger t 
    JOIN pg_class c ON t.tgrelid = c.oid 
    JOIN pg_namespace n ON c.relnamespace = n.oid 
    WHERE n.nspname = 'auth' 
    AND c.relname = 'users' 
    AND t.tgname = 'on_auth_user_email_confirmation';
    
    IF func_count = 0 AND trigger_count = 0 THEN
        RAISE NOTICE 'All functions and triggers dropped successfully';
    ELSE
        RAISE NOTICE 'Some items may still exist. Function count: %, Trigger count: %', func_count, trigger_count;
    END IF;
END $$;

COMMIT;

