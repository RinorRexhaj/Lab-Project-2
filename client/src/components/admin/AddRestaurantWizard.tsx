import React, { useState } from "react";
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
} from "@fortawesome/free-solid-svg-icons";
import { Restaurant, FoodCategory } from "../../types/restaurant/Restaurant";
import { FoodItem as FoodItemType } from "../../types/restaurant/FoodItem";
import { restaurantService } from "../../api/RestaurantService";
import ImageSelectionModal from "../admin/ImageSelectionModal";

interface AddRestaurantWizardProps {
  onClose: () => void;
}

const AddRestaurantWizard: React.FC<AddRestaurantWizardProps> = ({ onClose }) => {
  // Wizard steps
  const [currentStep, setCurrentStep] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageType, setImageType] = useState<"restaurant" | "foodItem">("restaurant");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number | null>(null);
  const [currentFoodItemIndex, setCurrentFoodItemIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restaurant data
  const [restaurant, setRestaurant] = useState<Partial<Restaurant>>({
    name: "",
    description: "",
    category: "",
    deliveryFee: 0,
    estimatedDeliveryTime: "30-45 min",
    rating: 0,
    imageUrl: "",
    isOpen24Hours: false,
    openingTime: "08:00",
    closingTime: "22:00",
  });

  // Menu data
  const [categories, setCategories] = useState<Partial<FoodCategory>[]>([]);
  const [foodItems, setFoodItems] = useState<{ [categoryId: number]: Partial<FoodItemType>[] }>({});

  // Temp form data for adding categories and items
  const [newCategory, setNewCategory] = useState<Partial<FoodCategory>>({ name: "" });
  const [newFoodItem, setNewFoodItem] = useState<Partial<FoodItemType>>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
  });

  // Handlers
  const handleRestaurantChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setRestaurant({ ...restaurant, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === "deliveryFee" || name === "rating") {
      setRestaurant({ ...restaurant, [name]: parseFloat(value) || 0 });
    } else {
      setRestaurant({ ...restaurant, [name]: value });
    }
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory({ ...newCategory, name: e.target.value });
  };

  const handleNewFoodItemChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "price") {
      setNewFoodItem({ ...newFoodItem, [name]: parseFloat(value) || 0 });
    } else {
      setNewFoodItem({ ...newFoodItem, [name]: value });
    }
  };

  const openRestaurantImageModal = () => {
    setImageType("restaurant");
    setCurrentCategoryIndex(null);
    setCurrentFoodItemIndex(null);
    setShowImageModal(true);
  };

  const openFoodItemImageModal = (categoryIdx: number, itemIdx: number | null = null) => {
    setImageType("foodItem");
    setCurrentCategoryIndex(categoryIdx);
    setCurrentFoodItemIndex(itemIdx);
    setShowImageModal(true);
  };

  const handleImageSelect = (imagePath: string) => {
    if (imageType === "restaurant") {
      setRestaurant({ ...restaurant, imageUrl: imagePath });
    } else if (
      imageType === "foodItem" &&
      currentCategoryIndex !== null &&
      currentCategoryIndex < categories.length
    ) {
      const catId = categories[currentCategoryIndex].id!;
      const updated = { ...foodItems };
      if (currentFoodItemIndex === -1) {
        // new item
        setNewFoodItem({ ...newFoodItem, imageUrl: imagePath });
      } else if (
        Array.isArray(updated[catId]) &&
        currentFoodItemIndex !== null &&
        currentFoodItemIndex < updated[catId].length
      ) {
        updated[catId][currentFoodItemIndex] = {
          ...updated[catId][currentFoodItemIndex],
          imageUrl: imagePath,
        };
        setFoodItems(updated);
      }
    }
    setShowImageModal(false);
  };

  const addCategory = () => {
    if (!newCategory.name?.trim()) {
      setError("Category name is required");
      return;
    }
    const id = Date.now();
    setCategories([...categories, { id, name: newCategory.name }]);
    setFoodItems({ ...foodItems, [id]: [] });
    setNewCategory({ name: "" });
    setError(null);
  };

  const removeCategory = (idx: number) => {
    const removed = categories[idx];
    const updatedCats = categories.filter((_, i) => i !== idx);
    const updatedItems = { ...foodItems };
    if (removed.id) delete updatedItems[removed.id];
    setCategories(updatedCats);
    setFoodItems(updatedItems);
  };

  const addFoodItem = (catId: number) => {
    if (!newFoodItem.name?.trim()) {
      setError("Item name is required");
      return;
    }
    if (!newFoodItem.price || newFoodItem.price <= 0) {
      setError("Price must be > 0");
      return;
    }
    const item = { ...newFoodItem, id: Date.now(), categoryId: catId };
    setFoodItems({
      ...foodItems,
      [catId]: [...(foodItems[catId] || []), item],
    });
    setNewFoodItem({ name: "", description: "", price: 0, imageUrl: "" });
    setError(null);
  };

  const removeFoodItem = (catId: number, idx: number) => {
    const updated = [...(foodItems[catId] || [])];
    updated.splice(idx, 1);
    setFoodItems({ ...foodItems, [catId]: updated });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (
        !restaurant.name ||
        !restaurant.description ||
        !restaurant.category ||
        !restaurant.imageUrl
      ) {
        setError("Fill all required fields");
        return;
      }
      if ((restaurant.rating ?? 0) < 0 || (restaurant.rating ?? 0) > 5) {
        setError("Rating must be 0–5");
        return;
      }
      if ((restaurant.deliveryFee ?? 0) < 0) {
        setError("Delivery fee cannot be negative");
        return;
      }
    }

    if (currentStep === 2 && !restaurant.isOpen24Hours) {
      if (!restaurant.openingTime || !restaurant.closingTime) {
        setError("Set opening and closing times");
        return;
      }
    }

    if (currentStep === 3) {
      if (categories.length === 0) {
        setError("Add at least one category");
        return;
      }
      const empty = categories.filter(
        (c) => !(foodItems[c.id!]?.length > 0)
      );
      if (empty.length) {
        setError(
          `Add at least one item in each: ${empty
            .map((c) => c.name)
            .join(", ")}`
        );
        return;
      }
    }

    setError(null);
    setCurrentStep((s) => s + 1);
  };

  const handlePrevious = () => {
    setError(null);
    setCurrentStep((s) => s - 1);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      const created = await restaurantService.createRestaurant(
        restaurant as Restaurant
      );
      for (const cat of categories) {
        const createdCat = await restaurantService.addFoodCategory(
          created.id,
          { name: cat.name! }
        );
        const items = foodItems[cat.id!] || [];
        for (const it of items) {
          await restaurantService.addFoodItem(created.id, createdCat.id, {
            name: it.name!,
            description: it.description!,
            price: it.price!,
            imageUrl: it.imageUrl!,
          });
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create restaurant");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4"
      onClick={handleOutsideClick}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">
            {currentStep < 4
              ? `Step ${currentStep} of 4`
              : "Review & Submit"}
          </h2>
          <button onClick={onClose} aria-label="Close" title="Close">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>

        {/* Progress */}
        <div className="px-4 py-2 border-b">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1 text-center">
                <div
                  className={`mx-auto mb-1 w-8 h-8 rounded-full flex items-center justify-center ${
                    currentStep >= step
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                <div className="text-xs">
                  {["Info", "Hours", "Menu", "Review"][step - 1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-auto flex-1">
          {currentStep === 1 && (
            <div>
              <h3 className="mb-4 font-semibold">Basic Restaurant Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Name *</label>
                  <input
                    name="name"
                    value={restaurant.name}
                    onChange={handleRestaurantChange}
                    className="w-full border rounded p-2"
                    placeholder="Restaurant name"
                    title="Restaurant name"
                  />
                </div>
                <div>
                  <label className="block mb-1">Category *</label>
                  <select
                    name="category"
                    value={restaurant.category}
                    onChange={handleRestaurantChange}
                    className="w-full border rounded p-2"
                    title="Restaurant category"
                  >
                    <option value="">Select…</option>
                    <option>Fast Food</option>
                    <option>Pizza</option>
                    <option>Asian</option>
                    <option>Mexican</option>
                    <option>Desserts</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={restaurant.description}
                    onChange={handleRestaurantChange}
                    className="w-full border rounded p-2"
                    rows={3}
                    placeholder="Restaurant description"
                    title="Restaurant description"
                  />
                </div>
                <div>
                  <label className="block mb-1">Rating (0–5) *</label>
                  <input
                    type="number"
                    name="rating"
                    value={restaurant.rating}
                    onChange={handleRestaurantChange}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full border rounded p-2"
                    placeholder="Rating (0-5)"
                    title="Restaurant rating"
                  />
                </div>
                <div>
                  <label className="block mb-1">Delivery Fee *</label>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={restaurant.deliveryFee}
                    onChange={handleRestaurantChange}
                    min={0}
                    step={0.01}
                    className="w-full border rounded p-2"
                    placeholder="Delivery fee amount"
                    title="Delivery fee"
                  />
                </div>
                <div>
                  <label className="block mb-1">
                    Estimated Delivery Time *
                  </label>
                  <input
                    name="estimatedDeliveryTime"
                    value={restaurant.estimatedDeliveryTime}
                    onChange={handleRestaurantChange}
                    className="w-full border rounded p-2"
                    placeholder="E.g., 30-45 min"
                    title="Estimated delivery time"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Image *</label>
                  {restaurant.imageUrl ? (
                    <div className="relative">
                      <img
                        src={restaurant.imageUrl}
                        alt=""
                        className="w-full h-40 object-cover rounded"
                      />
                      <button
                        onClick={openRestaurantImageModal}
                        className="absolute top-2 right-2"
                        aria-label="Change image"
                        title="Change image"
                      >
                        <FontAwesomeIcon icon={faImage} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openRestaurantImageModal}
                      className="w-full h-40 border-dashed border-2 rounded border-gray-300 flex items-center justify-center"
                      aria-label="Select restaurant image"
                      title="Select restaurant image"
                    >
                      <FontAwesomeIcon icon={faImage} className="mr-2" />
                      Select Image
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="mb-4 font-semibold">Operating Hours</h3>
              <label className="inline-flex items-center mb-4">
                <input
                  type="checkbox"
                  name="isOpen24Hours"
                  checked={restaurant.isOpen24Hours}
                  onChange={handleRestaurantChange}
                  className="mr-2"
                />
                Open 24 Hours
              </label>
              {!restaurant.isOpen24Hours && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Opening Time</label>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      <input
                        type="time"
                        name="openingTime"
                        value={restaurant.openingTime}
                        onChange={handleRestaurantChange}
                        className="border rounded p-2 flex-1"
                        title="Restaurant opening time"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block mb-1">Closing Time</label>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      <input
                        type="time"
                        name="closingTime"
                        value={restaurant.closingTime}
                        onChange={handleRestaurantChange}
                        className="border rounded p-2 flex-1"
                        title="Restaurant closing time"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="mb-4 font-semibold">Menu Categories & Items</h3>
              {/* Add Category */}
              <div className="mb-4 flex space-x-2">
                <input
                  value={newCategory.name}
                  onChange={handleNewCategoryChange}
                  placeholder="New category name"
                  className="border rounded p-2 flex-1"
                  title="Category name"
                />
                <button onClick={addCategory} className="px-4 bg-emerald-500 text-white rounded" aria-label="Add category" title="Add category">
                  <FontAwesomeIcon icon={faPlus} />
                </button>
              </div>

              {/* Categories list */}
              {categories.length ? (
                categories.map((cat, ci) => (
                  <div key={ci} className="mb-4 border rounded">
                    <div className="p-2 bg-gray-100 flex justify-between items-center">
                      <span>{cat.name}</span>
                      <button onClick={() => removeCategory(ci)} aria-label="Remove category" title="Remove category">
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                    {/* Items */}
                    <div className="p-2 space-y-2">
                      {(foodItems[cat.id!] || []).map((it, ii) => (
                        <div key={ii} className="flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            {it.imageUrl && (
                              <img src={it.imageUrl} className="w-8 h-8 rounded" alt="" />
                            )}
                            <span>{it.name}</span>
                          </div>
                          <div>
                            <span>${it.price?.toFixed(2)}</span>
                            <button
                            onClick={() => removeFoodItem(cat.id!, ii)}
                            className="ml-2 text-red-600"
                              aria-label="Remove food item"
                            title="Remove food item"
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* Add item */}
                      <div className="flex space-x-2 mt-2">
                        <input
                          name="name"
                          value={newFoodItem.name}
                          onChange={handleNewFoodItemChange}
                          placeholder="Item name"
                          className="border rounded p-2 flex-1"
                          title="Food item name"
                        />
                        <input
                          name="price"
                          type="number"
                          value={newFoodItem.price ?? ""}
                          onChange={handleNewFoodItemChange}
                          placeholder="Price"
                          className="border rounded p-2 w-24"
                          title="Food item price"
                        />
                        <button
                          onClick={() => openFoodItemImageModal(ci, -1)}
                          className="px-2 border rounded"
                          aria-label="Select food image"
                          title="Select food image"
                        >
                          <FontAwesomeIcon icon={faImage} />
                        </button>
                        <button onClick={() => addFoodItem(cat.id!)} className="px-4 bg-emerald-500 text-white rounded" aria-label="Add food item" title="Add food item">
                          <FontAwesomeIcon icon={faPlus} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <FontAwesomeIcon icon={faUtensils} size="2x" />
                  <p>No categories yet</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h3 className="mb-4 font-semibold">Review & Submit</h3>
              {/* Summary */}
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  {restaurant.imageUrl && (
                    <img src={restaurant.imageUrl} className="w-20 h-20 rounded" alt="" />
                  )}
                  <div>
                    <h4 className="font-semibold">{restaurant.name}</h4>
                    <p>{restaurant.category}</p>
                  </div>
                </div>
                <div>
                  <p>{restaurant.description}</p>
                  <p>
                    Rating: {restaurant.rating} • Fee: ${restaurant.deliveryFee?.toFixed(2)} •{" "}
                    {restaurant.estimatedDeliveryTime}
                  </p>
                </div>
                <div>
                  <p>
                    Hours:{" "}
                    {restaurant.isOpen24Hours
                      ? "Open 24 Hours"
                      : `${restaurant.openingTime} – ${restaurant.closingTime}`}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold">Menu:</h5>
                  {categories.map((cat, ci) => (
                    <div key={ci} className="mt-2">
                      <p className="font-medium">{cat.name}</p>
                      {(foodItems[cat.id!] || []).map((it, ii) => (
                        <div key={ii} className="flex justify-between text-sm">
                          <span>{it.name}</span>
                          <span>${it.price?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && <p className="mt-4 text-red-600">{error}</p>}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-between">
          {currentStep > 1 ? (
            <button
              onClick={handlePrevious}
              className="px-4 py-2 border rounded"
              aria-label="Go to previous step"
              title="Previous step"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="mr-1" />
              Previous
            </button>
          ) : (
            <div />
          )}
          {currentStep < 4 ? (
            <button
              onClick={handleNext}
              className="px-4 py-2 bg-emerald-500 text-white rounded"
              aria-label="Go to next step"
              title="Next step"
            >
              Next
              <FontAwesomeIcon icon={faChevronRight} className="ml-1" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded text-white ${
                isSubmitting ? "bg-gray-400" : "bg-emerald-500 hover:bg-emerald-600"
              }`}
              aria-label="Create restaurant"
              title="Create restaurant"
            >
              {isSubmitting ? "Creating..." : "Create Restaurant"}
              {!isSubmitting && (
                <FontAwesomeIcon icon={faCheck} className="ml-1" />
              )}
            </button>
          )}
        </div>
      </div>

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

export default AddRestaurantWizard;
