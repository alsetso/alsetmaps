-- Initial schema for users and boxes tables
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS "public"."users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text",
    "email" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "supabase_id" "uuid"
);

-- Create boxes table
CREATE TABLE IF NOT EXISTS "public"."boxes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "description" "text",
    "price" numeric(12,2),
    "state" "text",
    "city" "text",
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "text" DEFAULT 'active' NOT NULL
);

-- Add constraints
ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_pkey" PRIMARY KEY ("id");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_email_unique" UNIQUE ("email");

ALTER TABLE ONLY "public"."users"
    ADD CONSTRAINT "users_supabase_id_key" UNIQUE ("supabase_id");

ALTER TABLE ONLY "public"."boxes"
    ADD CONSTRAINT "boxes_pkey" PRIMARY KEY ("id");

-- Add foreign key
ALTER TABLE ONLY "public"."boxes"
    ADD CONSTRAINT "boxes_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id");

-- Enable RLS
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."boxes" ENABLE ROW LEVEL SECURITY;

-- Create policies for boxes
CREATE POLICY "Users can view their own boxes" ON "public"."boxes"
    FOR SELECT USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = "auth"."uid"()))));

CREATE POLICY "Enable users to insert their own boxes" ON "public"."boxes"
    FOR INSERT TO "authenticated" WITH CHECK (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = ( SELECT "auth"."uid"() AS "uid")))));

CREATE POLICY "Enable users to update their own boxes" ON "public"."boxes"
    FOR UPDATE TO "authenticated" USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = ( SELECT "auth"."uid"() AS "uid"))))) WITH CHECK (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = ( SELECT "auth"."uid"() AS "uid")))));

CREATE POLICY "Enable users to delete their own boxes" ON "public"."boxes"
    FOR DELETE TO "authenticated" USING (("user_id" IN ( SELECT "users"."id"
   FROM "public"."users"
  WHERE ("users"."supabase_id" = ( SELECT "auth"."uid"() AS "uid")))));

-- Grant permissions
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."boxes" TO "authenticated";
GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE "public"."boxes" TO "anon";
GRANT INSERT,UPDATE ON TABLE "public"."users" TO "authenticated";
GRANT INSERT,UPDATE ON TABLE "public"."users" TO "anon";

