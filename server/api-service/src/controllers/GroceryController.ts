import { RequestHandler } from "express";
import fs from "fs";
import path from "path";
import {
  getAllGroceryStores,
  getGroceryStoreById,
  getGroceryStoreWithProducts,
  createNewGroceryStore,
  updateGroceryStoreInfo,
  deleteGroceryStoreById,
  createGroceryCategory,
  updateGroceryCategoryById,
  deleteGroceryCategoryById,
  createGroceryProduct,
  updateGroceryProductById,
  deleteGroceryProductById,
} from "../services/GroceryService";

// Get all grocery stores
export const getGroceryStores: RequestHandler = async (req, res): Promise<void> => {
  try {
    const { category } = req.query;
    const stores = await getAllGroceryStores(category as string);
    res.json({ stores });
  } catch (error) {
    console.error("Error fetching grocery stores:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get grocery store by ID
export const getGroceryStore: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Grocery Store ID" });
      return;
    }

    const store = await getGroceryStoreById(parseInt(id));
    if (!store) {
      res.status(404).json({ error: "Grocery store not found" });
      return;
    }

    res.json({ store });
  } catch (error) {
    console.error("Error fetching grocery store:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get grocery store with products
export const getGroceryStoreProducts: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Grocery Store ID" });
      return;
    }

    const store = await getGroceryStoreWithProducts(parseInt(id));

    if (!store) {
      res.status(404).json({ error: "Grocery store not found" });
      return;
    }

    res.json({ store });
  } catch (error) {
    console.error("Error fetching grocery store products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Create a new grocery store
export const createGroceryStore: RequestHandler = async (req, res) => {
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
      res.status(400).json({ error: "Missing required grocery store information" });
      return;
    }

    const store = await createNewGroceryStore({
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

    res.status(201).json({ store });
  } catch (error) {
    console.error("Error creating grocery store:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update existing grocery store
export const updateGroceryStore: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Grocery Store ID" });
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

    const store = await updateGroceryStoreInfo(parseInt(id), {
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

    if (!store) {
      res.status(404).json({ error: "Grocery store not found" });
      return;
    }

    res.json({ store });
  } catch (error) {
    console.error("Error updating grocery store:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete grocery store
export const deleteGroceryStore: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ error: "Invalid Grocery Store ID" });
      return;
    }

    const result = await deleteGroceryStoreById(parseInt(id));
    if (!result) {
      res.status(404).json({ error: "Grocery store not found" });
      return;
    }

    res.json({ message: "Grocery store deleted successfully" });
  } catch (error) {
    console.error("Error deleting grocery store:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add grocery category
export const addGroceryCategory: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!id || !name) {
      res.status(400).json({ error: "Missing required category information" });
      return;
    }

    const category = await createGroceryCategory(parseInt(id), { name });
    if (!category) {
      res.status(404).json({ error: "Grocery store not found" });
      return;
    }

    res.status(201).json({ category });
  } catch (error) {
    console.error("Error adding grocery category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update grocery category
export const updateGroceryCategory: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const { name } = req.body;

    if (!id || !categoryId || !name) {
      res.status(400).json({ error: "Missing required category information" });
      return;
    }

    const category = await updateGroceryCategoryById(
      parseInt(id),
      parseInt(categoryId),
      { name }
    );
    if (!category) {
      res.status(404).json({ error: "Category or grocery store not found" });
      return;
    }

    res.json({ category });
  } catch (error) {
    console.error("Error updating grocery category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete grocery category
export const deleteGroceryCategory: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId } = req.params;

    if (!id || !categoryId) {
      res.status(400).json({ error: "Invalid ID parameters" });
      return;
    }

    const result = await deleteGroceryCategoryById(
      parseInt(id),
      parseInt(categoryId)
    );
    if (!result) {
      res.status(404).json({ error: "Category or grocery store not found" });
      return;
    }

    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Error deleting grocery category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Add grocery product
export const addGroceryProduct: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId } = req.params;
    const { name, description, price, imageUrl, unit, weight, inStock } = req.body;

    if (!id || !categoryId || !name || price === undefined) {
      res.status(400).json({ error: "Missing required product information" });
      return;
    }

    const product = await createGroceryProduct(parseInt(id), parseInt(categoryId), {
      name,
      description: description || "",
      price,
      imageUrl: imageUrl || "",
      unit: unit || "",
      weight: weight || "",
      inStock: inStock !== undefined ? inStock : true,
    });

    if (!product) {
      res.status(404).json({ error: "Category or grocery store not found" });
      return;
    }

    res.status(201).json({ product });
  } catch (error) {
    console.error("Error adding grocery product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Update grocery product
export const updateGroceryProduct: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId, productId } = req.params;
    const { name, description, price, imageUrl, unit, weight, inStock } = req.body;

    if (!id || !categoryId || !productId || !name || price === undefined) {
      res.status(400).json({ error: "Missing required product information" });
      return;
    }

    const product = await updateGroceryProductById(
      parseInt(id),
      parseInt(categoryId),
      parseInt(productId),
      {
        name,
        description: description || "",
        price,
        imageUrl: imageUrl || "",
        unit: unit || "",
        weight: weight || "",
        inStock: inStock !== undefined ? inStock : true,
      }
    );

    if (!product) {
      res.status(404).json({ error: "Product, category, or grocery store not found" });
      return;
    }

    res.json({ product });
  } catch (error) {
    console.error("Error updating grocery product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Delete grocery product
export const deleteGroceryProduct: RequestHandler = async (req, res) => {
  try {
    const { id, categoryId, productId } = req.params;

    if (!id || !categoryId || !productId) {
      res.status(400).json({ error: "Invalid ID parameters" });
      return;
    }

    const result = await deleteGroceryProductById(
      parseInt(id),
      parseInt(categoryId),
      parseInt(productId)
    );

    if (!result) {
      res.status(404).json({ error: "Product, category, or grocery store not found" });
      return;
    }

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting grocery product:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get grocery store images
export const getGroceryStoreImages: RequestHandler = async (req, res) => {
  try {
    const imagesDir = path.join(
      process.cwd(),
      "..",
      "..",
      "client",
      "public",
      "assets",
      "img",
      "grocery"
    );

    fs.readdir(imagesDir, (err, files) => {
      if (err) {
        console.error("Error reading grocery store images directory:", err);
        return res.status(500).json({ error: "Failed to get grocery store images" });
      }

      const imageFiles = files.filter(
        (file) =>
          file.endsWith(".jpg") ||
          file.endsWith(".jpeg") ||
          file.endsWith(".png") ||
          file.endsWith(".webp")
      );

      const imageUrls = imageFiles.map((file) => `/assets/img/grocery/${file}`);

      res.json({ images: imageUrls });
    });
  } catch (error) {
    console.error("Error getting grocery store images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Get grocery product images
export const getGroceryProductImages: RequestHandler = async (req, res) => {
  try {
    const imagesDir = path.join(
      process.cwd(),
      "..",
      "..",
      "client",
      "public",
      "assets",
      "img",
      "grocery",
      "grocery_items"
    );

    fs.readdir(imagesDir, (err, files) => {
      if (err) {
        console.error("Error reading grocery product images directory:", err);
        return res.status(500).json({ error: "Failed to get grocery product images" });
      }

      const imageFiles = files.filter(
        (file) =>
          file.endsWith(".jpg") ||
          file.endsWith(".jpeg") ||
          file.endsWith(".png") ||
          file.endsWith(".webp")
      );

      const imageUrls = imageFiles.map((file) => `/assets/img/grocery/grocery_items/${file}`);

      res.json({ images: imageUrls });
    });
  } catch (error) {
    console.error("Error getting grocery product images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
