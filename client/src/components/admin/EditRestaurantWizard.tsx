import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faImage,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faClock,
  faUtensils,
  faCheck,
  faTrash,
  faPencilAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Restaurant, FoodCategory } from "../../types/restaurant/Restaurant";
import { FoodItem } from "../../types/restaurant/FoodItem";
import { restaurantService } from "../../api/RestaurantService";
import ImageSelectionModal from "../admin/ImageSelectionModal";

interface EditRestaurantWizardProps {
  restaurant: Restaurant;
  onClose: () => void;
}

const EditRestaurantWizard: React.FC<EditRestaurantWizardProps> = ({ restaurant: initialRestaurant, onClose }) => {
  // Wizard steps
  const [currentStep, setCurrentStep] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageType, setImageType] = useState<"restaurant" | "foodItem">("restaurant");
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);
  // const [currentFoodItem, setCurrentFoodItem] = useState<number | null>(null); // Temporarily comment out unused state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | null>(null); // 'category' or 'foodItem'
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);

  // Restaurant data
  const [restaurant, setRestaurant] = useState<Restaurant>({
    ...initialRestaurant,
    isOpen24Hours: initialRestaurant.isOpen24Hours || false,
    openingTime: initialRestaurant.openingTime || "08:00",
    closingTime: initialRestaurant.closingTime || "22:00",
  });

  // Menu data
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [foodItems, setFoodItems] = useState<{ [categoryId: number]: FoodItem[] }>({});
  
  // Temp form data for adding/editing categories and items
  const [tempCategory, setTempCategory] = useState<Partial<FoodCategory>>({
    name: "",
  });
  const [tempFoodItem, setTempFoodItem] = useState<Partial<FoodItem>>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
  });

  // Fetch restaurant details with menu
  useEffect(() => {
    const fetchRestaurantWithMenu = async () => {
      try {
        setIsLoading(true);
        const restaurantData = await restaurantService.getRestaurantWithMenu(initialRestaurant.id);
        
        setRestaurant({
          ...restaurantData,
          isOpen24Hours: restaurantData.isOpen24Hours || false,
          openingTime: restaurantData.openingTime || "08:00",
          closingTime: restaurantData.closingTime || "22:00",
        });
        
        if (restaurantData.menu) {
          setCategories(restaurantData.menu);
          
          // Organize food items by category
          const itemsByCategory: { [categoryId: number]: FoodItem[] } = {};
          restaurantData.menu.forEach(category => {
            if (category.items && category.id) {
              itemsByCategory[category.id] = category.items;
            }
          });
          setFoodItems(itemsByCategory);
        }
      } catch (error) {
        console.error("Failed to fetch restaurant details:", error);
        setError("Failed to load restaurant details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRestaurantWithMenu();
  }, [initialRestaurant.id]);

  const handleRestaurantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setRestaurant({ ...restaurant, [name]: checked });
      return;
    }
    
    // Handle numeric fields
    if (name === 'deliveryFee' || name === 'rating') {
      setRestaurant({ ...restaurant, [name]: parseFloat(value) || 0 });
      return;
    }
    
    setRestaurant({ ...restaurant, [name]: value });
  };

  const handleTempCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempCategory({ ...tempCategory, name: e.target.value });
  };

  const handleTempFoodItemChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setTempFoodItem({ ...tempFoodItem, [name]: parseFloat(value) || 0 });
      return;
    }
    
    setTempFoodItem({ ...tempFoodItem, [name]: value });
  };

  const handleImageSelect = (imagePath: string) => {
    if (imageType === "restaurant") {
      setRestaurant({ ...restaurant, imageUrl: imagePath });
    } else if (currentCategory !== null) {
      if (editMode === 'foodItem' && editItemIndex !== null) {
        // Update an existing food item's image
        const updatedFoodItems = { ...foodItems };
        updatedFoodItems[currentCategory][editItemIndex] = {
          ...updatedFoodItems[currentCategory][editItemIndex],
          imageUrl: imagePath
        };
        setFoodItems(updatedFoodItems);
      } else {
        // Update new food item being created
        setTempFoodItem({ ...tempFoodItem, imageUrl: imagePath });
      }
    }
    setShowImageModal(false);
  };

  const openRestaurantImageModal = () => {
    setImageType("restaurant");
    setShowImageModal(true);
  };

  const openFoodItemImageModal = (categoryId: number) => {
    setImageType("foodItem");
    setCurrentCategory(categoryId);
    setShowImageModal(true);
  };

  const startAddCategory = () => {
    setEditMode('category');
    setTempCategory({ name: "" });
  };

  const addCategory = async () => {
    if (!tempCategory.name || !tempCategory.name.trim()) {
      setError("Category name is required");
      return;
    }
    
    try {
      const newCategory = await restaurantService.addFoodCategory(
        restaurant.id,
        { name: tempCategory.name }
      );
      
      setCategories([...categories, newCategory]);
      setFoodItems({ ...foodItems, [newCategory.id]: [] });
      
      // Reset temp data
      setEditMode(null);
      setTempCategory({ name: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to add category:", err);
      setError("Failed to add category. Please try again.");
    }
  };

  const startEditCategory = (category: FoodCategory) => {
    setEditMode('category');
    setTempCategory({
      id: category.id,
      name: category.name
    });
    setEditItemIndex(categories.findIndex(c => c.id === category.id));
  };

  const updateCategory = async () => {
    if (!tempCategory.name?.trim() || !tempCategory.id) {
      setError("Category name is required");
      return;
    }
    
    try {
      const updatedCategory = await restaurantService.updateFoodCategory(
        restaurant.id,
        tempCategory.id,
        { name: tempCategory.name }
      );
      
      const updatedCategories = [...categories];
      const index = updatedCategories.findIndex(c => c.id === tempCategory.id);
      if (index !== -1) {
        updatedCategories[index] = updatedCategory;
        setCategories(updatedCategories);
      }
      
      // Reset temp data
      setEditMode(null);
      setTempCategory({ name: "" });
      setEditItemIndex(null);
      setError(null);
    } catch (err) {
      console.error("Failed to update category:", err);
      setError("Failed to update category. Please try again.");
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      await restaurantService.deleteFoodCategory(restaurant.id, categoryId);
      
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      setCategories(updatedCategories);
      
      // Remove associated food items
      const updatedFoodItems = { ...foodItems };
      delete updatedFoodItems[categoryId];
      setFoodItems(updatedFoodItems);
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError("Failed to delete category. Please try again.");
    }
  };

  const startAddFoodItem = (categoryId: number) => {
    setEditMode('foodItem');
    setCurrentCategory(categoryId);
    setTempFoodItem({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      categoryId: categoryId
    });
    setEditItemIndex(null);
  };

  const addFoodItem = async () => {
    if (!tempFoodItem.name?.trim() || currentCategory === null) {
      setError("Food item name is required");
      return;
    }
    
    if (!tempFoodItem.price || tempFoodItem.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      const newFoodItem = await restaurantService.addFoodItem(
        restaurant.id,
        currentCategory,
        {
          name: tempFoodItem.name,
          description: tempFoodItem.description || "",
          price: tempFoodItem.price,
          imageUrl: tempFoodItem.imageUrl || "",
          categoryId: currentCategory
        }
      );
      
      const updatedItems = { 
        ...foodItems, 
        [currentCategory]: [...(foodItems[currentCategory] || []), newFoodItem] 
      };
      
      setFoodItems(updatedItems);
      
      // Reset temp data
      setEditMode(null);
      setTempFoodItem({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
      });
      setCurrentCategory(null);
      setError(null);
    } catch (err) {
      console.error("Failed to add food item:", err);
      setError("Failed to add food item. Please try again.");
    }
  };

  const startEditFoodItem = (categoryId: number, itemIndex: number) => {
    const item = foodItems[categoryId][itemIndex];
    
    setEditMode('foodItem');
    setCurrentCategory(categoryId);
    setEditItemIndex(itemIndex);
    setTempFoodItem({
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      imageUrl: item.imageUrl,
      categoryId: categoryId
    });
  };

  const updateFoodItem = async () => {
    if (!tempFoodItem.name?.trim() || currentCategory === null || editItemIndex === null) {
      setError("Food item name is required");
      return;
    }
    
    if (!tempFoodItem.price || tempFoodItem.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      const foodItemId = foodItems[currentCategory][editItemIndex].id;
      
      const updatedFoodItem = await restaurantService.updateFoodItem(
        restaurant.id,
        currentCategory,
        foodItemId,
        {
          name: tempFoodItem.name,
          description: tempFoodItem.description || "",
          price: tempFoodItem.price,
          imageUrl: tempFoodItem.imageUrl
        }
      );
      
      const updatedItems = { ...foodItems };
      updatedItems[currentCategory][editItemIndex] = updatedFoodItem;
      setFoodItems(updatedItems);
      
      // Reset temp data
      setEditMode(null);
      setTempFoodItem({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
      });
      setCurrentCategory(null);
      setEditItemIndex(null);
      setError(null);
    } catch (err) {
      console.error("Failed to update food item:", err);
      setError("Failed to update food item. Please try again.");
    }
  };

  const deleteFoodItem = async (categoryId: number, itemIndex: number) => {
    try {
      const foodItemId = foodItems[categoryId][itemIndex].id;
      
      await restaurantService.deleteFoodItem(restaurant.id, categoryId, foodItemId);
      
      const updatedItems = { ...foodItems };
      updatedItems[categoryId] = [
        ...updatedItems[categoryId].slice(0, itemIndex),
        ...updatedItems[categoryId].slice(itemIndex + 1)
      ];
      setFoodItems(updatedItems);
    } catch (err) {
      console.error("Failed to delete food item:", err);
      setError("Failed to delete food item. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditMode(null);
    setTempCategory({ name: "" });
    setTempFoodItem({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
    });
    setCurrentCategory(null);
    setEditItemIndex(null);
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!restaurant.name || !restaurant.description || !restaurant.category || !restaurant.imageUrl) {
        setError("Please fill in all required fields and select an image");
        return;
      }
      if (restaurant.rating < 0 || restaurant.rating > 5) {
        setError("Rating must be between 0 and 5");
        return;
      }
      if (restaurant.deliveryFee < 0) {
        setError("Delivery fee cannot be negative");
        return;
      }
    } else if (currentStep === 2) {
      if (!restaurant.isOpen24Hours && (!restaurant.openingTime || !restaurant.closingTime)) {
        setError("Please set opening and closing times or select 24 hours");
        return;
      }
    }
    
    setError(null);
    setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      // Update the restaurant basic info
      await restaurantService.updateRestaurant(restaurant.id, {
        name: restaurant.name,
        description: restaurant.description,
        category: restaurant.category,
        deliveryFee: restaurant.deliveryFee,
        estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
        rating: restaurant.rating,
        imageUrl: restaurant.imageUrl,
        isOpen24Hours: restaurant.isOpen24Hours,
        openingTime: restaurant.openingTime,
        closingTime: restaurant.closingTime
      });
      
      onClose(); // Close the wizard after successful submission
    } catch (err) {
      console.error("Failed to update restaurant:", err);
      setError("Failed to update restaurant. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Loading restaurant data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">
            {currentStep === 3 ? "Review Changes" : `Edit Restaurant - Step ${currentStep} of 3`}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600" aria-label="Close" title="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Wizard Progress */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <div className="text-xs mt-2 text-gray-600">
                  {step === 1
                    ? "Basic Info"
                    : step === 2
                    ? "Hours & Menu"
                    : "Review"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="overflow-y-auto p-6 flex-1">
          {/* Step 1: Basic Restaurant Information */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Restaurant Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Restaurant Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={restaurant.name}
                    onChange={handleRestaurantChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    placeholder="Restaurant name"
                    title="Restaurant name"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={restaurant.category}
                    onChange={handleRestaurantChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    title="Restaurant category"
                  >
                    <option value="">Select Category</option>
                    <option value="Fast Food">Fast Food</option>
                    <option value="Pizza">Pizza</option>
                    <option value="Asian">Asian</option>
                    <option value="Mexican">Mexican</option>
                    <option value="Healthy">Healthy</option>
                    <option value="Desserts">Desserts</option>
                    <option value="Italian">Italian</option>
                    <option value="Indian">Indian</option>
                    <option value="Breakfast">Breakfast</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={restaurant.description}
                    onChange={handleRestaurantChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    required
                    placeholder="Restaurant description"
                    title="Restaurant description"
                  ></textarea>
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (0-5) *
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={restaurant.rating}
                    onChange={handleRestaurantChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    title="Restaurant rating"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Fee ($) *
                  </label>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={restaurant.deliveryFee}
                    onChange={handleRestaurantChange}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    title="Delivery fee"
                  />
                </div>
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estimated Delivery Time *
                  </label>
                  <input
                    type="text"
                    name="estimatedDeliveryTime"
                    value={restaurant.estimatedDeliveryTime}
                    onChange={handleRestaurantChange}
                    placeholder="e.g., 30-45 min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    title="Estimated delivery time"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restaurant Image *
                  </label>
                  {restaurant.imageUrl ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={restaurant.imageUrl}
                        alt="Restaurant"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={openRestaurantImageModal}
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                        aria-label="Change restaurant image"
                        title="Change image"
                      >
                        <FontAwesomeIcon icon={faImage} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openRestaurantImageModal}
                      className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors focus:outline-none"
                    >
                      <div className="text-center">
                        <FontAwesomeIcon
                          icon={faImage}
                          className="text-gray-400 text-3xl mb-2"
                        />
                        <p className="text-sm text-gray-600">
                          Click to select a restaurant image
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Hours and Menu Management */}
          {currentStep === 2 && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
                <div className="mb-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isOpen24Hours"
                      checked={restaurant.isOpen24Hours}
                      onChange={(e) => 
                        setRestaurant({ 
                          ...restaurant, 
                          isOpen24Hours: e.target.checked 
                        })
                      }
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Open 24 Hours</span>
                  </label>
                </div>

                {!restaurant.isOpen24Hours && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Opening Time
                      </label>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-gray-400 mr-2"
                        />
                        <input
                          type="time"
                          name="openingTime"
                          value={restaurant.openingTime}
                          onChange={handleRestaurantChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          title="Opening time"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Closing Time
                      </label>
                      <div className="flex items-center">
                        <FontAwesomeIcon
                          icon={faClock}
                          className="text-gray-400 mr-2"
                        />
                        <input
                          type="time"
                          name="closingTime"
                          value={restaurant.closingTime}
                          onChange={handleRestaurantChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          title="Closing time"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold mb-4">Menu Management</h3>
                
                {/* Category and Food Item Management */}
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">Menu Categories ({categories.length})</h4>
                  <button
                    onClick={startAddCategory}
                    className="px-3 py-1 bg-emerald-500 text-white rounded-md flex items-center text-sm hover:bg-emerald-600"
                  >
                    <FontAwesomeIcon icon={faPlus} className="mr-1" />
                    Add Category
                  </button>
                </div>
                
                {/* Add/Edit Category Form */}
                {editMode === 'category' && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="text-md font-medium text-gray-700 mb-3">
                      {tempCategory.id ? "Edit Category" : "Add New Category"}
                    </h5>
                    <div className="flex flex-col space-y-3">
                      <input
                        type="text"
                        value={tempCategory.name}
                        onChange={handleTempCategoryChange}
                        placeholder="Category Name (e.g., Appetizers, Main Course, Desserts)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={cancelEdit}
                          className="px-3 py-1 border border-gray-300 bg-white rounded-md text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={tempCategory.id ? updateCategory : addCategory}
                          className="px-3 py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600"
                        >
                          {tempCategory.id ? "Update" : "Add"} Category
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Categories List */}
                {categories.length > 0 ? (
                  <div className="space-y-6">
                    {categories.map((category) => (
                      <div key={category.id} className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="bg-gray-100 px-4 py-3 flex justify-between items-center">
                          <h5 className="font-semibold text-gray-700">{category.name}</h5>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => startEditCategory(category)}
                              className="text-emerald-600 hover:text-emerald-800"
                            >
                              <FontAwesomeIcon icon={faPencilAlt} /> Edit
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FontAwesomeIcon icon={faTrash} /> Delete
                            </button>
                          </div>
                        </div>
                        
                        {/* Food Items in this Category */}
                        <div className="p-4">
                          <div className="mb-4 flex justify-between items-center">
                            <h6 className="font-medium text-sm text-gray-700">Food Items</h6>
                            <button
                              onClick={() => startAddFoodItem(category.id)}
                              className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs flex items-center hover:bg-emerald-200"
                            >
                              <FontAwesomeIcon icon={faPlus} className="mr-1" />
                              Add Item
                            </button>
                          </div>
                          
                          {/* Add/Edit Food Item Form */}
                          {editMode === 'foodItem' && currentCategory === category.id && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                              <h6 className="font-medium text-sm text-gray-700 mb-2">
                                {editItemIndex !== null ? "Edit Food Item" : `Add Food Item to ${category.name}`}
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input
                                  type="text"
                                  placeholder="Food Item Name"
                                  value={tempFoodItem.name}
                                  onChange={(e) => handleTempFoodItemChange(e as React.ChangeEvent<HTMLInputElement>)}
                                  name="name"
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <input
                                  type="number"
                                  placeholder="Price ($)"
                                  value={tempFoodItem.price || ""}
                                  onChange={(e) => handleTempFoodItemChange(e as React.ChangeEvent<HTMLInputElement>)}
                                  name="price"
                                  min="0"
                                  step="0.01"
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <div className="md:col-span-2">
                                  <textarea
                                    placeholder="Description"
                                    value={tempFoodItem.description}
                                    onChange={(e) => handleTempFoodItemChange(e as React.ChangeEvent<HTMLTextAreaElement>)}
                                    name="description"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    rows={2}
                                  ></textarea>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <button
                                  onClick={() => openFoodItemImageModal(category.id)}
                                  className="px-3 py-1 border border-gray-300 bg-white rounded-md hover:bg-gray-50 text-sm"
                                >
                                  <FontAwesomeIcon icon={faImage} className="mr-1" /> 
                                  {tempFoodItem.imageUrl ? "Change Image" : "Add Image"}
                                </button>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={cancelEdit}
                                    className="px-3 py-1 border border-gray-300 bg-white rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={editItemIndex !== null ? updateFoodItem : addFoodItem}
                                    className="px-3 py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 text-sm"
                                  >
                                    {editItemIndex !== null ? "Update" : "Add"} Item
                                  </button>
                                </div>
                              </div>
                              
                              {tempFoodItem.imageUrl && (
                                <div className="mt-2 flex items-center">
                                  <div className="w-12 h-12 rounded overflow-hidden mr-2">
                                    <img
                                      src={tempFoodItem.imageUrl}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600">Image selected</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Food Items List */}
                          {foodItems[category.id] && foodItems[category.id].length > 0 ? (
                            <div className="space-y-3">
                              {foodItems[category.id].map((item, itemIndex) => (
                                <div key={item.id} className="flex items-start p-3 bg-white border border-gray-200 rounded-md">
                                  {item.imageUrl && (
                                    <div className="w-16 h-16 rounded overflow-hidden mr-3 flex-shrink-0">
                                      <img
                                        src={item.imageUrl}
                                        alt={item.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <div>
                                        <h6 className="font-medium">{item.name}</h6>
                                        <p className="text-sm text-gray-600">{item.description}</p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium text-emerald-600">${item.price.toFixed(2)}</div>
                                        <div className="flex space-x-2 mt-1">
                                          <button
                                            onClick={() => startEditFoodItem(category.id, itemIndex)}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => deleteFoodItem(category.id, itemIndex)}
                                            className="text-xs text-red-600 hover:text-red-800"
                                          >
                                            Remove
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-4 text-gray-500 border border-dashed border-gray-300 rounded-md">
                              <p>No food items in this category yet.</p>
                              <button
                                onClick={() => startAddFoodItem(category.id)}
                                className="mt-2 text-sm text-emerald-600 hover:text-emerald-800"
                              >
                                + Add your first item
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FontAwesomeIcon icon={faUtensils} className="text-gray-300 text-5xl mb-2" />
                    <p className="text-gray-500">No categories added yet. Add a category to start building your menu.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Review Your Changes</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 flex items-start space-x-4">
                  {restaurant.imageUrl && (
                    <img
                      src={restaurant.imageUrl}
                      alt={restaurant.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="text-xl font-semibold">{restaurant.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{restaurant.category}</p>
                    <p className="mt-2">{restaurant.description}</p>
                    <div className="mt-2 text-sm">
                      Rating: <span className="font-semibold">{restaurant.rating}</span> ⭐
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Delivery Information</h5>
                  <p className="text-sm">
                    Delivery Fee: <span className="font-semibold">${restaurant.deliveryFee?.toFixed(2)}</span>
                  </p>
                  <p className="text-sm mt-1">
                    Estimated Time: <span className="font-semibold">{restaurant.estimatedDeliveryTime}</span>
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Operating Hours</h5>
                  {restaurant.isOpen24Hours ? (
                    <p className="text-sm">Open 24 Hours</p>
                  ) : (
                    <p className="text-sm">
                      Open from <span className="font-semibold">{restaurant.openingTime}</span> to{" "}
                      <span className="font-semibold">{restaurant.closingTime}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-medium mb-3">Menu ({categories.length} categories)</h5>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
                      <h6 className="font-medium">{category.name}</h6>
                      {foodItems[category.id] && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {foodItems[category.id].length} items in this category
                          </p>
                          {foodItems[category.id].length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {foodItems[category.id].map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                  <span>{item.name}</span>
                                  <span className="font-medium">${item.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="mr-2" />
              Previous
            </button>
          ) : (
            <div></div> 
          )}
          
          {currentStep < 3 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center"
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} className="ml-2" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 flex items-center
                ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'} text-white`}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              {!isSubmitting && <FontAwesomeIcon icon={faCheck} className="ml-2" />}
            </button>
          )}
        </div>
      </div>

      {/* Image Selection Modal */}
      {showImageModal && (
        <ImageSelectionModal
          imageType={imageType}
          onSelect={handleImageSelect}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default EditRestaurantWizard;
