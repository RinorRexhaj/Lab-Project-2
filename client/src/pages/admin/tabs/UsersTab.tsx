import { useEffect, useState } from "react";
import { useAdminUsersStore } from "../../../store/useAdminUsersStore";
import { useUserService } from "../../../services/userService";
import { SuspendUserData, UpdateUserData, User } from "../../../types/User";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faX } from "@fortawesome/free-solid-svg-icons";

// Import components
import UserFilters from "../../../components/admin/UserFilters";
import UserTable from "../../../components/admin/UserTable";
import UserPagination from "../../../components/admin/UserPagination";
import UserDetail from "../../../components/admin/UserDetail";

const UsersTab = () => {
  const {
    users,
    totalUsers,
    currentPage,
    itemsPerPage,
    loading,
    selectedUser,
    filter,
    setUsers,
    setTotalUsers,
    setCurrentPage,
    setItemsPerPage,
    setLoading,
    setSelectedUser,
    setFilter,
    resetFilters,
  } = useAdminUsersStore();

  const {
    getUsers,
    getUserById,
    updateUser,
    changeUserStatus,
    suspendUser,
    resetPassword,
    // deleteUser
  } = useUserService();

  const [showModal, setShowModal] = useState(false);
  const [dataType, setDataType] = useState("VARCHAR");

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers(currentPage, itemsPerPage, filter);
      if (response.data) {
        setUsers(response.data);
      }
      setTotalUsers(response.total);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user: User) => {
    try {
      // Get the latest user data
      const updatedUser = await getUserById(String(user.id));
      setSelectedUser(updatedUser);
    } catch (error) {
      console.error("Error fetching user details:", error);
      toast.error("Failed to load user details");
    }
  };

  const handleUpdateUser = async (userId: string, userData: UpdateUserData) => {
    try {
      await updateUser(userId, userData);
      toast.success("User updated successfully");
      fetchUsers(); // Refresh the user list

      // If the selected user was updated, refresh their details
      if (selectedUser && String(selectedUser.id) === userId) {
        const updatedUser = await getUserById(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Failed to update user");
    }
  };

  const handleChangeStatus = async (userId: string, status: string) => {
    try {
      await changeUserStatus(userId, status);

      const statusMap: { [key: string]: string } = {
        active: "activated",
        suspended: "suspended",
        banned: "banned",
      };

      toast.success(`User ${statusMap[status]} successfully`);
      fetchUsers(); // Refresh the user list

      // If the selected user's status was changed, refresh their details
      if (selectedUser && String(selectedUser.id) === userId) {
        const updatedUser = await getUserById(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error("Error changing user status:", error);
      toast.error("Failed to change user status");
    }
  };

  const handleSuspendUser = async (
    userId: string,
    suspendData: SuspendUserData
  ) => {
    try {
      await suspendUser(userId, suspendData);
      toast.success("User suspended successfully");
      fetchUsers(); // Refresh the user list

      // If the selected user was suspended, refresh their details
      if (selectedUser && String(selectedUser.id) === userId) {
        const updatedUser = await getUserById(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error("Error suspending user:", error);
      toast.error("Failed to suspend user");
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      await resetPassword(userId, newPassword);
      toast.success("Password reset successfully");
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error("Failed to reset password");
    }
  };

  //Bug Fix Here - By Rinor Agaj

  // const handleDeleteUser = async (userId: string) => {
  //   if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
  //     try {
  //       await deleteUser(userId);
  //       toast.success('User deleted successfully');
  //       fetchUsers(); // Refresh the user list
  //       if (selectedUser && String(selectedUser.id) === userId) {
  //         setSelectedUser(null); // Close the user detail modal
  //       }
  //     } catch (error) {
  //       console.error('Error deleting user:', error);
  //       toast.error('Failed to delete user');
  //     }
  //   }
  // };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">
            User Management
          </h2>
          <button
            title="Add a column for Users table"
            className="flex items-center gap-2 bg-emerald-500 text-white hover:bg-emerald-700 p-[8px] rounded-full"
            onClick={() => setShowModal(true)}
          >
            <FontAwesomeIcon icon={faPlus} />
            Add a Column
          </button>
          {showModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="relative flex flex-col justify-center items-center bg-white p-8 rounded-md text-center max-w-lg w-full">
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  <FontAwesomeIcon icon={faX} />
                </button>
                <h2 className="text-xl font-bold mb-4">Add New Column</h2>

                <form className="space-y-4">
                  <div>
                    <input
                      type="text"
                      className="w-full border px-3 py-2 rounded"
                      placeholder="Column Name..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-left">
                      Data Type
                    </label>
                    <select
                      className="w-full border px-3 py-2 rounded"
                      value={dataType}
                      onChange={(e) => setDataType(e.target.value)}
                    >
                      <option value="VARCHAR">VARCHAR</option>
                      <option value="INTEGER">INTEGER</option>
                      <option value="DECIMAL">DECIMAL</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="DATE">DATE</option>
                    </select>
                  </div>

                  {/* VARCHAR: Needs Length */}
                  {dataType === "VARCHAR" && (
                    <div>
                      <input
                        type="number"
                        min="0"
                        max="255"
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Length (0-255)..."
                        required
                      />
                    </div>
                  )}

                  {/* DECIMAL: Needs Precision */}
                  {dataType === "DECIMAL" && (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <input
                          type="number"
                          className="w-full border px-3 py-2 rounded"
                          placeholder="Precision (e.g. 10)..."
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="number"
                          className="w-full border px-3 py-2 rounded"
                          placeholder="Scale (e.g. 2)..."
                        />
                      </div>
                    </div>
                  )}

                  {/* INTEGER: Auto Increment */}
                  {dataType === "INTEGER" && (
                    <div>
                      <label className="flex items-center gap-2 mt-2">
                        <input type="checkbox" />
                        Auto Increment
                      </label>
                    </div>
                  )}

                  {/* Shared Optional Fields (when relevant) */}
                  {[
                    "VARCHAR",
                    "INTEGER",
                    "DECIMAL",
                    "BOOLEAN",
                    "DATE",
                  ].includes(dataType) && (
                    <div className="flex flex-wrap gap-4 mt-2">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        Nullable
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" />
                        Unique
                      </label>
                    </div>
                  )}

                  {/* Optional: Default Value */}
                  {dataType !== "BOOLEAN" && (
                    <div>
                      <input
                        type="text"
                        className="w-full border px-3 py-2 rounded"
                        placeholder="Default Value..."
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="bg-emerald-600 text-white px-4 py-2 rounded"
                  >
                    Add Column
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {totalUsers} {totalUsers === 1 ? "user" : "users"} found
          </span>
        </div>
      </div>

      {/* Filters */}
      <UserFilters
        filter={filter}
        onFilterChange={setFilter}
        onResetFilters={resetFilters}
      />

      {/* User Table */}
      <UserTable users={users} loading={loading} onViewUser={handleViewUser} />

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <UserPagination
          currentPage={currentPage}
          totalItems={totalUsers}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <UserDetail
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={handleUpdateUser}
          onChangeStatus={handleChangeStatus}
          onSuspend={handleSuspendUser}
          onResetPassword={handleResetPassword}
        />
      )}
    </div>
  );
};

export default UsersTab;
