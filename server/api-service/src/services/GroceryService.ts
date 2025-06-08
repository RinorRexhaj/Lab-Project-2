import { GroceryStoreRepo } from "../repositories/GroceryStoreRepo";
import { GroceryStore } from "../models/GroceryStore";
import { GroceryCategory } from "../models/GroceryCategory";
import { GroceryProduct } from "../models/GroceryProduct";

export const getAllGroceryStores = async (category?: string) => {
  return await GroceryStoreRepo.getAllStores(category);
};

export const getGroceryStoreById = async (id: number) => {
  if (!id) return null;
  return await GroceryStoreRepo.getStoreById(id);
};

export const getGroceryStoreWithProducts = async (id: number) => {
  if (!id) return null;
  return await GroceryStoreRepo.getStoreWithProducts(id);
};

// Create a new grocery store
export const createNewGroceryStore = async (storeData: Partial<GroceryStore>) => {
  const repo = new GroceryStoreRepo();
  return await GroceryStoreRepo.createStore(storeData);
};

// Update grocery store information
export const updateGroceryStoreInfo = async (id: number, storeData: Partial<GroceryStore>) => {
  if (!id) return null;
  return await GroceryStoreRepo.updateStore(id, storeData);
};

// Delete a grocery store
export const deleteGroceryStoreById = async (id: number) => {
  if (!id) return null;
  return await GroceryStoreRepo.deleteStore(id);
};

// Create a grocery category
export const createGroceryCategory = async (storeId: number, categoryData: Partial<GroceryCategory>) => {
  if (!storeId || !categoryData.name) return null;
  return await GroceryStoreRepo.createCategory(storeId, categoryData);
};

// Update a grocery category
export const updateGroceryCategoryById = async (
  storeId: number,
  categoryId: number,
  categoryData: Partial<GroceryCategory>
) => {
  if (!storeId || !categoryId || !categoryData.name) return null;
  return await GroceryStoreRepo.updateCategory(storeId, categoryId, categoryData);
};

// Delete a grocery category
export const deleteGroceryCategoryById = async (storeId: number, categoryId: number) => {
  if (!storeId || !categoryId) return null;
  return await GroceryStoreRepo.deleteCategory(storeId, categoryId);
};

// Create a grocery product
export const createGroceryProduct = async (
  storeId: number,
  categoryId: number,
  productData: Partial<GroceryProduct>
) => {
  if (!storeId || !categoryId || !productData.name || productData.price === undefined) return null;
  return await GroceryStoreRepo.createProduct(storeId, categoryId, productData);
};

// Update a grocery product
export const updateGroceryProductById = async (
  storeId: number,
  categoryId: number,
  productId: number,
  productData: Partial<GroceryProduct>
) => {
  if (!storeId || !categoryId || !productId || !productData.name || productData.price === undefined) return null;
  return await GroceryStoreRepo.updateProduct(storeId, categoryId, productId, productData);
};

// Delete a grocery product
export const deleteGroceryProductById = async (
  storeId: number,
  categoryId: number,
  productId: number
) => {
  if (!storeId || !categoryId || !productId) return null;
  return await GroceryStoreRepo.deleteProduct(storeId, categoryId, productId);
};
