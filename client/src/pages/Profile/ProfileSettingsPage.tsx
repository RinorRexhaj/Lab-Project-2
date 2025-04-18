import React, { useState, useEffect } from "react";
import { Link, useNavigate, useBeforeUnload } from "react-router-dom";
import toast from "react-hot-toast";
import { useUserStore } from "../../store/useUserStore";
import { useSessionStore } from "../../store/useSessionStore";
import { userService } from "../../api/UserService";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faUser,
  faCamera,
  faSpinner,
  faIdCard,
  faLock,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import AvatarPickerModal from "./components/AvatarPickerModal";
import ConfirmDialog from "../../shared/ConfirmDialog";
import AvatarPickerSidebar from "./components/AvatarPickerSidebar";

const ProfileSettingsPage: React.FC = () => {
  const { user, updateUser, updateAvatar, resetUser } = useUserStore();
  const { setAccessToken, setRole } = useSessionStore();
  const navigate = useNavigate();

  // Form states
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [address, setAddress] = useState(user?.address || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatar, setAvatar] = useState(user?.avatar || "user-avatar-1.png");
  
  // UI states
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  // Responsive state
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 700);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setAddress(user.address || "");
      setAvatar(user.avatar || "user-avatar-1.png");
    }
  }, [user]);

  // Track form changes
  useEffect(() => {
    const formChanged = 
      fullName !== (user?.fullName || "") ||
      address !== (user?.address || "") ||
      avatar !== (user?.avatar || "user-avatar-1.png") ||
      currentPassword !== "" ||
      newPassword !== "";
      
    setHasChanges(formChanged);
  }, [fullName, address, avatar, currentPassword, newPassword, user]);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 700);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Form validation
  const validatePasswordMatch = () => {
    if (newPassword && newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match");
      toast.error("Passwords don't match");
      return false;
    }
    
    if (newPassword && newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      toast.error("Password must be at least 6 characters");
      return false;
    }
    
    setPasswordError("");
    return true;
  };

  // Handle avatar change with immediate save
  const handleAvatarChange = async (newAvatar: string) => {
    setAvatar(newAvatar);
    setIsAvatarModalOpen(false);
    
    // Only update if changed and user exists
    if (newAvatar !== (user?.avatar || "user-avatar-1.png") && user) {
      try {
        // Immediately update avatar in backend
        const updatedUser = await userService.updateAvatar(user.id, newAvatar);
        
        // Update local state
        updateAvatar(newAvatar);
        
        toast.success("Avatar updated successfully!");
      } catch (error) {
        toast.error("Failed to update avatar. Please try again.");
        // Revert to previous avatar if update fails
        setAvatar(user.avatar || "user-avatar-1.png");
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword && !validatePasswordMatch()) {
      return;
    }
    
    if (user) {
      try {
        setIsSubmitting(true);
        
        // Create object to track which fields have changed
        const updates: { fullName?: string; address?: string; avatar?: string } = {};
        
        // Check which fields have changed
        if (fullName !== user.fullName) updates.fullName = fullName;
        if (address !== (user.address || "")) updates.address = address;
        if (avatar !== (user.avatar || "user-avatar-1.png")) updates.avatar = avatar;
        
        // Only make API call if there are changes
        if (Object.keys(updates).length > 0) {
          // Send API request to update profile
          const updatedUser = await userService.updateProfile(
            user.id,
            fullName,
            address || "",
            avatar
          );
          
          // Update local state
          updateUser({
            fullName: updatedUser.fullName,
            address: updatedUser.address
          });
          
          // If avatar changed, update it in store
          if (updates.avatar) {
            updateAvatar(avatar);
          }
          
          // Show success message
          toast.success("Profile updated successfully!");
        }
        
        // Handle password update if provided
        if (newPassword && currentPassword) {
          await handlePasswordUpdate();
        }
        
        setHasChanges(false);
      } catch (error) {
        if (error instanceof Error) {
          toast.error(error.message || "Failed to update profile");
        } else {
          toast.error("An unexpected error occurred");
        }
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Handle password update
  const handlePasswordUpdate = async () => {
    if (!user || !validatePasswordMatch()) return;
    
    try {
      setIsUpdatingPassword(true);
      
      const result = await userService.updatePassword(
        user.id,
        currentPassword,
        newPassword
      );
      
      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      toast.success("Password updated successfully");
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to update password");
      return false;
    } finally {
      setIsUpdatingPassword(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return;
    
    try {
      setIsDeleting(true);
      
      const result = await userService.deleteAccount(user.id);
      
      if (result.deleted) {
        // Clear user state
        resetUser();
        
        // Clear session
        setAccessToken("");
        setRole("");
        
        // Clear localStorage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("userData");
        
        toast.success("Your account has been deleted");
        
        // Redirect to login page
        navigate("/login");
      } else {
        toast.error(result.message || "Failed to delete account");
      }
    } catch (error: any) {
      console.error("Delete account error:", error);
      toast.error(
        error.response?.data?.error || 
        "An error occurred while deleting your account. Please try again later."
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Handle navigation away with unsaved changes
  const handleCancel = () => {
    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate("/");
    }
  };
  
  const handleConfirmLeave = () => {
    navigate("/");
  };

  // Prompt user before leaving if there are unsaved changes
  useBeforeUnload(
    React.useCallback(
      (event) => {
        if (hasChanges) {
          event.preventDefault();
          return "You have unsaved changes. Are you sure you want to leave?";
        }
      },
      [hasChanges]
    )
  );

  return (
    <div className="w-full bg-gray-50">
      <div className="max-w-7xl flex flex-col p-3 w-11/12 mx-auto space-y-12">
        {/* Back Button */}
        <div className="mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="flex md:flex-col gap-8">
          {/* Avatar Sidebar - Only visible on larger screens */}
          {!isMobile && (
            <div className="w-1/4 md:w-full">
              <AvatarPickerSidebar 
                currentAvatar={avatar}
                onSelect={handleAvatarChange}
              />
            </div>
          )}

          {/* Main Content */}
          <div className={`${isMobile ? 'w-full' : 'w-3/4'}`}>
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Avatar Section - Only visible on smaller screens */}
              {isMobile && (
                <div className="flex flex-col items-center pb-6 border-b border-gray-200">
                  <div className="relative mb-4">
                    <div className="w-32 h-32 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center border-4 border-white shadow-lg relative">
                      {avatar ? (
                        <img 
                          src={`/assets/img/user_avatar/${avatar}`} 
                          alt="User Avatar" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FontAwesomeIcon icon={faUser} className="w-16 h-16 text-white" />
                      )}
                    </div>
                    <button
                      type="button"
                      className="absolute bottom-0 right-0 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full p-2"
                      onClick={() => setIsAvatarModalOpen(true)}
                    >
                      <FontAwesomeIcon icon={faCamera} />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="text-emerald-500 hover:text-emerald-700 font-medium text-sm"
                    onClick={() => setIsAvatarModalOpen(true)}
                  >
                    Change Avatar
                  </button>
                </div>
              )}

              {/* Profile Info Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                  <FontAwesomeIcon icon={faIdCard} className="text-emerald-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
                </div>
                
                <div className="space-y-5">
                  {/* Name field */}
                  <div>
                    <label 
                      htmlFor="fullName"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      required
                    />
                  </div>
                  
                  {/* Email field (read-only) */}
                  <div>
                    <label 
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={user?.email || ""}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                      readOnly
                    />
                  </div>
                  
                  {/* Address field */}
                  <div>
                    <label 
                      htmlFor="address"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Address
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="Enter your address"
                    />
                  </div>
                </div>
              </div>

              {/* Password Update Section */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center mb-4 pb-3 border-b border-gray-100">
                  <FontAwesomeIcon icon={faLock} className="text-emerald-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-800">Password Update</h2>
                </div>
                
                <div className="space-y-5">
                  {/* Current Password */}
                  <div>
                    <label 
                      htmlFor="currentPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="Enter current password"
                    />
                  </div>
                  
                  {/* New Password */}
                  <div>
                    <label 
                      htmlFor="newPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      placeholder="Enter new password"
                    />
                  </div>
                  
                  {/* Confirm New Password */}
                  <div>
                    <label 
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={validatePasswordMatch}
                      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${
                        passwordError ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Confirm new password"
                    />
                    {passwordError && (
                      <p className="mt-1 text-sm text-red-600">{passwordError}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2 bg-emerald-500 text-white font-medium rounded-md flex items-center transition-colors ${
                    hasChanges && !isSubmitting
                      ? "hover:bg-emerald-600" 
                      : "opacity-50 cursor-not-allowed"
                  }`}
                  disabled={!hasChanges || isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>

              {/* Danger Zone */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-red-100 mt-12">
                <div className="flex items-center mb-4 pb-3 border-b border-red-100">
                  <FontAwesomeIcon icon={faExclamationTriangle} className="text-red-500 mr-3" />
                  <h2 className="text-xl font-semibold text-red-500">Danger Zone</h2>
                </div>
                <p className="text-gray-600 mb-4">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
                <div>
                  <button
                    type="button"
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-md transition-colors"
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <FontAwesomeIcon icon={faSpinner} className="mr-2 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Avatar Picker Modal - Only for mobile view */}
      {isAvatarModalOpen && (
        <AvatarPickerModal
          currentAvatar={avatar}
          onSelect={handleAvatarChange}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      )}
      
      {/* Confirm Dialog for Unsaved Changes */}
      <ConfirmDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmLeave}
        title="Unsaved Changes"
        message="You have unsaved changes. Are you sure you want to leave without saving?"
        confirmText="Leave"
        cancelText="Stay"
        type="warning"
      />
      
      {/* Confirm Dialog for Account Deletion */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDeleteAccount}
        title="Delete Account"
        message="This action cannot be undone. All your data will be permanently removed. Are you sure you want to delete your account?"
        confirmText="Yes, Delete My Account"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default ProfileSettingsPage;