import { AppDataSource } from "../data-source";
import { Order } from "../models/Order";
import { OrderItem } from "../models/OrderItem";

export class OrderRepo {
  static async createOrder(orderData: Partial<Order>, orderItems: Partial<OrderItem>[]): Promise<Order | null> {
    const orderRepo = AppDataSource.getRepository(Order);
    const orderItemRepo = AppDataSource.getRepository(OrderItem);

    // Create and save the order
    const newOrder = orderRepo.create(orderData);
    await orderRepo.save(newOrder);

    // Create and save order items
    for (const item of orderItems) {
      const newOrderItem = orderItemRepo.create({
        ...item,
        orderId: newOrder.id
      });
      await orderItemRepo.save(newOrderItem);
    }

    // Return the order with items
    return await this.getOrderById(newOrder.id);
  }

  static async getOrderById(orderId: number): Promise<Order | null> {
    const orderRepo = AppDataSource.getRepository(Order);
    return await orderRepo.findOne({ 
      where: { id: orderId },
      relations: ["items", "items.foodItem"] 
    });
  }

  static async getUserOrders(userId: number): Promise<Order[]> {
    const orderRepo = AppDataSource.getRepository(Order);
    return await orderRepo.find({ 
      where: { userId },
      relations: ["items", "restaurant"],
      order: { createdAt: "DESC" } 
    }) || [];
  }
}
