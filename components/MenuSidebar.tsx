'use client'

import { MenuWithDetails, MenuItem } from '../types/menu'
import { useEffect } from 'react'
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  FolderIcon, 
  DocumentTextIcon, 
  PencilSquareIcon, 
  PlusCircleIcon, 
  TrashIcon
} from '@heroicons/react/24/outline'

interface MenuSidebarProps {
  menus: MenuWithDetails[]
  selectedMenu: string | null
  selectedGroup: string | null
  onSelectMenu: (menuId: string) => void
  onSelectGroup: (groupId: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  onEditMenu: (menuId: string) => void
  onEditGroup: (groupId: string) => void
  onDeleteMenu: (menuId: string) => void
  onDeleteGroup: (groupId: string) => void
  onCreateMenu: () => void
  onCreateGroup: (menuId: string) => void
  onCreateItem: (groupId: string) => void
  onSelectItem: (item: MenuItem) => void
  expandedMenus: Set<string>
  expandedGroups: Set<string>
  onExpandMenu: (menuId: string) => void
  onExpandGroup: (groupId: string) => void
}

export default function MenuSidebar({
  menus,
  selectedMenu,
  selectedGroup,
  onSelectMenu,
  onSelectGroup,
  searchQuery,
  onSearchChange,
  onEditMenu,
  onEditGroup,
  onDeleteMenu,
  onDeleteGroup,
  onCreateMenu,
  onCreateGroup,
  onCreateItem,
  onSelectItem,
  expandedMenus,
  expandedGroups,
  onExpandMenu,
  onExpandGroup,
}: MenuSidebarProps) {
  // Remove the local state since we're now using props
  // const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set())
  // const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // Update expanded states based on search
  useEffect(() => {
    if (searchQuery) {
      const newExpandedMenus = new Set<string>()
      const newExpandedGroups = new Set<string>()

      menus.forEach(menu => {
        const menuMatches = menu.name.toLowerCase().includes(searchQuery.toLowerCase())
        const groupMatches = menu.groups.some(group => 
          group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          group.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
        )

        if (menuMatches || groupMatches) {
          newExpandedMenus.add(menu.id)
          
          if (groupMatches) {
            menu.groups.forEach(group => {
              if (
                group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                group.items.some(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
              ) {
                newExpandedGroups.add(group.id)
              }
            })
          }
        }
      })

      // Update through props instead of local state
      newExpandedMenus.forEach(menuId => onExpandMenu(menuId))
      newExpandedGroups.forEach(groupId => onExpandGroup(groupId))
    }
  }, [searchQuery, menus, onExpandMenu, onExpandGroup])

  const toggleMenu = (menuId: string) => {
    if (searchQuery) return // Prevent toggling when searching
    onExpandMenu(menuId)
  }

  const toggleGroup = (groupId: string) => {
    if (searchQuery) return // Prevent toggling when searching
    onExpandGroup(groupId)
  }

  const highlightText = (text: string) => {
    if (!searchQuery) return text

    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === searchQuery.toLowerCase() ? 
        <span key={i} className="bg-yellow-200">{part}</span> : 
        part
    )
  }

  const filteredMenus = menus.map(menu => ({
    ...menu,
    groups: menu.groups.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      menu.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.items.some(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  })).filter(menu => 
    menu.groups.length > 0 || 
    menu.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="w-80 bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Menus</h2>
          <button
            onClick={onCreateMenu}
            className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusCircleIcon className="h-5 w-5 mr-1.5" />
            Create Menu
          </button>
        </div>
        <div className="relative">
          <input
            type="text"
            placeholder="Search menus, groups, and items..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-16rem)]">
        {filteredMenus.map(menu => (
          <div key={menu.id} className="mb-2">
            <div className="flex items-center">
              <button
                onClick={() => toggleMenu(menu.id)}
                className={`flex items-center flex-1 text-left p-2 rounded-md hover:bg-gray-100 ${
                  selectedMenu === menu.id ? 'bg-blue-50 text-blue-600' : ''
                }`}
              >
                {expandedMenus.has(menu.id) ? (
                  <ChevronDownIcon className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronRightIcon className="h-4 w-4 mr-2" />
                )}
                <FolderIcon className="h-5 w-5 mr-2" />
                <span className="truncate">{highlightText(menu.name)}</span>
              </button>
              <div className="flex">
                <button
                  onClick={() => onCreateGroup(menu.id)}
                  className="p-2 text-gray-500 hover:text-green-600"
                >
                  <PlusCircleIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onEditMenu(menu.id)}
                  className="p-2 text-gray-500 hover:text-blue-600"
                >
                  <PencilSquareIcon className="h-5 w-5" />
                </button>
                <button
                  onClick={() => onDeleteMenu(menu.id)}
                  className="p-2 text-gray-500 hover:text-red-600"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
            
            {expandedMenus.has(menu.id) && (
              <div className="ml-6 mt-1 space-y-1">
                {menu.groups.map(group => (
                  <div key={group.id}>
                    <div className="flex items-center">
                      <button
                        onClick={() => {
                          onSelectMenu(menu.id)
                          onSelectGroup(group.id)
                          toggleGroup(group.id)
                        }}
                        className={`flex items-center flex-1 text-left p-2 rounded-md hover:bg-gray-100 ${
                          selectedGroup === group.id ? 'bg-blue-50 text-blue-600' : ''
                        }`}
                      >
                        {expandedGroups.has(group.id) ? (
                          <ChevronDownIcon className="h-4 w-4 mr-2" />
                        ) : (
                          <ChevronRightIcon className="h-4 w-4 mr-2" />
                        )}
                        <FolderIcon className="h-4 w-4 mr-2" />
                        <span className="truncate">{highlightText(group.name)}</span>
                      </button>
                      <div className="flex">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            onCreateItem(group.id)
                          }}
                          className="p-2 text-gray-500 hover:text-green-600"
                        >
                          <PlusCircleIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onEditGroup(group.id)}
                          className="p-2 text-gray-500 hover:text-blue-600"
                        >
                          <PencilSquareIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => onDeleteGroup(group.id)}
                          className="p-2 text-gray-500 hover:text-red-600"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    {expandedGroups.has(group.id) && group.items.length > 0 && (
                      <div className="ml-6 mt-1 space-y-1">
                        {group.items.map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer"
                            onClick={() => onSelectItem(item)}
                          >
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-gray-400" />
                            <span className="truncate text-sm text-gray-600">
                              {highlightText(item.name)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 