import type { CookieOptions as SupabaseCookieOptions } from '@supabase/ssr'
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'

export type CookieOptions = SupabaseCookieOptions & ResponseCookie 