import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: () => cookieStore }
    )
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get subscription details using the database function
    const { data, error } = await supabase
      .rpc('get_subscription_details', { p_user_id: user.id })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Subscription details error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    )
  }
} 