'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../contexts/AuthContext'
import { colors, typography } from '../../../styles/design-system'
import NavigationHeader from '../../../components/NavigationHeader'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

export default function SubscriptionSuccessPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
    
    // Redirect to dashboard after 5 seconds
    const timeout = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)
    
    return () => clearTimeout(timeout)
  }, [user, loading, router])
  
  return (
    <div className="flex flex-col min-h-screen ml-64 transition-all duration-300">
      <NavigationHeader title="Assinatura Ativada" />
      
      <div className="flex flex-col items-center justify-center flex-1 px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8 text-center">
          <CheckCircleIcon className="w-16 h-16 mx-auto mb-4 text-green-500" />
          
          <h1 style={{ 
            fontSize: typography.headings.h2.fontSize,
            fontWeight: typography.fontWeight.bold,
            color: colors.brand.primary,
            marginBottom: '1rem'
          }}>
            Assinatura Ativada com Sucesso!
          </h1>
          
          <p style={{ 
            fontSize: typography.fontSize.lg,
            color: colors.ui.gray[600],
            marginBottom: '2rem'
          }}>
            Seu período de teste de 14 dias começou. Aproveite todos os recursos do plano Pro.
          </p>
          
          <p className="text-sm text-gray-500">
            Redirecionando para o dashboard em alguns segundos...
          </p>
        </div>
      </div>
    </div>
  )
} 