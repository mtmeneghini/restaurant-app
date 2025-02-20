import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline'
import { typography } from '../styles/design-system'

interface HowItWorksModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function HowItWorksModal({ isOpen, onClose }: HowItWorksModalProps) {
  if (!isOpen) return null

  const steps = [
    {
      title: 'Configuração das Mesas',
      description: 'Primeiro, crie as mesas ou posições do seu restaurante usando o botão "Nova Mesa". Você pode editar ou excluir mesas conforme necessário.',
      icon: '🪑'
    },
    {
      title: 'Criação de Pedidos',
      description: 'Para criar um novo pedido, selecione uma mesa disponível (verde). Um pedido será criado automaticamente para esta mesa.',
      icon: '📝'
    },
    {
      title: 'Adição de Itens',
      description: 'Com o pedido criado, use o botão "Adicionar Item" para incluir produtos do menu. Você pode especificar a quantidade e adicionar observações para cada item.',
      icon: '🍽️'
    },
    {
      title: 'Gerenciamento de Status',
      description: 'Acompanhe o status de cada item (Pendente, Preparando, Pronto, Entregue) e do pedido como um todo. Quando finalizado, use "Fechar Pedido".',
      icon: '✅'
    }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <QuestionMarkCircleIcon className="h-6 w-6 text-gray-600" />
            <h2 className="text-xl font-semibold">Como Funciona</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-100 rounded-full">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <div>
                <h3 
                  className="font-medium mb-2"
                  style={{ fontSize: typography.fontSize.lg }}
                >
                  {index + 1}. {step.title}
                </h3>
                <p 
                  className="text-gray-600"
                  style={{ fontSize: typography.fontSize.base }}
                >
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            style={{ fontSize: typography.fontSize.base }}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
} 