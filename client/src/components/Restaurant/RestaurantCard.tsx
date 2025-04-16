import React from "react";
import { Restaurant } from "../../types/restaurant/Restaurant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar, faClock, faDoorOpen, faDoorClosed } from "@fortawesome/free-solid-svg-icons";
import { isRestaurantOpen, formatOpeningHours } from "../../utils/restaurant/isRestaurantOpen";

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  const isOpen = isRestaurantOpen(restaurant);
  
  return (
    <div 
      className="h-full w-full bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col transform hover:-translate-y-1 hover:scale-[1.02]"
      onClick={onClick}
    >
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={restaurant.imageUrl || '/placeholder-restaurant.jpg'} 
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-emerald-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
          <FontAwesomeIcon icon={faStar} className="mr-1 text-yellow-300" />
          <span>{restaurant.rating}</span>
        </div>
        <div className="absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
          {isOpen ? (
            <span className="bg-emerald-600 text-white px-2 py-1 rounded-full flex items-center">
              <FontAwesomeIcon icon={faDoorOpen} className="mr-1" />
              Open
            </span>
          ) : (
            <span className="bg-red-500 text-white px-2 py-1 rounded-full flex items-center">
              <FontAwesomeIcon icon={faDoorClosed} className="mr-1" />
              Closed
            </span>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent py-2 px-3">
          <span className="text-white text-xs font-medium px-2 py-1 bg-black bg-opacity-50 rounded-full">{restaurant.category || 'All'}</span>
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{restaurant.name}</h3>
        
        <p className="text-gray-600 text-sm line-clamp-2 flex-1">{restaurant.description}</p>
        
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center text-sm text-gray-600">
            <FontAwesomeIcon icon={faClock} className="mr-1 text-emerald-500" />
            <span>{restaurant.estimatedDeliveryTime}</span>
          </div>
          <div className="text-sm font-medium text-emerald-600">
            ${restaurant.deliveryFee.toFixed(2)} delivery
          </div>
        </div>
        <div className="mt-2 pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500 flex items-center">
            <FontAwesomeIcon icon={faClock} className="mr-1 text-gray-400" />
            <span>{formatOpeningHours(restaurant)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantCard;
