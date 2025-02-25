'use client'

import { useRouter } from 'next/navigation'
import { CheckIcon } from '@heroicons/react/24/outline'
import { colors, typography } from '../../styles/design-system'
import Header from '../../components/Header'
import Footer from '../../components/Footer'
import { useAuth } from '../../contexts/AuthContext'

interface SubscriptionPlan {
  name: string
  price: string
  description: string
  features: string[]
  buttonText: string
  popular?: boolean
}

const subscriptionPlans: SubscriptionPlan[] = [
  {
    name: 'Básico',
    price: 'R$ 89/mês',
    description: 'Para restaurantes pequenos',
    features: [
      'Até 10 mesas',
      'Cardápio digital',
      'Pedidos online',
      'Suporte por email'
    ],
    buttonText: 'Começar agora',
  },
  {
    name: 'Pro',
    price: 'R$ 179/mês',
    description: 'Para restaurantes em crescimento',
    features: [
      'Mesas ilimitadas',
      'Cardápio digital personalizado',
      'Pedidos online e QR Code',
      'Suporte prioritário',
      'Relatórios avançados'
    ],
    buttonText: 'Começar teste grátis',
    popular: true
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const router = useRouter()

  const handleSubscribe = (plan: SubscriptionPlan) => {
    if (!user) {
      router.push('/login?view=sign_up')
      return
    }
    console.log('Subscription feature coming soon:', plan)
  }

  return (
    <div 
      className="min-h-screen flex flex-col"
      style={{ 
        backgroundColor: colors.ui.white,
        fontFamily: typography.fontFamily.primary 
      }}
    >
      <Header />
      
      <main className="flex-grow py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 
              className="mb-4"
              style={{ 
                fontSize: typography.headings.h1.fontSize,
                lineHeight: typography.headings.h1.lineHeight,
                fontWeight: typography.fontWeight.semibold,
                color: colors.brand.primary
              }}
            >
              Planos e Preços
            </h1>
            <p 
              style={{ 
                fontSize: typography.fontSize.lg,
                color: colors.ui.gray[600]
              }}
            >
              Escolha o plano ideal para o seu restaurante
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {subscriptionPlans.map((plan) => (
              <div 
                key={plan.name}
                className={`rounded-lg border p-8 ${
                  plan.popular ? 'shadow-lg' : ''
                }`}
                style={{
                  borderColor: plan.popular ? colors.brand.primary : colors.ui.gray[200]
                }}
              >
                {plan.popular && (
                  <span 
                    className="inline-block px-3 py-1 rounded-full mb-4"
                    style={{ 
                      backgroundColor: colors.brand.primary,
                      color: colors.ui.white,
                      fontSize: typography.fontSize.sm
                    }}
                  >
                    Mais popular
                  </span>
                )}
                <h3 
                  className="font-bold"
                  style={{ 
                    fontSize: typography.headings.h3.fontSize,
                    color: colors.ui.gray[900]
                  }}
                >
                  {plan.name}
                </h3>
                <p 
                  className="mt-4 font-bold"
                  style={{ 
                    fontSize: typography.fontSize['3xl'],
                    color: colors.ui.gray[900]
                  }}
                >
                  {plan.price}
                </p>
                <p 
                  className="mt-2"
                  style={{ color: colors.ui.gray[600] }}
                >
                  {plan.description}
                </p>
                
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckIcon 
                        className="h-6 w-6 flex-shrink-0"
                        style={{ color: colors.brand.tertiary }}
                      />
                      <span 
                        className="ml-3"
                        style={{ color: colors.ui.gray[600] }}
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan)}
                  className={`mt-8 w-full py-3 px-6 rounded-lg transition-colors`}
                  style={{
                    backgroundColor: plan.popular ? colors.brand.primary : colors.ui.gray[100],
                    color: plan.popular ? colors.ui.white : colors.ui.gray[900],
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
} 