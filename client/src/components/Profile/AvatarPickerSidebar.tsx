import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faCheck } from "@fortawesome/free-solid-svg-icons";

interface AvatarPickerSidebarProps {
  currentAvatar: string;
  onSelect: (avatar: string) => void;
}

const AvatarPickerSidebar: React.FC<AvatarPickerSidebarProps> = ({
  currentAvatar,
  onSelect,
}) => {
  const [avatars, setAvatars] = useState<string[]>([]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(currentAvatar);

  // Generate list of avatar file names
  useEffect(() => {
    const avatarList = Array.from({ length: 15 }, (_, i) => `user-avatar-${i + 1}.png`);
    setAvatars(avatarList);
  }, []);

  // Handle avatar selection
  const handleAvatarClick = (avatar: string) => {
    setSelectedAvatar(avatar);
    onSelect(avatar);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 sticky top-28">
      {/* Header */}
      <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-3 border-b border-gray-100">
        Profile Photo
      </h2>

      {/* Current Avatar */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-36 h-36 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center border-4 border-white shadow-lg relative mb-4">
          {selectedAvatar ? (
            <img 
              src={`/assets/img/user_avatar/${selectedAvatar}`} 
              alt="User Avatar" 
              className="w-full h-full object-cover"
            />
          ) : (
            <FontAwesomeIcon icon={faUser} className="w-20 h-20 text-white" />
          )}
        </div>
        <p className="text-center text-gray-600 text-sm">
          Select a new avatar from the options below
        </p>
      </div>

      {/* Avatar Options */}
      <div className="grid grid-cols-3 gap-3">
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
    </div>
  );
};

export default AvatarPickerSidebar;