import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faImage,
  faPlus,
  faChevronLeft,
  faChevronRight,
  faClock,
  faShoppingCart,
  faCheck,
  faBoxes,
} from "@fortawesome/free-solid-svg-icons";
import { GroceryStore, GroceryCategory } from "../../types/grocery/GroceryStore";
import { GroceryProduct } from "../../types/grocery/GroceryProduct";
import { groceryService } from "../../api/GroceryService";
import ImageSelectionModal from "../admin/ImageSelectionModal";

interface AddGroceryStoreWizardProps {
  onClose: () => void;
}

const AddGroceryStoreWizard: React.FC<AddGroceryStoreWizardProps> = ({ onClose }) => {
  // Wizard steps
  const [currentStep, setCurrentStep] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageType, setImageType] = useState<"store" | "product">("store");
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState<number | null>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store data
  const [store, setStore] = useState<Partial<GroceryStore>>({
    name: "",
    description: "",
    category: "",
    deliveryFee: 0,
    estimatedDeliveryTime: "25-40 min",
    rating: 0,
    imageUrl: "",
    isOpen24Hours: false,
    openingTime: "08:00",
    closingTime: "22:00",
  });

  // Categories and products data
  const [categories, setCategories] = useState<Partial<GroceryCategory>[]>([]);
  const [products, setProducts] = useState<{ [categoryId: number]: Partial<GroceryProduct>[] }>({});

  // Temp form data for adding categories and products
  const [newCategory, setNewCategory] = useState<Partial<GroceryCategory>>({ name: "" });
  const [newProduct, setNewProduct] = useState<Partial<GroceryProduct>>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    unit: "",
    weight: "",
    inStock: true,
  });

  // Handlers
  const handleStoreChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setStore({ ...store, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === "deliveryFee" || name === "rating") {
      setStore({ ...store, [name]: parseFloat(value) || 0 });
    } else {
      setStore({ ...store, [name]: value });
    }
  };

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategory({ ...newCategory, name: e.target.value });
  };

  const handleNewProductChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setNewProduct({ ...newProduct, [name]: (e.target as HTMLInputElement).checked });
    } else if (name === "price") {
      setNewProduct({ ...newProduct, [name]: parseFloat(value) || 0 });
    } else {
      setNewProduct({ ...newProduct, [name]: value });
    }
  };

  const openStoreImageModal = () => {
    setImageType("store");
    setCurrentCategoryIndex(null);
    setCurrentProductIndex(null);
    setShowImageModal(true);
  };

  const openProductImageModal = (categoryIdx: number, productIdx: number | null = null) => {
    setImageType("product");
    setCurrentCategoryIndex(categoryIdx);
    setCurrentProductIndex(productIdx);
    setShowImageModal(true);
  };

  const handleImageSelect = (imagePath: string) => {
    if (imageType === "store") {
      setStore({ ...store, imageUrl: imagePath });
    } else if (
      imageType === "product" &&
      currentCategoryIndex !== null &&
      currentCategoryIndex < categories.length
    ) {
      const catId = categories[currentCategoryIndex].id!;
      const updated = { ...products };
      if (currentProductIndex === -1) {
        // new product
        setNewProduct({ ...newProduct, imageUrl: imagePath });
      } else if (
        Array.isArray(updated[catId]) &&
        currentProductIndex !== null &&
        currentProductIndex < updated[catId].length
      ) {
        updated[catId][currentProductIndex] = {
          ...updated[catId][currentProductIndex],
          imageUrl: imagePath,
        };
        setProducts(updated);
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
    setProducts({ ...products, [id]: [] });
    setNewCategory({ name: "" });
    setError(null);
  };

  const removeCategory = (idx: number) => {
    const removed = categories[idx];
    const updatedCats = categories.filter((_, i) => i !== idx);
    const updatedProducts = { ...products };
    if (removed.id) delete updatedProducts[removed.id];
    setCategories(updatedCats);
    setProducts(updatedProducts);
  };

  const addProduct = (catId: number) => {
    if (!newProduct.name?.trim()) {
      setError("Product name is required");
      return;
    }
    if (!newProduct.price || newProduct.price <= 0) {
      setError("Price must be > 0");
      return;
    }
    const product = { ...newProduct, id: Date.now(), categoryId: catId };
    setProducts({
      ...products,
      [catId]: [...(products[catId] || []), product],
    });
    setNewProduct({ 
      name: "", 
      description: "", 
      price: 0, 
      imageUrl: "",
      unit: "",
      weight: "",
      inStock: true 
    });
    setError(null);
  };

  const removeProduct = (catId: number, idx: number) => {
    const updated = [...(products[catId] || [])];
    updated.splice(idx, 1);
    setProducts({ ...products, [catId]: updated });
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (
        !store.name ||
        !store.description ||
        !store.category ||
        !store.imageUrl
      ) {
        setError("Fill all required fields");
        return;
      }
      if ((store.rating ?? 0) < 0 || (store.rating ?? 0) > 5) {
        setError("Rating must be 0–5");
        return;
      }
      if ((store.deliveryFee ?? 0) < 0) {
        setError("Delivery fee cannot be negative");
        return;
      }
    }

    if (currentStep === 2 && !store.isOpen24Hours) {
      if (!store.openingTime || !store.closingTime) {
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
        (c) => !(products[c.id!]?.length > 0)
      );
      if (empty.length) {
        setError(
          `Add at least one product in each: ${empty
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
      const created = await groceryService.createStore(
        store as GroceryStore
      );
      for (const cat of categories) {
        const createdCat = await groceryService.createCategory(
          created.id,
          { name: cat.name! }
        );
        const items = products[cat.id!] || [];
        for (const item of items) {
          await groceryService.createProduct(created.id, createdCat.id, {
            name: item.name!,
            description: item.description!,
            price: item.price!,
            imageUrl: item.imageUrl!,
            unit: item.unit,
            weight: item.weight,
            inStock: item.inStock ?? true,
          });
        }
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to create grocery store");
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
                  {["Info", "Hours", "Products", "Review"][step - 1]}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-auto flex-1">
          {currentStep === 1 && (
            <div>
              <h3 className="mb-4 font-semibold">Basic Store Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Name *</label>
                  <input
                    name="name"
                    value={store.name}
                    onChange={handleStoreChange}
                    className="w-full border rounded p-2"
                    placeholder="Store name"
                    title="Store name"
                  />
                </div>
                <div>
                  <label className="block mb-1">Category *</label>
                  <select
                    name="category"
                    value={store.category}
                    onChange={handleStoreChange}
                    className="w-full border rounded p-2"
                    title="Store category"
                  >
                    <option value="">Select…</option>
                    <option>Supermarket</option>
                    <option>Organic</option>
                    <option>Convenience</option>
                    <option>International</option>
                    <option>Specialty</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Description *</label>
                  <textarea
                    name="description"
                    value={store.description}
                    onChange={handleStoreChange}
                    className="w-full border rounded p-2"
                    rows={3}
                    placeholder="Store description"
                    title="Store description"
                  />
                </div>
                <div>
                  <label className="block mb-1">Rating (0–5) *</label>
                  <input
                    type="number"
                    name="rating"
                    value={store.rating}
                    onChange={handleStoreChange}
                    min={0}
                    max={5}
                    step={0.1}
                    className="w-full border rounded p-2"
                    placeholder="Rating (0-5)"
                    title="Store rating"
                  />
                </div>
                <div>
                  <label className="block mb-1">Delivery Fee *</label>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={store.deliveryFee}
                    onChange={handleStoreChange}
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
                    value={store.estimatedDeliveryTime}
                    onChange={handleStoreChange}
                    className="w-full border rounded p-2"
                    placeholder="E.g., 25-40 min"
                    title="Estimated delivery time"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Image *</label>
                  {store.imageUrl ? (
                    <div className="relative">
                      <img
                        src={store.imageUrl}
                        alt=""
                        className="w-full h-40 object-cover rounded"
                      />
                      <button
                        onClick={openStoreImageModal}
                        className="absolute top-2 right-2"
                        aria-label="Change image"
                        title="Change image"
                      >
                        <FontAwesomeIcon icon={faImage} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openStoreImageModal}
                      className="w-full h-40 border-dashed border-2 rounded border-gray-300 flex items-center justify-center"
                      aria-label="Select store image"
                      title="Select store image"
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
                  checked={store.isOpen24Hours}
                  onChange={handleStoreChange}
                  className="mr-2"
                />
                Open 24 Hours
              </label>
              {!store.isOpen24Hours && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-1">Opening Time</label>
                    <div className="flex items-center">
                      <FontAwesomeIcon icon={faClock} className="mr-2" />
                      <input
                        type="time"
                        name="openingTime"
                        value={store.openingTime}
                        onChange={handleStoreChange}
                        className="border rounded p-2 flex-1"
                        title="Store opening time"
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
                        value={store.closingTime}
                        onChange={handleStoreChange}
                        className="border rounded p-2 flex-1"
                        title="Store closing time"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h3 className="mb-4 font-semibold">Product Categories & Items</h3>
              {/* Add Category */}
              <div className="mb-4 flex space-x-2">
                <input
                  value={newCategory.name}
                  onChange={handleNewCategoryChange}
                  placeholder="New category name (e.g., Fruits & Vegetables)"
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
                      <span className="font-medium">
                        <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                        {cat.name}
                      </span>
                      <button onClick={() => removeCategory(ci)} aria-label="Remove category" title="Remove category">
                        <FontAwesomeIcon icon={faXmark} />
                      </button>
                    </div>
                    {/* Products */}
                    <div className="p-2 space-y-2">
                      {(products[cat.id!] || []).map((product, pi) => (
                        <div key={pi} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div className="flex items-center space-x-2">
                            {product.imageUrl && (
                              <img src={product.imageUrl} className="w-12 h-12 rounded object-cover" alt="" />
                            )}
                            <div>
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-600">
                                {product.unit && `${product.unit} • `}
                                {product.weight && `${product.weight} • `}
                                {product.inStock ? "In Stock" : "Out of Stock"}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">${product.price?.toFixed(2)}</span>
                            <button
                              onClick={() => removeProduct(cat.id!, pi)}
                              className="ml-2 text-red-600"
                              aria-label="Remove product"
                              title="Remove product"
                            >
                              <FontAwesomeIcon icon={faXmark} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {/* Add product form */}
                      <div className="mt-3 p-3 bg-blue-50 rounded">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                          <input
                            name="name"
                            value={newProduct.name}
                            onChange={handleNewProductChange}
                            placeholder="Product name"
                            className="border rounded p-2"
                            title="Product name"
                          />
                          <input
                            name="price"
                            type="number"
                            value={newProduct.price ?? ""}
                            onChange={handleNewProductChange}
                            placeholder="Price"
                            step="0.01"
                            className="border rounded p-2"
                            title="Product price"
                          />
                          <input
                            name="unit"
                            value={newProduct.unit}
                            onChange={handleNewProductChange}
                            placeholder="Unit (e.g., each, bunch)"
                            className="border rounded p-2"
                            title="Product unit"
                          />
                          <input
                            name="weight"
                            value={newProduct.weight}
                            onChange={handleNewProductChange}
                            placeholder="Weight (e.g., 1 lb, 500g)"
                            className="border rounded p-2"
                            title="Product weight"
                          />
                          <textarea
                            name="description"
                            value={newProduct.description}
                            onChange={handleNewProductChange}
                            placeholder="Product description"
                            className="border rounded p-2 md:col-span-2"
                            rows={2}
                            title="Product description"
                          />
                        </div>
                        <div className="flex justify-between items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              name="inStock"
                              checked={newProduct.inStock}
                              onChange={handleNewProductChange}
                              className="mr-2"
                            />
                            In Stock
                          </label>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openProductImageModal(ci, -1)}
                              className="px-3 py-1 border rounded"
                              aria-label="Select product image"
                              title="Select product image"
                            >
                              <FontAwesomeIcon icon={faImage} />
                            </button>
                            <button 
                              onClick={() => addProduct(cat.id!)} 
                              className="px-4 py-1 bg-emerald-500 text-white rounded" 
                              aria-label="Add product" 
                              title="Add product"
                            >
                              <FontAwesomeIcon icon={faPlus} /> Add Product
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <FontAwesomeIcon icon={faShoppingCart} size="2x" />
                  <p>No categories yet</p>
                  <p className="text-sm mt-2">Start by adding product categories like "Fruits & Vegetables", "Dairy", etc.</p>
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
                  {store.imageUrl && (
                    <img src={store.imageUrl} className="w-20 h-20 rounded" alt="" />
                  )}
                  <div>
                    <h4 className="font-semibold text-lg">{store.name}</h4>
                    <p className="text-gray-600">{store.category}</p>
                  </div>
                </div>
                <div>
                  <p className="text-gray-700">{store.description}</p>
                  <p className="mt-2">
                    <span className="font-medium">Rating:</span> {store.rating} • 
                    <span className="font-medium"> Delivery Fee:</span> ${store.deliveryFee?.toFixed(2)} • 
                    <span className="font-medium"> Delivery Time:</span> {store.estimatedDeliveryTime}
                  </p>
                </div>
                <div>
                  <p>
                    <span className="font-medium">Hours:</span>{" "}
                    {store.isOpen24Hours
                      ? "Open 24 Hours"
                      : `${store.openingTime} – ${store.closingTime}`}
                  </p>
                </div>
                <div>
                  <h5 className="font-semibold mb-2">Product Inventory:</h5>
                  {categories.map((cat, ci) => (
                    <div key={ci} className="mb-3 p-3 bg-gray-50 rounded">
                      <p className="font-medium text-emerald-700 mb-2">
                        <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                        {cat.name}
                      </p>
                      <div className="space-y-1">
                        {(products[cat.id!] || []).map((product, pi) => (
                          <div key={pi} className="flex justify-between text-sm">
                            <span>
                              {product.name}
                              {product.unit && ` (${product.unit})`}
                              {product.weight && ` - ${product.weight}`}
                            </span>
                            <span>
                              ${product.price?.toFixed(2)}
                              {!product.inStock && " (Out of Stock)"}
                            </span>
                          </div>
                        ))}
                      </div>
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
              aria-label="Create grocery store"
              title="Create grocery store"
            >
              {isSubmitting ? "Creating..." : "Create Store"}
              {!isSubmitting && (
                <FontAwesomeIcon icon={faCheck} className="ml-1" />
              )}
            </button>
          )}
        </div>
      </div>

      {showImageModal && (
        <ImageSelectionModal
          imageType={imageType === "store" ? "grocery" : "groceryProduct"}
          onSelect={handleImageSelect}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default AddGroceryStoreWizard;