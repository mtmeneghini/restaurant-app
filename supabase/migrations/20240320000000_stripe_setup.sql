-- Enable the wrappers extension
create extension if not exists wrappers with schema extensions;

-- Enable the Stripe wrapper
create foreign data wrapper stripe_wrapper
  handler stripe_fdw_handler
  validator stripe_fdw_validator;

-- Create a schema for Stripe-related tables and functions
create schema if not exists stripe;

-- Create a server for Stripe connection
-- Note: Replace <your_key_name> with your actual key name after storing it in vault
create server stripe_server
  foreign data wrapper stripe_wrapper
  options (
    api_key_name 'Stripe',
    api_url 'https://api.stripe.com/v1/'
  );

-- Create foreign tables for Stripe data
create foreign table stripe.customers (
  id text,
  email text,
  name text,
  description text,
  created timestamp,
  attrs jsonb
)
  server stripe_server
  options (
    object 'customers'
  );

create foreign table stripe.prices (
  id text,
  active bool,
  currency text,
  product text,
  unit_amount bigint,
  type text,
  created timestamp,
  attrs jsonb
)
  server stripe_server
  options (
    object 'prices'
  );

create foreign table stripe.subscriptions (
  id text,
  customer text,
  currency text,
  current_period_start timestamp,
  current_period_end timestamp,
  attrs jsonb
)
  server stripe_server
  options (
    object 'subscriptions',
    rowid_column 'id'
  );

-- Add subscription_tier to restaurants table
alter table restaurants 
add column subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'custom')),
add column stripe_customer_id text,
add column stripe_subscription_id text; 