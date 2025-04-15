import React, { useEffect, useState } from "react";
import { restaurantService } from "../api/RestaurantService";
import { Restaurant } from "../types/restaurant/Restaurant";
import RestaurantCard from "../components/Restaurant/RestaurantCard";
import FoodOrderModal from "../components/Restaurant/FoodOrderModal";
import useApi from "../hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const EatPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const { loading, error } = useApi();

  useEffect(() => {
    fetchRestaurants(selectedCategory);
  }, [selectedCategory]);

  const fetchRestaurants = async (category: string = "All") => {
    try {
      const data = await restaurantService.getAllRestaurants(category);
      setRestaurants(data);
    } catch (error) {
      console.error("Failed to fetch restaurants:", error);
    }
  };

  const handleRestaurantClick = async (restaurant: Restaurant) => {
    try {
      // Fetch restaurant with menu details
      const restaurantWithMenu = await restaurantService.getRestaurantWithMenu(restaurant.id);
      setSelectedRestaurant(restaurantWithMenu);
      setModalOpen(true);
    } catch (error) {
      console.error("Failed to fetch restaurant details:", error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedRestaurant(null);
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    restaurant.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 pb-16 bg-gray-50 min-h-screen">

      <div className="mb-10 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white p-6 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold mb-2">Food Delivery</h1>
        <p className="text-emerald-100">Order delicious food from your favorite restaurants</p>
      </div>
      
      {/* Search Bar */}
      <div className="relative mb-8">
        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white shadow-sm">
          <FontAwesomeIcon icon={faSearch} className="ml-4 text-emerald-500" />
          <input
            type="text"
            placeholder="Search restaurants or cuisines..."
            className="w-full py-3 px-3 focus:outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {/* Popular Categories */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Popular Categories</h2>
        <div className="flex overflow-x-auto pb-2 -mx-2 hide-scrollbar">
          {['All', 'Fast Food', 'Pizza', 'Asian', 'Mexican', 'Healthy', 'Desserts'].map(category => (
            <div key={category} className="px-2">
              <div 
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full cursor-pointer transition-colors ${category === selectedCategory ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}
              >
                {category}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <h2 className="text-xl font-semibold mb-4">All Restaurants</h2>
      
      {/* Restaurant Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading restaurants...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-lg text-red-600">Error loading restaurants. Please try again.</p>
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No restaurants found matching your search criteria.</p>
        </div>
      ) : (
        <div className="flex flex-wrap -mx-3">
          {filteredRestaurants.map((restaurant) => (
            <div 
              key={restaurant.id} 
              className="w-1/3 px-3 mb-6 tb:w-1/2 sm:w-full"
            >
              <RestaurantCard
                restaurant={restaurant}
                onClick={() => handleRestaurantClick(restaurant)}
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Order Modal */}
      {modalOpen && selectedRestaurant && (
        <FoodOrderModal restaurant={selectedRestaurant} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default EatPage;
