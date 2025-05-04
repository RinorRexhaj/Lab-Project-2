import React from "react";
import { FoodItem as FoodItemType } from "../../types/restaurant/FoodItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

interface FoodItemProps {
  item: FoodItemType;
  quantity: number;
  onQuantityChange: (id: number, newQuantity: number) => void;
  onSpecialInstructions: (id: number, instructions: string) => void;
  specialInstructions?: string;
}

const FoodItem: React.FC<FoodItemProps> = ({
  item,
  quantity,
  onQuantityChange,
  onSpecialInstructions,
  specialInstructions = "",
}) => {
  return (
    <div className="py-4 hover:bg-gray-50 transition-colors duration-150 rounded-md -mx-2 px-2">
      <div className="flex gap-3">
        {item.imageUrl ? (
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
            <img 
              src={item.imageUrl} 
              alt={item.name} 
              className="w-full h-full object-cover"
              onError={(e) => {
                // Set a fallback image
                e.currentTarget.src = "/assets/img/placeholder-image.jpg";
              }}
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 bg-gray-200 flex items-center justify-center">
            <span className="text-xs text-gray-500">No image</span>
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <h4 className="text-base font-medium text-gray-800">{item.name}</h4>
              <p className="text-sm text-gray-600 mt-1 pr-4">{item.description}</p>
            </div>
            
            <div className="text-emerald-600 font-medium">${item.price.toFixed(2)}</div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                onClick={() => onQuantityChange(item.id, quantity - 1)}
                disabled={quantity === 0}
              >
                <FontAwesomeIcon icon={faMinus} className="text-xs" />
              </button>
              <span className="px-4 py-1 text-gray-800 min-w-[30px] text-center font-medium">{quantity}</span>
              <button
                className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                onClick={() => onQuantityChange(item.id, quantity + 1)}
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {quantity > 0 && (
        <div className="mt-4 ml-6">
          <label htmlFor={`special-${item.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions
          </label>
          <input
            type="text"
            id={`special-${item.id}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="E.g., No onions, extra sauce"
            value={specialInstructions}
            onChange={(e) => onSpecialInstructions(item.id, e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default FoodItem;
