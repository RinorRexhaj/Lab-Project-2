import React, { useState, useEffect } from "react";
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
  faTrash,
  faPencilAlt,
  faBoxes,
} from "@fortawesome/free-solid-svg-icons";
import { GroceryStore, GroceryCategory } from "../../types/grocery/GroceryStore";
import { GroceryProduct } from "../../types/grocery/GroceryProduct";
import { groceryService } from "../../api/GroceryService";
import ImageSelectionModal from "../admin/ImageSelectionModal";

interface EditGroceryStoreWizardProps {
  store: GroceryStore;
  onClose: () => void;
}

const EditGroceryStoreWizard: React.FC<EditGroceryStoreWizardProps> = ({ store: initialStore, onClose }) => {
  // Wizard steps
  const [currentStep, setCurrentStep] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageType, setImageType] = useState<"store" | "product">("store");
  const [currentCategory, setCurrentCategory] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState<string | null>(null); // 'category' or 'product'
  const [editItemIndex, setEditItemIndex] = useState<number | null>(null);

  // Store data
  const [store, setStore] = useState<GroceryStore>({
    ...initialStore,
    isOpen24Hours: initialStore.isOpen24Hours || false,
    openingTime: initialStore.openingTime || "08:00",
    closingTime: initialStore.closingTime || "22:00",
  });

  // Categories and products data
  const [categories, setCategories] = useState<GroceryCategory[]>([]);
  const [products, setProducts] = useState<{ [categoryId: number]: GroceryProduct[] }>({});
  
  // Temp form data for adding/editing categories and products
  const [tempCategory, setTempCategory] = useState<Partial<GroceryCategory>>({
    name: "",
  });
  const [tempProduct, setTempProduct] = useState<Partial<GroceryProduct>>({
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    unit: "",
    weight: "",
    inStock: true,
  });

  // Fetch store details with products
  useEffect(() => {
    const fetchStoreWithProducts = async () => {
      try {
        setIsLoading(true);
        const storeData = await groceryService.getStoreWithProducts(initialStore.id);
        
        setStore({
          ...storeData,
          isOpen24Hours: storeData.isOpen24Hours || false,
          openingTime: storeData.openingTime || "08:00",
          closingTime: storeData.closingTime || "22:00",
        });
        
        if (storeData.products) {
          setCategories(storeData.products);
          
          // Organize products by category
          const productsByCategory: { [categoryId: number]: GroceryProduct[] } = {};
          storeData.products.forEach(category => {
            if (category.items && category.id) {
              productsByCategory[category.id] = category.items;
            }
          });
          setProducts(productsByCategory);
        }
      } catch (error) {
        console.error("Failed to fetch store details:", error);
        setError("Failed to load store details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreWithProducts();
  }, [initialStore.id]);

  const handleStoreChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Handle checkbox separately
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setStore({ ...store, [name]: checked });
      return;
    }
    
    // Handle numeric fields
    if (name === 'deliveryFee' || name === 'rating') {
      setStore({ ...store, [name]: parseFloat(value) || 0 });
      return;
    }
    
    setStore({ ...store, [name]: value });
  };

  const handleTempCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempCategory({ ...tempCategory, name: e.target.value });
  };

  const handleTempProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setTempProduct({ ...tempProduct, [name]: checked });
      return;
    }
    
    if (name === 'price') {
      setTempProduct({ ...tempProduct, [name]: parseFloat(value) || 0 });
      return;
    }
    
    setTempProduct({ ...tempProduct, [name]: value });
  };

  const handleImageSelect = (imagePath: string) => {
    if (imageType === "store") {
      setStore({ ...store, imageUrl: imagePath });
    } else if (currentCategory !== null) {
      if (editMode === 'product' && editItemIndex !== null) {
        // Update an existing product's image
        const updatedProducts = { ...products };
        updatedProducts[currentCategory][editItemIndex] = {
          ...updatedProducts[currentCategory][editItemIndex],
          imageUrl: imagePath
        };
        setProducts(updatedProducts);
      } else {
        // Update new product being created
        setTempProduct({ ...tempProduct, imageUrl: imagePath });
      }
    }
    setShowImageModal(false);
  };

  const openStoreImageModal = () => {
    setImageType("store");
    setShowImageModal(true);
  };

  const openProductImageModal = (categoryId: number) => {
    setImageType("product");
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
      const newCategory = await groceryService.createCategory(
        store.id,
        { name: tempCategory.name }
      );
      
      setCategories([...categories, newCategory]);
      setProducts({ ...products, [newCategory.id]: [] });
      
      // Reset temp data
      setEditMode(null);
      setTempCategory({ name: "" });
      setError(null);
    } catch (err) {
      console.error("Failed to add category:", err);
      setError("Failed to add category. Please try again.");
    }
  };

  const startEditCategory = (category: GroceryCategory) => {
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
      const updatedCategory = await groceryService.updateCategory(
        store.id,
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
      await groceryService.deleteCategory(store.id, categoryId);
      
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      setCategories(updatedCategories);
      
      // Remove associated products
      const updatedProducts = { ...products };
      delete updatedProducts[categoryId];
      setProducts(updatedProducts);
    } catch (err) {
      console.error("Failed to delete category:", err);
      setError("Failed to delete category. Please try again.");
    }
  };

  const startAddProduct = (categoryId: number) => {
    setEditMode('product');
    setCurrentCategory(categoryId);
    setTempProduct({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      unit: "",
      weight: "",
      inStock: true,
      categoryId: categoryId
    });
    setEditItemIndex(null);
  };

  const addProduct = async () => {
    if (!tempProduct.name?.trim() || currentCategory === null) {
      setError("Product name is required");
      return;
    }
    
    if (!tempProduct.price || tempProduct.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      const newProduct = await groceryService.createProduct(
        store.id,
        currentCategory,
        {
          name: tempProduct.name,
          description: tempProduct.description || "",
          price: tempProduct.price,
          imageUrl: tempProduct.imageUrl || "",
          unit: tempProduct.unit,
          weight: tempProduct.weight,
          inStock: tempProduct.inStock ?? true,
          categoryId: currentCategory
        }
      );
      
      const updatedProducts = { 
        ...products, 
        [currentCategory]: [...(products[currentCategory] || []), newProduct] 
      };
      
      setProducts(updatedProducts);
      
      // Reset temp data
      setEditMode(null);
      setTempProduct({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        unit: "",
        weight: "",
        inStock: true,
      });
      setCurrentCategory(null);
      setError(null);
    } catch (err) {
      console.error("Failed to add product:", err);
      setError("Failed to add product. Please try again.");
    }
  };

  const startEditProduct = (categoryId: number, productIndex: number) => {
    const product = products[categoryId][productIndex];
    
    setEditMode('product');
    setCurrentCategory(categoryId);
    setEditItemIndex(productIndex);
    setTempProduct({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      imageUrl: product.imageUrl,
      unit: product.unit,
      weight: product.weight,
      inStock: product.inStock,
      categoryId: categoryId
    });
  };

  const updateProduct = async () => {
    if (!tempProduct.name?.trim() || currentCategory === null || editItemIndex === null) {
      setError("Product name is required");
      return;
    }
    
    if (!tempProduct.price || tempProduct.price <= 0) {
      setError("Price must be greater than 0");
      return;
    }

    try {
      const productId = products[currentCategory][editItemIndex].id;
      
      const updatedProduct = await groceryService.updateProduct(
        store.id,
        currentCategory,
        productId,
        {
          name: tempProduct.name,
          description: tempProduct.description || "",
          price: tempProduct.price,
          imageUrl: tempProduct.imageUrl,
          unit: tempProduct.unit,
          weight: tempProduct.weight,
          inStock: tempProduct.inStock ?? true
        }
      );
      
      const updatedProducts = { ...products };
      updatedProducts[currentCategory][editItemIndex] = updatedProduct;
      setProducts(updatedProducts);
      
      // Reset temp data
      setEditMode(null);
      setTempProduct({
        name: "",
        description: "",
        price: 0,
        imageUrl: "",
        unit: "",
        weight: "",
        inStock: true,
      });
      setCurrentCategory(null);
      setEditItemIndex(null);
      setError(null);
    } catch (err) {
      console.error("Failed to update product:", err);
      setError("Failed to update product. Please try again.");
    }
  };

  const deleteProduct = async (categoryId: number, productIndex: number) => {
    try {
      const productId = products[categoryId][productIndex].id;
      
      await groceryService.deleteProduct(store.id, categoryId, productId);
      
      const updatedProducts = { ...products };
      updatedProducts[categoryId] = [
        ...updatedProducts[categoryId].slice(0, productIndex),
        ...updatedProducts[categoryId].slice(productIndex + 1)
      ];
      setProducts(updatedProducts);
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError("Failed to delete product. Please try again.");
    }
  };

  const cancelEdit = () => {
    setEditMode(null);
    setTempCategory({ name: "" });
    setTempProduct({
      name: "",
      description: "",
      price: 0,
      imageUrl: "",
      unit: "",
      weight: "",
      inStock: true,
    });
    setCurrentCategory(null);
    setEditItemIndex(null);
  };

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!store.name || !store.description || !store.category || !store.imageUrl) {
        setError("Please fill in all required fields and select an image");
        return;
      }
      if (store.rating < 0 || store.rating > 5) {
        setError("Rating must be between 0 and 5");
        return;
      }
      if (store.deliveryFee < 0) {
        setError("Delivery fee cannot be negative");
        return;
      }
    } else if (currentStep === 2) {
      if (!store.isOpen24Hours && (!store.openingTime || !store.closingTime)) {
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
      
      // Update the store basic info
      await groceryService.updateStore(store.id, {
        name: store.name,
        description: store.description,
        category: store.category,
        deliveryFee: store.deliveryFee,
        estimatedDeliveryTime: store.estimatedDeliveryTime,
        rating: store.rating,
        imageUrl: store.imageUrl,
        isOpen24Hours: store.isOpen24Hours,
        openingTime: store.openingTime,
        closingTime: store.closingTime
      });
      
      onClose(); // Close the wizard after successful submission
    } catch (err) {
      console.error("Failed to update store:", err);
      setError("Failed to update store. Please try again.");
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
            <p className="text-lg text-gray-700">Loading store data...</p>
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
            {currentStep === 3 ? "Review Changes" : `Edit Store - Step ${currentStep} of 3`}
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
                    ? "Hours & Products"
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
          {/* Step 1: Basic Store Information */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Basic Store Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Store Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={store.name}
                    onChange={handleStoreChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    placeholder="Store name"
                    title="Store name"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={store.category}
                    onChange={handleStoreChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    title="Store category"
                  >
                    <option value="">Select Category</option>
                    <option value="Supermarket">Supermarket</option>
                    <option value="Organic">Organic</option>
                    <option value="Convenience">Convenience</option>
                    <option value="International">International</option>
                    <option value="Specialty">Specialty</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={store.description}
                    onChange={handleStoreChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    rows={3}
                    required
                    placeholder="Store description"
                    title="Store description"
                  ></textarea>
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rating (0-5) *
                  </label>
                  <input
                    type="number"
                    name="rating"
                    value={store.rating}
                    onChange={handleStoreChange}
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    title="Store rating"
                  />
                </div>

                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Delivery Fee ($) *
                  </label>
                  <input
                    type="number"
                    name="deliveryFee"
                    value={store.deliveryFee}
                    onChange={handleStoreChange}
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
                    value={store.estimatedDeliveryTime}
                    onChange={handleStoreChange}
                    placeholder="e.g., 25-40 min"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                    title="Estimated delivery time"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Store Image *
                  </label>
                  {store.imageUrl ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border border-gray-300">
                      <img
                        src={store.imageUrl}
                        alt="Store"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={openStoreImageModal}
                        className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                        aria-label="Change store image"
                        title="Change image"
                      >
                        <FontAwesomeIcon icon={faImage} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={openStoreImageModal}
                      className="flex items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg hover:border-emerald-500 transition-colors focus:outline-none"
                    >
                      <div className="text-center">
                        <FontAwesomeIcon
                          icon={faImage}
                          className="text-gray-400 text-3xl mb-2"
                        />
                        <p className="text-sm text-gray-600">
                          Click to select a store image
                        </p>
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Hours and Products Management */}
          {currentStep === 2 && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Operating Hours</h3>
                <div className="mb-6">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="isOpen24Hours"
                      checked={store.isOpen24Hours}
                      onChange={(e) => 
                        setStore({ 
                          ...store, 
                          isOpen24Hours: e.target.checked 
                        })
                      }
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">Open 24 Hours</span>
                  </label>
                </div>
                {!store.isOpen24Hours && (
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
                          value={store.openingTime}
                          onChange={handleStoreChange}
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
                          value={store.closingTime}
                          onChange={handleStoreChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          title="Closing time"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-8">
                <h3 className="text-lg font-semibold mb-4">Product Management</h3>
                
                {/* Category and Product Management */}
                <div className="mb-4 flex justify-between items-center">
                  <h4 className="font-medium text-gray-700">Product Categories ({categories.length})</h4>
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
                        placeholder="Category Name (e.g., Fruits & Vegetables, Dairy, Bakery)"
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
                          <h5 className="font-semibold text-gray-700">
                            <FontAwesomeIcon icon={faBoxes} className="mr-2" />
                            {category.name}
                          </h5>
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
                        
                        {/* Products in this Category */}
                        <div className="p-4">
                          <div className="mb-4 flex justify-between items-center">
                            <h6 className="font-medium text-sm text-gray-700">Products</h6>
                            <button
                              onClick={() => startAddProduct(category.id)}
                              className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs flex items-center hover:bg-emerald-200"
                            >
                              <FontAwesomeIcon icon={faPlus} className="mr-1" />
                              Add Product
                            </button>
                          </div>
                          
                          {/* Add/Edit Product Form */}
                          {editMode === 'product' && currentCategory === category.id && (
                            <div className="mb-4 p-3 bg-gray-50 rounded-md border border-gray-200">
                              <h6 className="font-medium text-sm text-gray-700 mb-2">
                                {editItemIndex !== null ? "Edit Product" : `Add Product to ${category.name}`}
                              </h6>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <input
                                  type="text"
                                  placeholder="Product Name"
                                  value={tempProduct.name}
                                  onChange={(e) => handleTempProductChange(e as React.ChangeEvent<HTMLInputElement>)}
                                  name="name"
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <input
                                  type="number"
                                  placeholder="Price ($)"
                                  value={tempProduct.price || ""}
                                  onChange={(e) => handleTempProductChange(e as React.ChangeEvent<HTMLInputElement>)}
                                  name="price"
                                  min="0"
                                  step="0.01"
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <input
                                  type="text"
                                  placeholder="Unit (e.g., each, bunch, lb)"
                                  value={tempProduct.unit}
                                  onChange={(e) => handleTempProductChange(e as React.ChangeEvent<HTMLInputElement>)}
                                  name="unit"
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <input
                                  type="text"
                                  placeholder="Weight (e.g., 1 lb, 500g)"
                                  value={tempProduct.weight}
                                  onChange={(e) => handleTempProductChange(e as React.ChangeEvent<HTMLInputElement>)}
                                  name="weight"
                                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                                <div className="md:col-span-2">
                                  <textarea
                                    placeholder="Description"
                                    value={tempProduct.description}
                                    onChange={(e) => handleTempProductChange(e as React.ChangeEvent<HTMLTextAreaElement>)}
                                    name="description"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    rows={2}
                                  ></textarea>
                                </div>
                              </div>
                              
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                  <button
                                    onClick={() => openProductImageModal(category.id)}
                                    className="px-3 py-1 border border-gray-300 bg-white rounded-md hover:bg-gray-50 text-sm"
                                  >
                                    <FontAwesomeIcon icon={faImage} className="mr-1" /> 
                                    {tempProduct.imageUrl ? "Change Image" : "Add Image"}
                                  </button>
                                  <label className="flex items-center text-sm">
                                    <input
                                      type="checkbox"
                                      name="inStock"
                                      checked={tempProduct.inStock}
                                      onChange={handleTempProductChange}
                                      className="mr-2"
                                    />
                                    In Stock
                                  </label>
                                </div>
                                
                                <div className="flex space-x-2">
                                  <button
                                    onClick={cancelEdit}
                                    className="px-3 py-1 border border-gray-300 bg-white rounded-md text-gray-700 hover:bg-gray-50 text-sm"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={editItemIndex !== null ? updateProduct : addProduct}
                                    className="px-3 py-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 text-sm"
                                  >
                                    {editItemIndex !== null ? "Update" : "Add"} Product
                                  </button>
                                </div>
                              </div>
                              
                              {tempProduct.imageUrl && (
                                <div className="mt-2 flex items-center">
                                  <div className="w-12 h-12 rounded overflow-hidden mr-2">
                                    <img
                                      src={tempProduct.imageUrl}
                                      alt="Preview"
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <span className="text-xs text-gray-600">Image selected</span>
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Products List */}
                          {products[category.id] && products[category.id].length > 0 ? (
                            <div className="space-y-3">
                              {products[category.id].map((product, productIndex) => (
                                <div key={product.id} className="flex items-start p-3 bg-white border border-gray-200 rounded-md">
                                  {product.imageUrl && (
                                    <div className="w-16 h-16 rounded overflow-hidden mr-3 flex-shrink-0">
                                      <img
                                        src={product.imageUrl}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="flex-1">
                                    <div className="flex justify-between">
                                      <div>
                                        <h6 className="font-medium">{product.name}</h6>
                                        <p className="text-sm text-gray-600">{product.description}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {product.unit && `${product.unit} • `}
                                          {product.weight && `${product.weight} • `}
                                          {product.inStock ? 
                                            <span className="text-green-600">In Stock</span> : 
                                            <span className="text-red-600">Out of Stock</span>
                                          }
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium text-emerald-600">${product.price.toFixed(2)}</div>
                                        <div className="flex space-x-2 mt-1">
                                          <button
                                            onClick={() => startEditProduct(category.id, productIndex)}
                                            className="text-xs text-blue-600 hover:text-blue-800"
                                          >
                                            Edit
                                          </button>
                                          <button
                                            onClick={() => deleteProduct(category.id, productIndex)}
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
                              <p>No products in this category yet.</p>
                              <button
                                onClick={() => startAddProduct(category.id)}
                                className="mt-2 text-sm text-emerald-600 hover:text-emerald-800"
                              >
                                + Add your first product
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                    <FontAwesomeIcon icon={faShoppingCart} className="text-gray-300 text-5xl mb-2" />
                    <p className="text-gray-500">No categories added yet. Add a category to start managing your inventory.</p>
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
                  {store.imageUrl && (
                    <img
                      src={store.imageUrl}
                      alt={store.name}
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h4 className="text-xl font-semibold">{store.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{store.category}</p>
                    <p className="mt-2">{store.description}</p>
                    <div className="mt-2 text-sm">
                      Rating: <span className="font-semibold">{store.rating}</span> ⭐
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Delivery Information</h5>
                  <p className="text-sm">
                    Delivery Fee: <span className="font-semibold">${store.deliveryFee?.toFixed(2)}</span>
                  </p>
                  <p className="text-sm mt-1">
                    Estimated Time: <span className="font-semibold">{store.estimatedDeliveryTime}</span>
                  </p>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium mb-2">Operating Hours</h5>
                  {store.isOpen24Hours ? (
                    <p className="text-sm">Open 24 Hours</p>
                  ) : (
                    <p className="text-sm">
                      Open from <span className="font-semibold">{store.openingTime}</span> to{" "}
                      <span className="font-semibold">{store.closingTime}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h5 className="font-medium mb-3">Product Inventory ({categories.length} categories)</h5>
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div key={category.id} className="p-3 bg-gray-50 rounded-lg">
                      <h6 className="font-medium">
                        <FontAwesomeIcon icon={faBoxes} className="mr-2 text-emerald-600" />
                        {category.name}
                      </h6>
                      {products[category.id] && (
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            {products[category.id].length} products in this category
                          </p>
                          {products[category.id].length > 0 && (
                            <div className="mt-2 grid grid-cols-2 gap-2">
                              {products[category.id].map((product) => (
                                <div key={product.id} className="flex justify-between text-sm">
                                  <span>
                                    {product.name}
                                    {!product.inStock && " (Out of Stock)"}
                                  </span>
                                  <span className="font-medium">${product.price.toFixed(2)}</span>
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
          imageType={imageType === "store" ? "grocery" : "groceryProduct"}
          onSelect={handleImageSelect}
          onClose={() => setShowImageModal(false)}
        />
      )}
    </div>
  );
};

export default EditGroceryStoreWizard;