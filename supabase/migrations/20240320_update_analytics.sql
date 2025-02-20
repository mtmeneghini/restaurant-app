-- Update order items policy to use restaurant_id from orders directly
DROP POLICY IF EXISTS "Users can only access their restaurant's order items" ON order_items;
CREATE POLICY "Users can only access their restaurant's order items" ON order_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM orders
        JOIN restaurants ON restaurants.id = orders.restaurant_id
        WHERE orders.id = order_items.order_id
        AND restaurants.user_id = auth.uid()
    ));

-- Update analytics functions
CREATE OR REPLACE FUNCTION get_monthly_revenue(restaurant_id UUID, start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE (
    month DATE,
    total_revenue DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', orders.created_at)::DATE as month,
        COALESCE(SUM(orders.total_amount), 0) as total_revenue
    FROM orders
    WHERE 
        orders.restaurant_id = get_monthly_revenue.restaurant_id
        AND orders.status = 'closed'
        AND orders.created_at BETWEEN start_date AND end_date
    GROUP BY DATE_TRUNC('month', orders.created_at)
    ORDER BY month;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_monthly_orders(restaurant_id UUID, start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE (
    month DATE,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', orders.created_at)::DATE as month,
        COUNT(*) as order_count
    FROM orders
    WHERE 
        orders.restaurant_id = get_monthly_orders.restaurant_id
        AND orders.status = 'closed'
        AND orders.created_at BETWEEN start_date AND end_date
    GROUP BY DATE_TRUNC('month', orders.created_at)
    ORDER BY month;
END;
$$ LANGUAGE plpgsql;

-- Re-grant permissions
GRANT EXECUTE ON FUNCTION get_monthly_revenue TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_orders TO authenticated; 