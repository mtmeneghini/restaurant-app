'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '../../utils/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { colors, typography } from '../../styles/design-system'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import Link from 'next/link'

export default function LoginPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const view = searchParams.get('view')
  const isSignUp = view === 'sign_up'
  const initialView = isSignUp ? 'sign_up' : 'sign_in'

  useEffect(() => {
    if (!loading && user) {
      router.push('/profile')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ fontFamily: typography.fontFamily.primary }}>
        <div style={{ 
          fontSize: typography.fontSize.lg,
          color: colors.ui.gray[600]
        }}>
          Carregando...
        </div>
      </div>
    )
  }

  const authTheme = {
    ...ThemeSupa,
    default: {
      colors: {
        brand: colors.brand.primary,
        brandAccent: colors.brand.tertiary,
        inputBackground: colors.ui.white,
        inputBorder: colors.ui.gray[300],
        inputBorderHover: colors.ui.gray[400],
        inputBorderFocus: colors.brand.primary,
        inputText: colors.ui.gray[900],
        inputLabelText: colors.ui.gray[700],
        inputPlaceholder: colors.ui.gray[400],
        brandButtonText: colors.ui.white,
      },
      space: {
        inputPadding: '12px',
        buttonPadding: '12px 24px',
      },
      borderWidths: {
        buttonBorderWidth: '1px',
        inputBorderWidth: '1px',
      },
      radii: {
        borderRadiusButton: '9999px',
        buttonBorderRadius: '9999px',
        inputBorderRadius: '12px',
      },
      fontSizes: {
        baseInputSize: '16px',
        baseButtonSize: '16px',
        baseLabelSize: '14px',
      },
      fonts: {
        bodyFontFamily: typography.fontFamily.primary,
        buttonFontFamily: typography.fontFamily.primary,
        inputFontFamily: typography.fontFamily.primary,
        labelFontFamily: typography.fontFamily.primary,
      },
    },
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        fontFamily: typography.fontFamily.primary,
        backgroundColor: colors.ui.white
      }}
    >
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 
              className="mb-4"
              style={{ 
                fontSize: typography.headings.h2.fontSize,
                lineHeight: typography.headings.h2.lineHeight,
                fontWeight: typography.fontWeight.semibold,
                color: colors.brand.primary,
                letterSpacing: typography.headings.h2.letterSpacing
              }}
            >
              {isSignUp ? 'Crie sua conta' : 'Acesse sua conta'}
            </h1>
            <p
              style={{ 
                fontSize: typography.fontSize.lg,
                lineHeight: typography.lineHeight.relaxed,
                color: colors.ui.gray[600]
              }}
            >
              {isSignUp 
                ? 'Comece agora a gerenciar seu restaurante de forma simples e eficiente' 
                : 'Gerencie seu restaurante de forma simples e eficiente'}
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
            <Auth
              key={initialView}
              supabaseClient={supabase}
              appearance={{ theme: authTheme }}
              providers={['google']}
              view={initialView}
              showLinks={false}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'seu@email.com',
                    password_input_placeholder: 'Sua senha',
                    button_label: 'Entrar',
                    loading_button_label: 'Entrando...',
                    social_provider_text: 'Entrar com {{provider}}',
                  },
                  sign_up: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'seu@email.com',
                    password_input_placeholder: 'Sua senha',
                    button_label: 'Criar conta',
                    loading_button_label: 'Criando conta...',
                    social_provider_text: 'Cadastrar com {{provider}}',
                  },
                  forgotten_password: {
                    email_label: 'Email',
                    password_label: 'Senha',
                    email_input_placeholder: 'seu@email.com',
                    button_label: 'Enviar instruções',
                    loading_button_label: 'Enviando instruções...',
                    link_text: 'Esqueceu sua senha?',
                  },
                },
              }}
              redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/profile`}
            />
            <div className="mt-4 text-center">
              {isSignUp ? (
                <Link
                  href="/login"
                  className="text-sm hover:text-gray-700 transition-colors"
                  style={{ 
                    color: colors.ui.gray[600],
                    fontSize: typography.fontSize.sm
                  }}
                >
                  Já tem uma conta? Entrar
                </Link>
              ) : (
                <Link
                  href="/login?view=sign_up"
                  className="text-sm hover:text-gray-700 transition-colors"
                  style={{ 
                    color: colors.ui.gray[600],
                    fontSize: typography.fontSize.sm
                  }}
                >
                  Não tem uma conta? Cadastre-se
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 