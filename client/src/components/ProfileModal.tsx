import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useUserStore } from "../store/useUserStore";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import LogOutButton from "../shared/LogOutButton";

interface ProfileModalProps {
  setProfile: (profile: boolean) => void;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ setProfile }) => {
  const { user } = useUserStore();

  return (
    <div className="fixed top-20 md:top-[470px] max-w-7xl w-11/12 pr-6">
      <div
        id="profile-modal"
        className="relative w-60 px-6 bg-white py-4 rounded-lg flex flex-col gap-2 font-medium text-black animate-fadeIn shadow-lg border border-gray-300 z-50"
        style={{
          left: "calc(100% - 240px)",
        }}
      >
        <p className="font-semibold text-lg">{user?.fullName}</p>
        <p className="text-sm text-gray-600">{user?.email}</p>
        {user?.address && (
          <p className="text-sm text-gray-600">{user.address}</p>
        )}
        <FontAwesomeIcon
          icon={faXmark}
          className="cursor-pointer w-5 h-5 absolute top-3 right-3"
          onClick={() => setProfile(false)}
        />
        <div className="mt-3">
          <LogOutButton />
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
