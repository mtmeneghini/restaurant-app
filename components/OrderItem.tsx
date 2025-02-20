import { OrderWithDetails, ItemStatus } from '../types/orders'
import { typography } from '../styles/design-system'

interface OrderItemProps {
  item: OrderWithDetails['items'][0]
  orderStatus: OrderWithDetails['status']
  onUpdateStatus: (itemId: string, newStatus: ItemStatus) => void
}

export default function OrderItem({ item, orderStatus, onUpdateStatus }: OrderItemProps) {
  return (
    <div className="px-6 py-4">
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
            onChange={(e) => onUpdateStatus(item.id, e.target.value as ItemStatus)}
            disabled={orderStatus !== 'active' || item.item_status === 'delivered'}
            className={`px-3 py-1 rounded-lg text-sm border ${
              item.item_status === 'pending'
                ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                : item.item_status === 'preparing'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : item.item_status === 'ready'
                ? 'bg-purple-100 text-purple-700 border-purple-200'
                : 'bg-green-100 text-green-700 border-green-200'
            } ${orderStatus === 'active' && item.item_status !== 'delivered' ? 'cursor-pointer' : 'cursor-not-allowed'}`}
          >
            <option value="pending" className="bg-white text-gray-700">Pendente</option>
            <option value="preparing" className="bg-white text-gray-700">Preparando</option>
            <option value="ready" className="bg-white text-gray-700">Pronto</option>
            <option value="delivered" className="bg-white text-gray-700">Entregue</option>
          </select>
        </div>
      </div>
    </div>
  )
} 