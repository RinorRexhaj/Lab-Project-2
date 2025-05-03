import React, { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faXmark, 
  faSave, 
  faLock, 
  faUnlock, 
  faKey 
} from '@fortawesome/free-solid-svg-icons';
import { SuspendUserData, UpdateUserData, User, UserRole } from '../../types/User';

interface UserDetailProps {
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, data: UpdateUserData) => void;
  onChangeStatus: (userId: string, status: string) => void;
  onSuspend: (userId: string, data: SuspendUserData) => void;
  onResetPassword: (userId: string, password: string) => void;
}

const UserDetail: React.FC<UserDetailProps> = ({
  user,
  onClose,
  onSave,
  onChangeStatus,
  onSuspend,
  onResetPassword,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateUserData>({});
  const [suspendData, setSuspendData] = useState<SuspendUserData>({ reason: '' });
  const [reasonCharCount, setReasonCharCount] = useState(0);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [showSuspendForm, setShowSuspendForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const roleOptions: UserRole[] = ['User', 'Admin', 'Driver', 'Vendor'];

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSuspendInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Handle character limit for reason field
    if (name === 'reason') {
      // Limit to 20 characters
      const limitedValue = value.slice(0, 20);
      setSuspendData({ ...suspendData, [name]: limitedValue });
      setReasonCharCount(limitedValue.length);
    } else {
      setSuspendData({ ...suspendData, [name]: value });
    }
  };

  const handleSave = () => {
    onSave(user.id, formData);
    setIsEditing(false);
    setFormData({});
  };

  const handleResetPassword = () => {
    if (newPassword) {
      onResetPassword(user.id, newPassword);
      setNewPassword('');
      setShowPasswordReset(false);
    }
  };

  const handleSuspend = () => {
    if (suspendData.reason) {
      onSuspend(user.id, suspendData);
      setSuspendData({ reason: '' });
      setReasonCharCount(0);
      setShowSuspendForm(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Invalid date';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div ref={modalRef} className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit User Profile' : 'User Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
          >
            <FontAwesomeIcon icon={faXmark} className="h-5 w-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar section */}
            <div className="flex flex-col items-center">
              <div className="h-32 w-32 mb-4">
                {user.avatar ? (
                  <img
                    className="h-full w-full rounded-full object-cover border-2 border-emerald-200 shadow-md"
                    src={`${user.avatar.startsWith('http') ? user.avatar : `/images/${user.avatar}`}`}
                    alt={user.fullName}
                    onError={(e) => {
                      // If image fails to load, show initials instead
                      e.currentTarget.style.display = 'none';
                      const initials = document.getElementById(`user-initials-${user.id}`);
                      if (initials) initials.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div 
                  id={`user-initials-${user.id}`} 
                  className={`h-full w-full rounded-full bg-emerald-100 flex items-center justify-center ${user.avatar ? 'hidden' : ''}`}
                >
                  <span className="text-emerald-800 text-2xl font-medium">
                    {user.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                  user.status === 'active' || !user.status
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
                  }`}
                  >
                    {(user.status || 'active').charAt(0).toUpperCase() + (user.status || 'active').slice(1)}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* User details/form section */}
            <div className="flex-1">
              {isEditing ? (
                <form className="space-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      id="fullName"
                      defaultValue={user.fullName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      defaultValue={user.email}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      name="role"
                      id="role"
                      defaultValue={user.role}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      id="address"
                      defaultValue={user.address || ''}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                    />
                  </div>
                </form>
              ) : (
                <div className="space-y-3">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{user.fullName}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    {user.address && (
                      <p className="text-sm text-gray-500 mt-1">{user.address}</p>
                    )}
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700">Account Information</h4>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Date Joined</p>
                        <p className="text-sm">{user.dateJoined ? formatDate(user.dateJoined) : 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Last Login</p>
                        <p className="text-sm">{user.lastLogin ? formatDate(user.lastLogin) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action buttons section */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <FontAwesomeIcon icon={faSave} className="mr-2 h-4 w-4" />
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({});
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <FontAwesomeIcon icon={faXmark} className="mr-2 h-4 w-4" />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(true)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <FontAwesomeIcon icon={faKey} className="mr-2 h-4 w-4" />
                    Reset Password
                  </button>
                  {user.status === 'active' || !user.status ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSuspendForm(true);
                        setReasonCharCount(0);
                      }}
                      className="inline-flex items-center px-4 py-2 border border-yellow-300 rounded-md shadow-sm text-sm font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                    >
                      <FontAwesomeIcon icon={faLock} className="mr-2 h-4 w-4" />
                      Suspend User
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onChangeStatus(user.id, 'active')}
                      className="inline-flex items-center px-4 py-2 border border-green-300 rounded-md shadow-sm text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <FontAwesomeIcon icon={faUnlock} className="mr-2 h-4 w-4" />
                      Activate User
                    </button>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Password Reset Form */}
          {showPasswordReset && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Reset Password</h3>
              <div className="mt-2">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                  placeholder="Enter new password"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleResetPassword}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Reset Password
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordReset(false);
                    setNewPassword('');
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Suspend Form */}
          {showSuspendForm && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Suspend User</h3>
              <div className="mt-2">
                <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
                  Reason for Suspension
                </label>
                <textarea
                  name="reason"
                  id="reason"
                  rows={3}
                  value={suspendData.reason}
                  onChange={handleSuspendInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm resize-none"
                  placeholder="Enter reason for suspension"
                  maxLength={20}
                />
                <div className="text-xs text-gray-500 text-right mt-1">
                  {reasonCharCount}/20 characters
                </div>
              </div>
              <div className="mt-2">
                <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700">
                  Expiry Date (Optional)
                </label>
                <input
                  type="date"
                  name="expiryDate"
                  id="expiryDate"
                  value={suspendData.expiryDate || ''}
                  onChange={handleSuspendInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm"
                />
              </div>
              <div className="mt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleSuspend}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Suspend User
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowSuspendForm(false);
                    setSuspendData({ reason: '' });
                    setReasonCharCount(0);
                  }}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
