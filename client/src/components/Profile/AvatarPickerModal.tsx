import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faCheck } from "@fortawesome/free-solid-svg-icons";

interface AvatarPickerModalProps {
  currentAvatar: string;
  onSelect: (avatar: string) => void;
  onClose: () => void;
}

const AvatarPickerModal: React.FC<AvatarPickerModalProps> = ({
  currentAvatar,
  onSelect,
  onClose,
}) => {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);

  // Generate list of avatar file names
  useEffect(() => {
    const avatarList = Array.from({ length: 15 }, (_, i) => `user-avatar-${i + 1}.png`);
    setAvatars(avatarList);
  }, []);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.getElementById("avatar-picker-modal");
      if (modal && !modal.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  // Handle avatar selection
  const handleAvatarClick = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  // Handle confirm selection
  const handleConfirm = () => {
    onSelect(selectedAvatar);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div 
        id="avatar-picker-modal"
        className="bg-white rounded-lg shadow-xl p-6 max-w-md w-11/12 max-h-[90vh] overflow-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Choose an Avatar</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close"
          >
            <FontAwesomeIcon icon={faXmark} className="w-5 h-5" />
          </button>
        </div>

        {/* Current Avatar Preview */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center border-2 border-white shadow-md">
            <img
              src={`/assets/img/user_avatar/${selectedAvatar}`}
              alt="Selected Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Avatar Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
          {avatars.map((avatar) => (
            <div
              key={avatar}
              className={`relative cursor-pointer rounded-full overflow-hidden border-2 aspect-square bg-gradient-to-r from-emerald-500 to-teal-500 ${
                selectedAvatar === avatar
                  ? "border-white shadow-md"
                  : "border-transparent hover:border-white hover:shadow-sm"
              }`}
              onClick={() => handleAvatarClick(avatar)}
            >
              <img
                src={`/assets/img/user_avatar/${avatar}`}
                alt={`Avatar ${avatar}`}
                className="w-full h-full object-cover"
              />
              {selectedAvatar === avatar && (
                <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-1">
                  <FontAwesomeIcon icon={faCheck} className="w-2 h-2 text-white" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 transition-colors"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPickerModal;