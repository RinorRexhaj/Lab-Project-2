import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faImage, faSearch } from "@fortawesome/free-solid-svg-icons";
import { restaurantService } from "../../api/RestaurantService";

interface ImageSelectionModalProps {
  imageType: "restaurant" | "foodItem";
  onSelect: (imagePath: string) => void;
  onClose: () => void;
}

const ImageSelectionModal: React.FC<ImageSelectionModalProps> = ({
  imageType,
  onSelect,
  onClose,
}) => {
  const [images, setImages] = useState<string[]>([]);
  const [filteredImages, setFilteredImages] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        let imageUrls: string[] = [];
        
        if (imageType === "restaurant") {
          imageUrls = await restaurantService.getRestaurantImages();
        } else {
          imageUrls = await restaurantService.getFoodItemImages();
        }
        
        setImages(imageUrls);
        setFilteredImages(imageUrls);
        setError(null);
      } catch (error) {
        console.error("Error fetching images:", error);
        setError("Failed to load images. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [imageType]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    if (query.trim() === "") {
      setFilteredImages(images);
    } else {
      const filtered = images.filter(image => 
        image.toLowerCase().includes(query)
      );
      setFilteredImages(filtered);
    }
  };

  const handleImageClick = (image: string) => {
    setSelectedImage(image);
  };

  const handleConfirm = () => {
    if (selectedImage) {
      onSelect(selectedImage);
    }
  };

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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-base font-medium text-gray-900">
            Select {imageType === "restaurant" ? "Restaurant" : "Food Item"} Image
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
            aria-label="Close modal"
            title="Close"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search images..."
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
        </div>
        
        <div className="overflow-y-auto p-4 flex-grow">
          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faImage} className="text-gray-300 text-3xl mb-2" />
              <p className="text-red-500 mb-2">{error}</p>
              <p className="text-gray-500">Please make sure there are images in the {imageType === "restaurant" ? "restaurants" : "food_items"} folder.</p>
            </div>
          ) : filteredImages.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
              {filteredImages.map((image, index) => (
                <div 
                  key={index}
                  className={`aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-90 transition-all duration-200 ${
                    selectedImage === image ? 'border-emerald-500 ring-1 ring-emerald-500 shadow-sm' : 'border-gray-200'
                  }`}
                  onClick={() => handleImageClick(image)}
                >
                  <img 
                    src={image} 
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback for images that fail to load
                      e.currentTarget.src = "/assets/img/placeholder-image.jpg";
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FontAwesomeIcon icon={faImage} className="text-gray-300 text-3xl mb-2" />
              <p className="text-gray-500">No images found matching your search.</p>
            </div>
          )}
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={!selectedImage}
            className={`px-3 py-1.5 rounded-md text-sm ${
              selectedImage
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Select Image
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageSelectionModal;
