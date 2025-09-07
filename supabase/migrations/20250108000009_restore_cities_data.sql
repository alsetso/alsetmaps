-- Restore cities data including the new cities we added
-- This populates the cities table with Minnesota cities

INSERT INTO cities (name, state, latitude, longitude, population) VALUES
-- Major Twin Cities
('Minneapolis', 'MN', 44.9778, -93.2650, 429954),
('Saint Paul', 'MN', 44.9537, -93.0900, 311527),
('Rochester', 'MN', 44.0216, -92.4699, 121395),
('Duluth', 'MN', 46.7867, -92.1005, 86697),
('Bloomington', 'MN', 44.8408, -93.2983, 89987),
('Brooklyn Park', 'MN', 45.0941, -93.3563, 86078),
('Plymouth', 'MN', 45.0105, -93.4555, 81025),
('Saint Cloud', 'MN', 45.5579, -94.1632, 68031),
('Eagan', 'MN', 44.8041, -93.1669, 66803),
('Woodbury', 'MN', 44.9239, -92.9594, 75069),
('Maple Grove', 'MN', 45.0725, -93.4558, 70018),
('Eden Prairie', 'MN', 44.8547, -93.4707, 64098),
('Minnetonka', 'MN', 44.9133, -93.5033, 53735),
('Burnsville', 'MN', 44.7677, -93.2777, 64060),
('Lakeville', 'MN', 44.6497, -93.2428, 69490),
('Apple Valley', 'MN', 44.7319, -93.2178, 54984),
('Blaine', 'MN', 45.1608, -93.2349, 70186),
('Maplewood', 'MN', 44.9530, -92.9952, 40188),
('Richfield', 'MN', 44.8833, -93.2833, 36421),
('Roseville', 'MN', 45.0061, -93.1567, 36825),
('Cottage Grove', 'MN', 44.8278, -92.9439, 38082),
('Inver Grove Heights', 'MN', 44.8481, -93.0428, 35076),
('Brooklyn Center', 'MN', 45.0761, -93.3325, 33100),
('Savage', 'MN', 44.7792, -93.3369, 32065),
('Shoreview', 'MN', 45.0792, -93.1478, 26921),
('Oakdale', 'MN', 44.9631, -92.9647, 28003),
('Fridley', 'MN', 45.0861, -93.2633, 27568),
('Crystal', 'MN', 45.0328, -93.3600, 23000),
('New Brighton', 'MN', 45.0656, -93.2019, 22640),
('White Bear Lake', 'MN', 45.0847, -93.0097, 25540),
('Golden Valley', 'MN', 45.0097, -93.3492, 22395),
('Hopkins', 'MN', 44.9250, -93.4625, 19800),
('Columbia Heights', 'MN', 45.0408, -93.2569, 21000),
('Edina', 'MN', 44.8897, -93.3497, 53094),
('Mounds View', 'MN', 45.1047, -93.2086, 13000),
('New Hope', 'MN', 45.0381, -93.3869, 21000),
('Robbinsdale', 'MN', 45.0322, -93.3383, 14000),
('Saint Louis Park', 'MN', 44.9489, -93.3481, 50000),
('South Saint Paul', 'MN', 44.8919, -93.0347, 20000),
('West Saint Paul', 'MN', 44.9169, -93.1019, 20000),

-- North Metro Cities (newly added)
('Monticello', 'MN', 45.3055, -93.7941, 13700),
('Elk River', 'MN', 45.3175, -93.5811, 25000),
('Ramsey', 'MN', 45.2611, -93.4497, 28000),
('St. Michael', 'MN', 45.2091, -93.6644, 18000),
('Buffalo', 'MN', 45.1719, -93.8744, 16000),
('Rockford', 'MN', 45.0883, -93.7344, 4000),
('Coon Rapids', 'MN', 45.1731, -93.3044, 63000),
('Andover', 'MN', 45.2333, -93.3167, 32000),

-- West Metro Cities (newly added)
('Mound', 'MN', 44.9366, -93.6661, 9000),
('Waconia', 'MN', 44.8508, -93.7869, 12000),
('Chanhassen', 'MN', 44.8619, -93.5324, 25000),
('Shakopee', 'MN', 44.7983, -93.5269, 43000),
('Belle Plaine', 'MN', 44.6222, -93.7672, 7000)

ON CONFLICT (name) DO NOTHING;
