'use client'

import { CreateMenuInput, CreateMenuGroupInput, CreateMenuItemInput } from '../types/menu'
import Modal from './Modal'
import ConfirmDialog from './ConfirmDialog'
import { KeyboardEvent } from 'react'

interface MenuModalsProps {
  isMenuModalOpen: boolean
  isGroupModalOpen: boolean
  isItemModalOpen: boolean
  isEditMode: boolean
  menuForm: CreateMenuInput
  groupForm: CreateMenuGroupInput
  itemForm: CreateMenuItemInput
  confirmDialog: {
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
  }
  onCloseMenuModal: () => void
  onCloseGroupModal: () => void
  onCloseItemModal: () => void
  onCloseConfirmDialog: () => void
  onMenuFormChange: (name: string) => void
  onGroupFormChange: (name: string) => void
  onItemFormChange: (field: keyof CreateMenuItemInput, value: string | number | null) => void
  onCreateOrUpdateMenu: () => void
  onCreateOrUpdateGroup: () => void
  onCreateOrUpdateItem: () => void
}

export default function MenuModals({
  isMenuModalOpen,
  isGroupModalOpen,
  isItemModalOpen,
  isEditMode,
  menuForm,
  groupForm,
  itemForm,
  confirmDialog,
  onCloseMenuModal,
  onCloseGroupModal,
  onCloseItemModal,
  onCloseConfirmDialog,
  onMenuFormChange,
  onGroupFormChange,
  onItemFormChange,
  onCreateOrUpdateMenu,
  onCreateOrUpdateGroup,
  onCreateOrUpdateItem,
}: MenuModalsProps) {
  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    action: () => void,
    isDisabled?: boolean
  ) => {
    if (e.key === 'Enter' && !isDisabled) {
      e.preventDefault()
      action()
    }
  }

  return (
    <>
      {/* Menu Modal */}
      <Modal
        isOpen={isMenuModalOpen}
        onClose={onCloseMenuModal}
        title={isEditMode ? "Editar Cardápio" : "Criar Cardápio"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Cardápio</label>
            <input
              type="text"
              value={menuForm.name}
              onChange={(e) => onMenuFormChange(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, onCreateOrUpdateMenu)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Digite o nome do cardápio"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCloseMenuModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onCreateOrUpdateMenu}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditMode ? 'Salvar Alterações' : 'Criar Cardápio'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Group Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={onCloseGroupModal}
        title={isEditMode ? "Editar Categoria" : "Criar Nova Categoria"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome da Categoria</label>
            <input
              type="text"
              value={groupForm.name}
              onChange={(e) => onGroupFormChange(e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, onCreateOrUpdateGroup)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Digite o nome da categoria"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCloseGroupModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onCreateOrUpdateGroup}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isEditMode ? 'Salvar Alterações' : 'Criar Categoria'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Item Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={onCloseItemModal}
        title={isEditMode ? "Editar Item" : "Adicionar Novo Item"}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nome do Item</label>
            <input
              type="text"
              value={itemForm.name}
              onChange={(e) => onItemFormChange('name', e.target.value)}
              onKeyPress={(e) => handleKeyPress(e, onCreateOrUpdateItem, itemForm.name.trim() === '')}
              className={`mt-1 block w-full rounded-md shadow-sm focus:ring-1 focus:ring-blue-500 ${
                itemForm.name.trim() === '' 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              placeholder="Digite o nome do item"
            />
            {itemForm.name.trim() === '' && (
              <p className="mt-1 text-sm text-red-600">Nome do item é obrigatório</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Descrição</label>
            <input
              type="text"
              value={itemForm.description || ''}
              onChange={(e) => onItemFormChange('description', e.target.value || null)}
              onKeyPress={(e) => handleKeyPress(e, onCreateOrUpdateItem, itemForm.name.trim() === '')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Digite a descrição do item (opcional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Preço</label>
            <input
              type="number"
              value={isNaN(itemForm.price) || itemForm.price === 0 ? '' : itemForm.price}
              onChange={(e) => {
                const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                onItemFormChange('price', value)
              }}
              onKeyPress={(e) => handleKeyPress(e, onCreateOrUpdateItem, itemForm.name.trim() === '')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Digite o preço"
              step="0.01"
              min="0"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onCloseItemModal}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onCreateOrUpdateItem}
              disabled={itemForm.name.trim() === ''}
              className={`px-4 py-2 rounded-md transition-colors ${
                itemForm.name.trim() === ''
                  ? 'bg-blue-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isEditMode ? 'Salvar Alterações' : 'Adicionar Item'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={onCloseConfirmDialog}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
      />
    </>
  )
} 