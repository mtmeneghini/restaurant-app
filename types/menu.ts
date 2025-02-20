export interface MenuWithDetails {
  id: string
  name: string
  restaurant_id: string
  created_at: string
  updated_at: string
  groups: MenuGroupWithItems[]
}

export interface MenuGroupWithItems {
  id: string
  menu_id: string
  name: string
  created_at: string
  updated_at: string
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  group_id: string
  name: string
  description: string | null
  price: number
  created_at: string
  updated_at: string
}

export interface CreateMenuInput {
  name: string
  restaurant_id: string
}

export interface CreateMenuGroupInput {
  name: string
  menu_id: string
  id?: string
}

export interface CreateMenuItemInput {
  id?: string
  name: string
  description: string | null
  price: number
  group_id: string
}

export interface EditMenuItemInput extends CreateMenuItemInput {
  id: string
} 