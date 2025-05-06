import { RestaurantRepo } from "../repositories/RestaurantRepo";
import { Restaurant } from "../models/Restaurant";
import { FoodCategory } from "../models/FoodCategory";
import { FoodItem } from "../models/FoodItem";

export const getAllRestaurants = async (category?: string) => {
  return await RestaurantRepo.getAllRestaurants(category);
};

export const getRestaurantById = async (id: number) => {
  if (!id) return null;
  return await RestaurantRepo.getRestaurantById(id);
};

export const getRestaurantWithMenu = async (id: number) => {
  if (!id) return null;
  return await RestaurantRepo.getRestaurantWithMenu(id);
};

// Create a new restaurant
export const createNewRestaurant = async (restaurantData: Partial<Restaurant>) => {
  return await RestaurantRepo.createRestaurant(restaurantData);
};

// Update restaurant information
export const updateRestaurantInfo = async (id: number, restaurantData: Partial<Restaurant>) => {
  if (!id) return null;
  return await RestaurantRepo.updateRestaurant(id, restaurantData);
};

// Delete a restaurant
export const deleteRestaurantById = async (id: number) => {
  if (!id) return null;
  return await RestaurantRepo.deleteRestaurant(id);
};

// Create a food category
export const createFoodCategory = async (restaurantId: number, categoryData: Partial<FoodCategory>) => {
  if (!restaurantId || !categoryData.name) return null;
  return await RestaurantRepo.createFoodCategory(restaurantId, categoryData);
};

// Update a food category
export const updateFoodCategoryById = async (
  restaurantId: number,
  categoryId: number,
  categoryData: Partial<FoodCategory>
) => {
  if (!restaurantId || !categoryId || !categoryData.name) return null;
  return await RestaurantRepo.updateFoodCategory(restaurantId, categoryId, categoryData);
};

// Delete a food category
export const deleteFoodCategoryById = async (restaurantId: number, categoryId: number) => {
  if (!restaurantId || !categoryId) return null;
  return await RestaurantRepo.deleteFoodCategory(restaurantId, categoryId);
};

// Create a food item
export const createFoodItem = async (
  restaurantId: number,
  categoryId: number,
  itemData: Partial<FoodItem>
) => {
  if (!restaurantId || !categoryId || !itemData.name || itemData.price === undefined) return null;
  return await RestaurantRepo.createFoodItem(restaurantId, categoryId, itemData);
};

// Update a food item
export const updateFoodItemById = async (
  restaurantId: number,
  categoryId: number,
  itemId: number,
  itemData: Partial<FoodItem>
) => {
  if (!restaurantId || !categoryId || !itemId || !itemData.name || itemData.price === undefined) return null;
  return await RestaurantRepo.updateFoodItem(restaurantId, categoryId, itemId, itemData);
};

// Delete a food item
export const deleteFoodItemById = async (
  restaurantId: number,
  categoryId: number,
  itemId: number
) => {
  if (!restaurantId || !categoryId || !itemId) return null;
  return await RestaurantRepo.deleteFoodItem(restaurantId, categoryId, itemId);
};
