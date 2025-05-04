import React, { useEffect, useState } from 'react';
import { useAdminUsersStore } from '../../../store/useAdminUsersStore';
import { useUserService } from '../../../services/userService';
import { SuspendUserData, UpdateUserData, User } from '../../../types/User';
import { toast } from 'react-hot-toast';

// Import components
import UserFilters from '../../../components/admin/UserFilters';
import UserTable from '../../../components/admin/UserTable';
import UserPagination from '../../../components/admin/UserPagination';
import UserDetail from '../../../components/admin/UserDetail';

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
    resetFilters
  } = useAdminUsersStore();

  const {
    getUsers,
    getUserById,
    updateUser,
    changeUserStatus,
    suspendUser,
    resetPassword,
    deleteUser
  } = useUserService();

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [currentPage, itemsPerPage, filter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      console.log('Fetching users...');
      const response = await getUsers(currentPage, itemsPerPage, filter);
      console.log('Response received:', response);
      setUsers(response.data);
      setTotalUsers(response.total);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleViewUser = async (user: User) => {
    try {
      // Get the latest user data
      const updatedUser = await getUserById(user.id);
      setSelectedUser(updatedUser);
    } catch (error) {
      console.error('Error fetching user details:', error);
      toast.error('Failed to load user details');
    }
  };

  const handleUpdateUser = async (userId: string, userData: UpdateUserData) => {
    try {
      await updateUser(userId, userData);
      toast.success('User updated successfully');
      fetchUsers(); // Refresh the user list
      
      // If the selected user was updated, refresh their details
      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = await getUserById(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  const handleChangeStatus = async (userId: string, status: string) => {
    try {
      await changeUserStatus(userId, status);
      
      const statusMap: { [key: string]: string } = {
        'active': 'activated',
        'suspended': 'suspended',
        'banned': 'banned'
      };
      
      toast.success(`User ${statusMap[status]} successfully`);
      fetchUsers(); // Refresh the user list
      
      // If the selected user's status was changed, refresh their details
      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = await getUserById(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error('Error changing user status:', error);
      toast.error('Failed to change user status');
    }
  };

  const handleSuspendUser = async (userId: string, suspendData: SuspendUserData) => {
    try {
      await suspendUser(userId, suspendData);
      toast.success('User suspended successfully');
      fetchUsers(); // Refresh the user list
      
      // If the selected user was suspended, refresh their details
      if (selectedUser && selectedUser.id === userId) {
        const updatedUser = await getUserById(userId);
        setSelectedUser(updatedUser);
      }
    } catch (error) {
      console.error('Error suspending user:', error);
      toast.error('Failed to suspend user');
    }
  };

  const handleResetPassword = async (userId: string, newPassword: string) => {
    try {
      await resetPassword(userId, newPassword);
      toast.success('Password reset successfully');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error('Failed to reset password');
    }
  };

  //Bug Fix Here - By Rinor Agaj

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        toast.success('User deleted successfully');
        fetchUsers(); // Refresh the user list
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser(null); // Close the user detail modal
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-700 mb-2 sm:mb-0">User Management</h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            {totalUsers} {totalUsers === 1 ? 'user' : 'users'} found
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
      <UserTable 
        users={users}
        loading={loading}
        onViewUser={handleViewUser}
      />

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
