import { RequestHandler } from "express";
import {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantWithMenu
} from "../services/RestaurantService";

export const getRestaurants: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { category } = req.query;
    const restaurants = await getAllRestaurants(category as string);
    res.json({ restaurants });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRestaurant: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Restaurant ID" });
      return;
    }
    
    const restaurant = await getRestaurantById(parseInt(id));
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant not found" });
      return;
    }
    
    res.json({ restaurant });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getRestaurantMenu: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Restaurant ID" });
      return;
    }
    
    console.log(`Fetching restaurant menu for ID: ${id}`);
    const restaurant = await getRestaurantWithMenu(parseInt(id));
    
    if (!restaurant) {
      res.status(404).json({ error: "Restaurant not found" });
      return;
    }
    
    console.log(`Restaurant found: ${restaurant.name}`);
    console.log(`Menu categories: ${restaurant.menu ? restaurant.menu.length : 0}`);
    if (restaurant.menu) {
      restaurant.menu.forEach((category: any) => {
        console.log(`Category: ${category.name}, Items: ${category.items ? category.items.length : 0}`);
      });
    }
    
    res.json({ restaurant });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
