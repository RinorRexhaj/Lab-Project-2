import React from "react";
import { GroceryProduct } from "../../types/grocery/GroceryProduct";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus, faExclamationCircle } from "@fortawesome/free-solid-svg-icons";

interface GroceryProductItemProps {
  product: GroceryProduct;
  quantity: number;
  onQuantityChange: (id: number, newQuantity: number) => void;
  onSpecialInstructions: (id: number, instructions: string) => void;
  specialInstructions?: string;
}

const GroceryProductItem: React.FC<GroceryProductItemProps> = ({
  product,
  quantity,
  onQuantityChange,
  onSpecialInstructions,
  specialInstructions = "",
}) => {
  return (
    <div className="py-4 hover:bg-gray-50 transition-colors duration-150 rounded-md -mx-2 px-2">
      <div className="flex gap-3">
        {product.imageUrl && (
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="flex-1">
          <div className="flex justify-between">
            <div>
              <div className="flex items-center">
                <h4 className="text-base font-medium text-gray-800">{product.name}</h4>
                {!product.inStock && (
                  <span className="ml-2 text-xs text-white bg-red-500 px-2 py-0.5 rounded-full flex items-center">
                    <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
                    Out of Stock
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1 pr-4">{product.description}</p>
              {(product.weight || product.unit) && (
                <p className="text-xs text-gray-500 mt-1">
                  {product.weight && `${product.weight}`}
                  {product.weight && product.unit && " · "}
                  {product.unit && `${product.unit}`}
                </p>
              )}
            </div>
            
            <div className="text-emerald-600 font-medium">${product.price.toFixed(2)}</div>
          </div>
          
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <button
                className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                onClick={() => onQuantityChange(product.id, quantity - 1)}
                disabled={quantity === 0 || !product.inStock}
              >
                <FontAwesomeIcon icon={faMinus} className="text-xs" />
              </button>
              <span className="px-4 py-1 text-gray-800 min-w-[30px] text-center font-medium">{quantity}</span>
              <button
                className="px-3 py-1 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
                onClick={() => onQuantityChange(product.id, quantity + 1)}
                disabled={!product.inStock}
              >
                <FontAwesomeIcon icon={faPlus} className="text-xs" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {quantity > 0 && (
        <div className="mt-4 ml-6">
          <label htmlFor={`special-${product.id}`} className="block text-sm font-medium text-gray-700 mb-1">
            Special Instructions
          </label>
          <input
            type="text"
            id={`special-${product.id}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            placeholder="E.g., Ripe bananas, Fresh milk, etc."
            value={specialInstructions}
            onChange={(e) => onSpecialInstructions(product.id, e.target.value)}
          />
        </div>
      )}
    </div>
  );
};

export default GroceryProductItem;
