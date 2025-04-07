import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { useChatStore } from "../../store/useChatStore";
import { ChatUser } from "../../types/ChatUser";
import { useChat } from "../../hooks/useChat";
import { useTimeAgo } from "../../hooks/useTimeAgo";
import { useUserStore } from "../../store/useUserStore";
import { useChatUsersStore } from "../../store/useChatUsersStore";

interface UserProps {
  user: ChatUser;
}
const User: React.FC<UserProps> = ({ user }) => {
  const [profile, setProfile] = useState(false);
  const { user: currUser } = useUserStore();
  const { typing, newMessages, setNewMessages, setOpenUser } = useChatStore();
  const { setOpenUserActive } = useChatUsersStore();
  const { openChat } = useChat();
  const { formatTime } = useTimeAgo();

  const userMessage = (): string => {
    if (!user.lastMessage) return "";
    if (typing.includes(user.id)) return "Typing...";
    else {
      let text = user.lastMessage.text;
      if (text.length > 25) {
        if (user.lastMessage.sender === user.id)
          text = text.slice(0, 20) + "...";
        else text = "You: " + text.slice(0, 15) + "...";
      }
      return text;
    }
  };

  const isSeen = () => {
    if (!user.lastMessage) return false;
    return new Date(user.lastMessage.seen).getFullYear() > 2000;
  };

  const isDelivered = () => {
    if (!user.lastMessage) return false;
    return new Date(user.lastMessage.delivered).getFullYear() > 2000;
  };

  const lastSent = () => {
    return user.lastMessage && user.lastMessage.sender !== currUser?.id;
  };

  const hasNewMessage = () => {
    return !isSeen() && lastSent();
  };

  const agoText = () => {
    if (!user.lastMessage) return "";
    if (typing.includes(user.id)) return "";
    if (user.lastMessage.sender === user.id)
      return formatTime(user.lastMessage.sent);
    else {
      if (isSeen()) return "Seen " + formatTime(user.lastMessage.seen);
      else if (isDelivered())
        return "Delivered " + formatTime(user.lastMessage.delivered);
      return "Sent " + formatTime(user.lastMessage.sent);
    }
  };

  return (
    <div
      className="relative w-full max-h-[60px] flex items-center py-2 mt-1 hover:bg-slate-100 duration-150 ease-linear cursor-pointer"
      onClick={() => {
        setOpenUser(user);
        openChat(user.id);
        setOpenUserActive(user.active ? true : false);
        if (hasNewMessage()) setNewMessages(newMessages - 1);
      }}
    >
      {/* Profile Icon */}
      <div className="relative flex-shrink-0">
        {profile ? (
          <img className="w-10 h-10 rounded-full object-cover" />
        ) : (
          <FontAwesomeIcon
            icon={faUser}
            className="w-4 h-4 text-slate-600 bg-slate-300 hover:bg-slate-400 ease-in duration-150 p-3 rounded-full cursor-pointer"
          />
        )}
        {user.active && (
          <div className="absolute bottom-1 left-7 border-2 border-white h-3.5 w-3.5 rounded-full bg-green-400"></div>
        )}
      </div>

      {/* User Info */}
      <div className="w-full flex flex-col justify-center ml-3">
        <p
          className={`whitespace-nowrap text-base ${
            hasNewMessage() && "font-semibold"
          }`}
        >
          {user.fullName}
        </p>

        {/* Message & Timestamp */}
        <div className="w-full flex items-center justify-between">
          <p
            className={`relative flex-1 text-sm truncate ${
              hasNewMessage() && "font-semibold"
            }`}
          >
            {userMessage()}
          </p>
          <p
            className={`relative right-2 text-sm text-slate-500 text-right min-w-max pl-2 ${
              hasNewMessage() && "font-semibold"
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
