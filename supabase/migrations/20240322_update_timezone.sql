-- Set the database timezone to America/Sao_Paulo
ALTER DATABASE postgres SET timezone TO 'America/Sao_Paulo';

-- Update existing timestamps to America/Sao_Paulo timezone
UPDATE restaurants 
SET 
    created_at = TIMEZONE('America/Sao_Paulo', created_at AT TIME ZONE 'UTC'),
    updated_at = TIMEZONE('America/Sao_Paulo', updated_at AT TIME ZONE 'UTC');

UPDATE menus 
SET 
    created_at = TIMEZONE('America/Sao_Paulo', created_at AT TIME ZONE 'UTC'),
    updated_at = TIMEZONE('America/Sao_Paulo', updated_at AT TIME ZONE 'UTC');

UPDATE menu_groups 
SET 
    created_at = TIMEZONE('America/Sao_Paulo', created_at AT TIME ZONE 'UTC'),
    updated_at = TIMEZONE('America/Sao_Paulo', updated_at AT TIME ZONE 'UTC');

UPDATE menu_items 
SET 
    created_at = TIMEZONE('America/Sao_Paulo', created_at AT TIME ZONE 'UTC'),
    updated_at = TIMEZONE('America/Sao_Paulo', updated_at AT TIME ZONE 'UTC');

UPDATE tables 
SET 
    created_at = TIMEZONE('America/Sao_Paulo', created_at AT TIME ZONE 'UTC'),
    updated_at = TIMEZONE('America/Sao_Paulo', updated_at AT TIME ZONE 'UTC');

UPDATE orders 
SET 
    created_at = TIMEZONE('America/Sao_Paulo', created_at AT TIME ZONE 'UTC'),
    updated_at = TIMEZONE('America/Sao_Paulo', updated_at AT TIME ZONE 'UTC');

UPDATE order_items 
SET 
    created_at = TIMEZONE('America/Sao_Paulo', created_at AT TIME ZONE 'UTC'),
    updated_at = TIMEZONE('America/Sao_Paulo', updated_at AT TIME ZONE 'UTC');

-- Drop existing functions first
DROP FUNCTION IF EXISTS get_monthly_revenue(UUID, TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS get_monthly_revenue(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);
DROP FUNCTION IF EXISTS get_monthly_orders(UUID, TIMESTAMP, TIMESTAMP);
DROP FUNCTION IF EXISTS get_monthly_orders(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE);

-- Update the analytics functions to handle timezones consistently
CREATE OR REPLACE FUNCTION get_monthly_revenue(restaurant_id UUID, start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    month DATE,
    total_revenue DECIMAL(10,2)
) AS $$
BEGIN
    -- Convert input dates to America/Sao_Paulo timezone
    start_date := start_date AT TIME ZONE 'America/Sao_Paulo';
    end_date := end_date AT TIME ZONE 'America/Sao_Paulo';
    
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', orders.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE as month,
        COALESCE(SUM(orders.total_amount), 0) as total_revenue
    FROM orders
    WHERE 
        orders.restaurant_id = get_monthly_revenue.restaurant_id
        AND orders.status = 'closed'
        AND orders.created_at BETWEEN start_date AND end_date
    GROUP BY DATE_TRUNC('month', orders.created_at AT TIME ZONE 'America/Sao_Paulo')
    ORDER BY month;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_monthly_orders(restaurant_id UUID, start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (
    month DATE,
    order_count BIGINT
) AS $$
BEGIN
    -- Convert input dates to America/Sao_Paulo timezone
    start_date := start_date AT TIME ZONE 'America/Sao_Paulo';
    end_date := end_date AT TIME ZONE 'America/Sao_Paulo';
    
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', orders.created_at AT TIME ZONE 'America/Sao_Paulo')::DATE as month,
        COUNT(*) as order_count
    FROM orders
    WHERE 
        orders.restaurant_id = get_monthly_orders.restaurant_id
        AND orders.status = 'closed'
        AND orders.created_at BETWEEN start_date AND end_date
    GROUP BY DATE_TRUNC('month', orders.created_at AT TIME ZONE 'America/Sao_Paulo')
    ORDER BY month;
END;
$$ LANGUAGE plpgsql;

-- Set the session timezone for any remaining operations
SET timezone TO 'America/Sao_Paulo'; 