export interface OrderItem {
    foodItemId: number;
    quantity: number;
    specialInstructions?: string;
    price: number;
    name: string;
  }
  
  export interface Order {
    id?: number;
    userId: number;
    restaurantId: number;
    items: OrderItem[];
    deliveryFee: number;
    subtotal: number;
    total: number;
    status?: string;
    createdAt?: Date;
  }
  