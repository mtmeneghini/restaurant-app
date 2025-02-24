'use client'

import { Table, TableStatus } from '../types/orders'
import { useState } from 'react'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

interface TableSelectorProps {
  tables: Table[]
  selectedTable: Table | null
  onSelectTable: (table: Table) => void
  onCreateTable?: () => void
  onEditTable?: (table: Table) => void
  onDeleteTable?: (table: Table) => void
}

const statusColors: Record<TableStatus, string> = {
  available: 'bg-green-100 text-green-800',
  occupied: 'bg-yellow-100 text-yellow-800',
  closed: 'bg-red-100 text-red-800'
}

export default function TableSelector({
  tables,
  selectedTable,
  onSelectTable,
  onCreateTable,
  onEditTable,
  onDeleteTable,
}: TableSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTables = tables.filter(table =>
    table.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Tables</h2>
          {onCreateTable && (
            <button
              onClick={onCreateTable}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Create Table
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
        {filteredTables.map((table) => (
          <div
            key={table.id}
            onClick={() => onSelectTable(table)}
            className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
              selectedTable?.id === table.id ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{table.label}</div>
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusColors[table.status]}`}>
                  {table.status}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {onEditTable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditTable(table)
                    }}
                    className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {onDeleteTable && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteTable(table)
                    }}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 