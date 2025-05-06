import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import {
  getAllRestaurants,
  getRestaurantById,
  getRestaurantWithMenu,
  createNewRestaurant,
  updateRestaurantInfo,
  deleteRestaurantById,
  createFoodCategory,
  updateFoodCategoryById,
  deleteFoodCategoryById,
  createFoodItem,
  updateFoodItemById,
  deleteFoodItemById,
} from "../services/RestaurantService";

// Get all restaurants
export const getRestaurants: RequestHandler = async (
  req,
  res
): Promise<void> => {
  try {
    const { category } = req.query;
    const restaurants = await getAllRestaurants(category as string);
    res.json({ restaurants });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get restaurant by ID
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
    console.error("Error fetching restaurant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get restaurant with menu
export const getRestaurantMenu: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Restaurant ID" });
      return;
    }

    const restaurant = await getRestaurantWithMenu(parseInt(id));

    if (!restaurant) {
      res.status(404).json({ error: "Restaurant not found" });
      return;
    }

    if (restaurant.menu) {
    }

    res.json({ restaurant });
  } catch (error) {
    console.error("Error fetching restaurant menu:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new restaurant
export const createRestaurant: RequestHandler = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      deliveryFee,
      estimatedDeliveryTime,
      rating,
      imageUrl,
      isOpen24Hours,
      openingTime,
      closingTime,
    } = req.body;

    if (!name || !description || !category || !imageUrl) {
      res
        .status(400)
        .json({ error: "Missing required restaurant information" });
      return;
    }

    const restaurant = await createNewRestaurant({
      name,
      description,
      category,
      deliveryFee,
      estimatedDeliveryTime,
      rating,
      imageUrl,
      isOpen24Hours,
      openingTime,
      closingTime,
    });

    res.status(201).json({ restaurant });
  } catch (error) {
    console.error("Error creating restaurant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update existing restaurant
export const updateRestaurant: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Restaurant ID" });
      return;
    }

    const {
      name,
      description,
      category,
      deliveryFee,
      estimatedDeliveryTime,
      rating,
      imageUrl,
      isOpen24Hours,
      openingTime,
      closingTime,
    } = req.body;

    const restaurant = await updateRestaurantInfo(parseInt(id), {
      name,
      description,
      category,
      deliveryFee,
      estimatedDeliveryTime,
      rating,
      imageUrl,
      isOpen24Hours,
      openingTime,
      closingTime,
    });

    if (!restaurant) {
      res.status(404).json({ error: "Restaurant not found" });
      return;
    }

    res.json({ restaurant });
  } catch (error) {
    console.error("Error updating restaurant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete restaurant
export const deleteRestaurant: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Restaurant ID" });
      return;
    }

    const result = await deleteRestaurantById(parseInt(id));
    if (!result) {
      res.status(404).json({ error: "Restaurant not found" });
      return;
    }

    res.json({ message: "Restaurant deleted successfully" });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add food category
export const addFoodCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || !name) {
      res.status(400).json({ error: "Missing required category information" });
      return;
    }

    const category = await createFoodCategory(parseInt(id), { name });
    if (!category) {
      res.status(404).json({ error: "Restaurant not found" });
      return;
    }

    res.status(201).json({ category });
  } catch (error) {
    console.error("Error adding food category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update food category
export const updateFoodCategory: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const { name } = req.body;

    if (!id || !categoryId || !name) {
      res.status(400).json({ error: "Missing required category information" });
      return;
    }

    const category = await updateFoodCategoryById(
      parseInt(id),
      parseInt(categoryId),
      { name }
    );
    if (!category) {
      res.status(404).json({ error: "Category or restaurant not found" });
      return;
    }

    res.json({ category });
  } catch (error) {
    console.error("Error updating food category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete food category
export const deleteFoodCategory: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId } = req.params;

    if (!id || !categoryId) {
      res.status(400).json({ error: "Invalid ID parameters" });
      return;
    }

    const result = await deleteFoodCategoryById(
      parseInt(id),
      parseInt(categoryId)
    );
    if (!result) {
      res.status(404).json({ error: "Category or restaurant not found" });
      return;
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting food category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add food item
export const addFoodItem: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const { name, description, price, imageUrl } = req.body;

    if (!id || !categoryId || !name || price === undefined) {
      res.status(400).json({ error: "Missing required food item information" });
      return;
    }

    const foodItem = await createFoodItem(parseInt(id), parseInt(categoryId), {
      name,
      description: description || "",
      price,
      imageUrl: imageUrl || "",
      categoryId: parseInt(categoryId),
    });

    if (!foodItem) {
      res.status(404).json({ error: "Category or restaurant not found" });
      return;
    }

    res.status(201).json({ foodItem });
  } catch (error) {
    console.error("Error adding food item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update food item
export const updateFoodItem: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId, itemId } = req.params;
    const { name, description, price, imageUrl } = req.body;

    if (!id || !categoryId || !itemId || !name || price === undefined) {
      res.status(400).json({ error: "Missing required food item information" });
      return;
    }

    const foodItem = await updateFoodItemById(
      parseInt(id),
      parseInt(categoryId),
      parseInt(itemId),
      {
        name,
        description: description || "",
        price,
        imageUrl: imageUrl || "",
      }
    );

    if (!foodItem) {
      res
        .status(404)
        .json({ error: "Food item, category, or restaurant not found" });
      return;
    }

    res.json({ foodItem });
  } catch (error) {
    console.error("Error updating food item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete food item
export const deleteFoodItem: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId, itemId } = req.params;

    if (!id || !categoryId || !itemId) {
      res.status(400).json({ error: "Invalid ID parameters" });
      return;
    }

    const result = await deleteFoodItemById(
      parseInt(id),
      parseInt(categoryId),
      parseInt(itemId)
    );

    if (!result) {
      res
        .status(404)
        .json({ error: "Food item, category, or restaurant not found" });
      return;
    }

    res.json({ message: "Food item deleted successfully" });
  } catch (error) {
    console.error("Error deleting food item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get restaurant images
export const getRestaurantImages: RequestHandler = async (req, res) => {
  try {
    const imagesDir = path.join(
      process.cwd(),
      "..",
      "..",
      "client",
      "public",
      "assets",
      "img",
      "restaurants"
    );

    fs.readdir(imagesDir, (err, files) => {
      if (err) {
        console.error("Error reading restaurant images directory:", err);
        return res
          .status(500)
          .json({ error: "Failed to get restaurant images" });
      }

      const imageFiles = files.filter(
        (file) =>
          file.endsWith(".jpg") ||
          file.endsWith(".jpeg") ||
          file.endsWith(".png") ||
          file.endsWith(".webp")
      );

      const imageUrls = imageFiles.map(
        (file) => `/assets/img/restaurants/${file}`
      );

      res.json({ images: imageUrls });
    });
  } catch (error) {
    console.error("Error getting restaurant images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get food item images
export const getFoodItemImages: RequestHandler = async (req, res) => {
  try {
    const imagesDir = path.join(
      process.cwd(),
      "..",
      "..",
      "client",
      "public",
      "assets",
      "img",
      "food_items"
    );

    fs.readdir(imagesDir, (err, files) => {
      if (err) {
        console.error("Error reading food item images directory:", err);
        return res
          .status(500)
          .json({ error: "Failed to get food item images" });
      }

      const imageFiles = files.filter(
        (file) =>
          file.endsWith(".jpg") ||
          file.endsWith(".jpeg") ||
          file.endsWith(".png") ||
          file.endsWith(".webp")
      );

      const imageUrls = imageFiles.map(
        (file) => `/assets/img/food_items/${file}`
      );

      res.json({ images: imageUrls });
    });
  } catch (error) {
    console.error("Error getting food item images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
