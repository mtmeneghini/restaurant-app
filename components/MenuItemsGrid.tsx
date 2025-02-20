'use client'

import { MenuItem, MenuGroupWithItems } from '../types/menu'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface MenuItemsGridProps {
  group: MenuGroupWithItems | null
  onEditItem: (item: MenuItem) => void
  onDeleteItem: (itemId: string) => void
}

export default function MenuItemsGrid({ group, onEditItem, onDeleteItem }: MenuItemsGridProps) {
  if (!group) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">Select a menu group to view items</p>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{group.name}</h2>
        <p className="text-gray-600">{group.items.length} items</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {group.items.map(item => (
          <div
            key={item.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => onEditItem(item)}
                  className="p-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDeleteItem(item.id)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            {item.description && (
              <p className="text-gray-600 text-sm mb-2">{item.description}</p>
            )}
            <p className="text-lg font-medium text-gray-900">
              ${item.price.toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
} 