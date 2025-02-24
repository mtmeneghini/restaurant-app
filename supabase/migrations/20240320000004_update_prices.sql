-- First, remove any existing prices
DELETE FROM product_prices WHERE product_id = 'prod_Rp2zLXduAGNayh';

-- Insert all price options
INSERT INTO product_prices (
    product_id,
    stripe_price_id,
    billing_period,
    amount,
    currency
) VALUES 
    ('prod_Rp2zLXduAGNayh', 'price_1QvOtuH4SSeIoMySNboYIHEc', 'monthly', 89.00, 'BRL'),
    ('prod_Rp2zLXduAGNayh', 'price_1QvOtuH4SSeIoMyS7EsPZNeD', 'semester', 474.00, 'BRL'),
    ('prod_Rp2zLXduAGNayh', 'price_1QvOtuH4SSeIoMySGvhJPsdi', 'yearly', 828.00, 'BRL'); 