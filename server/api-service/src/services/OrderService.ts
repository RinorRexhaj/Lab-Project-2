import { OrderRepo } from "../repositories/OrderRepo";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";

export const createOrder = async (
  userId: number,
  restaurantId: number,
  items: Array<{
    foodItemId: number;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>,
  subtotal: number,
  deliveryFee: number,
  total: number
): Promise<Order | null> => {
  if (!userId || !restaurantId || items.length === 0) return null;
  
  // Create order data
  const orderData: Partial<Order> = {
    userId,
    restaurantId,
    subtotal,
    deliveryFee,
    total
  };

  // Create order items
  const orderItems: Partial<OrderItem>[] = items.map(item => ({
    foodItemId: item.foodItemId,
    quantity: item.quantity,
    price: item.price,
    specialInstructions: item.specialInstructions
  }));

  return await OrderRepo.createOrder(orderData, orderItems);
};

export const getUserOrders = async (userId: number) => {
  if (!userId) return [];
  return await OrderRepo.getUserOrders(userId);
};
