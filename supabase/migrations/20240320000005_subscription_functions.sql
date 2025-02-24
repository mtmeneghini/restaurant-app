-- Function to cancel a subscription
CREATE OR REPLACE FUNCTION cancel_subscription(p_subscription_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Cancel the subscription at period end
    UPDATE stripe.subscriptions
    SET cancel_at_period_end = true
    WHERE id = p_subscription_id;
END;
$$;

-- Function to reactivate a canceled subscription
CREATE OR REPLACE FUNCTION reactivate_subscription(p_subscription_id TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Remove the cancellation
    UPDATE stripe.subscriptions
    SET cancel_at_period_end = false
    WHERE id = p_subscription_id;
END;
$$;

-- Function to get detailed subscription status
CREATE OR REPLACE FUNCTION get_subscription_details(p_user_id UUID)
RETURNS TABLE (
    tier TEXT,
    status TEXT,
    current_period_end TIMESTAMP,
    cancel_at_period_end BOOLEAN,
    billing_period billing_period
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        r.subscription_tier,
        COALESCE(s.attrs->>'status', 'inactive'),
        (s.attrs->>'current_period_end')::TIMESTAMP,
        (s.attrs->>'cancel_at_period_end')::BOOLEAN,
        r.billing_period
    FROM restaurants r
    LEFT JOIN stripe.subscriptions s ON s.id = r.stripe_subscription_id
    WHERE r.user_id = p_user_id;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION cancel_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION reactivate_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION get_subscription_details TO authenticated; 