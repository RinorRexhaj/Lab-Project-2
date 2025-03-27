import { useEffect, useRef, useState } from "react";
import {
  faArrowDown,
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
import Typing from "./Typing";

const Chat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrollDown, setScrollDown] = useState(false);
  const { messages, users, typing, openUser, setOpenUser, setMessages } =
    useChatStore();
  const { getUsers, getMessages, closeChat, sendRemoveTyping } = useChat();
  const messagesRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);
  const lastOpenUserRef = useRef(openUser);

  useEffect(() => {
    lastOpenUserRef.current = openUser;
    if (!openUser) {
      setMessages([]);
      closeChat();
      getUsers();
    } else {
      getMessages(openUser.id);
    }
  }, [openUser]);

  useEffect(() => {
    if (messagesRef.current) {
      scrollToBottom(false);
    }
  }, [messages, isOpen]);

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

  const handleScroll = () => {
    if (!messagesRef.current) return;
    const element = messagesRef.current;
    const isUserScrolledUp =
      element.scrollTop + element.clientHeight < element.scrollHeight - 200;
    setScrollDown(isUserScrolledUp);
  };

  const scrollToBottom = (behavior: boolean) => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: behavior ? "smooth" : "instant",
    });
  };

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
        <FontAwesomeIcon icon={faMessage} className="w-5 h-5 text-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          ref={chatWindowRef}
          className={`fixed bottom-6 right-[5%] w-96 sm:max-w-[350px] bg-white shadow-xl z-50 rounded-lg p-4 mt-3 border border-gray-300 ${
            isOpen ? "animate-fadeIn" : "animate-fadeOut"
          } [animation-fill-mode:backwards]`}
        >
          {/* Chat Header */}
          <div className="flex justify-between items-center border-b pb-2">
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
          </div>

          <div
            ref={messagesRef}
            className="mt-3 h-72 flex flex-col overflow-y-auto overflow-x-hidden gap-[1px]"
            onScroll={handleScroll}
          >
            {openUser ? (
              <>
                {messages.map((msg, index) => {
                  return (
                    <Message
                      key={"message" + msg.id}
                      current={msg}
                      prev={messages[index - 1]}
                      next={messages[index + 1]}
                      last={index === messages.length - 1}
                    />
                  );
                })}
                {typing.includes(openUser.id) && (
                  <Typing
                    key={"typing-" + openUser.id}
                    scrollDown={scrollDown}
                    scrollToBottom={scrollToBottom}
                  />
                )}
              </>
            ) : (
              users.map((user) => {
                return (
                  <User
                    user={user}
                    active={false}
                    key={"chat-user-" + user.id}
                  />
                );
              })
            )}

            {/* Scroll to Bottom */}
            {scrollDown && (
              <button
                onClick={() => scrollToBottom(true)}
                className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center flex items-center justify-center p-1.5 bg-slate-700 rounded-full shadow-md animate-fadeIn"
              >
                <FontAwesomeIcon
                  icon={faArrowDown}
                  className="w-5 h-5 text-white"
                />
              </button>
            )}
          </div>

          {openUser ? <Input /> : <div className="h-10"></div>}
        </div>
      )}
    </div>
  );
};

export default Chat;
