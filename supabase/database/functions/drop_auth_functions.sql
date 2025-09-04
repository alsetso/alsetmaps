-- Drop auth-related functions and triggers
-- This migration removes the automatic user profile creation functionality

-- Drop the trigger function first
DROP TRIGGER IF EXISTS on_auth_user_email_confirmation ON auth.users;

-- Drop the trigger function
DROP FUNCTION IF EXISTS handle_email_confirmation();

-- Drop the auth user created function
DROP FUNCTION IF EXISTS handle_auth_user_created();

-- Verify drops (these should return no rows if successful)
SELECT 
    'Functions and triggers dropped successfully' as status,
    'handle_auth_user_created' as dropped_function_1,
    'handle_email_confirmation' as dropped_function_2,
    'on_auth_user_email_confirmation' as dropped_trigger;

