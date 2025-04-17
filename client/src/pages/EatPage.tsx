import React, { useEffect, useState, useRef } from "react";
import { restaurantService } from "../api/RestaurantService";
import { Restaurant } from "../types/restaurant/Restaurant";
import RestaurantCard from "../components/Restaurant/RestaurantCard";
import FoodOrderModal from "../components/Restaurant/FoodOrderModal";
import useApi from "../hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faDoorOpen, faDoorClosed, faSort, faStar, faClock, faMoneyBill, faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";
import { isRestaurantOpen } from "../utils/restaurant/isRestaurantOpen";

const EatPage: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("none");
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { loading, error } = useApi();

  useEffect(() => {
    fetchRestaurants(selectedCategory);
  }, [selectedCategory]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim() !== "") {
      // Generate suggestions based on restaurant names and categories
      const suggestions = restaurants
        .filter(r => 
          r.name.toLowerCase().includes(value.toLowerCase()) || 
          (r.category && r.category.toLowerCase().includes(value.toLowerCase()))
        )
        .map(r => r.name)
        .slice(0, 5);
      
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== "") {
      // Add to search history
      if (!searchHistory.includes(searchQuery)) {
        setSearchHistory(prev => [searchQuery, ...prev].slice(0, 5));
      }
      setShowSuggestions(false);
    }
  };

  const applySorting = (restaurants: Restaurant[]): Restaurant[] => {
    switch (sortBy) {
      case "rating":
        return [...restaurants].sort((a, b) => b.rating - a.rating);
      case "delivery-time":
        return [...restaurants].sort((a, b) => {
          // Extract the first number from the delivery time
          const getMinTime = (time: string) => {
            const match = time.match(/\d+/);
            return match ? parseInt(match[0]) : 999;
          };
          return getMinTime(a.estimatedDeliveryTime) - getMinTime(b.estimatedDeliveryTime);
        });
      case "delivery-fee":
        return [...restaurants].sort((a, b) => a.deliveryFee - b.deliveryFee);
      default:
        return restaurants;
    }
  };

  const toggleMobileFilters = () => {
    setMobileFiltersOpen(!mobileFiltersOpen);
  };

  // First filter restaurants based on search, category, and availability
  const filteredRestaurants = restaurants.filter(restaurant => {
    // Filter by search query
    const matchesSearch = restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by availability
    const isOpen = isRestaurantOpen(restaurant);
    const matchesAvailability = 
      availabilityFilter === "All" ||
      (availabilityFilter === "Open" && isOpen) ||
      (availabilityFilter === "Closed" && !isOpen);
    
    return matchesSearch && matchesAvailability;
  });
  
  // Apply sorting to the filtered results
  const sortedAndFilteredRestaurants = applySorting(filteredRestaurants);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 pb-16 bg-gray-50 min-h-screen">

      <section className="text-center py-14 px-3 mb-10 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-2xl shadow-lg max-w-7xl w-full mx-auto">
        <h1 className="text-3xl md:text-xl font-bold">Food Delivery</h1>
        <p className="text-lg md:text-base mt-4">Order delicious food from your favorite restaurants</p>
      </section>
      
      {/* Search Bar with Autocomplete */}
      <div className="relative mb-8" ref={searchRef}>
        <div className="flex items-center border border-gray-300 rounded-full overflow-hidden bg-white shadow-sm">
          <FontAwesomeIcon icon={faSearch} className="ml-4 text-emerald-500" />
          <input
            type="text"
            placeholder="Search restaurants or cuisines..."
            className="w-full py-3 px-3 focus:outline-none"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
            onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
          />
          {searchQuery && (
            <button 
              className="mr-4 text-gray-400 hover:text-gray-600" 
              onClick={() => setSearchQuery('')}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          )}
        </div>
        
        {/* Search Suggestions and History */}
        {showSuggestions && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto">
            {searchSuggestions.length > 0 ? (
              <div className="py-1">
                <h3 className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Suggestions</h3>
                {searchSuggestions.map((suggestion, index) => (
                  <div 
                    key={`suggestion-${index}`}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setSearchQuery(suggestion);
                      setShowSuggestions(false);
                      handleSearchSubmit();
                    }}
                  >
                    <FontAwesomeIcon icon={faSearch} className="mr-2 text-gray-400" />
                    {suggestion}
                  </div>
                ))}
              </div>
            ) : searchHistory.length > 0 ? (
              <div className="py-1">
                <h3 className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase">Recent Searches</h3>
                {searchHistory.map((item, index) => (
                  <div 
                    key={`history-${index}`}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100 flex items-center"
                    onClick={() => {
                      setSearchQuery(item);
                      setShowSuggestions(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                    {item}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
      
      {/* Filter Toggle Button */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Restaurants</h2>
        <button 
          className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full flex items-center shadow-sm hover:bg-emerald-200 transition-colors duration-300" 
          onClick={toggleMobileFilters}
        >
          <FontAwesomeIcon icon={faFilter} className="mr-2" />
          {mobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filters Section */}
      <div className={`filter-container ${mobileFiltersOpen ? 'active' : ''}`} style={{ display: mobileFiltersOpen ? 'block' : 'none' }}>
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6 md:flex md:space-x-4">
          {/* Categories Filter */}
          <div className="mb-4 md:mb-0 md:flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {['All', 'Fast Food', 'Pizza', 'Asian', 'Mexican', 'Healthy', 'Desserts'].map(category => (
                <div 
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors ${category === selectedCategory ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {category}
                </div>
              ))}
            </div>
          </div>
          
          {/* Availability Filter */}
          <div className="mb-4 md:mb-0 md:flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Availability</h3>
            <div className="flex flex-wrap gap-2">
              <div 
                onClick={() => setAvailabilityFilter('All')}
                className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors flex items-center ${availabilityFilter === 'All' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                All
              </div>
              <div 
                onClick={() => setAvailabilityFilter('Open')}
                className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors flex items-center ${availabilityFilter === 'Open' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FontAwesomeIcon icon={faDoorOpen} className="mr-1" />
                Open Now
              </div>
              <div 
                onClick={() => setAvailabilityFilter('Closed')}
                className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors flex items-center ${availabilityFilter === 'Closed' ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FontAwesomeIcon icon={faDoorClosed} className="mr-1" />
                Closed
              </div>
            </div>
          </div>
          
          {/* Sort Options */}
          <div className="md:flex-1">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Sort By</h3>
            <div className="flex flex-wrap gap-2">
              <div 
                onClick={() => setSortBy('none')}
                className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors flex items-center ${sortBy === 'none' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Default
              </div>
              <div 
                onClick={() => setSortBy('rating')}
                className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors flex items-center ${sortBy === 'rating' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FontAwesomeIcon icon={faStar} className="mr-1" />
                Top Rated
              </div>
              <div 
                onClick={() => setSortBy('delivery-time')}
                className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors flex items-center ${sortBy === 'delivery-time' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FontAwesomeIcon icon={faClock} className="mr-1" />
                Fastest Delivery
              </div>
              <div 
                onClick={() => setSortBy('delivery-fee')}
                className={`px-3 py-1 text-sm rounded-full cursor-pointer transition-colors flex items-center ${sortBy === 'delivery-fee' ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <FontAwesomeIcon icon={faMoneyBill} className="mr-1" />
                Lowest Delivery Fee
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-gray-500">
          {sortedAndFilteredRestaurants.length} result{sortedAndFilteredRestaurants.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      {/* Restaurant Grid */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Loading restaurants...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-lg text-red-600">Error loading restaurants. Please try again.</p>
        </div>
      ) : sortedAndFilteredRestaurants.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">No restaurants found matching your search criteria.</p>
        </div>
      ) : (
        <div className="flex flex-wrap -mx-3">
          {sortedAndFilteredRestaurants.map((restaurant) => (
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