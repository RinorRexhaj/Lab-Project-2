import { useEffect, useRef, useState } from "react";
import {
  faCircleLeft,
  faMessage,
  faUser,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatStore } from "../../store/useChatStore";
import Input from "./Input";
import { useChat } from "../../hooks/useChat";
import Search from "./Search";
import Messages from "./Messages";
import { useChatUsersStore } from "../../store/useChatUsersStore";
import useApi from "../../hooks/useApi";
import { Message } from "../../types/Message";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reply, setReply] = useState<Message | null>(null);
  const { openUser, newMessages, setOpenUser, resetMessages } = useChatStore();
  const { getUsers, getMessages, closeChat, sendRemoveTyping } = useChat();
  const { openUserActive, setOpenUserActive } = useChatUsersStore();
  const { get } = useApi();
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const lastOpenUserRef = useRef(openUser);

  useEffect(() => {
    if (isOpen) {
      closeChat();
    }
    getUsers();
  }, [isOpen]);

  useEffect(() => {
    clickUser();
  }, [openUser]);

  const clickUser = async () => {
    lastOpenUserRef.current = openUser;
    if (!openUser) {
      resetMessages();
      closeChat();
      getUsers();
    } else {
      const { active } = await get(`/chat/active/${openUser.id}`);
      setOpenUserActive(active);
      getMessages(openUser.id);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !document.getElementById("chat-btn")?.contains(event.target as Node) &&
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target as Node)
      ) {
        if (lastOpenUserRef.current) {
          sendRemoveTyping(lastOpenUserRef.current.id);
        }
        setIsOpen(false);
        setOpenUser(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, sendRemoveTyping]);

  return (
    <div className="flex flex-col items-end tb:text-base z-50">
      {/* Floating Button */}
      <button
        id="chat-btn"
        className="w-10 h-10 p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 duration-150 rounded-lg"
        onClick={() => {
          if (isOpen && openUser) sendRemoveTyping(openUser.id);
          setIsOpen(!isOpen);
          setOpenUser(null);
        }}
      >
        <FontAwesomeIcon
          icon={faMessage}
          className="absolute w-5 h-5 text-white"
        />
        {newMessages > 0 && (
          <div className="relative -top-4 -right-5 border-2 border-white h-5 w-5 rounded-full bg-red-500 text-white flex justify-center items-center text-xs font-semibold">
            {newMessages}
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className={`fixed bottom-6 right-[5%] h-[420px] w-96 sm:max-w-[350px] bg-white shadow-xl z-50 rounded-lg p-4 mt-3 border border-gray-300 ${
            isOpen ? "animate-fadeIn" : "animate-fadeOut"
          } [animation-fill-mode:backwards]`}
        >
          {/* Chat Header */}
          <div
            className={`flex justify-between items-center ${
              openUser && "border-b pb-2"
            }`}
          >
            <div className="flex items-start gap-2">
              {openUser && (
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-2 h-2 text-slate-600 bg-slate-300 hover:bg-slate-400 ease-in duration-150 p-2 rounded-full cursor-pointer"
                />
              )}
              <h2 className="text-lg font-semibold">
                {openUser?.fullName || "Chat"}
              </h2>
            </div>
            <FontAwesomeIcon
              icon={openUser ? faCircleLeft : faXmarkCircle}
              className="cursor-pointer text-gray-700 h-6 w-6"
              onClick={() => {
                if (openUser) {
                  sendRemoveTyping(openUser.id);
                  setOpenUser(null);
                } else setIsOpen(false);
              }}
            ></FontAwesomeIcon>
            {openUser && openUserActive && (
              <div className="absolute top-8 left-8 border-2 border-white h-2.5 w-2.5 rounded-full bg-green-400"></div>
            )}
          </div>

          <div
            className={`mt-3 ${
              openUser ? "h-72" : "h-96"
            } flex flex-col overflow-y-auto overflow-x-hidden gap-[1px]`}
          >
            {openUser ? (
              <Messages reply={reply} setReply={setReply} />
            ) : (
              <Search />
            )}
          </div>

          {openUser ? (
            <Input reply={reply} setReply={setReply} />
          ) : (
            <div className="h-10"></div>
          )}
        </div>
      )}
    </div>
  );
};

export default Chat;
