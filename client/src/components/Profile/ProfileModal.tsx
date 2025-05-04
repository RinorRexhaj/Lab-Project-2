import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserStore } from "../../store/useUserStore";
import { useSessionStore } from "../../store/useSessionStore";
import {
  faXmark,
  faUser,
  faPenToSquare,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import LogOutButton from "../../shared/LogOutButton";
import { Link } from "react-router-dom";

interface ProfileModalProps {
  setProfile: (profile: boolean) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ setProfile }) => {
  const { user } = useUserStore();
  const { role } = useSessionStore();
  const isAdmin = role === "Admin";

  // Default avatar if user doesn't have one set yet
  const avatarSrc = user?.avatar
    ? `/assets/img/user_avatar/${user.avatar}`
    : "/assets/img/user_avatar/user-avatar-1.png";

  return (
    <div className="fixed top-20 max-w-7xl w-11/12 pr-6">
      <div
        id="profile-modal"
        className="relative w-72 px-6 bg-white py-5 rounded-lg flex flex-col gap-3 font-medium text-black animate-fadeIn shadow-lg border border-gray-300 z-50"
        style={{
          left: "calc(100% - 288px)",
        }}
      >
        <FontAwesomeIcon
          icon={faXmark}
          className="cursor-pointer w-5 h-5 absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={() => setProfile(false)}
        />

        {/* User Avatar and Info */}
        <div className="flex items-center gap-4 pb-2 border-b border-gray-200">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-500 flex items-center justify-center border-2 border-white shadow-md">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <FontAwesomeIcon icon={faUser} className="w-8 h-8 text-white" />
            )}
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-semibold text-lg">{user?.fullName || "User"}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 mt-1">
          {isAdmin && (
            <Link
              to="/admin-dashboard"
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 duration-200 text-white font-semibold flex items-center justify-center gap-2 text-sm"
              onClick={() => setProfile(false)}
            >
              <FontAwesomeIcon icon={faUserShield} className="w-4 h-4" />
              Admin Dashboard
            </Link>
          )}
          <Link
            to="/profile"
            className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 duration-200 text-white font-semibold flex items-center justify-center gap-2 text-sm"
            onClick={() => setProfile(false)}
          >
            <FontAwesomeIcon icon={faPenToSquare} className="w-4 h-4" />
            Edit Profile
          </Link>
          <LogOutButton />
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
