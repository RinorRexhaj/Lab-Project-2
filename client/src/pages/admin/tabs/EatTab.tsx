import React, { useState, useEffect } from "react";
import { restaurantService } from "../../../api/RestaurantService";
import { Restaurant } from "../../../types/restaurant/Restaurant";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch,
  faSort,
  faSortUp,
  faSortDown,
} from "@fortawesome/free-solid-svg-icons";
import AddRestaurantWizard from "../../../components/admin/AddRestaurantWizard";
import EditRestaurantWizard from "../../../components/admin/EditRestaurantWizard";
import DeleteConfirmationModal from "../../../components/admin/DeleteConfirmationModal";

const EatTab: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof Restaurant | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] =
    useState<Restaurant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    setLoading(true);
    try {
      const allRestaurants = await restaurantService.getAllRestaurants();
      setRestaurants(allRestaurants);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch restaurants:", err);
      setError("Failed to load restaurants. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddWizard = () => {
    setShowAddWizard(true);
  };

  const handleCloseAddWizard = () => {
    setShowAddWizard(false);
    fetchRestaurants(); // Refresh the list after adding
  };

  const handleOpenEditWizard = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowEditWizard(true);
  };

  const handleCloseEditWizard = () => {
    setShowEditWizard(false);
    setSelectedRestaurant(null);
    fetchRestaurants(); // Refresh the list after editing
  };

  const handleOpenDeleteModal = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedRestaurant(null);
  };

  const handleDeleteRestaurant = async () => {
    if (!selectedRestaurant) return;

    try {
      await restaurantService.deleteRestaurant(selectedRestaurant.id);
      setShowDeleteModal(false);
      setSelectedRestaurant(null);
      fetchRestaurants(); // Refresh the list after deletion
    } catch (err) {
      console.error("Failed to delete restaurant:", err);
      setError("Failed to delete restaurant. Please try again.");
    }
  };

  const handleSort = (field: keyof Restaurant) => {
    if (sortField === field) {
      // Toggle sort direction if same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // New sort field, default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Filter and sort the restaurants
  const filteredRestaurants = restaurants.filter((restaurant) => {
    return (
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (restaurant.category &&
        restaurant.category
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      restaurant.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    if (!sortField) return 0;

    let valA = a[sortField];
    let valB = b[sortField];

    // Handle string values
    if (typeof valA === "string" && typeof valB === "string") {
      valA = valA.toLowerCase();
      valB = valB.toLowerCase();
    }

    if (!valA || !valB) return 0;

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getSortIcon = (field: keyof Restaurant) => {
    if (sortField !== field) return <FontAwesomeIcon icon={faSort} />;
    return sortDirection === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} />
    ) : (
      <FontAwesomeIcon icon={faSortDown} />
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">
          Restaurant Management
        </h2>
        <button
          onClick={handleOpenAddWizard}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center space-x-2 hover:bg-emerald-600 transition duration-200"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Restaurant</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search restaurants by name, category or description..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Restaurant table */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : sortedRestaurants.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Name</span>
                    {getSortIcon("name")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Category</span>
                    {getSortIcon("category")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("rating")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Rating</span>
                    {getSortIcon("rating")}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("deliveryFee")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Delivery Fee</span>
                    {getSortIcon("deliveryFee")}
                  </div>
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedRestaurants.map((restaurant) => (
                <tr key={restaurant.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={restaurant.imageUrl}
                          alt={restaurant.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {restaurant.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {restaurant.category || "Uncategorized"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {restaurant.rating}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${restaurant.deliveryFee.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenEditWizard(restaurant)}
                      className="text-emerald-600 hover:text-emerald-900 mr-3"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(restaurant)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FontAwesomeIcon icon={faTrash} /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <p className="text-gray-500">
            No restaurants found matching your search.
          </p>
        </div>
      )}

      {/* Add Restaurant Wizard Modal */}
      {showAddWizard && <AddRestaurantWizard onClose={handleCloseAddWizard} />}

      {/* Edit Restaurant Wizard Modal */}
      {showEditWizard && selectedRestaurant && (
        <EditRestaurantWizard
          restaurant={selectedRestaurant}
          onClose={handleCloseEditWizard}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedRestaurant && (
        <DeleteConfirmationModal
          restaurantName={selectedRestaurant.name}
          onConfirm={handleDeleteRestaurant}
          onCancel={handleCloseDeleteModal}
        />
      )}
    </div>
  );
};

export default EatTab;
