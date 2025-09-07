-- Restore the count functions for boxes and listings
-- These functions are used by the API endpoints to count active records by city

-- Create boxes count function
CREATE OR REPLACE FUNCTION get_boxes_count_by_city()
RETURNS TABLE(city TEXT, count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        b.city,
        COUNT(b.id) AS count
    FROM
        public.boxes b
    WHERE
        b.status = 'active' AND b.city IS NOT NULL
    GROUP BY
        b.city
    ORDER BY
        count DESC;
END;
$$;

-- Create listings count function
CREATE OR REPLACE FUNCTION get_listings_count_by_city()
RETURNS TABLE(city TEXT, count BIGINT)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        l.city,
        COUNT(l.id) AS count
    FROM
        public.listings l
    WHERE
        l.status = 'new' AND l.city IS NOT NULL
    GROUP BY
        l.city
    ORDER BY
        count DESC;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_boxes_count_by_city() TO authenticated;
GRANT EXECUTE ON FUNCTION get_listings_count_by_city() TO authenticated;
