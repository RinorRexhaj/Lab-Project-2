# Groceries Page Documentation

## Overview

The Groceries page is a key component of the Lab-Project-2 application, allowing users to:

- Browse grocery stores by category
- Filter stores by availability (open/closed)
- Sort stores based on different criteria (rating, delivery time, delivery fee)
- Search for stores and grocery products
- View a store's product catalog organized by categories
- Add products to a shopping cart
- Place orders for grocery delivery

## Technical Implementation

### Frontend Components

1. **GroceriesPage** - Main page component with store listing and filters
2. **GroceryStoreCard** - Card component for displaying store information
3. **GroceryOrderModal** - Modal for viewing store products and placing orders
4. **GroceryProductItem** - Component for displaying individual products

### Backend Components

1. **GroceryController** - Handles API requests for grocery stores and products
2. **GroceryOrderController** - Handles API requests for grocery orders
3. **GroceryStoreRepo** - Repository for grocery store database operations
4. **GroceryOrderRepo** - Repository for grocery order database operations

### Database Models

1. **GroceryStore** - Represents a grocery store
2. **GroceryCategory** - Represents a product category in a store
3. **GroceryProduct** - Represents an individual grocery product
4. **GroceryOrder** - Represents a customer's grocery order
5. **GroceryOrderItem** - Represents an item in a grocery order

## API Endpoints

### Grocery Stores

- `GET /grocery` - Get all grocery stores
- `GET /grocery?category={category}` - Get stores filtered by category
- `GET /grocery/:id/products` - Get a store with its products
- `POST /grocery` - Create a new grocery store (admin only)
- `POST /grocery/:storeId/categories` - Create a product category (admin only)
- `POST /grocery/categories/:categoryId/products` - Create a product (admin only)

### Grocery Orders

- `POST /grocery-order` - Create a new grocery order
- `GET /grocery-order/history` - Get order history for the current user

## How to Add Data

You can add grocery store data in two ways:

1. **Automatically via Seed Script:** The database will be automatically seeded with grocery store data when the application starts, if the grocery store tables are empty.

2. **Manually via Postman:** You can use the provided Postman collection (`GroceryStoreApiCollection.json`) to manually add grocery stores, categories, and products.

   a. Import the collection into Postman
   b. Set up a Postman environment with a `baseUrl` variable (e.g., `http://localhost:5000`)
   c. Login as admin to get an auth token
   d. Use the provided endpoints to create stores, categories, and products

## User Flow

1. **Browse Stores:** Users can browse grocery stores on the Groceries page
2. **Filter and Search:** Users can filter stores by category, search for stores, and sort results
3. **View Store Products:** Clicking on a store opens a modal with product categories and items
4. **Add to Cart:** Users can add products to their cart, adjust quantities, and add special instructions
5. **Checkout:** Users can place an order for delivery after reviewing their cart

## Integration with Existing Application

The Groceries page is integrated into the main application in the following ways:

1. **Navigation:** Added to the navbar for easy access
2. **Routing:** Added to the AppRouter component at the path `/groceries`
3. **Authentication:** Uses the same authentication system as the rest of the application
4. **Styling:** Uses the same Tailwind CSS styling and follows the same design patterns

## UI/UX Considerations

1. **Responsive Design:** The Groceries page is fully responsive and works on mobile devices
2. **Consistent Styling:** Uses the same emerald color scheme as the rest of the application
3. **User Feedback:** Provides loading states, error handling, and empty state messages
4. **Intuitive Navigation:** Clear categories and filters make it easy to find products
5. **Seamless Shopping Experience:** Simple and intuitive cart and checkout process
