export type TableStatus = 'available' | 'occupied' | 'closed'
export type OrderStatus = 'active' | 'closed'
export type ItemStatus = 'pending' | 'preparing' | 'ready' | 'delivered'

export interface Table {
  id: string
  restaurant_id: string
  label: string
  status: TableStatus
  created_at: string
  updated_at: string
}

export interface OrderWithDetails {
  id: string
  table_id: string
  status: OrderStatus
  total_amount: number
  created_at: string
  updated_at: string
  table: Table
  items: OrderItemWithDetails[]
}

export interface OrderItemWithDetails {
  id: string
  order_id: string
  menu_item_id: string
  quantity: number
  item_status: ItemStatus
  unit_price: number
  total_price: number
  created_at: string
  updated_at: string
  observations?: string
  menu_item: {
    id: string
    name: string
    description: string | null
    price: number
  }
  order: {
    id: string
    table: {
      label: string
    }
  }
}

export interface CreateOrderInput {
  table_id: string
  status: OrderStatus
  total_amount: number
}

export interface CreateOrderItemInput {
  order_id: string
  menu_item_id: string
  quantity: number
  item_status: ItemStatus
  unit_price: number
}

export interface UpdateOrderItemInput {
  quantity?: number
  item_status?: ItemStatus
} 