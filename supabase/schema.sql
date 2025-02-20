-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing types if they exist
DROP TYPE IF EXISTS table_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS item_status CASCADE;

-- Create custom types for status fields
CREATE TYPE table_status AS ENUM ('available', 'occupied', 'closed');
CREATE TYPE order_status AS ENUM ('active', 'closed');
CREATE TYPE item_status AS ENUM ('pending', 'preparing', 'delivered');

-- Restaurants table
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) UNIQUE,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only see and modify their own restaurant
CREATE POLICY "Users can only access their own restaurant" ON restaurants
    FOR ALL USING (auth.uid() = user_id);

-- Menus table
CREATE TABLE menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their restaurant's menus" ON menus
    FOR ALL USING (EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = menus.restaurant_id
        AND restaurants.user_id = auth.uid()
    ));

-- Menu Groups table
CREATE TABLE menu_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID REFERENCES menus(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE menu_groups ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their restaurant's menu groups" ON menu_groups
    FOR ALL USING (EXISTS (
        SELECT 1 FROM menus
        JOIN restaurants ON restaurants.id = menus.restaurant_id
        WHERE menus.id = menu_groups.menu_id
        AND restaurants.user_id = auth.uid()
    ));

-- Menu Items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES menu_groups(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their restaurant's menu items" ON menu_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM menu_groups
        JOIN menus ON menus.id = menu_groups.menu_id
        JOIN restaurants ON restaurants.id = menus.restaurant_id
        WHERE menu_groups.id = menu_items.group_id
        AND restaurants.user_id = auth.uid()
    ));

-- Tables table
CREATE TABLE tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL,
    status table_status DEFAULT 'available' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their restaurant's tables" ON tables
    FOR ALL USING (EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = tables.restaurant_id
        AND restaurants.user_id = auth.uid()
    ));

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
    status order_status DEFAULT 'active' NOT NULL,
    total_amount DECIMAL(10,2) DEFAULT 0.00,
    observation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Update policy for orders to use restaurant_id directly
DROP POLICY IF EXISTS "Users can only access their restaurant's orders" ON orders;
CREATE POLICY "Users can only access their restaurant's orders" ON orders
    FOR ALL USING (EXISTS (
        SELECT 1 FROM restaurants
        WHERE restaurants.id = orders.restaurant_id
        AND restaurants.user_id = auth.uid()
    ));

-- Order Items table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    item_status item_status DEFAULT 'pending' NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policy
CREATE POLICY "Users can only access their restaurant's order items" ON order_items
    FOR ALL USING (EXISTS (
        SELECT 1 FROM orders
        JOIN tables ON tables.id = orders.table_id
        JOIN restaurants ON restaurants.id = tables.restaurant_id
        WHERE orders.id = order_items.order_id
        AND restaurants.user_id = auth.uid()
    ));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('America/Sao_Paulo'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables to update updated_at
CREATE TRIGGER update_restaurants_updated_at
    BEFORE UPDATE ON restaurants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menus_updated_at
    BEFORE UPDATE ON menus
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_groups_updated_at
    BEFORE UPDATE ON menu_groups
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_menu_items_updated_at
    BEFORE UPDATE ON menu_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tables_updated_at
    BEFORE UPDATE ON tables
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_items_updated_at
    BEFORE UPDATE ON order_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to get monthly revenue for a restaurant
CREATE OR REPLACE FUNCTION get_monthly_revenue(restaurant_id UUID, start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE (
    month DATE,
    total_revenue DECIMAL(10,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', TIMEZONE('America/Sao_Paulo', orders.created_at))::DATE as month,
        COALESCE(SUM(orders.total_amount), 0) as total_revenue
    FROM orders
    WHERE 
        orders.restaurant_id = get_monthly_revenue.restaurant_id
        AND orders.status = 'closed'
        AND orders.created_at BETWEEN start_date AND end_date
    GROUP BY DATE_TRUNC('month', TIMEZONE('America/Sao_Paulo', orders.created_at))
    ORDER BY month;
END;
$$ LANGUAGE plpgsql;

-- Function to get monthly order count for a restaurant
CREATE OR REPLACE FUNCTION get_monthly_orders(restaurant_id UUID, start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE (
    month DATE,
    order_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        DATE_TRUNC('month', TIMEZONE('America/Sao_Paulo', orders.created_at))::DATE as month,
        COUNT(*) as order_count
    FROM orders
    WHERE 
        orders.restaurant_id = get_monthly_orders.restaurant_id
        AND orders.status = 'closed'
        AND orders.created_at BETWEEN start_date AND end_date
    GROUP BY DATE_TRUNC('month', TIMEZONE('America/Sao_Paulo', orders.created_at))
    ORDER BY month;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS for the functions
GRANT EXECUTE ON FUNCTION get_monthly_revenue TO authenticated;
GRANT EXECUTE ON FUNCTION get_monthly_orders TO authenticated;
