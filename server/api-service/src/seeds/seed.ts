import { AppDataSource } from "../data-source";
import { Restaurant } from "../models/Restaurant";
import { FoodCategory } from "../models/FoodCategory";
import { FoodItem } from "../models/FoodItem";
import { User } from "../models/User";

// Function to ensure avatar column exists for all users
async function ensureUserAvatars() {
  console.log("Ensuring all users have avatar values...");

  try {
    // Check if there are any users without avatars
    const users = await AppDataSource.getRepository(User).find();

    // Set default avatar for users that don't have one
    for (const user of users) {
      if (!user.avatar) {
        user.avatar = "user-avatar-1.png";
        await AppDataSource.getRepository(User).save(user);
      }
    }

    console.log(`✅ Checked avatars for ${users.length} users`);
  } catch (error) {
    console.error("Error ensuring user avatars:", error);
  }
}

export async function seedDatabase() {
  try {
    // Only run seeds if tables are empty
    const restaurantCount = await AppDataSource.getRepository(
      Restaurant
    ).count();
    if (restaurantCount > 0) {
      console.log("🌱 Database already has data, skipping seed");
      return;
    }

    // 1. Seed Restaurants
    console.log("🌱 Starting database seeding...");
    const restaurants = [
      {
        name: "Burger Haven",
        description: "Gourmet burgers made with premium ingredients",
        deliveryFee: 3.99,
        estimatedDeliveryTime: "25-40 min",
        rating: 4.8,
        imageUrl: "assets/img/restaurants/fast_food-1.jpg",
        category: "Fast Food",
        isOpen24Hours: true, // Open 24h
      },
      {
        name: "Pizza Palace",
        description: "Authentic Italian pizzas with homemade sauce",
        deliveryFee: 2.99,
        estimatedDeliveryTime: "30-45 min",
        rating: 4.7,
        imageUrl: "assets/img/restaurants/pizza-1.jpg",
        category: "Pizza",
        isOpen24Hours: false,
        openingTime: "11:00",
        closingTime: "04:00",
      },
      {
        name: "Sushi Supreme",
        description: "Fresh, high-quality sushi and Japanese specialties",
        deliveryFee: 4.99,
        estimatedDeliveryTime: "35-50 min",
        rating: 4.9,
        imageUrl: "assets/img/restaurants/asian-1.jpg",
        category: "Asian",
        isOpen24Hours: false,
        openingTime: "11:00",
        closingTime: "22:00",
      },
      {
        name: "Taco Fiesta",
        description: "Authentic Mexican tacos and traditional dishes",
        deliveryFee: 3.49,
        estimatedDeliveryTime: "25-35 min",
        rating: 4.6,
        imageUrl: "assets/img/restaurants/mexican-1.jpg",
        category: "Mexican",
        isOpen24Hours: false,
        openingTime: "10:00",
        closingTime: "23:00",
      },
      {
        name: "Green Leaf",
        description: "Nutritious salads and health-focused meals",
        deliveryFee: 3.99,
        estimatedDeliveryTime: "20-30 min",
        rating: 4.5,
        imageUrl: "assets/img/restaurants/healthy-1.jpg",
        category: "Healthy",
        isOpen24Hours: false,
        openingTime: "07:00",
        closingTime: "21:00",
      },
      {
        name: "Sweet Treats",
        description: "Delicious desserts and sweet specialties",
        deliveryFee: 4.49,
        estimatedDeliveryTime: "25-35 min",
        rating: 4.7,
        imageUrl: "assets/img/restaurants/desserts-1.jpg",
        category: "Desserts",
        isOpen24Hours: false,
        openingTime: "10:00",
        closingTime: "22:00",
      },
      {
        name: "Pasta Paradise",
        description: "Homemade pasta dishes with authentic Italian recipes",
        deliveryFee: 3.79,
        estimatedDeliveryTime: "30-45 min",
        rating: 4.6,
        imageUrl: "assets/img/restaurants/italian-1.jpg",
        category: "Italian",
        isOpen24Hours: false,
        openingTime: "11:00",
        closingTime: "22:30",
      },
      {
        name: "Spice Route",
        description: "Flavorful Indian curries and specialties",
        deliveryFee: 4.29,
        estimatedDeliveryTime: "35-50 min",
        rating: 4.7,
        imageUrl: "assets/img/restaurants/indian-1.jpg",
        category: "Indian",
        isOpen24Hours: false,
        openingTime: "11:30",
        closingTime: "22:30",
      },
      {
        name: "Crispy Chicken",
        description: "Perfectly fried chicken with secret spice blend",
        deliveryFee: 3.49,
        estimatedDeliveryTime: "25-40 min",
        rating: 4.5,
        imageUrl: "assets/img/restaurants/fast_food-2.jpg",
        category: "Fast Food",
        isOpen24Hours: false,
        openingTime: "10:00",
        closingTime: "01:00",
      },
      {
        name: "Mediterranean Delight",
        description: "Authentic Mediterranean dishes with fresh ingredients",
        deliveryFee: 4.49,
        estimatedDeliveryTime: "30-45 min",
        rating: 4.8,
        imageUrl: "assets/img/restaurants/mediterranean-1.jpg",
        category: "Mediterranean",
        isOpen24Hours: false,
        openingTime: "11:00",
        closingTime: "22:00",
      },
      {
        name: "Wok Master",
        description: "Stir-fried Asian specialties with house-made sauces",
        deliveryFee: 3.99,
        estimatedDeliveryTime: "25-40 min",
        rating: 4.6,
        imageUrl: "assets/img/restaurants/asian-2.jpg",
        category: "Asian",
        isOpen24Hours: false,
        openingTime: "11:00",
        closingTime: "23:00",
      },
      {
        name: "BBQ Shack",
        description: "Slow-cooked barbecue meats with signature sauces",
        deliveryFee: 4.79,
        estimatedDeliveryTime: "35-50 min",
        rating: 4.8,
        imageUrl: "assets/img/restaurants/american-1.jpg",
        category: "American",
        isOpen24Hours: false,
        openingTime: "12:00",
        closingTime: "02:00",
      },
    ];

    const savedRestaurants = await AppDataSource.getRepository(Restaurant).save(
      restaurants
    );
    console.log(
      `✅ Seeded ${savedRestaurants.length} restaurants successfully`
    );

    // 2. Seed Food Categories - with specific IDs to match food items
    console.log("Seeding food categories...");

    const foodCategories = [
      { id: 1, name: "Burgers", restaurantId: 1 },
      { id: 2, name: "Sides", restaurantId: 1 },
      { id: 3, name: "Beverages", restaurantId: 1 },
      { id: 5, name: "Classic Pizzas", restaurantId: 2 },
      { id: 6, name: "Specialty Pizzas", restaurantId: 2 },
      { id: 7, name: "Sides", restaurantId: 2 },
      { id: 8, name: "Beverages", restaurantId: 2 },
      { id: 9, name: "Sushi", restaurantId: 3 },
      { id: 10, name: "Sashimi", restaurantId: 3 },
      { id: 11, name: "Appetizers", restaurantId: 3 },
      { id: 12, name: "Beverages", restaurantId: 3 },
      { id: 13, name: "Tacos", restaurantId: 4 },
      { id: 14, name: "Burritos", restaurantId: 4 },
      { id: 15, name: "Sides", restaurantId: 4 },
      { id: 16, name: "Beverages", restaurantId: 4 },
      { id: 17, name: "Salads", restaurantId: 5 },
      { id: 18, name: "Bowls", restaurantId: 5 },
      { id: 19, name: "Smoothies", restaurantId: 5 },
      { id: 20, name: "Beverages", restaurantId: 5 },
      { id: 21, name: "Cakes", restaurantId: 6 },
      { id: 22, name: "Ice Cream", restaurantId: 6 },
      { id: 23, name: "Cookies", restaurantId: 6 },
      { id: 24, name: "Beverages", restaurantId: 6 },
      { id: 25, name: "Pasta", restaurantId: 7 },
      { id: 26, name: "Risotto", restaurantId: 7 },
      { id: 27, name: "Appetizers", restaurantId: 7 },
      { id: 28, name: "Beverages", restaurantId: 7 },
      { id: 29, name: "Curries", restaurantId: 8 },
      { id: 30, name: "Tandoori", restaurantId: 8 },
      { id: 31, name: "Rice Dishes", restaurantId: 8 },
      { id: 32, name: "Beverages", restaurantId: 8 },
      { id: 33, name: "Chicken", restaurantId: 9 },
      { id: 34, name: "Sandwiches", restaurantId: 9 },
      { id: 35, name: "Sides", restaurantId: 9 },
      { id: 36, name: "Beverages", restaurantId: 9 },
      { id: 37, name: "Mezze", restaurantId: 10 },
      { id: 38, name: "Main Dishes", restaurantId: 10 },
      { id: 39, name: "Sides", restaurantId: 10 },
      { id: 40, name: "Beverages", restaurantId: 10 },
      { id: 41, name: "Noodles", restaurantId: 11 },
      { id: 42, name: "Rice Dishes", restaurantId: 11 },
      { id: 43, name: "Appetizers", restaurantId: 11 },
      { id: 44, name: "Beverages", restaurantId: 11 },
      { id: 45, name: "Ribs & Brisket", restaurantId: 12 },
      { id: 46, name: "Sandwiches", restaurantId: 12 },
      { id: 47, name: "Sides", restaurantId: 12 },
      { id: 49, name: "Beverages", restaurantId: 12 },
    ];

    // Use raw query - make sure IDs are preserved
    await AppDataSource.createQueryBuilder()
      .insert()
      .into(FoodCategory)
      .values(foodCategories)
      .execute();

    console.log(
      `✅ Seeded ${foodCategories.length} food categories successfully`
    );

    // 3. Seed Food Items
    console.log("Seeding food items...");

    const tsvData = `id	name	description	price	imageUrl	categoryId
1	Classic Burger	Beef patty with lettuce, tomato, onion, and our special sauce	8.99	assets/img/food_items/Burger.png	1
2	Cheese Burger	Beef patty with American cheese, lettuce, tomato, and our special sauce	9.99	assets/img/food_items/Burger.png	1
3	Bacon Burger	Beef patty with crispy bacon, lettuce, tomato, and our special sauce	10.99	assets/img/food_items/Burger.png	1
4	French Fries	Crispy golden fries with sea salt	3.99	assets/img/food_items/French-Fries.png	2
5	Onion Rings	Crispy battered onion rings	4.99	assets/img/food_items/Onion-Rings.png	2
6	Soft Drink	Choice of Coke, Diet Coke, Sprite, or Fanta	2.49	assets/img/food_items/Soda.png	3
7	Milkshake	Creamy milkshake in vanilla, chocolate, or strawberry	4.99	assets/img/food_items/Milkshake.png	3
8	Margherita	Fresh mozzarella, tomato sauce, and basil	12.99	assets/img/food_items/Pizza.png	5
9	Pepperoni	Pepperoni, mozzarella, and tomato sauce	14.99	assets/img/food_items/Pizza.png	5
10	Supreme	Pepperoni, sausage, bell peppers, onions, and olives	16.99	assets/img/food_items/Pizza.png	6
11	BBQ Chicken	Grilled chicken, BBQ sauce, red onion, and cilantro	16.99	assets/img/food_items/Pizza.png	6
12	Garlic Bread	Toasted bread with garlic butter and herbs	4.99	assets/img/food_items/Garlic-Bread.png	7
13	Caesar Salad	Romaine lettuce, croutons, parmesan, and Caesar dressing	6.99	assets/img/food_items/Salad.png	7
14	Soft Drink	Choice of Coke, Diet Coke, Sprite, or Fanta	2.49	assets/img/food_items/Soda.png	8
15	Bottled Water	Purified bottled water	1.99	assets/img/food_items/Soda.png	8
16	California Roll	Crab, avocado, and cucumber	8.99	assets/img/food_items/Sushi-Roll.png	9
17	Spicy Tuna Roll	Spicy tuna and cucumber	9.99	assets/img/food_items/Sushi-Roll.png	9
18	Dragon Roll	Eel, crab, and avocado	12.99	assets/img/food_items/Sushi-Roll.png	9
19	Salmon Sashimi	Fresh slices of salmon	14.99	assets/img/food_items/Sashimi.png	10
20	Tuna Sashimi	Fresh slices of tuna	15.99	assets/img/food_items/Sashimi.png	10
21	Edamame	Steamed soybeans with sea salt	4.99	assets/img/food_items/Edamame.png	11
22	Miso Soup	Traditional Japanese soybean paste soup	3.99	assets/img/food_items/Soup.png	11
23	Green Tea	Traditional Japanese green tea	2.49	assets/img/food_items/Coffee.png	12
24	Sake	Japanese rice wine, served warm or cold	7.99	assets/img/food_items/Soda.png	12
25	Carne Asada Taco	Grilled steak with onions, cilantro, and salsa	3.99	assets/img/food_items/Taco.png	13
26	Chicken Taco	Grilled chicken with lettuce, cheese, and pico de gallo	3.49	assets/img/food_items/Taco.png	13
27	Fish Taco	Battered fish with cabbage slaw and chipotle sauce	4.49	assets/img/food_items/Taco.png	13
28	Beef Burrito	Seasoned beef, rice, beans, cheese, and pico de gallo	8.99	assets/img/food_items/Burrito.png	14
29	Chicken Burrito	Grilled chicken, rice, beans, cheese, and pico de gallo	8.49	assets/img/food_items/Burrito.png	14
30	Chips & Salsa	Crispy tortilla chips with homemade salsa	3.99	assets/img/food_items/Chips-salca.png	15
31	Guacamole	Fresh avocado dip with lime and cilantro	4.99	assets/img/food_items/Chips-salca.png	15
32	Mexican Soda	Assorted Mexican sodas	2.99	assets/img/food_items/Soda.png	16
33	Horchata	Sweet rice drink with cinnamon	3.49	assets/img/food_items/Soda.png	16
34	Caesar Salad	Romaine lettuce, croutons, parmesan, and Caesar dressing	9.99	assets/img/food_items/Salad.png	17
35	Greek Salad	Mixed greens, feta, olives, tomatoes, and Greek dressing	10.99	assets/img/food_items/Salad.png	17
36	Cobb Salad	Mixed greens, chicken, bacon, egg, avocado, and blue cheese	12.99	assets/img/food_items/Salad.png	17
37	Quinoa Bowl	Quinoa, roasted vegetables, chickpeas, and tahini dressing	11.99	assets/img/food_items/Rice-Bowl.png	18
38	Buddha Bowl	Brown rice, avocado, sweet potato, edamame, and ginger dressing	12.99	assets/img/food_items/Rice-Bowl.png	18
39	Berry Blast	Strawberries, blueberries, banana, and almond milk	6.99	assets/img/food_items/Smoothie.png	19
40	Green Machine	Spinach, kale, apple, banana, and almond milk	6.99	assets/img/food_items/Smoothie.png	19
41	Sparkling Water	Refreshing sparkling water	2.49	assets/img/food_items/Soda.png	20
42	Kombucha	Fermented tea with probiotics	4.99	assets/img/food_items/Soda.png	20
43	Chocolate Cake	Rich chocolate cake with chocolate ganache	6.99	assets/img/food_items/Dessert.png	21
44	Cheesecake	Creamy New York style cheesecake	7.99	assets/img/food_items/Dessert.png	21
45	Red Velvet Cake	Red velvet cake with cream cheese frosting	6.99	assets/img/food_items/Dessert.png	21
46	Vanilla Ice Cream	Creamy vanilla bean ice cream	4.99	assets/img/food_items/Ice-Cream.png	22
47	Chocolate Ice Cream	Rich chocolate ice cream	4.99	assets/img/food_items/Ice-Cream.png	22
48	Chocolate Chip Cookie	Classic chocolate chip cookie	2.49	assets/img/food_items/Cookie.png	23
49	Double Chocolate Cookie	Double chocolate cookie with chocolate chips	2.99	assets/img/food_items/Cookie.png	23
50	Coffee	Freshly brewed coffee	2.99	assets/img/food_items/Coffee.png	24
51	Hot Chocolate	Rich hot chocolate with whipped cream	3.99	assets/img/food_items/Coffee.png	24
52	Spaghetti Bolognese	Spaghetti with rich meat sauce	13.99	assets/img/food_items/Pasta.png	25
53	Fettuccine Alfredo	Fettuccine with creamy Alfredo sauce	14.99	assets/img/food_items/Pasta.png	25
54	Lasagna	Layered pasta with meat sauce and cheese	15.99	assets/img/food_items/Pasta.png	25
55	Mushroom Risotto	Creamy arborio rice with wild mushrooms	14.99	assets/img/food_items/Risotto.png	26
56	Seafood Risotto	Creamy arborio rice with mixed seafood	17.99	assets/img/food_items/Risotto.png	26
57	Bruschetta	Toasted bread topped with tomatoes, garlic, and basil	6.99	assets/img/food_items/Bruschetta.png	27
58	Caprese Salad	Fresh mozzarella, tomatoes, and basil with balsamic glaze	8.99	assets/img/food_items/Bruschetta.png	27
59	Italian Soda	Flavored sparkling water with cream	3.99	assets/img/food_items/Soda.png	28
60	Espresso	Strong Italian coffee	2.99	assets/img/food_items/Coffee.png	28
61	Chicken Tikka Masala	Grilled chicken in a creamy tomato sauce	14.99	assets/img/food_items/Curry.png	29
62	Butter Chicken	Tender chicken in a rich buttery tomato sauce	15.99	assets/img/food_items/Curry.png	29
63	Vegetable Curry	Mixed vegetables in a flavorful curry sauce	12.99	assets/img/food_items/Curry.png	29
64	Chicken Tandoori	Marinated chicken cooked in a clay oven	15.99	assets/img/food_items/Tandoori.png	30
65	Seekh Kebab	Spiced ground meat skewers cooked in a clay oven	14.99	assets/img/food_items/Tandoori.png	30
66	Basmati Rice	Fragrant long-grain rice	3.99	assets/img/food_items/Biryani.png	31
67	Biryani	Fragrant rice dish with meat and spices	16.99	assets/img/food_items/Biryani.png	31
68	Mango Lassi	Yogurt drink with mango	3.99	assets/img/food_items/Smoothie.png	32
69	Masala Chai	Spiced Indian tea with milk	2.99	assets/img/food_items/Coffee.png	32
70	Fried Chicken - 2pc	Two pieces of our signature fried chicken	6.99	assets/img/food_items/Fried-Chicken.png	33
71	Fried Chicken - 4pc	Four pieces of our signature fried chicken	12.99	assets/img/food_items/Fried-Chicken.png	33
72	Chicken Tenders	Crispy chicken tenders with dipping sauce	8.99	assets/img/food_items/Chicken-Tenders.png	33
73	Chicken Sandwich	Crispy chicken with lettuce, tomato, and mayo	7.99	assets/img/food_items/Sandwich.png	34
74	Spicy Chicken Sandwich	Spicy crispy chicken with lettuce, tomato, and spicy mayo	8.49	assets/img/food_items/Sandwich.png	34
75	French Fries	Crispy golden fries with sea salt	3.99	assets/img/food_items/French-Fries.png	35
76	Coleslaw	Creamy cabbage and carrot slaw	2.99	assets/img/food_items/Coleslaw.png	35
77	Soft Drink	Choice of Coke, Diet Coke, Sprite, or Fanta	2.49	assets/img/food_items/Soda.png	36
78	Sweet Tea	Southern-style sweet iced tea	2.99	assets/img/food_items/Soda.png	36
79	Hummus	Chickpea dip with olive oil and pita bread	6.99	assets/img/food_items/Hummus.png	37
80	Baba Ganoush	Roasted eggplant dip with pita bread	7.99	assets/img/food_items/Hummus.png	37
81	Falafel	Crispy chickpea fritters with tahini sauce	6.99	assets/img/food_items/Hummus.png	37
82	Chicken Shawarma	Marinated chicken with garlic sauce and pickles	13.99	assets/img/food_items/Shawarma.png	38
83	Lamb Gyro	Sliced lamb with tzatziki, tomatoes, and onions	14.99	assets/img/food_items/Shawarma.png	38
84	Greek Salad	Mixed greens, feta, olives, tomatoes, and Greek dressing	8.99	assets/img/food_items/Salad.png	39
85	Rice Pilaf	Seasoned rice with vegetables	3.99	assets/img/food_items/Biryani.png	39
86	Turkish Coffee	Strong, unfiltered coffee	3.49	assets/img/food_items/Coffee.png	40
87	Mint Tea	Fresh mint tea	2.99	assets/img/food_items/Coffee.png	40
88	Pad Thai	Rice noodles with egg, tofu, bean sprouts, and peanuts	13.99	assets/img/food_items/Asian-Noodles.png	41
89	Lo Mein	Stir-fried noodles with vegetables and choice of protein	12.99	assets/img/food_items/Asian-Noodles.png	41
90	Singapore Noodles	Thin rice noodles with curry flavor and vegetables	14.99	assets/img/food_items/Asian-Noodles.png	41
91	Fried Rice	Stir-fried rice with vegetables and choice of protein	11.99	assets/img/food_items/Fried-Rice.png	42
92	Teriyaki Rice Bowl	Steamed rice with teriyaki sauce and choice of protein	12.99	assets/img/food_items/Fried-Rice.png	42
93	Spring Rolls	Vegetable spring rolls with sweet chili sauce	5.99	assets/img/food_items/Spring-Rolls.png	43
94	Crab Rangoon	Cream cheese and crab filled wontons	6.99	assets/img/food_items/Spring-Rolls.png	43
95	Jasmine Tea	Fragrant jasmine green tea	2.49	assets/img/food_items/Coffee.png	44
96	Thai Iced Tea	Sweet and creamy Thai tea	3.99	assets/img/food_items/Coffee.png	44
105	Texas-Style Beef Brisket	Slow-smoked for 14 hours with our secret spice rub, sliced to order	18.99	assets/img/food_items/BBQ-Meat.png	45
106	St. Louis Ribs	Fall-off-the-bone tender pork ribs with our signature BBQ sauce	16.99	assets/img/food_items/BBQ-Meat.png	45
107	Smoked Chicken	Half chicken smoked to perfection with our house dry rub	14.99	assets/img/food_items/Fried-Chicken.png	45
108	BBQ Combo Platter	Your choice of any two meats with two sides	24.99	assets/img/food_items/BBQ-Meat.png	45
109	Pulled Pork Sandwich	Slow-smoked pulled pork topped with coleslaw on a brioche bun	12.99	assets/img/food_items/Sandwich.png	46
110	Brisket Sandwich	Tender sliced brisket with pickles and onions on Texas toast	14.99	assets/img/food_items/Sandwich.png	46
111	BBQ Chicken Sandwich	Smoked chicken with BBQ sauce and crispy onions on a toasted bun	11.99	assets/img/food_items/Sandwich.png	46
112	Burnt Ends Sandwich	Caramelized brisket ends with tangy sauce on a potato roll	15.99	assets/img/food_items/Sandwich.png	46
113	Mac & Cheese	Creamy three-cheese blend with a crispy breadcrumb topping	5.99	assets/img/food_items/Mac-Cheese.png	47
114	Baked Beans	Slow-cooked with bacon, brown sugar, and a hint of bourbon	4.99	assets/img/food_items/Baked-Beans.png	47
115	Coleslaw	Crisp cabbage with our tangy house-made dressing	3.99	assets/img/food_items/Coleslaw.png	47
116	French Fries	Hand-cut potatoes fried to golden perfection	4.49	assets/img/food_items/French-Fries.png	47
117	Onion Rings	Thick-cut onions in a crunchy batter, fried golden brown	5.49	assets/img/food_items/Onion-Rings.png	47
118	Sweet Tea	Southern-style sweet tea, brewed fresh daily	2.99	assets/img/food_items/Coffee.png	49
119	Soft Drinks	Coca-Cola, Diet Coke, Sprite, Dr. Pepper, or Root Beer	2.79	assets/img/food_items/Soda.png	49
120	Classic Milkshake	Hand-spun vanilla, chocolate, or strawberry shake	5.99	assets/img/food_items/Milkshake.png	49
121	Fresh Fruit Smoothie	Blended seasonal fruits with a hint of honey	4.99	assets/img/food_items/Smoothie.png	49`;

    // Process the TSV data to create food items
    const foodItems = tsvData
      .split("\n")
      .filter((line) => line.trim() && !line.startsWith("id")) // Skip header and empty lines
      .map((line) => {
        const [id, name, description, price, imageUrl, categoryId] =
          line.split("\t");
        // Verify we have all required data
        if (name && description && price && imageUrl && categoryId) {
          return {
            name,
            description,
            price: parseFloat(price),
            imageUrl,
            categoryId: parseInt(categoryId),
          };
        }
        return null;
      })
      .filter((item) => item !== null); // Remove any invalid entries

    // Save all food items
    const savedFoodItems = await AppDataSource.getRepository(FoodItem).save(
      foodItems
    );
    console.log(`✅ Seeded ${savedFoodItems.length} food items successfully`);

    // Ensure all users have an avatar
    await ensureUserAvatars();

    console.log("🌱 Database seeding completed successfully!");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
