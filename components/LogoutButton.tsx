'use client'

import { useRouter } from 'next/navigation'
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { createClientComponentClient } from '@supabase/ssr'
import { typography } from '../styles/design-system'

interface LogoutButtonProps {
  isExpanded: boolean
}

export default function LogoutButton({ isExpanded }: LogoutButtonProps) {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
        !isExpanded && 'justify-center px-2'
      } text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full`}
      style={{ fontSize: typography.fontSize.sm }}
    >
      <ArrowRightOnRectangleIcon className="h-5 w-5 flex-shrink-0" />
      {isExpanded && <span>Sair</span>}
    </button>
  )
} 