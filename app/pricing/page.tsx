'use client'

import Link from 'next/link'
import { CheckIcon } from '@heroicons/react/24/outline'
import { colors, typography } from '../../styles/design-system'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

const plans = [
  {
    name: 'Grátis',
    price: '0',
    description: 'Perfeito para pequenos restaurantes começando agora',
    features: [
      'Até 2 cardápios',
      'Até 5 mesas',
      'Gestão básica de pedidos',
      'Análises básicas',
      'Suporte por email'
    ],
    cta: 'Começar Agora',
    href: '/login?view=sign_up',
    highlighted: false
  },
  {
    name: 'Pro',
    price: '49',
    description: 'Ideal para restaurantes em crescimento com múltiplos cardápios',
    features: [
      'Cardápios ilimitados',
      'Mesas ilimitadas',
      'Gestão avançada de pedidos',
      'Análises e relatórios detalhados',
      'Suporte prioritário por email e chat',
      'Sistema de reserva de mesas',
      'Personalização de marca',
      'Acesso à API'
    ],
    cta: 'Teste Grátis',
    href: '/login?view=sign_up',
    highlighted: true
  },
  {
    name: 'Personalizado',
    price: 'Consulte',
    description: 'Para grandes restaurantes com necessidades específicas',
    features: [
      'Tudo do plano Pro',
      'Integrações personalizadas',
      'Gerente de conta dedicado',
      'Desenvolvimento de recursos personalizados',
      'Garantias de SLA',
      'Suporte por telefone',
      'Treinamento presencial',
      'Análises personalizadas'
    ],
    cta: 'Fale com Vendas',
    href: 'mailto:vendas@zarpar.com',
    highlighted: false
  }
]

export default function PricingPage() {
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

      {/* Main content */}
      <main className="flex-grow">
        {/* Pricing Section */}
        <div className="py-[--section-spacing]">
          <div className="max-w-6xl mx-auto px-[--container-padding]">
            <div className="text-center mb-[--section-spacing]">
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
                style={{ 
                  fontSize: typography.fontSize.lg,
                  lineHeight: typography.lineHeight.relaxed,
                  color: colors.ui.gray[600]
                }}
              >
                Escolha o plano que melhor se adapta às necessidades do seu restaurante
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl ${
                    plan.highlighted
                      ? `text-white ring-4 ring-[${colors.brand.primary}]`
                      : 'bg-white text-gray-900 border border-gray-200'
                  } p-8 shadow-sm`}
                  style={{
                    backgroundColor: plan.highlighted ? colors.brand.primary : colors.ui.white
                  }}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div 
                        className="text-white px-4 py-1 rounded-full"
                        style={{ 
                          fontSize: typography.fontSize.sm,
                          fontWeight: typography.fontWeight.medium,
                          backgroundColor: colors.brand.tertiary
                        }}
                      >
                        Mais Popular
                      </div>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 
                      className="mb-2"
                      style={{ 
                        fontSize: typography.headings.h3.fontSize,
                        lineHeight: typography.headings.h3.lineHeight,
                        fontWeight: typography.fontWeight.semibold
                      }}
                    >
                      {plan.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      {plan.price !== 'Custom' && (
                        <span style={{ fontSize: typography.fontSize['2xl'] }}>$</span>
                      )}
                      <span style={{ 
                        fontSize: typography.headings.h1.fontSize,
                        fontWeight: typography.fontWeight.semibold,
                        letterSpacing: typography.headings.h1.letterSpacing
                      }}>
                        {plan.price}
                      </span>
                      {plan.price !== 'Custom' && (
                        <span style={{ fontSize: typography.fontSize.base }}>/month</span>
                      )}
                    </div>
                    <p 
                      className="mt-4"
                      style={{ 
                        fontSize: typography.fontSize.base,
                        lineHeight: typography.lineHeight.normal,
                        color: plan.highlighted ? 'rgba(255,255,255,0.9)' : colors.ui.gray[600]
                      }}
                    >
                      {plan.description}
                    </p>
                  </div>

                  <ul className="mb-8 space-y-4">
                    {plan.features.map((feature) => (
                      <li 
                        key={feature} 
                        className="flex items-start gap-3"
                        style={{ 
                          fontSize: typography.fontSize.base,
                          lineHeight: typography.lineHeight.normal
                        }}
                      >
                        <CheckIcon className={`h-6 w-6 flex-shrink-0 ${
                          plan.highlighted ? 'text-white' : ''
                        }`} style={{ 
                          color: plan.highlighted ? colors.ui.white : colors.brand.tertiary 
                        }} />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.href}
                    className={`block w-full text-center py-3 px-6 rounded-full transition-colors ${
                      plan.highlighted
                        ? 'bg-white hover:bg-gray-50'
                        : 'text-white hover:bg-gray-800'
                    }`}
                    style={{ 
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      backgroundColor: plan.highlighted ? colors.ui.white : colors.brand.primary,
                      color: plan.highlighted ? colors.brand.primary : colors.ui.white
                    }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
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