import { useEffect, useRef, useState } from "react";
import {
  faCircleLeft,
  faMessage,
  faUser,
  faXmarkCircle,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useChatStore } from "../../store/useChatStore";
import Message from "./Message";
import Input from "./Input";
import User from "./User";
import { useChat } from "../../hooks/useChat";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, users, currentUser, setCurrentUser, setMessages } =
    useChatStore();
  const { getUsers, getMessages } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentUser) {
      setMessages([]);
      getUsers();
    } else {
      getMessages(currentUser.id);
    }
  }, [currentUser]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !document.getElementById("chat-btn")?.contains(event.target as Node) &&
        chatWindowRef.current &&
        !chatWindowRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setCurrentUser(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="flex flex-col items-end tb:text-base z-50">
      {/* Floating Button */}
      <button
        id="chat-btn"
        className="w-10 h-10 p-2 flex items-center justify-center bg-emerald-500 hover:bg-emerald-600 duration-150 rounded-lg"
        onClick={() => {
          setIsOpen(!isOpen);
          setCurrentUser(null);
        }}
      >
        <FontAwesomeIcon icon={faMessage} className="w-5 h-5 text-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className={`fixed bottom-8 right-[5%] w-96 max-w-[70vw] bg-white shadow-xl z-50 rounded-lg p-4 mt-3 border border-gray-300 ${
            isOpen ? "animate-fadeIn" : "animate-fadeOut"
          } [animation-fill-mode:backwards]`}
        >
          {/* Chat Header */}
          <div className="flex justify-between items-center border-b pb-2">
            <div className="flex items-start gap-2">
              {currentUser && (
                <FontAwesomeIcon
                  icon={faUser}
                  className="w-2 h-2 text-slate-600 bg-slate-300 hover:bg-slate-400 ease-in duration-150 p-2 rounded-full cursor-pointer"
                />
              )}
              <h2 className="text-lg font-semibold">
                {currentUser?.fullName || "Chat"}
              </h2>
            </div>
            <FontAwesomeIcon
              icon={currentUser ? faCircleLeft : faXmarkCircle}
              className="cursor-pointer text-gray-700 h-6 w-6"
              onClick={() => {
                if (currentUser) {
                  setCurrentUser(null);
                } else setIsOpen(false);
              }}
            ></FontAwesomeIcon>
          </div>

          <div className="mt-3 h-72 flex flex-col overflow-y-auto overflow-x-hidden gap-[1px]">
            {currentUser
              ? messages.map((msg, index) => {
                  return (
                    <Message
                      key={"message" + msg.id}
                      current={msg}
                      prev={messages[index - 1]}
                      next={messages[index + 1]}
                      last={index === messages.length - 1}
                    />
                  );
                })
              : users.map((user, index) => {
                  return (
                    <User
                      user={user}
                      active={false}
                      last={index === users.length - 1}
                      key={"chat-user-" + user.id}
                    />
                  );
                })}

            {/* Scroll to Bottom Ref */}
            <div ref={messagesEndRef} />
          </div>

          {currentUser ? <Input /> : <div className="h-10"></div>}
        </div>
      )}
    </div>
  );
};

export default Chat;
