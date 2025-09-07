-- Grant SELECT permission on public.users to authenticated role
GRANT SELECT ON public.users TO authenticated;
GRANT SELECT ON public.users TO anon;

-- Verify the permission
SELECT 
    schemaname, 
    tablename, 
    privilege_type, 
    grantee 
FROM information_schema.table_privileges 
WHERE tablename = 'users' 
AND schemaname = 'public';

