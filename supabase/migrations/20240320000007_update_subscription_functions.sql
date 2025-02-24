-- Update create_subscription function to handle trials
CREATE OR REPLACE FUNCTION create_subscription(
    p_user_id uuid,
    p_price_id text,
    p_billing_period billing_period,
    p_trial_days integer DEFAULT NULL
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
    v_trial_end timestamp;
BEGIN
    -- Get restaurant and customer info
    SELECT id, stripe_customer_id
    INTO v_restaurant_id, v_stripe_customer_id
    FROM restaurants
    WHERE user_id = p_user_id;

    IF v_stripe_customer_id IS NULL THEN
        RAISE EXCEPTION 'No Stripe customer found for this user';
    END IF;

    -- Calculate trial end date if trial days provided
    IF p_trial_days IS NOT NULL THEN
        v_trial_end := TIMEZONE('America/Sao_Paulo'::text, NOW() + (p_trial_days || ' days')::interval);
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

    -- Create subscription with trial if applicable
    INSERT INTO stripe.subscriptions (
        customer,
        items,
        trial_end,
        trial_settings
    )
    VALUES (
        v_stripe_customer_id,
        jsonb_build_array(
            jsonb_build_object(
                'price', p_price_id
            )
        ),
        CASE 
            WHEN v_trial_end IS NOT NULL THEN extract(epoch from v_trial_end)::bigint
            ELSE NULL
        END,
        CASE 
            WHEN v_trial_end IS NOT NULL THEN jsonb_build_object(
                'end_behavior', jsonb_build_object(
                    'missing_payment_method', 'cancel'
                )
            )
            ELSE NULL
        END
    )
    RETURNING id INTO v_subscription_id;

    -- Update restaurant subscription info
    UPDATE restaurants
    SET 
        stripe_subscription_id = v_subscription_id,
        subscription_tier = 'pro',
        billing_period = p_billing_period,
        is_trial = (v_trial_end IS NOT NULL),
        trial_end = v_trial_end
    WHERE id = v_restaurant_id;

    -- Return subscription details
    RETURN (
        SELECT attrs 
        FROM stripe.subscriptions 
        WHERE id = v_subscription_id
    );
END;
$$;

-- Function to check if a user is eligible for trial
CREATE OR REPLACE FUNCTION check_trial_eligibility(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_has_previous_trial boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM restaurants
        WHERE user_id = p_user_id
        AND (
            is_trial = true
            OR trial_end IS NOT NULL
            OR subscription_tier = 'pro'
        )
    ) INTO v_has_previous_trial;

    RETURN NOT v_has_previous_trial;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION check_trial_eligibility TO authenticated; 