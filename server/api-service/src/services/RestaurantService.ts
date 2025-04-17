import { RestaurantRepo } from "../repositories/RestaurantRepo";

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
