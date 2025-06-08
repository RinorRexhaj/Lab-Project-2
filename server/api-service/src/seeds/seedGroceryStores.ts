import { AppDataSource } from "../data-source";
import { GroceryStore } from "../models/GroceryStore";
import { GroceryCategory } from "../models/GroceryCategory";
import { GroceryProduct } from "../models/GroceryProduct";

export async function seedGroceryStores() {
  try {
    // Check if grocery stores already exist
    const groceryStoreCount = await AppDataSource.getRepository(GroceryStore).count();
    if (groceryStoreCount > 0) {
      console.log("🏪 Grocery stores already seeded, skipping...");
      return;
    }

    console.log("🌱 Seeding grocery stores...");

    // 1. Seed Grocery Stores
    const groceryStores = [
      {
        name: "Fresh Market",
        imageUrl: "/assets/img/grocery/24-7-market.jpg",
        description: "Premium grocery store with a wide selection of fresh produce, meats, and specialty items",
        deliveryFee: 3.99,
        estimatedDeliveryTime: "25-40 min",
        rating: 4.8,
        category: "Supermarket",
        openingTime: "08:00",
        closingTime: "22:00",
        isOpen24Hours: false,
      },
      {
        name: "Organic Harvest",
        imageUrl: "/assets/img/grocery/organic-harvest.jpg",
        description: "Specializing in organic and locally sourced produce and products",
        deliveryFee: 4.99,
        estimatedDeliveryTime: "35-50 min",
        rating: 4.7,
        category: "Organic",
        openingTime: "09:00",
        closingTime: "20:00",
        isOpen24Hours: false,
      },
      {
        name: "QuickMart",
        imageUrl: "/assets/img/grocery/quickmart.png",
        description: "Convenience store with all the essentials, open late for your last-minute needs",
        deliveryFee: 1.99,
        estimatedDeliveryTime: "15-25 min",
        rating: 4.1,
        category: "Convenience",
        openingTime: "06:00",
        closingTime: "01:00",
        isOpen24Hours: false,
      },
      {
        name: "Global Foods",
        imageUrl: "/assets/img/grocery/global-food.jpg",
        description: "International grocery store featuring products from around the world",
        deliveryFee: 3.49,
        estimatedDeliveryTime: "40-55 min",
        rating: 4.5,
        category: "International",
        openingTime: "08:30",
        closingTime: "21:30",
        isOpen24Hours: false,
      },
      {
        name: "24/7 Grocery",
        imageUrl: "/assets/img/grocery/24-7-market.jpg",
        description: "Always open, always stocked with everything you need day or night",
        deliveryFee: 3.99,
        estimatedDeliveryTime: "20-35 min",
        rating: 4.2,
        category: "Convenience",
        isOpen24Hours: true,
      },
    ];

    const savedStores = await AppDataSource.getRepository(GroceryStore).save(groceryStores);
    console.log(`✅ Seeded ${savedStores.length} grocery stores successfully`);

    // 2. Seed Grocery Categories
    console.log("🗂️ Seeding grocery categories...");

    const groceryCategories = [
      // Fresh Market categories
      { name: "Fruits & Vegetables", storeId: 1 },
      { name: "Dairy & Eggs", storeId: 1 },
      { name: "Bakery", storeId: 1 },
      { name: "Meat & Seafood", storeId: 1 },
      
      // Organic Harvest categories
      { name: "Organic Produce", storeId: 2 },
      { name: "Organic Dairy", storeId: 2 },
      { name: "Natural Products", storeId: 2 },
      
      // QuickMart categories
      { name: "Snacks", storeId: 3 },
      { name: "Beverages", storeId: 3 },
      { name: "Ready Meals", storeId: 3 },
      
      // Global Foods categories
      { name: "Asian Foods", storeId: 4 },
      { name: "European Products", storeId: 4 },
      { name: "Spices & Seasonings", storeId: 4 },
      
      // 24/7 Grocery categories
      { name: "Essentials", storeId: 5 },
      { name: "Frozen Foods", storeId: 5 },
      { name: "Household Items", storeId: 5 },
    ];

    const savedCategories = await AppDataSource.getRepository(GroceryCategory).save(groceryCategories);
    console.log(`✅ Seeded ${savedCategories.length} grocery categories successfully`);

    // 3. Seed Grocery Products
    console.log("🛒 Seeding grocery products...");

    const groceryProducts = [
      // Fresh Market - Fruits & Vegetables (categoryId: 1)
      {
        name: "Organic Bananas",
        description: "Bunch of organic bananas, approximately 5-7 pieces",
        price: 2.99,
        imageUrl: "/assets/img/grocery/grocery_items/banana.jpg",
        categoryId: 1,
        unit: "bunch",
        inStock: true
      },
      {
        name: "Fresh Strawberries",
        description: "Sweet and juicy strawberries, perfect for snacking or desserts",
        price: 4.99,
        imageUrl: "/assets/img/grocery/grocery_items/strawberry.jpg",
        categoryId: 1,
        weight: "1 lb",
        inStock: true
      },
      {
        name: "Avocados",
        description: "Ripe Hass avocados, ready to eat",
        price: 2.49,
        imageUrl: "/assets/img/grocery/grocery_items/avocado.jpg",
        categoryId: 1,
        unit: "each",
        inStock: true
      },
      {
        name: "Organic Baby Spinach",
        description: "Fresh organic baby spinach, pre-washed and ready to eat",
        price: 3.99,
        imageUrl: "/assets/img/grocery/grocery_items/spinach.jpg",
        categoryId: 1,
        weight: "5 oz",
        inStock: true
      },
      {
        name: "Red Bell Peppers",
        description: "Sweet red bell peppers, great for salads or cooking",
        price: 1.79,
        imageUrl: "/assets/img/grocery/grocery_items/red-bell.jpg",
        categoryId: 1,
        unit: "each",
        inStock: false
      },

      // Fresh Market - Dairy & Eggs (categoryId: 2)
      {
        name: "Organic Whole Milk",
        description: "Grade A organic whole milk from grass-fed cows",
        price: 4.49,
        imageUrl: "/assets/img/grocery/grocery_items/milk.jpg",
        categoryId: 2,
        weight: "1 gallon",
        inStock: true
      },
      {
        name: "Large Brown Eggs",
        description: "Farm-fresh large brown eggs from free-range chickens",
        price: 5.99,
        imageUrl: "/assets/img/grocery/grocery_items/eggs.jpg",
        categoryId: 2,
        unit: "dozen",
        inStock: true
      },
      {
        name: "Greek Yogurt",
        description: "Plain Greek yogurt, high in protein and perfect for breakfast",
        price: 3.49,
        imageUrl: "/assets/img/grocery/grocery_items/yogurt.jpg",
        categoryId: 2,
        weight: "32 oz",
        inStock: true
      },
      {
        name: "Cheddar Cheese Block",
        description: "Sharp cheddar cheese, aged for 12 months",
        price: 6.99,
        imageUrl: "/assets/img/grocery/grocery_items/cheddar.jpg",
        categoryId: 2,
        weight: "8 oz",
        inStock: false
      },

      // Fresh Market - Bakery (categoryId: 3)
      {
        name: "Artisan Sourdough Bread",
        description: "Freshly baked sourdough bread with a crispy crust",
        price: 4.99,
        imageUrl: "/assets/img/grocery/grocery_items/bread.jpg",
        categoryId: 3,
        unit: "loaf",
        inStock: true
      },
      {
        name: "Blueberry Muffins",
        description: "Freshly baked blueberry muffins made with real blueberries",
        price: 5.99,
        imageUrl: "/assets/img/grocery/grocery_items/muffin.jpg",
        categoryId: 3,
        unit: "pack of 4",
        inStock: true
      },
      {
        name: "Chocolate Chip Cookies",
        description: "Soft and chewy chocolate chip cookies, baked fresh daily",
        price: 3.99,
        imageUrl: "/assets/img/grocery/grocery_items/cookies.jpg",
        categoryId: 3,
        unit: "pack of 6",
        inStock: true
      },

      // Organic Harvest - Organic Produce (categoryId: 5)
      {
        name: "Organic Kale",
        description: "Fresh organic kale, perfect for smoothies and salads",
        price: 2.99,
        imageUrl: "/assets/img/grocery/grocery_items/kale.jpg",
        categoryId: 5,
        weight: "1 bunch",
        inStock: true
      },
      {
        name: "Organic Carrots",
        description: "Sweet organic carrots, great for snacking or cooking",
        price: 2.49,
        imageUrl: "/assets/img/grocery/grocery_items/carrots.jpg",
        categoryId: 5,
        weight: "2 lb bag",
        inStock: true
      },

      // QuickMart - Snacks (categoryId: 8)
      {
        name: "Potato Chips",
        description: "Crispy potato chips, classic salted flavor",
        price: 2.99,
        imageUrl: "/assets/img/grocery/grocery_items/chips.jpg",
        categoryId: 8,
        weight: "6 oz",
        inStock: true
      },
      {
        name: "Mixed Nuts",
        description: "Premium mixed nuts with almonds, cashews, and peanuts",
        price: 5.99,
        imageUrl: "/assets/img/grocery/grocery_items/nuts.jpg",
        categoryId: 8,
        weight: "8 oz",
        inStock: true
      },

      // QuickMart - Beverages (categoryId: 9)
      {
        name: "Energy Drink",
        description: "Popular energy drink to keep you energized",
        price: 2.49,
        imageUrl: "/assets/img/grocery/grocery_items/energy-drink.jpg",
        categoryId: 9,
        weight: "16 fl oz",
        inStock: true
      },
      {
        name: "Bottled Water",
        description: "Pure spring water in convenient bottles",
        price: 1.99,
        imageUrl: "/assets/img/grocery/grocery_items/water.jpg",
        categoryId: 9,
        weight: "24 pack",
        inStock: true
      },
    ];

    const savedProducts = await AppDataSource.getRepository(GroceryProduct).save(groceryProducts);
    console.log(`✅ Seeded ${savedProducts.length} grocery products successfully`);

    console.log("🏪 Grocery store seeding completed successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding grocery stores:", error);
    throw error;
  }
}
