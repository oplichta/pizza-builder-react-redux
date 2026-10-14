export type PizzaSizeValue = 'small' | 'medium' | 'large'

export interface Ingredient {
  id: number
  name: string
  quantity: number
}

export interface Pizza {
  id: string
  size: PizzaSizeValue
  name: string
  price: number
  quantity: number
  ingredients: Ingredient[]
}

export interface OrderDetails {
  name: string
  email: string
  address: string
  postcode: string
  phone: string
}

export interface OrderState {
  pizzas: Pizza[]
  activePizzaId: string | null
  totalAmount: number
  orderDetails: OrderDetails | null
}
