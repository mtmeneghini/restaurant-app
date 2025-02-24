-- Create billing period type
CREATE TYPE billing_period AS ENUM ('monthly', 'semester', 'yearly');

-- Create table to store product prices
CREATE TABLE product_prices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id TEXT NOT NULL,
    stripe_price_id TEXT NOT NULL UNIQUE,
    billing_period billing_period NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'BRL',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('America/Sao_Paulo'::text, NOW()) NOT NULL
);

-- Add trigger for updated_at
CREATE TRIGGER update_product_prices_updated_at
    BEFORE UPDATE ON product_prices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Insert the Pro plan prices
INSERT INTO product_prices (
    product_id,
    stripe_price_id,
    billing_period,
    amount,
    currency
) VALUES 
    ('prod_Rp2zLXduAGNayh', 'price_1QvOtuH4SSeIoMySNboYIHEc', 'monthly', 49.00, 'BRL');
-- Add your semester and yearly price IDs here with the same format

-- Add billing_period to restaurants table
ALTER TABLE restaurants 
    ADD COLUMN billing_period billing_period; 