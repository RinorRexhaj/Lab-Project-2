import React, { useState, useEffect } from "react";
import { groceryService } from "../../../api/GroceryService";
import { GroceryStore } from "../../../types/grocery/GroceryStore";
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
import AddGroceryStoreWizard from "../../../components/admin/AddGroceryStoreWizard";
import EditGroceryStoreWizard from "../../../components/admin/EditGroceryStoreWizard";
import DeleteConfirmationModal from "../../../components/admin/DeleteConfirmationModal";

const GroceryTab: React.FC = () => {
  const [stores, setStores] = useState<GroceryStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<keyof GroceryStore | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [showAddWizard, setShowAddWizard] = useState(false);
  const [showEditWizard, setShowEditWizard] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState<GroceryStore | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const allStores = await groceryService.getAllStores();
      setStores(allStores);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch grocery stores:", err);
      setError("Failed to load grocery stores. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAddWizard = () => {
    setShowAddWizard(true);
  };

  const handleCloseAddWizard = () => {
    setShowAddWizard(false);
    fetchStores(); // Refresh the list after adding
  };

  const handleOpenEditWizard = (store: GroceryStore) => {
    setSelectedStore(store);
    setShowEditWizard(true);
  };

  const handleCloseEditWizard = () => {
    setShowEditWizard(false);
    setSelectedStore(null);
    fetchStores(); // Refresh the list after editing
  };

  const handleOpenDeleteModal = (store: GroceryStore) => {
    setSelectedStore(store);
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setSelectedStore(null);
  };

  const handleDeleteStore = async () => {
    if (!selectedStore) return;

    try {
      await groceryService.deleteStore(selectedStore.id);
      setShowDeleteModal(false);
      setSelectedStore(null);
      fetchStores(); // Refresh the list after deletion
    } catch (err: any) {
      console.error("Failed to delete grocery store:", err);
      setError("Failed to delete grocery store. Please try again.");
    }
  };

  const handleSort = (field: keyof GroceryStore) => {
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



  // Filter and sort the stores
  const filteredStores = stores.filter((store) => {
    return (
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (store.category &&
        store.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const sortedStores = [...filteredStores].sort((a, b) => {
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

  const getSortIcon = (field: keyof GroceryStore) => {
    if (sortField !== field) return <FontAwesomeIcon icon={faSort} />;
    return sortDirection === "asc" ? (
      <FontAwesomeIcon icon={faSortUp} />
    ) : (
      <FontAwesomeIcon icon={faSortDown} />
    );
  };

  const getOperatingHours = (store: GroceryStore) => {
    if (store.isOpen24Hours) {
      return "24 Hours";
    }
    return `${store.openingTime || "N/A"} - ${store.closingTime || "N/A"}`;
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-700">
          Grocery Store Management
        </h2>
        <button
          onClick={handleOpenAddWizard}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg flex items-center space-x-2 hover:bg-emerald-600 transition duration-200"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span>Add Store</span>
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
            placeholder="Search stores by name, category or description..."
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

      {/* Store table */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
      ) : sortedStores.length > 0 ? (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Store Name</span>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Operating Hours
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Delivery Time
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedStores.map((store) => (
                <tr key={store.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={store.imageUrl}
                          alt={store.name}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/img/placeholder.jpg';
                          }}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {store.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-100 text-emerald-800">
                      {store.category || "Uncategorized"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span className={store.isOpen24Hours ? "font-semibold text-emerald-600" : ""}>
                      {getOperatingHours(store)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      {store.rating}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      ${store.deliveryFee.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.estimatedDeliveryTime}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleOpenEditWizard(store)}
                      className="text-emerald-600 hover:text-emerald-900 mr-3"
                      title="Edit store"
                    >
                      <FontAwesomeIcon icon={faEdit} /> Edit
                    </button>
                    <button
                      onClick={() => handleOpenDeleteModal(store)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete store"
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
            No grocery stores found matching your search.
          </p>
        </div>
      )}

      {showAddWizard && <AddGroceryStoreWizard onClose={handleCloseAddWizard} />}

      {showEditWizard && selectedStore && (
        <EditGroceryStoreWizard
          store={selectedStore}
          onClose={handleCloseEditWizard}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedStore && (
        <DeleteConfirmationModal
          restaurantName={selectedStore.name}
          onConfirm={handleDeleteStore}
          onCancel={handleCloseDeleteModal}
        />
      )}
    </div>
  );
};

export default GroceryTab;
