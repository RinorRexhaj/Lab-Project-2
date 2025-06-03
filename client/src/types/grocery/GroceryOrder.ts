export interface GroceryOrder {
  id: number;
  storeId: number;
  storeName: string;
  items: GroceryOrderItem[];
  deliveryFee: number;
  subtotal: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface GroceryOrderItem {
  id: number;
  productId: number;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
  unit?: string;
  weight?: string;
}