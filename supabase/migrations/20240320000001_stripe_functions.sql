-- Function to create or get a Stripe customer
create or replace function create_stripe_customer(
  p_user_id uuid,
  p_email text,
  p_restaurant_name text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stripe_customer_id text;
  v_restaurant_id uuid;
begin
  -- Check if restaurant already has a Stripe customer ID
  select id, stripe_customer_id 
  into v_restaurant_id, v_stripe_customer_id
  from restaurants 
  where user_id = p_user_id;

  if v_stripe_customer_id is not null then
    return v_stripe_customer_id;
  end if;

  -- Create new Stripe customer
  insert into stripe.customers (email, name, description)
  values (
    p_email,
    p_restaurant_name,
    format('Restaurant: %s', p_restaurant_name)
  )
  returning id into v_stripe_customer_id;

  -- Update restaurant with Stripe customer ID
  update restaurants
  set stripe_customer_id = v_stripe_customer_id
  where id = v_restaurant_id;

  return v_stripe_customer_id;
end;
$$;

-- Function to create a subscription
create or replace function create_subscription(
  p_user_id uuid,
  p_price_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stripe_customer_id text;
  v_subscription_id text;
  v_restaurant_id uuid;
begin
  -- Get restaurant and customer info
  select id, stripe_customer_id
  into v_restaurant_id, v_stripe_customer_id
  from restaurants
  where user_id = p_user_id;

  if v_stripe_customer_id is null then
    raise exception 'No Stripe customer found for this user';
  end if;

  -- Create subscription
  insert into stripe.subscriptions (customer, items)
  values (
    v_stripe_customer_id,
    jsonb_build_array(
      jsonb_build_object(
        'price', p_price_id
      )
    )
  )
  returning id into v_subscription_id;

  -- Update restaurant subscription info
  update restaurants
  set 
    stripe_subscription_id = v_subscription_id,
    subscription_tier = 'pro'
  where id = v_restaurant_id;

  -- Return subscription details
  return (
    select attrs 
    from stripe.subscriptions 
    where id = v_subscription_id
  );
end;
$$;

-- Function to check subscription status
create or replace function check_subscription_status(p_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subscription_id text;
  v_subscription_status jsonb;
begin
  -- Get subscription ID
  select stripe_subscription_id
  into v_subscription_id
  from restaurants
  where user_id = p_user_id;

  if v_subscription_id is null then
    return jsonb_build_object(
      'status', 'none',
      'tier', 'free'
    );
  end if;

  -- Get subscription details from Stripe
  select attrs
  into v_subscription_status
  from stripe.subscriptions
  where id = v_subscription_id;

  return v_subscription_status;
end;
$$;

-- Grant execute permissions to authenticated users
grant execute on function create_stripe_customer to authenticated;
grant execute on function create_subscription to authenticated;
grant execute on function check_subscription_status to authenticated; 