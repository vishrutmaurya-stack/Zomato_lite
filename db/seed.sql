-- Seed data for Zomato Lite.
-- Guarded so that re-running this file never creates duplicates.

INSERT INTO restaurants (id, name, cuisine, area)
SELECT 1, 'Ludhiana Burrito', 'Indian', 'Sector 32'
WHERE NOT EXISTS (SELECT 1 FROM restaurants WHERE id = 1);

INSERT INTO reviews (restaurant_id, rating, comment, created_at)
SELECT restaurant_id, rating, comment, created_at
FROM (VALUES
  (1, 5, 'Paneer burrito is unreal', NOW() - INTERVAL '8 days'),
  (1, 4, 'Good, but slow service',   NOW() - INTERVAL '6 days'),
  (1, 4, 'Solid. Would repeat.',     NOW() - INTERVAL '2 days')
) AS seed(restaurant_id, rating, comment, created_at)
WHERE NOT EXISTS (SELECT 1 FROM reviews WHERE restaurant_id = 1);
