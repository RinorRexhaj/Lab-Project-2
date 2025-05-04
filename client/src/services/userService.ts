// Define interface for backend user structure
interface BackendUser {
  id: string | number;
  fullName: string;
  email: string;
  role: string;
  status?: "active" | "suspended" | "banned";
  dateJoined?: string;
  lastLogin?: string;
  address?: string;
  avatar?: string;
  [key: string]: unknown; // For any other properties that might exist
}

// Define interface for API response
interface UserApiResponse {
  users?: BackendUser[];
  user?: BackendUser;
  success?: boolean;
  deleted?: boolean;
  [key: string]: unknown; // For any other properties that might exist
}
import useApi from "../hooks/useApi";
import {
  SuspendUserData,
  UpdateUserData,
  User,
  UserFilter,
} from "../types/User";

export const useUserService = () => {
  const { get, post, patch, del } = useApi();

  const transformUser = (backendUser: BackendUser): User => {
    // Transform backend user format to frontend format
    return {
      id: Number(backendUser.id),
      fullName: backendUser.fullName,
      email: backendUser.email,
      role: backendUser.role,
      status: backendUser.status || "active", // Default to active if status not provided
      dateJoined: backendUser.dateJoined || new Date().toISOString(), // Use current date if not provided
      lastLogin: backendUser.lastLogin || new Date().toISOString(), // Use current date if not provided
      address: backendUser.address,
      avatar: backendUser.avatar,
    };
  };

  const getUsers = async (page: number, limit: number, filter: UserFilter) => {
    try {
      // Get all users from the backend
      const response = (await get("/user")) as UserApiResponse;
      let users = response?.users || [];

      if (!response || !Array.isArray(users)) {
        console.error("Invalid response format:", response);
        return { data: [], total: 0 };
      }

      // Client-side filtering
      if (filter.search) {
        const searchTerm = filter.search.toLowerCase();
        users = users.filter(
          (user: BackendUser) =>
            user.fullName.toLowerCase().includes(searchTerm) ||
            user.email.toLowerCase().includes(searchTerm)
        );
      }

      if (filter.role) {
        users = users.filter((user: BackendUser) => user.role === filter.role);
      }

      if (filter.status) {
        users = users.filter(
          (user: BackendUser) => user.status === filter.status
        );
      }

      // Apply pagination
      const total = users.length;
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedUsers = users.slice(start, end);

      // Transform users to frontend format
      const transformedUsers = paginatedUsers.map(transformUser);

      return {
        data: transformedUsers,
        total,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  };

  const getUserById = async (userId: string) => {
    try {
      const response = (await get(`/user/${userId}`)) as UserApiResponse;
      const user = response?.user;

      if (!user) {
        throw new Error("User not found");
      }

      return transformUser(user);
    } catch (error) {
      console.error("Error fetching user details:", error);
      throw error;
    }
  };

  const updateUser = async (userId: string, userData: UpdateUserData) => {
    try {
      // Map our frontend update data to backend format
      const backendUpdateData = {
        fullname: userData.fullName || undefined,
        email: userData.email || undefined,
        role: userData.role || undefined,
        address: userData.address || undefined,
        status: userData.status || undefined,
      };

      // Remove any undefined values to prevent overwriting with null
      Object.keys(backendUpdateData).forEach((key) => {
        if (
          backendUpdateData[key as keyof typeof backendUpdateData] === undefined
        ) {
          delete backendUpdateData[key as keyof typeof backendUpdateData];
        }
      });

      console.log("Updating user with data:", backendUpdateData);
      const response = (await patch(
        `/user/${userId}`,
        backendUpdateData
      )) as UserApiResponse;
      if (response.user) return transformUser(response.user);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const changeUserStatus = async (userId: string, status: string) => {
    try {
      let response;

      if (status === "active") {
        response = (await post(
          `/user/${userId}/activate`,
          {}
        )) as UserApiResponse;
      } else if (status === "suspended") {
        response = (await post(`/user/${userId}/suspend`, {
          reason: "Suspended by administrator",
          expiryDate: null,
        })) as UserApiResponse;
      }

      if (response?.user) return transformUser(response.user);
    } catch (error) {
      console.error("Error changing user status:", error);
      throw error;
    }
  };

  const suspendUser = async (userId: string, suspendData: SuspendUserData) => {
    try {
      const response = (await post(
        `/user/${userId}/suspend`,
        suspendData
      )) as UserApiResponse;
      if (response.user) return transformUser(response.user);
    } catch (error) {
      console.error("Error suspending user:", error);
      throw error;
    }
  };

  const resetPassword = async (userId: string, newPassword: string) => {
    try {
      // Use the admin password reset endpoint
      const response = (await patch(`/user/${userId}/password`, {
        newPassword,
      })) as UserApiResponse;

      return { success: response?.success || true };
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  //Bug Fix Here - By Rinor Agaj

  const deleteUser = async (userId: string) => {
    try {
      const response = (await del(`/user/${userId}`)) as UserApiResponse;
      return response.deleted;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw error;
    }
  };

  return {
    getUsers,
    getUserById,
    updateUser,
    changeUserStatus,
    suspendUser,
    resetPassword,

    deleteUser,
  };
};
