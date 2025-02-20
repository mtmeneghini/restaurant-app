'use client'

import { useAuth } from '../contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { colors, typography } from '../styles/design-system'
import Header from '../components/Header'
import Footer from '../components/Footer'

// Testimonial data
const testimonials = [
  {
    text: "O Zarpar transformou completamente a forma como gerenciamos nosso restaurante. O sistema de gerenciamento de cardápio é intuitivo e nos economiza horas toda semana. O recurso de insights nos ajuda a tomar decisões baseadas em dados que melhoraram significativamente nossos resultados.",
    author: "Sarah Johnson",
    role: "Proprietária, The Rustic Table"
  },
  {
    text: "O recurso de acompanhamento de pedidos melhorou nossa eficiência de serviço em 40%. Nossa equipe adora a facilidade de uso, e nossos clientes apreciam o serviço mais rápido.",
    author: "Michael Chen",
    role: "Gerente, Urban Bites"
  },
  {
    text: "Desde que implementamos o Zarpar, vimos um aumento de 25% em nosso valor médio de pedido. Os insights nos ajudaram a otimizar nossa estratégia de cardápio e preços.",
    author: "Emma Rodriguez",
    role: "Proprietária, Café Moderna"
  }
]

export default function Home() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  useEffect(() => {
    if (user) {
      router.push('/profile')
    }
  }, [user, router])

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
      
      {/* Main content with snap scroll */}
      <main className="flex-grow snap-y snap-mandatory overflow-y-scroll">
        {/* Hero Section */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="max-w-6xl mx-auto w-full px-[--container-padding]">
            <div className="flex items-center">
              <div className="flex-1 px-[--container-padding]">
                <div className="max-w-xl">
                  <h1 
                    className="mb-6"
                    style={{ 
                      fontSize: typography.headings.h1.fontSize,
                      lineHeight: typography.headings.h1.lineHeight,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.brand.primary,
                      letterSpacing: typography.headings.h1.letterSpacing
                    }}
                  >
                    Simplifique a Gestão do seu Restaurante
                  </h1>
                  <p 
                    className="mb-8"
                    style={{ 
                      fontSize: typography.headings.body.fontSize,
                      lineHeight: typography.lineHeight.relaxed,
                      color: colors.ui.gray[600]
                    }}
                  >
                    Gerencie seu cardápio, acompanhe pedidos e obtenha insights valiosos com nossa solução completa de gestão de restaurantes.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Link
                      href="/login?view=sign_up"
                      className="inline-flex items-center px-8 py-3 border border-transparent rounded-full text-white transition-colors hover:bg-gray-800"
                      style={{ 
                        backgroundColor: colors.brand.primary,
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.medium
                      }}
                    >
                      Comece Gratuitamente
                    </Link>
                    <Link
                      href="/pricing"
                      className="inline-flex items-center px-8 py-3 rounded-full transition-colors hover:bg-gray-50"
                      style={{ 
                        border: `1px solid ${colors.brand.primary}`,
                        color: colors.brand.primary,
                        fontSize: typography.fontSize.base,
                        fontWeight: typography.fontWeight.medium
                      }}
                    >
                      Veja nossos planos
                    </Link>
                  </div>
                </div>
              </div>
              <div className="hidden lg:block w-1/4 relative">
                <img
                  src="/restaurant-worker.jpg"
                  alt="Restaurant worker using tablet for management"
                  className="absolute -right-12 top-1/2 transform -translate-y-1/2 w-[200%] max-w-none rounded-2xl object-cover"
                  style={{
                    aspectRatio: '600/400'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="max-w-6xl mx-auto w-full px-[--container-padding]">
            <div className="text-center mb-[--section-spacing]">
              <h2 
                style={{ 
                  fontSize: typography.headings.h2.fontSize,
                  lineHeight: typography.headings.h2.lineHeight,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.brand.primary,
                  letterSpacing: typography.headings.h2.letterSpacing
                }}
              >
                Tudo que Você Precisa para Gerenciar seu Restaurante
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 rounded-xl border border-gray-200">
                <h3 
                  className="mb-4"
                  style={{ 
                    fontSize: typography.fontSize.xl,
                    lineHeight: typography.lineHeight.normal,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.brand.primary
                  }}
                >
                  Gestão de Cardápio
                </h3>
                <p style={{ 
                  color: colors.ui.gray[600],
                  fontSize: typography.fontSize.base,
                  lineHeight: typography.lineHeight.normal
                }}>
                  Crie e atualize seus cardápios facilmente, organize itens em categorias e gerencie preços.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-gray-200">
                <h3 
                  className="mb-4"
                  style={{ 
                    fontSize: typography.fontSize.xl,
                    lineHeight: typography.lineHeight.normal,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.brand.primary
                  }}
                >
                  Acompanhamento de Pedidos
                </h3>
                <p style={{ 
                  color: colors.ui.gray[600],
                  fontSize: typography.fontSize.base,
                  lineHeight: typography.lineHeight.normal
                }}>
                  Acompanhe pedidos em tempo real, gerencie o status das mesas e garanta um serviço eficiente.
                </p>
              </div>
              <div className="p-8 rounded-xl border border-gray-200">
                <h3 
                  className="mb-4"
                  style={{ 
                    fontSize: typography.fontSize.xl,
                    lineHeight: typography.lineHeight.normal,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.brand.primary
                  }}
                >
                  Insights de Negócio
                </h3>
                <p style={{ 
                  color: colors.ui.gray[600],
                  fontSize: typography.fontSize.base,
                  lineHeight: typography.lineHeight.normal
                }}>
                  Obtenha insights valiosos sobre suas vendas, itens populares e desempenho do negócio.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="max-w-6xl mx-auto w-full px-[--container-padding]">
            <div className="text-center mb-[--section-spacing]">
              <h2 
                style={{ 
                  fontSize: typography.headings.h2.fontSize,
                  lineHeight: typography.headings.h2.lineHeight,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.brand.primary,
                  letterSpacing: typography.headings.h2.letterSpacing
                }}
              >
                O que Nossos Clientes Dizem
              </h2>
            </div>
            
            {/* Testimonial Carousel */}
            <div className="flex flex-col lg:flex-row items-center gap-12">
              {/* Image Side */}
              <div className="w-full lg:w-1/2">
                <div 
                  className="aspect-square rounded-3xl"
                  style={{ backgroundColor: colors.ui.gray[100] }}
                >
                  {/* Image placeholder */}
                </div>
              </div>

              {/* Content Side */}
              <div className="w-full lg:w-1/2">
                <div className="relative">
                  {/* Quote mark decoration */}
                  <div 
                    className="absolute -top-8 -left-4 text-6xl opacity-10"
                    style={{ color: colors.brand.primary }}
                  >
                    "
        </div>

                  {/* Testimonial Text */}
                  <p 
                    className="mb-8"
                    style={{ 
                      fontSize: typography.fontSize.lg,
                      lineHeight: typography.lineHeight.relaxed,
                      color: colors.ui.gray[700]
                    }}
                  >
                    {testimonials[currentTestimonial].text}
                  </p>

                  {/* Author Info */}
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-full"
                      style={{ backgroundColor: colors.ui.gray[200] }}
                    />
                    <div>
                      <p 
                        style={{ 
                          fontSize: typography.fontSize.base,
                          fontWeight: typography.fontWeight.semibold,
                          color: colors.brand.primary 
                        }}
                      >
                        {testimonials[currentTestimonial].author}
                      </p>
                      <p 
                        style={{ 
                          fontSize: typography.fontSize.sm,
                          color: colors.ui.gray[600]
                        }}
                      >
                        {testimonials[currentTestimonial].role}
                      </p>
                    </div>
                  </div>

                  {/* Navigation Dots */}
                  <div className="flex items-center justify-center gap-2 mt-12">
                    {testimonials.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTestimonial(index)}
                        className="w-2.5 h-2.5 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: index === currentTestimonial ? colors.brand.primary : colors.ui.gray[200],
                          transform: index === currentTestimonial ? 'scale(1.4)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="min-h-screen snap-start flex items-center">
          <div className="max-w-6xl mx-auto w-full px-[--container-padding]">
            <div className="text-center">
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
                Pronto para Transformar a Gestão do seu Restaurante?
              </h2>
              <p 
                className="mb-8"
                style={{ 
                  fontSize: typography.fontSize.lg,
                  lineHeight: typography.lineHeight.relaxed,
                  color: colors.ui.gray[600]
                }}
              >
                Junte-se a milhares de restaurantes que já usam o Zarpar para otimizar suas operações.
              </p>
              <Link
                href="/login?view=sign_up"
                className="inline-flex items-center px-8 py-3 border border-transparent rounded-full text-white transition-colors hover:bg-gray-800"
                style={{ 
                  backgroundColor: colors.brand.primary,
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.medium
                }}
              >
                Crie sua Conta Gratuita
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
