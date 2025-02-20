import { useState } from 'react'
import { Table, TableStatus, OrderWithDetails } from '../types/orders'
import { supabase } from '../utils/supabase'
import { PlusIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline'
import { colors, typography } from '../styles/design-system'
import ConfirmDialog from './ConfirmDialog'

interface TableManagerProps {
  tables: Table[]
  setTables: (tables: Table[]) => void
  onTableSelect: (table: Table | null) => void
  selectedTable: Table | null
  restaurantId: string | null
  onCreateOrderClick: () => void
  orders: OrderWithDetails[]
  setOrders: (orders: OrderWithDetails[]) => void
}

export default function TableManager({
  tables,
  setTables,
  onTableSelect,
  selectedTable,
  restaurantId,
  onCreateOrderClick,
  orders,
  setOrders
}: TableManagerProps) {
  const [isTableModalOpen, setIsTableModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [tableForm, setTableForm] = useState({ label: '' })
  const [activeDropdowns, setActiveDropdowns] = useState<Set<string>>(new Set())
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  })

  const toggleDropdown = (id: string) => {
    setActiveDropdowns(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const handleCreateTable = async () => {
    if (!restaurantId || !tableForm.label.trim()) return

    try {
      const { data, error } = await supabase
        .from('tables')
        .insert([{
          restaurant_id: restaurantId,
          label: tableForm.label,
          status: 'available' as TableStatus
        }])
        .select()
        .single()

      if (error) throw error

      setTables([...tables, data])
      setTableForm({ label: '' })
      setIsTableModalOpen(false)
    } catch (error) {
      console.error('Error creating table:', error)
    }
  }

  const handleUpdateTable = async (tableId: string, newLabel: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .update({ label: newLabel })
        .eq('id', tableId)

      if (error) throw error

      setTables(tables.map(table =>
        table.id === tableId ? { ...table, label: newLabel } : table
      ))

      setOrders(orders.map(order => {
        if (order.table.id === tableId) {
          return {
            ...order,
            table: {
              ...order.table,
              label: newLabel
            }
          }
        }
        return order
      }))

      onTableSelect(null)
      setTableForm({ label: '' })
      setIsTableModalOpen(false)
    } catch (error) {
      console.error('Error updating table:', error)
    }
  }

  const handleDeleteTable = async (tableId: string) => {
    try {
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)

      if (error) throw error

      setTables(tables.filter(table => table.id !== tableId))
      
      if (selectedTable?.id === tableId) {
        onTableSelect(null)
      }
    } catch (error) {
      console.error('Error deleting table:', error)
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 
          className="font-medium"
          style={{ fontSize: typography.fontSize.xl, color: colors.brand.primary }}
        >
          Mesas
        </h3>
        <button
          onClick={() => setIsTableModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          style={{ fontSize: typography.fontSize.sm }}
        >
          <PlusIcon className="h-5 w-5" />
          Nova Mesa
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tables.map((table) => (
          <div
            key={table.id}
            onClick={() => {
              if (table.status === 'available') {
                onTableSelect(table)
                onCreateOrderClick()
              } else {
                onTableSelect(selectedTable?.id === table.id ? null : table)
              }
            }}
            className={`
              relative p-1.5 rounded-lg border ${
                table.status === 'available'
                  ? 'border-gray-200 hover:border-black cursor-pointer'
                  : selectedTable?.id === table.id
                  ? 'border-black bg-gray-50'
                  : 'border-gray-200 bg-gray-50 cursor-pointer hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-center justify-between mb-0.5">
              <span className="font-medium" style={{ fontSize: typography.fontSize.sm }}>
                {table.label}
              </span>
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    toggleDropdown(`table-${table.id}`)
                  }}
                  className="dropdown-trigger p-0.5 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <EllipsisVerticalIcon className="h-3.5 w-3.5 text-gray-500" />
                </button>
                {activeDropdowns.has(`table-${table.id}`) && (
                  <div className="dropdown-content absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onTableSelect(table)
                        setTableForm({ label: table.label })
                        setIsEditMode(true)
                        setIsTableModalOpen(true)
                        toggleDropdown(`table-${table.id}`)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Renomear
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setConfirmDialog({
                          isOpen: true,
                          title: 'Excluir Mesa',
                          message: 'Tem certeza que deseja excluir esta mesa?',
                          onConfirm: () => handleDeleteTable(table.id)
                        })
                        toggleDropdown(`table-${table.id}`)
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </div>
            <span className={`
              inline-block px-2 py-0.5 rounded-full text-xs
              ${table.status === 'available'
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
              }
            `}>
              {table.status === 'available' ? 'Disponível' : 'Ocupada'}
            </span>
          </div>
        ))}
      </div>

      {/* Modal for creating/editing tables */}
      {isTableModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">
              {isEditMode ? 'Editar Mesa' : 'Nova Mesa'}
            </h3>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Número/Nome da Mesa
              </label>
              <input
                type="text"
                value={tableForm.label}
                onChange={(e) => setTableForm({ label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-black focus:border-black"
                placeholder="Ex: 1, 2, A, B..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setIsTableModalOpen(false)
                  setTableForm({ label: '' })
                  setIsEditMode(false)
                }}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (isEditMode && selectedTable) {
                    handleUpdateTable(selectedTable.id, tableForm.label)
                  } else {
                    handleCreateTable()
                  }
                }}
                className="px-4 py-2 text-sm bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                {isEditMode ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm()
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        }}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
    </>
  )
} 