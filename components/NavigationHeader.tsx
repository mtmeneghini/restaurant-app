'use client'

import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { colors, typography } from '../styles/design-system'
import { HomeIcon, QueueListIcon, ShoppingBagIcon, ChartBarIcon, ChevronLeftIcon, ChevronRightIcon, FireIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface NavigationHeaderProps {
  selectionPath: string
}

export default function NavigationHeader({ selectionPath }: NavigationHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('sidebarExpanded')
      return stored === null ? true : stored === 'true'
    }
    return true
  })

  const toggleSidebar = () => {
    const newState = !isExpanded
    setIsExpanded(newState)
    localStorage.setItem('sidebarExpanded', String(newState))
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'sidebarExpanded',
      newValue: String(newState)
    }))
  }

  return (
    <div className={`fixed left-0 top-0 h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${isExpanded ? 'w-52' : 'w-14'}`}>
      {/* Logo/Brand Section */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <span className="text-xl font-bold" style={{ color: colors.brand.primary }}>
              Zarpar
            </span>
          ) : (
            <span className="text-lg font-bold" style={{ color: colors.brand.primary }}>
              Z
            </span>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        >
          {isExpanded ? (
            <ChevronLeftIcon className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRightIcon className="h-4 w-4 text-gray-500" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          <Link
            href="/profile"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              !isExpanded && 'justify-center px-2'
            } ${
              selectionPath === 'Profile' 
                ? `bg-gray-100 font-medium text-gray-900` 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            style={{ fontSize: typography.fontSize.sm }}
          >
            <HomeIcon className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span>Home</span>}
          </Link>
          <Link
            href="/menu-manager"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              !isExpanded && 'justify-center px-2'
            } ${
              selectionPath === 'Menu Manager'
                ? `bg-gray-100 font-medium text-gray-900`
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            style={{ fontSize: typography.fontSize.sm }}
          >
            <QueueListIcon className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span>Cardápio</span>}
          </Link>
          <Link
            href="/order-manager"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              !isExpanded && 'justify-center px-2'
            } ${
              selectionPath === 'Order Manager'
                ? `bg-gray-100 font-medium text-gray-900`
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            style={{ fontSize: typography.fontSize.sm }}
          >
            <ShoppingBagIcon className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span>Pedidos</span>}
          </Link>
          <Link
            href="/kitchen"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              !isExpanded && 'justify-center px-2'
            } ${
              selectionPath === 'Kitchen'
                ? `bg-gray-100 font-medium text-gray-900`
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            style={{ fontSize: typography.fontSize.sm }}
          >
            <FireIcon className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span>Cozinha</span>}
          </Link>
          <Link
            href="/insights"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              !isExpanded && 'justify-center px-2'
            } ${
              selectionPath === 'Insights'
                ? `bg-gray-100 font-medium text-gray-900`
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
            style={{ fontSize: typography.fontSize.sm }}
          >
            <ChartBarIcon className="h-5 w-5 flex-shrink-0" />
            {isExpanded && <span>Desempenho</span>}
          </Link>
          <div className="mt-auto pt-4 border-t">
            <Link
              href="/subscription"
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                !isExpanded && 'justify-center px-2'
              } ${
                selectionPath === 'Subscription'
                  ? `bg-gray-100 font-medium text-gray-900`
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              style={{ fontSize: typography.fontSize.sm }}
            >
              <CreditCardIcon className="h-5 w-5 flex-shrink-0" />
              {isExpanded && <span>Assinatura</span>}
            </Link>
          </div>
        </div>
      </nav>

      {/* Logout Section */}
      <div className={`p-2 border-t ${!isExpanded && 'flex justify-center'}`}>
        <LogoutButton isExpanded={isExpanded} />
      </div>
    </div>
  )
} 