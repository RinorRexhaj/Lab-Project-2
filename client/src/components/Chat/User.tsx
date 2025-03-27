import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useChatStore } from "../../store/useChatStore";
import { ChatUser } from "../../types/ChatUser";
import { useChat } from "../../hooks/useChat";
import { useTimeAgo } from "../../hooks/useTimeAgo";
import { useUserStore } from "../../store/useUserStore";

interface UserProps {
  user: ChatUser;
  active: boolean;
}
const User: React.FC<UserProps> = ({ user, active }) => {
  const [profile, setProfile] = useState(false);
  const { user: currUser } = useUserStore();
  const { typing, setOpenUser } = useChatStore();
  const { openChat, getMessages } = useChat();
  const { formatTime } = useTimeAgo();

  const userMessage = (): string => {
    if (typing.includes(user.id)) return "Typing...";
    else {
      let text = user.lastMessage.text;
      if (text.length > 25) text = text.slice(0, 20) + "...";
      if (user.lastMessage.sender === user.id) return text;
      else return "You: " + text;
    }
  };

  const isSeen = () => {
    return new Date(user.lastMessage.seen).getFullYear() > 2000;
  };

  const lastSent = () => {
    return user.lastMessage.sender !== currUser?.id;
  };

  const agoText = () => {
    if (typing.includes(user.id)) return "";
    if (user.lastMessage.sender === user.id)
      return formatTime(user.lastMessage.sent);
    else {
      if (isSeen()) return "Seen " + formatTime(user.lastMessage.seen);
      return "Sent " + formatTime(user.lastMessage.sent);
    }
  };

  return (
    <div
      className="relative w-full min-h-15 flex py-2 mt-1 hover:bg-slate-100 duration-150 ease-linear cursor-pointer"
      onClick={() => {
        setOpenUser(user);
        openChat(user.id);
        getMessages(user.id);
      }}
    >
      {profile ? (
        <img className="w-10 h-10 rounded-full object-cover" />
      ) : (
        <FontAwesomeIcon
          icon={faUser}
          className="w-4 h-4 text-slate-600 bg-slate-300 hover:bg-slate-400 ease-in duration-150 p-3 rounded-full cursor-pointer"
        />
      )}
      {active && (
        <div className="absolute bottom-3 left-7 h-3.5 w-3.5 rounded-full bg-green-400"></div>
      )}
      <div className="w-full relative flex flex-col items-start left-3">
        <p className={`${!isSeen() && lastSent() && "font-semibold"}`}>
          {user.fullName}
        </p>
        <div
          className={`w-full flex items-center justify-between ${
            !isSeen() && lastSent() && "font-semibold"
          }`}
        >
          <p className={`relative w-2/3 flex gap-1 text-sm truncate`}>
            {userMessage()}
          </p>
          <p
            className={`relative text-sm text-slate-500 right-10 ${
              !isSeen() && lastSent() && "font-semibold"
            }`}
          >
            {agoText()}
          </p>
        </div>
      </div>
      <span className="w-full absolute bottom-0 z-10 h-[1px] bg-gray"></span>
    </div>
  );
};

export default User;
