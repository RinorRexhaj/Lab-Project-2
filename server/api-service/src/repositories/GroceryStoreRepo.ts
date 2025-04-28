import { AppDataSource } from "../data-source";
import { GroceryStore } from "../models/GroceryStore";
import { GroceryCategory } from "../models/GroceryCategory";
import { GroceryProduct } from "../models/GroceryProduct";

export class GroceryStoreRepo {
  private groceryStoreRepository = AppDataSource.getRepository(GroceryStore);
  private groceryCategoryRepository = AppDataSource.getRepository(GroceryCategory);
  private groceryProductRepository = AppDataSource.getRepository(GroceryProduct);

  /**
   * Get all grocery stores
   */
  async getAllStores(category?: string): Promise<GroceryStore[]> {
    let query = this.groceryStoreRepository.createQueryBuilder("store");

    if (category && category !== "All") {
      query = query.where("store.category = :category", { category });
    }

    return await query.getMany();
  }

  /**
   * Get a grocery store by ID with its product categories
   */
  async getStoreWithProducts(id: number): Promise<GroceryStore | null> {
    return await this.groceryStoreRepository
      .createQueryBuilder("store")
      .leftJoinAndSelect("store.categories", "category")
      .leftJoinAndSelect("category.products", "product")
      .where("store.id = :id", { id })
      .getOne();
  }

  /**
   * Create a new grocery store
   */
  async createStore(storeData: Partial<GroceryStore>): Promise<GroceryStore> {
    const store = this.groceryStoreRepository.create(storeData);
    return await this.groceryStoreRepository.save(store);
  }

  /**
   * Create a product category for a grocery store
   */
  async createCategory(storeId: number, name: string): Promise<GroceryCategory> {
    const store = await this.groceryStoreRepository.findOneBy({ id: storeId });
    if (!store) {
      throw new Error("Grocery store not found");
    }

    const category = this.groceryCategoryRepository.create({
      name,
      store,
    });

    return await this.groceryCategoryRepository.save(category);
  }

  /**
   * Create a product for a category
   */
  async createProduct(categoryId: number, productData: Partial<GroceryProduct>): Promise<GroceryProduct> {
    const category = await this.groceryCategoryRepository.findOneBy({ id: categoryId });
    if (!category) {
      throw new Error("Grocery category not found");
    }

    const product = this.groceryProductRepository.create({
      ...productData,
      category,
    });

    return await this.groceryProductRepository.save(product);
  }
}
