'use client'

import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'
import { colors, typography } from '../styles/design-system'

export default function Header() {
  const { user } = useAuth()

  return (
    <header 
      style={{ 
        fontFamily: typography.fontFamily.primary,
        backgroundColor: colors.ui.white,
        borderBottom: `1px solid ${colors.ui.gray[200]}`,
      }}
      className="sticky top-0 z-50 backdrop-blur-sm bg-white/80"
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-2xl font-semibold hover:text-gray-700 transition-colors"
            style={{ 
              color: colors.brand.primary,
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.semibold
            }}
          >
            Zarpar
          </Link>

          <div className="flex items-center gap-6">
            <Link
              href="/pricing"
              className="hover:text-gray-700 transition-colors"
              style={{ 
                color: colors.ui.gray[700],
                fontSize: typography.fontSize.base,
                fontWeight: typography.fontWeight.medium
              }}
            >
              Planos
            </Link>
            {user ? (
              <Link
                href="/profile"
                className="inline-flex items-center px-5 py-2 border border-transparent rounded-full text-white transition-colors hover:bg-gray-800"
                style={{ 
                  backgroundColor: colors.brand.primary,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium
                }}
              >
                Painel
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hover:text-gray-700 transition-colors"
                  style={{ 
                    color: colors.ui.gray[700],
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  Entrar
                </Link>
                <Link
                  href="/login?view=sign_up"
                  className="inline-flex items-center px-5 py-2 border border-transparent rounded-full text-white transition-colors hover:bg-gray-800"
                  style={{ 
                    backgroundColor: colors.brand.primary,
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  Cadastrar
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
} 