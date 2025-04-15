import { AppDataSource } from "../data-source";
import { Restaurant } from "../models/Restaurant";
import { FoodCategory } from "../models/FoodCategory";
import { FoodItem } from "../models/FoodItem";

export class RestaurantRepo {
  static async getAllRestaurants(category?: string): Promise<Restaurant[]> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    
    if (category && category !== 'All') {
      return await restaurantRepo.find({ where: { category } }) || [];
    }
    
    return await restaurantRepo.find() || [];
  }

  static async getRestaurantById(id: number): Promise<Restaurant | null> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    return await restaurantRepo.findOne({ where: { id } });
  }

  static async getRestaurantWithMenu(id: number): Promise<any | null> {
    const restaurantRepo = AppDataSource.getRepository(Restaurant);
    
    // First, get the restaurant
    const restaurant = await restaurantRepo.findOne({ where: { id } });
    if (!restaurant) return null;
    
    // Get all categories for this restaurant
    const categoryRepo = AppDataSource.getRepository(FoodCategory);
    const categories = await categoryRepo.find({ 
      where: { restaurantId: id },
      relations: ["items"],
      order: { id: "ASC" }
    });
    
    // Get items for each category directly to ensure they're loaded
    const itemRepo = AppDataSource.getRepository(FoodItem);
    
    // Create a new array with fully populated categories and items
    const menuWithItems = await Promise.all(categories.map(async (category) => {
      const items = await itemRepo.find({
        where: { categoryId: category.id },
        order: { id: "ASC" }
      });
      
      return {
        ...category,
        items: items
      };
    }));
    
    // Format the result to include menu with categories and items
    return {
      ...restaurant,
      menu: menuWithItems
    };
  }
}
