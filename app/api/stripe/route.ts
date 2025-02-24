import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

type BillingPeriod = 'monthly' | 'semester' | 'yearly'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the request body
    const { action, priceId, billingPeriod } = await request.json()

    console.log('Stripe API request:', { action, priceId, billingPeriod })

    // Get the current session for all actions except get_prices
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    if (sessionError) {
      console.error('Session error:', sessionError)
      return NextResponse.json(
        { error: `Authentication error: ${sessionError.message}` },
        { status: 401 }
      )
    }
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    if (action === 'get_prices') {
      console.log('Fetching prices for product')
      const { data, error } = await supabase
        .rpc('get_product_prices', {
          p_product_id: 'prod_Rp2zLXduAGNayh'
        })

      console.log('Price fetch result:', { data, error })

      if (error) {
        console.error('Error fetching prices:', error)
        return NextResponse.json(
          { error: `Failed to fetch prices: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json(data || [])
    }

    if (action === 'cancel_subscription') {
      // Get the restaurant's subscription ID
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('stripe_subscription_id')
        .eq('user_id', session.user.id)
        .single()

      if (restaurantError) {
        console.error('Error fetching restaurant:', restaurantError)
        return NextResponse.json(
          { error: `Failed to fetch restaurant: ${restaurantError.message}` },
          { status: 500 }
        )
      }

      if (!restaurant?.stripe_subscription_id) {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 400 }
        )
      }

      // Cancel the subscription at period end
      const { error } = await supabase
        .rpc('cancel_subscription', {
          p_subscription_id: restaurant.stripe_subscription_id
        })

      if (error) {
        console.error('Error canceling subscription:', error)
        return NextResponse.json(
          { error: `Failed to cancel subscription: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'create_customer') {
      if (!session.user.email) {
        return NextResponse.json(
          { error: 'User email is required' },
          { status: 400 }
        )
      }

      // Get restaurant info
      const { data: restaurant, error: restaurantError } = await supabase
        .from('restaurants')
        .select('name')
        .eq('user_id', session.user.id)
        .single()
      
      if (restaurantError) {
        console.error('Restaurant fetch error:', restaurantError)
        return NextResponse.json(
          { error: `Failed to fetch restaurant: ${restaurantError.message}` },
          { status: 500 }
        )
      }

      // Create Stripe customer
      const { data, error } = await supabase
        .rpc('create_stripe_customer', {
          p_user_id: session.user.id,
          p_email: session.user.email,
          p_restaurant_name: restaurant.name
        })

      if (error) {
        console.error('Customer creation error:', error)
        return NextResponse.json(
          { error: `Failed to create customer: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json({ customerId: data })
    }

    if (action === 'create_subscription') {
      if (!priceId || !billingPeriod) {
        return NextResponse.json(
          { error: 'Price ID and billing period are required' },
          { status: 400 }
        )
      }

      // Create subscription
      const { data, error } = await supabase
        .rpc('create_subscription', {
          p_user_id: session.user.id,
          p_price_id: priceId,
          p_billing_period: billingPeriod as BillingPeriod
        })

      if (error) {
        console.error('Subscription creation error:', error)
        return NextResponse.json(
          { error: `Failed to create subscription: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json(data)
    }

    if (action === 'check_subscription') {
      // Check subscription status
      const { data, error } = await supabase
        .rpc('check_subscription_status', {
          p_user_id: session.user.id
        })

      if (error) {
        console.error('Subscription status check error:', error)
        return NextResponse.json(
          { error: `Failed to check subscription: ${error.message}` },
          { status: 500 }
        )
      }

      return NextResponse.json(data)
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Stripe API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
} 