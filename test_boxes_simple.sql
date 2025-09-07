-- TEMPORARILY DISABLE RLS TO TEST
ALTER TABLE public.boxes DISABLE ROW LEVEL SECURITY;

-- Check if there are any boxes
SELECT * FROM public.boxes;

-- Check if there are any users
SELECT * FROM public.users;

-- Check the relationship
SELECT 
  b.*,
  u.supabase_id,
  u.email
FROM public.boxes b
LEFT JOIN public.users u ON b.user_id = u.id;

