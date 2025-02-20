import { colors, typography } from '../styles/design-system'

export default function Footer() {
  return (
    <footer 
      style={{ 
        backgroundColor: colors.brand.primary,
        fontFamily: typography.fontFamily.primary,
        color: colors.ui.white
      }}
    >
      <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Zarpar</h3>
            <p className="text-gray-300">
              Otimize as operações do seu restaurante com nossa solução completa de gestão.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Recursos</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Gestão de Cardápio</li>
              <li>Acompanhamento de Pedidos</li>
              <li>Gestão de Mesas</li>
              <li>Insights de Negócio</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contato</h3>
            <ul className="space-y-2 text-gray-300">
              <li>Email: suporte@zarpar.com</li>
              <li>Telefone: (11) 1234-5678</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} Zarpar. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
} 