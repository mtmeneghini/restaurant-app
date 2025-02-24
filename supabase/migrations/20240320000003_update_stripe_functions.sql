-- Function to get available prices
CREATE OR REPLACE FUNCTION get_product_prices(p_product_id TEXT)
RETURNS TABLE (
    stripe_price_id TEXT,
    billing_period billing_period,
    amount DECIMAL(10,2),
    currency TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT 
        stripe_price_id,
        billing_period,
        amount,
        currency
    FROM product_prices
    WHERE product_id = p_product_id
    AND active = true
    ORDER BY 
        CASE billing_period
            WHEN 'monthly' THEN 1
            WHEN 'semester' THEN 2
            WHEN 'yearly' THEN 3
        END;
$$;

-- Update create_subscription function to include billing period
CREATE OR REPLACE FUNCTION create_subscription(
    p_user_id uuid,
    p_price_id text,
    p_billing_period billing_period
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_stripe_customer_id text;
    v_subscription_id text;
    v_restaurant_id uuid;
BEGIN
    -- Get restaurant and customer info
    SELECT id, stripe_customer_id
    INTO v_restaurant_id, v_stripe_customer_id
    FROM restaurants
    WHERE user_id = p_user_id;

    IF v_stripe_customer_id IS NULL THEN
        RAISE EXCEPTION 'No Stripe customer found for this user';
    END IF;

    -- Validate price exists for the given billing period
    IF NOT EXISTS (
        SELECT 1 FROM product_prices
        WHERE stripe_price_id = p_price_id
        AND billing_period = p_billing_period
        AND active = true
    ) THEN
        RAISE EXCEPTION 'Invalid price ID for the specified billing period';
    END IF;

    -- Create subscription
    INSERT INTO stripe.subscriptions (customer, items)
    VALUES (
        v_stripe_customer_id,
        jsonb_build_array(
            jsonb_build_object(
                'price', p_price_id
            )
        )
    )
    RETURNING id INTO v_subscription_id;

    -- Update restaurant subscription info
    UPDATE restaurants
    SET 
        stripe_subscription_id = v_subscription_id,
        subscription_tier = 'pro',
        billing_period = p_billing_period
    WHERE id = v_restaurant_id;

    -- Return subscription details
    RETURN (
        SELECT attrs 
        FROM stripe.subscriptions 
        WHERE id = v_subscription_id
    );
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_product_prices TO authenticated; 