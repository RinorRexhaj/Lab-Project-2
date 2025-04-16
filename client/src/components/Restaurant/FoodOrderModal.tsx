import React, { useEffect, useState } from "react";
import { Restaurant } from "../../types/restaurant/Restaurant";
import { OrderItem, Order } from "../../types/restaurant/Order";
import FoodItem from "./FoodItem";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { useSessionStore } from "../../store/useSessionStore";
import { orderService } from "../../api/OrderService";
import { useNavigate } from "react-router-dom";

interface FoodOrderModalProps {
  restaurant: Restaurant;
  onClose: () => void;
}

const FoodOrderModal: React.FC<FoodOrderModalProps> = ({ restaurant, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [orderItems, setOrderItems] = useState<Record<number, OrderItem>>({});
  const [specialInstructions, setSpecialInstructions] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { accessToken } = useSessionStore();
  const navigate = useNavigate();

  // Initialize the active category with the first category.
  useEffect(() => {
    if (restaurant.menu && restaurant.menu.length > 0) {
      setActiveCategory(restaurant.menu[0].name);
    }
  }, [restaurant]);

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 0) return;
    const item = restaurant.menu?.flatMap((category) => category.items).find((item) => item.id === itemId);
    if (!item) return;
    if (newQuantity === 0) {
      const { [itemId]: removed, ...rest } = orderItems;
      setOrderItems(rest);
    } else {
      setOrderItems({
        ...orderItems,
        [itemId]: {
          foodItemId: itemId,
          quantity: newQuantity,
          specialInstructions: specialInstructions[itemId] || "",
          price: item.price,
          name: item.name,
        },
      });
    }
  };

  const handleSpecialInstructions = (itemId: number, instructions: string) => {
    setSpecialInstructions({
      ...specialInstructions,
      [itemId]: instructions,
    });
    if (orderItems[itemId]) {
      setOrderItems({
        ...orderItems,
        [itemId]: { ...orderItems[itemId], specialInstructions: instructions },
      });
    }
  };

  const calculateSubtotal = () =>
    Object.values(orderItems).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const calculateTotal = () => calculateSubtotal() + restaurant.deliveryFee;

  const handleSubmitOrder = async () => {
    if (Object.keys(orderItems).length === 0) return;
    try {
      setIsSubmitting(true);
      const order: Order = {
        userId: 0, // Backend will set the authenticated user.
        restaurantId: restaurant.id,
        items: Object.values(orderItems),
        deliveryFee: restaurant.deliveryFee,
        subtotal: calculateSubtotal(),
        total: calculateTotal(),
      };
      await orderService.createOrder(order);
      navigate("/payment");
    } catch (error) {
      console.error("Failed to place order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuantityForItem = (itemId: number) => orderItems[itemId]?.quantity || 0;
  const getSpecialInstructionsForItem = (itemId: number) => specialInstructions[itemId] || "";
  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleOutsideClick}
    >
      {/* Fixed overall modal container */}
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-emerald-600 p-4 flex justify-between items-center flex-shrink-0">
          <h2 className="text-xl font-bold text-white">{restaurant.name}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Area */}
        {/* Desktop: horizontal layout; Mobile: vertical layout */}
        <div className="flex flex-row tb:flex-col flex-1 overflow-hidden">
          {/* Categories Section */}
          <div className="w-1/4 tb:w-full border-r tb:border-r-0 tb:border-b border-gray-200">
            {/* Mobile: vertical list */}
            <div className="block tb:hidden overflow-y-auto p-2">
              {restaurant.menu?.map((category) => (
                <div
                  key={category.id}
                  className={`py-2 px-4 cursor-pointer mb-2 ${
                    activeCategory === category.name
                      ? "bg-emerald-500 text-white rounded"
                      : "text-gray-700 hover:bg-gray-200 rounded"
                  }`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </div>
              ))}
            </div>
            {/* Desktop: horizontal list in a fixed smaller height */}
            <div className="hidden tb:flex flex-row overflow-x-auto p-2 space-x-2 tb:h-16">
              {restaurant.menu?.map((category) => (
                <div
                  key={category.id}
                  className={`py-2 px-4 cursor-pointer whitespace-nowrap ${
                    activeCategory === category.name
                      ? "bg-emerald-500 text-white rounded"
                      : "text-gray-700 hover:bg-gray-200 rounded"
                  }`}
                  onClick={() => setActiveCategory(category.name)}
                >
                  {category.name}
                </div>
              ))}
            </div>
          </div>

          {/* Food Items Section */}
          <div className="w-2/4 tb:w-full flex-1 overflow-y-auto p-4 divide-y divide-gray-200">
            {restaurant.menu
              ?.find((category) => category.name === activeCategory)
              ?.items.map((item) => (
                <FoodItem
                  key={item.id}
                  item={item}
                  quantity={getQuantityForItem(item.id)}
                  onQuantityChange={handleQuantityChange}
                  onSpecialInstructions={handleSpecialInstructions}
                  specialInstructions={getSpecialInstructionsForItem(item.id)}
                />
              ))}
          </div>

          {/* Order Summary Section */}
          <div className="w-1/4 tb:w-full tb:h-80 border-l tb:border-l-0 tb:border-t border-gray-200">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex-shrink-0">
                <h3 className="text-lg font-semibold">Order Summary</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {Object.values(orderItems).length > 0 ? (
                  <ul className="space-y-3">
                    {Object.values(orderItems).map((item) => (
                      <li key={item.foodItemId} className="text-sm bg-white p-3 rounded-md shadow-sm">
                        <div className="flex justify-between font-medium">
                          <span>
                            {item.quantity}× {item.name}
                          </span>
                          <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        {item.specialInstructions && (
                          <div className="text-xs text-gray-500 mt-1 border-t border-gray-100 pt-1">
                            <span className="font-medium">Note:</span> {item.specialInstructions}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <p className="text-center mb-2">Your cart is empty</p>
                    <p className="text-sm text-center">Add items from the menu to get started</p>
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-gray-200 bg-white flex-shrink-0">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span>${restaurant.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-200 pt-2 mt-2">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={handleSubmitOrder}
                  disabled={Object.keys(orderItems).length === 0 || isSubmitting}
                  className={`mt-4 w-full py-3 rounded-md font-semibold ${
                    Object.keys(orderItems).length === 0 || isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-emerald-500 text-white hover:bg-emerald-600"
                  }`}
                >
                  {isSubmitting ? "Processing..." : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FoodOrderModal;
