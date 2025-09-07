-- Fix: Grant SELECT permission on users table
-- This was missing from the initial schema
GRANT SELECT ON TABLE "public"."users" TO "authenticated";
GRANT SELECT ON TABLE "public"."users" TO "anon";

