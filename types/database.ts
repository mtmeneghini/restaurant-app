export type TableStatus = 'available' | 'occupied' | 'closed'
export type OrderStatus = 'active' | 'closed'
export type ItemStatus = 'pending' | 'preparing' | 'delivered'

export interface Restaurant {
  id: string
  user_id: string
  name: string
  address: string
  phone_number: string
  created_at: string
  updated_at: string
}

export interface Menu {
  id: string
  restaurant_id: string
  name: string
  created_at: string
  updated_at: string
}

export interface MenuGroup {
  id: string
  menu_id: string
  name: string
  created_at: string
  updated_at: string
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

export interface Table {
  id: string
  restaurant_id: string
  label: string
  status: TableStatus
  created_at: string
  updated_at: string
}

export interface Order {
  id: string
  table_id: string
  status: OrderStatus
  total_amount: number
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  item_status: ItemStatus
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
}

export type Database = {
  restaurants: Restaurant
  menus: Menu
  menu_groups: MenuGroup
  menu_items: MenuItem
  tables: Table
  orders: Order
  order_items: OrderItem
} 