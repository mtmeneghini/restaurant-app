'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckIcon } from '@heroicons/react/24/outline'
import { colors, typography } from '../../styles/design-system'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useAuth } from '../../contexts/AuthContext'

type BillingPeriod = 'monthly' | 'semester' | 'yearly'

interface PriceOption {
  stripe_price_id: string
  billing_period: BillingPeriod
  amount: number
  currency: string
}

interface BillingOption {
  period: BillingPeriod
  label: string
  description: string
  monthlyPrice: number
  discount?: string
  recommended?: boolean
}

const sharedFeatures = [
  {
    title: 'Gestão de Cardápio',
    features: [
      'Cardápios ilimitados',
      'Categorização de itens',
      'Preços e descrições personalizáveis'
    ]
  },
  {
    title: 'Gestão de Mesas',
    features: [
      'Mesas ilimitadas',
      'Sistema de reservas',
      'Controle de status em tempo real'
    ]
  },
  {
    title: 'Pedidos',
    features: [
      'Gestão avançada de pedidos',
      'Acompanhamento em tempo real',
      'Histórico completo'
    ]
  },
  {
    title: 'Suporte e Extras',
    features: [
      'Suporte prioritário por email e chat',
      'Análises e relatórios detalhados',
      'Personalização de marca',
      'Acesso à API'
    ]
  }
]

const subscriptionPlans = [
  {
    period: 'yearly',
    name: 'Anual',
    basePrice: 69,
    description: 'Economize 22% ao ano',
    priceLabel: 'R$ 69/mês',
    cta: 'Assinar Plano Anual',
    highlighted: true
  },
  {
    period: 'semester',
    name: 'Semestral',
    basePrice: 79,
    description: 'Economize 11% ao ano',
    priceLabel: 'R$ 79/mês',
    cta: 'Assinar Plano Semestral',
  },
  {
    period: 'monthly',
    name: 'Mensal',
    basePrice: 89,
    description: 'Pague mês a mês',
    priceLabel: 'R$ 89/mês',
    cta: 'Assinar Plano Mensal',
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async (plan: typeof subscriptionPlans[0]) => {
    if (!user) {
      router.push('/login?view=sign_up')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First create/get customer
      const customerResponse = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create_customer' })
      })

      const customerData = await customerResponse.json()
      if (!customerResponse.ok) {
        throw new Error(customerData.error || 'Failed to create customer')
      }

      // Create subscription with trial if it's the trial plan
      const subscriptionResponse = await fetch('/api/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_subscription',
          billingPeriod: plan.period,
          trial_days: plan.trialDays
        })
      })

      const subscriptionData = await subscriptionResponse.json()
      if (!subscriptionResponse.ok) {
        throw new Error(subscriptionData.error || 'Failed to create subscription')
      }

      router.push('/dashboard?subscription=success')
    } catch (err) {
      console.error('Subscription error:', err)
      setError(err instanceof Error ? err.message : 'Failed to process subscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        fontFamily: typography.fontFamily.primary,
        backgroundColor: colors.ui.white,
        '--section-spacing': 'clamp(4rem, 8vh, 8rem)',
        '--container-padding': 'clamp(1rem, 3vw, 2rem)',
      } as React.CSSProperties}
    >
      <Header />

      <main className="flex-grow">
        <div className="py-[--section-spacing]">
          <div className="max-w-6xl mx-auto px-[--container-padding]">
            <div className="text-center mb-16">
              <h1 
                className="mb-4"
                style={{ 
                  fontSize: typography.headings.h1.fontSize,
                  lineHeight: typography.headings.h1.lineHeight,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.brand.primary,
                  letterSpacing: typography.headings.h1.letterSpacing
                }}
              >
                Preços simples e transparentes
              </h1>
              <p 
                className="mb-8"
                style={{ 
                  fontSize: typography.fontSize.lg,
                  lineHeight: typography.lineHeight.relaxed,
                  color: colors.ui.gray[600]
                }}
              >
                Escolha o plano que melhor se adapta às necessidades do seu restaurante
              </p>
              
              {/* Free Trial Button */}
              <div className="max-w-xl mx-auto">
                <button
                  onClick={() => handleSubscribe({ name: 'Teste Grátis', trialDays: 30 })}
                  className="w-full md:w-auto px-8 py-4 rounded-full text-white transition-colors"
                  style={{ 
                    backgroundColor: colors.brand.primary,
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  Começar Agora Grátis
                </button>
                <p 
                  className="mt-3"
                  style={{ 
                    fontSize: typography.fontSize.base,
                    color: colors.ui.gray[500]
                  }}
                >
                  Experimente todas as funcionalidades por 30 dias
                </p>
              </div>
            </div>

            {error && (
              <div className="max-w-xl mx-auto mb-8">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {subscriptionPlans.map((plan) => (
                <div
                  key={plan.period}
                  className={`relative rounded-2xl ${
                    plan.highlighted
                      ? 'bg-brand-primary text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  } p-8 shadow-sm`}
                  style={{
                    backgroundColor: plan.highlighted ? colors.brand.primary : undefined
                  }}
                >
                  <div className="mb-6">
                    <h3 
                      className="text-2xl font-semibold mb-2"
                      style={{
                        fontSize: typography.headings.h3.fontSize,
                        lineHeight: typography.headings.h3.lineHeight
                      }}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span 
                        className="text-4xl font-semibold"
                        style={{
                          fontSize: typography.fontSize['4xl'],
                          fontWeight: typography.fontWeight.semibold
                        }}
                      >
                        {plan.priceLabel}
                      </span>
                    </div>
                    <p 
                      className="text-base opacity-90"
                      style={{
                        fontSize: typography.fontSize.base,
                        color: plan.highlighted ? 'rgba(255,255,255,0.9)' : colors.ui.gray[600]
                      }}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <button
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading}
                    className={`block w-full text-center py-3 px-6 rounded-full transition-colors ${
                      plan.highlighted
                        ? 'bg-white hover:bg-gray-50'
                        : 'border border-brand-primary hover:bg-brand-primary hover:text-white'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    style={{
                      color: plan.highlighted ? colors.brand.primary : colors.brand.primary,
                      backgroundColor: plan.highlighted ? colors.ui.white : 'transparent',
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium
                    }}
                  >
                    {loading ? 'Processando...' : plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* New Features Section */}
        <div className="mt-24 mb-24 max-w-6xl mx-auto px-[--container-padding]">
          <div className="text-center mb-12">
            <h2 
              className="mb-4"
              style={{ 
                fontSize: typography.headings.h2.fontSize,
                lineHeight: typography.headings.h2.lineHeight,
                fontWeight: typography.fontWeight.semibold,
                color: colors.brand.primary,
                letterSpacing: typography.headings.h2.letterSpacing
              }}
            >
              Todas as funcionalidades incluídas em todos os planos
            </h2>
            <p 
              style={{ 
                fontSize: typography.fontSize.lg,
                lineHeight: typography.lineHeight.relaxed,
                color: colors.ui.gray[600]
              }}
            >
              Experimente gratuitamente por 30 dias
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {sharedFeatures.map((section) => (
              <div 
                key={section.title}
                className="p-6 rounded-xl bg-white border border-gray-200"
              >
                <h3 
                  className="mb-4"
                  style={{ 
                    fontSize: typography.headings.h4.fontSize,
                    lineHeight: typography.headings.h4.lineHeight,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.brand.primary
                  }}
                >
                  {section.title}
                </h3>
                <ul className="space-y-3">
                  {section.features.map((feature) => (
                    <li 
                      key={feature}
                      className="flex items-start gap-3"
                      style={{ 
                        fontSize: typography.fontSize.base,
                        color: colors.ui.gray[600]
                      }}
                    >
                      <CheckIcon 
                        className="h-5 w-5 flex-shrink-0"
                        style={{ color: colors.brand.tertiary }}
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="py-[--section-spacing] border-t">
          <div className="max-w-6xl mx-auto px-[--container-padding]">
            <div className="text-center mb-[--section-spacing]">
              <h2 
                className="mb-4"
                style={{ 
                  fontSize: typography.headings.h2.fontSize,
                  lineHeight: typography.headings.h2.lineHeight,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.brand.primary,
                  letterSpacing: typography.headings.h2.letterSpacing
                }}
              >
                Perguntas frequentes
              </h2>
              <p 
                style={{ 
                  fontSize: typography.fontSize.base,
                  lineHeight: typography.lineHeight.normal,
                  color: colors.ui.gray[600]
                }}
              >
                Tem mais perguntas? Entre em contato com nossa{' '}
                <a 
                  href="mailto:suporte@zarpar.com" 
                  className="hover:text-blue-700"
                  style={{ color: colors.brand.tertiary }}
                >
                  equipe de suporte
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 