'use client'

import { OrderWithDetails, OrderItemWithDetails, ItemStatus } from '../types/orders'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'

interface OrderDetailsProps {
  order: OrderWithDetails
  onAddItem: () => void
  onUpdateItemStatus: (itemId: string, status: ItemStatus) => void
  onUpdateItemQuantity: (itemId: string, quantity: number) => void
  onDeleteItem: (itemId: string) => void
  onEditItem: (item: OrderItemWithDetails) => void
  onCheckout: () => void
}

const itemStatusColors: Record<ItemStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  preparing: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800'
}

export default function OrderDetails({
  order,
  onAddItem,
  onUpdateItemStatus,
  onUpdateItemQuantity,
  onDeleteItem,
  onEditItem,
  onCheckout,
}: OrderDetailsProps) {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="p-8 bg-white border-b shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">
              Order for {order.table.label}
            </h1>
            <p className="text-gray-600">
              Created at: {new Date(order.created_at).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onAddItem}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Item
            </button>
            <button
              onClick={onCheckout}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {order.items.map(item => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {item.menu_item.name}
                    </div>
                    {item.observations && (
                      <div className="text-sm text-gray-500">
                        Notes: {item.observations}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value)
                        onUpdateItemQuantity(item.id, Math.max(1, value || 0))
                      }}
                      className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${item.unit_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <select
                      value={item.item_status}
                      onChange={(e) => onUpdateItemStatus(item.id, e.target.value as ItemStatus)}
                      className={`px-2 py-1 rounded-md text-sm font-medium ${itemStatusColors[item.item_status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="preparing">Preparing</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => onEditItem(item)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => onDeleteItem(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td colSpan={4} className="px-6 py-4 text-right font-medium">
                  Total Amount:
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  ${order.total_amount.toFixed(2)}
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
} 