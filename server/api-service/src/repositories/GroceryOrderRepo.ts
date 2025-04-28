import { AppDataSource } from "../data-source";
import { GroceryOrder } from "../models/GroceryOrder";
import { GroceryOrderItem } from "../models/GroceryOrderItem";
import { GroceryProduct } from "../models/GroceryProduct";
import { User } from "../models/User";
import { GroceryStore } from "../models/GroceryStore";

export class GroceryOrderRepo {
  private groceryOrderRepository = AppDataSource.getRepository(GroceryOrder);
  private groceryOrderItemRepository = AppDataSource.getRepository(GroceryOrderItem);
  private groceryProductRepository = AppDataSource.getRepository(GroceryProduct);
  private userRepository = AppDataSource.getRepository(User);
  private groceryStoreRepository = AppDataSource.getRepository(GroceryStore);

  /**
   * Create a new grocery order
   */
  async createOrder(userId: number, orderData: any): Promise<GroceryOrder> {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new Error("User not found");
    }

    const store = await this.groceryStoreRepository.findOneBy({ id: orderData.storeId });
    if (!store) {
      throw new Error("Grocery store not found");
    }

    // Create order
    const order = this.groceryOrderRepository.create({
      user,
      store,
      deliveryFee: orderData.deliveryFee,
      subtotal: orderData.subtotal,
      total: orderData.total,
    });

    const savedOrder = await this.groceryOrderRepository.save(order);

    // Create order items
    for (const item of orderData.items) {
      const product = await this.groceryProductRepository.findOneBy({ id: item.productId });
      if (!product) {
        throw new Error(`Product with ID ${item.productId} not found`);
      }

      const orderItem = this.groceryOrderItemRepository.create({
        order: savedOrder,
        product,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions,
        price: item.price,
        name: item.name,
        unit: item.unit,
        weight: item.weight,
      });

      await this.groceryOrderItemRepository.save(orderItem);
    }

    // Return the order with items
    return await this.getOrderById(savedOrder.id);
  }

  /**
   * Get a grocery order by ID
   */
  async getOrderById(id: number): Promise<GroceryOrder> {
    const order = await this.groceryOrderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.user", "user")
      .leftJoinAndSelect("order.store", "store")
      .leftJoinAndSelect("order.items", "items")
      .leftJoinAndSelect("items.product", "product")
      .where("order.id = :id", { id })
      .getOne();

    if (!order) {
      throw new Error("Order not found");
    }

    return order;
  }

  /**
   * Get all orders for a user
   */
  async getUserOrders(userId: number): Promise<GroceryOrder[]> {
    return await this.groceryOrderRepository
      .createQueryBuilder("order")
      .leftJoinAndSelect("order.store", "store")
      .leftJoinAndSelect("order.items", "items")
      .where("order.user.id = :userId", { userId })
      .orderBy("order.createdAt", "DESC")
      .getMany();
  }
}
