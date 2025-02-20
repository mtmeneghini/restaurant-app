-- Drop the existing type (if it exists)
DROP TYPE IF EXISTS item_status CASCADE;

-- Create the type with all status options
CREATE TYPE item_status AS ENUM ('pending', 'preparing', 'ready', 'delivered');

-- Add the column back to order_items table
ALTER TABLE order_items
    ADD COLUMN item_status item_status DEFAULT 'pending' NOT NULL; 