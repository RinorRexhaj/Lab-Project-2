import { AppDataSource } from "../data-source";
import { GroceryStore } from "../models/GroceryStore";
import { GroceryCategory } from "../models/GroceryCategory";
import { GroceryProduct } from "../models/GroceryProduct";

export async function seedGroceryStores() {
  const groceryStoreRepository = AppDataSource.getRepository(GroceryStore);
  const groceryCategoryRepository = AppDataSource.getRepository(GroceryCategory);
  const groceryProductRepository = AppDataSource.getRepository(GroceryProduct);

  // Check if data already exists
  const existingStores = await groceryStoreRepository.count();
  if (existingStores > 0) {
    console.log("📝 Grocery stores already seeded");
    return;
  }

  console.log("🌱 Seeding grocery stores...");

  try {
    // Create Fresh Market
    const freshMarket = groceryStoreRepository.create({
      name: "Fresh Market",
      imageUrl: "https://placehold.co/600x400/81c784/FFFFFF/png?text=Fresh+Market",
      description: "Premium grocery store with a wide selection of fresh produce, meats, and specialty items",
      deliveryFee: 3.99,
      estimatedDeliveryTime: "25-40 min",
      rating: 4.8,
      category: "Supermarket",
      openingTime: "08:00",
      closingTime: "22:00",
      isOpen24Hours: false,
    });
    await groceryStoreRepository.save(freshMarket);

    // Create categories and products for Fresh Market
    // Fruits & Vegetables Category
    const fruitsVeggies = groceryCategoryRepository.create({
      name: "Fruits & Vegetables",
      store: freshMarket,
    });
    await groceryCategoryRepository.save(fruitsVeggies);

    // Add products to Fruits & Vegetables
    const fruitsVeggiesProducts = [
      {
        name: "Organic Bananas",
        description: "Bunch of organic bananas, approximately 5-7 pieces",
        price: 2.99,
        imageUrl: "https://placehold.co/200x200/FFE135/FFFFFF/png?text=Bananas",
        unit: "bunch",
        inStock: true,
      },
      {
        name: "Fresh Strawberries",
        description: "Sweet and juicy strawberries, perfect for snacking or desserts",
        price: 4.99,
        imageUrl: "https://placehold.co/200x200/E30B5C/FFFFFF/png?text=Strawberries",
        weight: "1 lb",
        inStock: true,
      },
      {
        name: "Avocados",
        description: "Ripe Hass avocados, ready to eat",
        price: 2.49,
        imageUrl: "https://placehold.co/200x200/2E8B57/FFFFFF/png?text=Avocados",
        unit: "each",
        inStock: true,
      },
      {
        name: "Organic Baby Spinach",
        description: "Fresh organic baby spinach, pre-washed and ready to eat",
        price: 3.99,
        imageUrl: "https://placehold.co/200x200/175732/FFFFFF/png?text=Spinach",
        weight: "5 oz",
        inStock: true,
      },
      {
        name: "Red Bell Peppers",
        description: "Sweet red bell peppers, great for salads or cooking",
        price: 1.79,
        imageUrl: "https://placehold.co/200x200/ED2939/FFFFFF/png?text=Peppers",
        unit: "each",
        inStock: false,
      },
    ];

    for (const productData of fruitsVeggiesProducts) {
      const product = groceryProductRepository.create({
        ...productData,
        category: fruitsVeggies,
      });
      await groceryProductRepository.save(product);
    }

    // Dairy & Eggs Category
    const dairyEggs = groceryCategoryRepository.create({
      name: "Dairy & Eggs",
      store: freshMarket,
    });
    await groceryCategoryRepository.save(dairyEggs);

    // Add products to Dairy & Eggs
    const dairyEggsProducts = [
      {
        name: "Organic Whole Milk",
        description: "Grade A organic whole milk from grass-fed cows",
        price: 4.49,
        imageUrl: "https://placehold.co/200x200/FFFFFF/000000/png?text=Milk",
        weight: "1 gallon",
        inStock: true,
      },
      {
        name: "Large Brown Eggs",
        description: "Farm-fresh large brown eggs from free-range chickens",
        price: 5.99,
        imageUrl: "https://placehold.co/200x200/E2C88A/000000/png?text=Eggs",
        unit: "dozen",
        inStock: true,
      },
      {
        name: "Greek Yogurt",
        description: "Plain Greek yogurt, high in protein and perfect for breakfast",
        price: 3.49,
        imageUrl: "https://placehold.co/200x200/F5F5F5/000000/png?text=Yogurt",
        weight: "32 oz",
        inStock: true,
      },
      {
        name: "Cheddar Cheese Block",
        description: "Sharp cheddar cheese, aged for 12 months",
        price: 6.99,
        imageUrl: "https://placehold.co/200x200/FFB90F/000000/png?text=Cheese",
        weight: "8 oz",
        inStock: false,
      },
    ];

    for (const productData of dairyEggsProducts) {
      const product = groceryProductRepository.create({
        ...productData,
        category: dairyEggs,
      });
      await groceryProductRepository.save(product);
    }

    // Bakery Category
    const bakery = groceryCategoryRepository.create({
      name: "Bakery",
      store: freshMarket,
    });
    await groceryCategoryRepository.save(bakery);

    // Add products to Bakery
    const bakeryProducts = [
      {
        name: "Artisan Sourdough Bread",
        description: "Freshly baked sourdough bread with a crispy crust",
        price: 4.99,
        imageUrl: "https://placehold.co/200x200/D2691E/FFFFFF/png?text=Bread",
        unit: "loaf",
        inStock: true,
      },
      {
        name: "Blueberry Muffins",
        description: "Freshly baked blueberry muffins made with real blueberries",
        price: 5.99,
        imageUrl: "https://placehold.co/200x200/9370DB/FFFFFF/png?text=Muffins",
        unit: "pack of 4",
        inStock: true,
      },
      {
        name: "Chocolate Chip Cookies",
        description: "Soft and chewy chocolate chip cookies, baked fresh daily",
        price: 3.99,
        imageUrl: "https://placehold.co/200x200/CD853F/FFFFFF/png?text=Cookies",
        unit: "pack of 6",
        inStock: true,
      },
    ];

    for (const productData of bakeryProducts) {
      const product = groceryProductRepository.create({
        ...productData,
        category: bakery,
      });
      await groceryProductRepository.save(product);
    }

    // Create City Market
    const cityMarket = groceryStoreRepository.create({
      name: "City Market",
      imageUrl: "https://placehold.co/600x400/42a5f5/FFFFFF/png?text=City+Market",
      description: "Your neighborhood grocery store with affordable prices and friendly service",
      deliveryFee: 2.99,
      estimatedDeliveryTime: "30-45 min",
      rating: 4.3,
      category: "Supermarket",
      openingTime: "07:00",
      closingTime: "23:00",
      isOpen24Hours: false,
    });
    await groceryStoreRepository.save(cityMarket);

    // Create categories and products for City Market
    // Fruits & Vegetables Category for City Market
    const cityFruitsVeggies = groceryCategoryRepository.create({
      name: "Fruits & Vegetables",
      store: cityMarket,
    });
    await groceryCategoryRepository.save(cityFruitsVeggies);

    const cityFruitsVeggiesProducts = [
      {
        name: "Apples",
        description: "Fresh Gala apples, sweet and crisp",
        price: 1.99,
        imageUrl: "https://placehold.co/200x200/FF0800/FFFFFF/png?text=Apples",
        unit: "lb",
        inStock: true,
      },
      {
        name: "Carrots",
        description: "Fresh organic carrots, perfect for snacking or cooking",
        price: 2.49,
        imageUrl: "https://placehold.co/200x200/FF7F00/FFFFFF/png?text=Carrots",
        weight: "2 lb",
        inStock: true,
      },
    ];

    for (const productData of cityFruitsVeggiesProducts) {
      const product = groceryProductRepository.create({
        ...productData,
        category: cityFruitsVeggies,
      });
      await groceryProductRepository.save(product);
    }

    // Meat & Seafood Category for City Market
    const meatSeafood = groceryCategoryRepository.create({
      name: "Meat & Seafood",
      store: cityMarket,
    });
    await groceryCategoryRepository.save(meatSeafood);

    const meatSeafoodProducts = [
      {
        name: "Ground Beef",
        description: "80/20 ground beef, perfect for burgers or meatballs",
        price: 5.99,
        imageUrl: "https://placehold.co/200x200/8B0000/FFFFFF/png?text=Ground+Beef",
        weight: "1 lb",
        inStock: true,
      },
      {
        name: "Chicken Breast",
        description: "Boneless, skinless chicken breast",
        price: 6.99,
        imageUrl: "https://placehold.co/200x200/F5F5DC/000000/png?text=Chicken",
        weight: "1 lb",
        inStock: false,
      },
    ];

    for (const productData of meatSeafoodProducts) {
      const product = groceryProductRepository.create({
        ...productData,
        category: meatSeafood,
      });
      await groceryProductRepository.save(product);
    }

    // Create additional grocery stores
    const additionalStores = [
      {
        name: "Organic Harvest",
        imageUrl: "https://placehold.co/600x400/66bb6a/FFFFFF/png?text=Organic+Harvest",
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
        imageUrl: "https://placehold.co/600x400/f44336/FFFFFF/png?text=QuickMart",
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
        imageUrl: "https://placehold.co/600x400/ffb300/000000/png?text=Global+Foods",
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
        imageUrl: "https://placehold.co/600x400/7e57c2/FFFFFF/png?text=24/7+Grocery",
        description: "Always open, always stocked with everything you need day or night",
        deliveryFee: 3.99,
        estimatedDeliveryTime: "20-35 min",
        rating: 4.2,
        category: "Convenience",
        isOpen24Hours: true,
      },
    ];

    for (const storeData of additionalStores) {
      const store = groceryStoreRepository.create(storeData);
      await groceryStoreRepository.save(store);
    }

    console.log("✅ Grocery store seed completed successfully");
  } catch (error) {
    console.error("❌ Error seeding grocery stores:", error);
  }
}
