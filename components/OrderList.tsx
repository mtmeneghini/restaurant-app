import { OrderWithDetails, OrderStatus, ItemStatus } from '../types/orders'
import { colors, typography } from '../styles/design-system'
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import OrderItem from './OrderItem'
import Modal from './Modal'
import { useState } from 'react'

interface OrderListProps {
  orders: OrderWithDetails[]
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void
  onUpdateItemStatus: (itemId: string, newStatus: ItemStatus) => void
  onAddItem: (order: OrderWithDetails) => void
  onDeleteOrder: (orderId: string) => void
  onDeleteItem: (itemId: string) => void
  toggleDropdown: (id: string) => void
  activeDropdowns: Set<string>
  setConfirmDialog: (dialog: {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }) => void
}

export default function OrderList({
  orders,
  onUpdateOrderStatus,
  onUpdateItemStatus,
  onAddItem,
  onDeleteOrder,
  onDeleteItem,
  toggleDropdown,
  activeDropdowns,
  setConfirmDialog
}: OrderListProps) {
  const [closingOrder, setClosingOrder] = useState<OrderWithDetails | null>(null)

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
        <p className="text-gray-500" style={{ fontSize: typography.fontSize.base }}>
          Nenhum pedido encontrado
        </p>
      </div>
    )
  }

  const handleCloseOrder = (order: OrderWithDetails) => {
    setClosingOrder(order)
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg border border-gray-200 overflow-hidden"
          >
            {/* Order Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <span 
                  className="font-medium"
                  style={{ fontSize: typography.fontSize.lg, color: colors.brand.primary }}
                >
                  Mesa {order.table.label}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  order.status === 'active' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {order.status === 'active' ? 'Ativo' : 'Fechado'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onAddItem(order)}
                  className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                  style={{ fontSize: typography.fontSize.sm }}
                >
                  <PlusIcon className="h-5 w-5" />
                  Adicionar Item
                </button>
                <button
                  onClick={() => handleCloseOrder(order)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  style={{ fontSize: typography.fontSize.sm }}
                >
                  Fechar Pedido
                </button>
                <div className="relative">
                  <button
                    onClick={() => toggleDropdown(`order-${order.id}`)}
                    className="dropdown-trigger p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                  </button>
                  {activeDropdowns.has(`order-${order.id}`) && (
                    <div className="dropdown-content absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                      <button
                        onClick={() => {
                          setConfirmDialog({
                            isOpen: true,
                            title: 'Excluir Pedido',
                            message: `Tem certeza que deseja excluir este pedido?\n\nMesa ${order.table.label}\nTotal: R$ ${order.total_amount.toFixed(2)}`,
                            onConfirm: () => onDeleteOrder(order.id)
                          })
                          toggleDropdown(`order-${order.id}`)
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Excluir Pedido
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="divide-y divide-gray-200">
              {order.items.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium" style={{ fontSize: typography.fontSize.base }}>
                        {item.menu_item.name}
                      </h4>
                      <p className="text-gray-500 mt-1" style={{ fontSize: typography.fontSize.sm }}>
                        Quantidade: {item.quantity}
                      </p>
                      {item.observations && (
                        <p className="text-gray-500 mt-1 italic" style={{ fontSize: typography.fontSize.sm }}>
                          Obs: {item.observations}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        value={item.item_status}
                        onChange={(e) => onUpdateItemStatus(item.id, e.target.value as ItemStatus)}
                        disabled={item.item_status === 'delivered'}
                        className={`px-3 py-1 rounded-lg text-sm border ${
                          item.item_status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : item.item_status === 'preparing'
                            ? 'bg-blue-100 text-blue-700 border-blue-200'
                            : item.item_status === 'ready'
                            ? 'bg-purple-100 text-purple-700 border-purple-200'
                            : 'bg-green-100 text-green-700 border-green-200'
                        } ${item.item_status !== 'delivered' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                      >
                        <option value="pending" className="bg-white text-gray-700">Pendente</option>
                        <option value="preparing" className="bg-white text-gray-700">Preparando</option>
                        <option value="ready" className="bg-white text-gray-700">Pronto</option>
                        <option value="delivered" className="bg-white text-gray-700">Entregue</option>
                      </select>
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(`item-${item.id}`)}
                          className="dropdown-trigger p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <EllipsisVerticalIcon className="h-5 w-5 text-gray-500" />
                        </button>
                        {activeDropdowns.has(`item-${item.id}`) && (
                          <div className="dropdown-content absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Excluir Item',
                                  message: 'Tem certeza que deseja excluir este item?',
                                  onConfirm: () => onDeleteItem(item.id)
                                })
                                toggleDropdown(`item-${item.id}`)
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            >
                              Excluir Item
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-medium" style={{ fontSize: typography.fontSize.base }}>
                  Total
                </span>
                <span className="font-medium" style={{ fontSize: typography.fontSize.base }}>
                  R$ {order.total_amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Close Order Modal */}
      <Modal
        isOpen={closingOrder !== null}
        onClose={() => setClosingOrder(null)}
        title={`Fechar Pedido - Mesa ${closingOrder?.table.label || ''}`}
      >
        <div className="flex flex-col h-[calc(100vh-16rem)] max-w-4xl">
          {/* Items Grid Header - Fixed */}
          <div className="grid grid-cols-[3fr,1fr,1.5fr] gap-6 px-6 py-3 bg-gray-50 rounded-t-lg text-gray-600 border-b border-gray-200" style={{ fontSize: typography.fontSize.sm }}>
            <div className="font-medium">Item</div>
            <div className="font-medium text-center">Qtd.</div>
            <div className="font-medium text-right">Preço</div>
          </div>

          {/* Items List - Scrollable */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="space-y-2 p-2">
              {closingOrder?.items.map((item) => (
                <div key={item.id} className="grid grid-cols-[3fr,1fr,1.5fr] gap-6 px-6 py-4 bg-white rounded-lg border border-gray-100 items-center">
                  <div className="font-medium truncate" style={{ fontSize: typography.fontSize.sm }}>
                    {item.menu_item.name}
                  </div>
                  <div className="text-center" style={{ fontSize: typography.fontSize.sm }}>
                    {item.quantity}
                  </div>
                  <div className="text-right" style={{ fontSize: typography.fontSize.sm }}>
                    R$ {(item.quantity * item.menu_item.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Total - Fixed */}
          <div className="border-t border-gray-200 bg-white">
            <div className="flex justify-between items-center px-6 py-4 bg-gray-50">
              <span className="font-medium" style={{ fontSize: typography.fontSize.lg }}>
                Total
              </span>
              <span className="font-medium" style={{ fontSize: typography.fontSize.lg }}>
                R$ {closingOrder?.total_amount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Actions - Fixed */}
          <div className="flex justify-end gap-3 pt-4 px-6 bg-white">
            <button
              onClick={() => setClosingOrder(null)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                if (closingOrder) {
                  onUpdateOrderStatus(closingOrder.id, 'closed')
                  setClosingOrder(null)
                }
              }}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Confirmar e Fechar Pedido
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
} 