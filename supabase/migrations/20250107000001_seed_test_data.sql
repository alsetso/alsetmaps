-- Seed test data
INSERT INTO "public"."users" ("id", "name", "email", "created_at", "supabase_id") VALUES
('13bece3d-1021-48ff-887b-497064e0eeca', NULL, 'bremercole@gmail.com', '2025-09-06 23:45:13.36268+00', '668a12a7-fa4c-4f35-b351-ac2ca2f01f2e');

INSERT INTO "public"."boxes" ("id", "description", "price", "state", "city", "user_id", "created_at", "updated_at", "status") VALUES
('2d663b9c-fab6-458b-8285-28a272b5c833', 'test', 100000.00, 'MN', 'Minneapolis', '13bece3d-1021-48ff-887b-497064e0eeca', '2025-09-07 00:13:06.723759+00', '2025-09-07 00:13:06.723759+00', 'active');

