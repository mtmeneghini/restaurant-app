import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { Stripe } from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
})

const webhookSecret = 'whsec_mAxQOup9uns1ixydbXgOx95ZzxXSOmoa'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'No signature provided' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = createRouteHandlerClient({ cookies })
    console.log('Received Stripe webhook:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const isTrialSubscription = subscription.trial_end !== null
        
        // Update restaurant subscription status
        const { error } = await supabase
          .from('restaurants')
          .update({
            subscription_tier: 'pro',
            stripe_subscription_id: subscription.id,
            is_trial: isTrialSubscription,
            trial_end: isTrialSubscription ? new Date(subscription.trial_end! * 1000).toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('Error updating subscription status:', error)
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update restaurant subscription status
        const { error } = await supabase
          .from('restaurants')
          .update({
            subscription_tier: 'free',
            stripe_subscription_id: null,
            is_trial: false,
            trial_end: null,
            updated_at: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer)

        if (error) {
          console.error('Error updating subscription status:', error)
          return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        // TODO: Implement notification system for failed payments
        console.log('Payment failed for invoice:', invoice.id)
        break
      }

      case 'customer.subscription.trial_will_end': {
        const subscription = event.data.object as Stripe.Subscription
        // TODO: Implement notification system for trial ending
        console.log('Trial ending for subscription:', subscription.id)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
} 