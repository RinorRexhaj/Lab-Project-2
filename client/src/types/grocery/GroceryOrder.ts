export interface GroceryOrderItem {
  productId: number;
  quantity: number;
  specialInstructions?: string;
  price: number;
  name: string;
  unit?: string;
  weight?: string;
}

export interface GroceryOrder {
  id?: number;
  userId: number;
  storeId: number;
  items: GroceryOrderItem[];
  deliveryFee: number;
  subtotal: number;
  total: number;
  status?: string;
  createdAt?: Date;
}
