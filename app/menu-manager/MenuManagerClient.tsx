'use client'

import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../utils/supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { MenuWithDetails, CreateMenuInput, CreateMenuGroupInput, CreateMenuItemInput, MenuItem } from '../../types/menu'
import MenuModals from '../../components/MenuModals'
import { colors, typography } from '../../styles/design-system'
import { PlusIcon, EllipsisVerticalIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline'

interface MenuGroupType {
  id: string;
  name: string;
  menu_id: string;
}

export default function MenuManagerClient() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [menus, setMenus] = useState<MenuWithDetails[]>([])
  const [restaurantId, setRestaurantId] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true)
  
  // Modal states
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  
  // Confirm dialog states
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
  
  // Form states
  const [menuForm, setMenuForm] = useState<CreateMenuInput>({ name: '', restaurant_id: '' })
  const [groupForm, setGroupForm] = useState<CreateMenuGroupInput>({ name: '', menu_id: '' })
  const [itemForm, setItemForm] = useState<CreateMenuItemInput>({
    name: '',
    description: null,
    price: 0,
    group_id: ''
  })

  const [activeDropdowns, setActiveDropdowns] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdowns.size > 0) {
        const dropdowns = document.querySelectorAll('.dropdown-content')
        let clickedInside = false
        
        dropdowns.forEach(dropdown => {
          if (dropdown.contains(event.target as Node) || 
              (event.target as Element).closest('.dropdown-trigger')) {
            clickedInside = true
          }
        })
        
        if (!clickedInside) {
          setActiveDropdowns(new Set())
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdowns])

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    async function fetchRestaurantAndMenus() {
      try {
        // Get restaurant ID
        const { data: restaurant } = await supabase
          .from('restaurants')
          .select('id')
          .eq('user_id', user?.id || '')
          .single()

        if (restaurant) {
          setRestaurantId(restaurant.id)

          // Fetch menus with their groups and items
          const { data: menusData, error: menusError } = await supabase
            .from('menus')
            .select(`
              *,
              groups:menu_groups (
                *,
                items:menu_items (*)
              )
            `)
            .eq('restaurant_id', restaurant.id)
            .order('created_at', { ascending: true })

          if (menusError) throw menusError

          setMenus(menusData as MenuWithDetails[])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load menu data')
      } finally {
        setLoadingData(false)
      }
    }

    fetchRestaurantAndMenus()
  }, [user, router])

  const handleCreateMenu = async () => {
    try {
      if (!restaurantId) throw new Error('Restaurant ID not found')
      
      const { data, error } = await supabase
        .from('menus')
        .insert([{ name: 'Cardápio', restaurant_id: restaurantId }])
        .select()
        .single()

      if (error) throw error

      setMenus(prev => [...prev, { ...data, groups: [] }])
      setIsMenuModalOpen(false)
      setMenuForm({ name: '', restaurant_id: '' })
    } catch (error) {
      console.error('Error creating menu:', error)
      setError('Failed to create menu')
    }
  }

  const handleCreateGroup = async (menuId: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_groups')
        .insert([{ name: groupForm.name, menu_id: menuId }])
        .select()
        .single()

      if (error) throw error

      setMenus(prev => prev.map(menu => {
        if (menu.id === menuId) {
          return {
            ...menu,
            groups: [...menu.groups, { ...data, items: [] }]
          }
        }
        return menu
      }))

      setIsGroupModalOpen(false)
      setGroupForm({ name: '', menu_id: '' })
    } catch (error) {
      console.error('Error creating group:', error)
      setError('Failed to create category')
    }
  }

  const handleCreateItem = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('menu_items')
        .insert([{ ...itemForm, group_id: groupId }])
        .select()
        .single()

      if (error) throw error

      setMenus(prev => prev.map(menu => ({
        ...menu,
        groups: menu.groups.map(group => {
          if (group.id === groupId) {
            return {
              ...group,
              items: [...group.items, data]
            }
          }
          return group
        })
      })))

      setIsItemModalOpen(false)
      setItemForm({ name: '', description: null, price: 0, group_id: '' })
    } catch (error) {
      console.error('Error creating item:', error)
      setError('Failed to create item')
    }
  }

  const handleDeleteGroup = async (groupId: string) => {
    try {
      const { error } = await supabase
        .from('menu_groups')
        .delete()
        .eq('id', groupId)

      if (error) throw error

      setMenus(prev => prev.map(menu => ({
        ...menu,
        groups: menu.groups.filter(group => group.id !== groupId)
      })))
    } catch (error) {
      console.error('Error deleting group:', error)
      setError('Failed to delete category')
    }
  }

  const handleDeleteItem = async (itemId: string) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .delete()
        .eq('id', itemId)

      if (error) throw error

      setMenus(prev => prev.map(menu => ({
        ...menu,
        groups: menu.groups.map(group => ({
          ...group,
          items: group.items.filter(item => item.id !== itemId)
        }))
      })))
    } catch (error) {
      console.error('Error deleting item:', error)
      setError('Failed to delete item')
    }
  }

  const handleUpdateGroup = async (group: MenuGroupType) => {
    try {
      const { error } = await supabase
        .from('menu_groups')
        .update({ name: groupForm.name })
        .eq('id', group.id)

      if (error) throw error

      setMenus(prev => prev.map(menu => ({
        ...menu,
        groups: menu.groups.map(g => 
          g.id === group.id ? { ...g, name: groupForm.name } : g
        )
      })))

      setIsGroupModalOpen(false)
      setIsEditMode(false)
      setGroupForm({ name: '', menu_id: '' })
    } catch (error) {
      console.error('Error updating group:', error)
      setError('Failed to update category')
    }
  }

  const handleEditGroup = (group: MenuGroupType) => {
    setGroupForm({ name: group.name, menu_id: group.menu_id, id: group.id })
    setIsEditMode(true)
    setIsGroupModalOpen(true)
  }

  const handleUpdateItem = async (item: MenuItem) => {
    try {
      const { error } = await supabase
        .from('menu_items')
        .update({
          name: itemForm.name,
          description: itemForm.description,
          price: itemForm.price
        })
        .eq('id', item.id)

      if (error) throw error

      setMenus(prev => prev.map(menu => ({
        ...menu,
        groups: menu.groups.map(group => ({
          ...group,
          items: group.items.map(i => 
            i.id === item.id 
              ? { ...i, name: itemForm.name, description: itemForm.description, price: itemForm.price }
              : i
          )
        }))
      })))

      setIsItemModalOpen(false)
      setIsEditMode(false)
      setItemForm({ name: '', description: null, price: 0, group_id: '' })
    } catch (error) {
      console.error('Error updating item:', error)
      setError('Failed to update item')
    }
  }

  const filterItems = (items: MenuItem[], searchQuery: string) => {
    return items.filter(item =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      item.price.toString().includes(searchQuery)
    )
  }

  const filteredGroups = menus[0]?.groups.filter(group => 
    !selectedCategory || group.id === selectedCategory
  ).map(group => ({
    ...group,
    items: filterItems(group.items, searchQuery)
  })).filter(group => 
    !searchQuery || group.items.length > 0
  ) || []

  useEffect(() => {
    const handleSidebarChange = (e: StorageEvent) => {
      if (e.key === 'sidebarExpanded') {
        setIsSidebarExpanded(e.newValue === 'true')
      }
    }

    const storedValue = localStorage.getItem('sidebarExpanded')
    setIsSidebarExpanded(storedValue === null ? true : storedValue === 'true')

    window.addEventListener('storage', handleSidebarChange)
    return () => window.removeEventListener('storage', handleSidebarChange)
  }, [])

  if (loading || loadingData) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  const menu = menus[0] // We'll only work with the first menu

  return (
    <div className={`${isSidebarExpanded ? 'pl-52' : 'pl-14'} transition-all duration-300`}>
      <div className="p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {!menu ? (
          // Empty state
          <div className="flex flex-col items-center justify-center min-h-screen">
            <h2 
              className="mb-4"
              style={{ 
                fontSize: typography.headings.h2.fontSize,
                fontWeight: typography.fontWeight.semibold,
                color: colors.brand.primary
              }}
            >
              Comece a gerenciar seu cardápio
            </h2>
            <p 
              className="mb-8 text-center max-w-md"
              style={{ 
                fontSize: typography.fontSize.lg,
                color: colors.ui.gray[600]
              }}
            >
              Crie seu cardápio e comece a adicionar categorias e itens.
            </p>
            <button
              onClick={handleCreateMenu}
              className="inline-flex items-center px-6 py-3 rounded-full text-white transition-colors hover:bg-gray-800"
              style={{ backgroundColor: colors.brand.primary }}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Começar Cardápio
            </button>
          </div>
        ) : (
          // Menu content
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 
                style={{ 
                  fontSize: typography.headings.h2.fontSize,
                  lineHeight: typography.headings.h2.lineHeight,
                  fontWeight: typography.headings.h2.fontWeight,
                  letterSpacing: typography.headings.h2.letterSpacing,
                  color: colors.brand.primary
                }}
              >
                Cardápio
              </h2>
              <button
                onClick={() => {
                  setGroupForm({ name: '', menu_id: menu.id })
                  setIsGroupModalOpen(true)
                }}
                className="inline-flex items-center px-4 py-2 rounded-full text-white transition-colors hover:bg-gray-800"
                style={{ backgroundColor: colors.brand.primary }}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                Adicionar Categoria
              </button>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar itens por nome, descrição ou preço..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  style={{ fontSize: typography.fontSize.base }}
                />
              </div>

              {/* Category Filter */}
              <div className="sm:w-64">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FunnelIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={selectedCategory || ''}
                    onChange={(e) => setSelectedCategory(e.target.value || null)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                    style={{ fontSize: typography.fontSize.base }}
                  >
                    <option value="">Todas as categorias</option>
                    {menu.groups.map(group => (
                      <option key={group.id} value={group.id}>
                        {group.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-8">
              {filteredGroups.map(group => (
                <div 
                  key={group.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Category Header */}
                  <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 
                      style={{ 
                        fontSize: typography.fontSize.xl,
                        fontWeight: typography.fontWeight.semibold,
                        color: colors.brand.primary
                      }}
                    >
                      {group.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setItemForm({ name: '', description: null, price: 0, group_id: group.id })
                          setIsItemModalOpen(true)
                        }}
                        className="inline-flex items-center px-3 py-1.5 rounded-full border transition-colors hover:bg-gray-50"
                        style={{ 
                          borderColor: colors.brand.primary,
                          color: colors.brand.primary
                        }}
                      >
                        <PlusIcon className="w-4 h-4 mr-1" />
                        Adicionar Item
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => toggleDropdown(`group-${group.id}`)}
                          className="p-1 rounded-full hover:bg-gray-100 dropdown-trigger"
                        >
                          <EllipsisVerticalIcon className="w-6 h-6 text-gray-500" />
                        </button>
                        {activeDropdowns.has(`group-${group.id}`) && (
                          <div 
                            className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-10 dropdown-content"
                          >
                            <button
                              onClick={() => {
                                handleEditGroup(group)
                                toggleDropdown(`group-${group.id}`)
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => {
                                setConfirmDialog({
                                  isOpen: true,
                                  title: 'Excluir Categoria',
                                  message: `Tem certeza que deseja excluir a categoria "${group.name}"?`,
                                  onConfirm: () => handleDeleteGroup(group.id)
                                })
                                toggleDropdown(`group-${group.id}`)
                              }}
                              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                            >
                              Excluir
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Column Headers */}
                  <div className="grid grid-cols-[2fr,3fr,1fr,auto] gap-4 px-6 py-3 bg-gray-50 border-b border-gray-100">
                    <div className="text-left" style={{ 
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.ui.gray[600]
                    }}>
                      Item
                    </div>
                    <div className="text-left" style={{ 
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.ui.gray[600]
                    }}>
                      Descrição
                    </div>
                    <div className="text-left" style={{ 
                      fontSize: typography.fontSize.sm,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.ui.gray[600]
                    }}>
                      Preço
                    </div>
                    <div className="w-10"></div>
                  </div>

                  {/* Items List */}
                  <div className="divide-y divide-gray-100">
                    {group.items.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">
                        Nenhum item adicionado nesta categoria
                      </div>
                    ) : (
                      group.items.map(item => (
                        <div 
                          key={item.id}
                          className="grid grid-cols-[2fr,3fr,1fr,auto] gap-4 px-6 py-4 items-start hover:bg-gray-50"
                        >
                          <p className="text-left truncate" style={{ 
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.medium,
                            color: colors.brand.primary
                          }}>
                            {item.name}
                          </p>
                          <p className="text-left truncate" style={{ 
                            fontSize: typography.fontSize.sm,
                            color: colors.ui.gray[600]
                          }}>
                            {item.description || '-'}
                          </p>
                          <p className="text-left" style={{ 
                            fontSize: typography.fontSize.base,
                            fontWeight: typography.fontWeight.semibold,
                            color: colors.brand.primary,
                          }}>
                            R$ {item.price.toFixed(2)}
                          </p>
                          <div className="relative w-10">
                            <button
                              onClick={() => toggleDropdown(`item-${item.id}`)}
                              className="p-1 rounded-full hover:bg-gray-100 dropdown-trigger"
                            >
                              <EllipsisVerticalIcon className="w-6 h-6 text-gray-500" />
                            </button>
                            {activeDropdowns.has(`item-${item.id}`) && (
                              <div 
                                className="absolute right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-32 z-50 dropdown-content"
                                style={{ transform: 'translateY(-100%)' }}
                              >
                                <button
                                  onClick={() => {
                                    setItemForm({
                                      id: item.id,
                                      name: item.name,
                                      description: item.description,
                                      price: item.price,
                                      group_id: item.group_id
                                    })
                                    setIsEditMode(true)
                                    setIsItemModalOpen(true)
                                    toggleDropdown(`item-${item.id}`)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: 'Excluir Item',
                                      message: `Tem certeza que deseja excluir o item "${item.name}"?`,
                                      onConfirm: () => handleDeleteItem(item.id)
                                    })
                                    toggleDropdown(`item-${item.id}`)
                                  }}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                                >
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modals */}
        <MenuModals
          isMenuModalOpen={isMenuModalOpen}
          isGroupModalOpen={isGroupModalOpen}
          isItemModalOpen={isItemModalOpen}
          isEditMode={isEditMode}
          menuForm={menuForm}
          groupForm={groupForm}
          itemForm={itemForm}
          confirmDialog={confirmDialog}
          onCloseMenuModal={() => {
            setIsMenuModalOpen(false)
            setIsEditMode(false)
            setMenuForm({ name: '', restaurant_id: '' })
          }}
          onCloseGroupModal={() => {
            setIsGroupModalOpen(false)
            setIsEditMode(false)
            setGroupForm({ name: '', menu_id: '' })
          }}
          onCloseItemModal={() => {
            setIsItemModalOpen(false)
            setIsEditMode(false)
            setItemForm({ name: '', description: null, price: 0, group_id: '' })
          }}
          onCloseConfirmDialog={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
          onMenuFormChange={(name) => setMenuForm(prev => ({ ...prev, name }))}
          onGroupFormChange={(name) => setGroupForm(prev => ({ ...prev, name }))}
          onItemFormChange={(field, value) => setItemForm(prev => ({ ...prev, [field]: value }))}
          onCreateOrUpdateMenu={handleCreateMenu}
          onCreateOrUpdateGroup={() => {
            if (isEditMode && groupForm.id) {
              handleUpdateGroup({ id: groupForm.id, name: groupForm.name, menu_id: groupForm.menu_id })
            } else if (menu) {
              handleCreateGroup(menu.id)
            }
          }}
          onCreateOrUpdateItem={() => {
            if (isEditMode && itemForm.id) {
              handleUpdateItem({ ...itemForm as MenuItem })
            } else if (itemForm.group_id) {
              handleCreateItem(itemForm.group_id)
            }
          }}
        />
      </div>
    </div>
  )
} 