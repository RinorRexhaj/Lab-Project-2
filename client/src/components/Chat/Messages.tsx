import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import Message from "./Message";
import Typing from "./Typing";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";

const Messages = () => {
  const [scrollDown, setScrollDown] = useState(false);
  const { messages, typing, openUser } = useChatStore();
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom(false);
  }, [messages]);

  const scrollToBottom = (behavior: boolean) => {
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: behavior ? "smooth" : "instant",
    });
  };

  const handleScroll = () => {
    if (!messagesRef.current) return;
    const element = messagesRef.current;
    const isUserScrolledUp =
      element.scrollTop + element.clientHeight < element.scrollHeight - 200;
    setScrollDown(isUserScrolledUp);
  };

  if (!openUser) return;

  return (
    <div
      ref={messagesRef}
      className={`mt-3 h-72 flex flex-col overflow-y-auto overflow-x-hidden gap-[1px] focus:outline-none`}
      onScroll={handleScroll}
    >
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
      {/* Scroll to Bottom */}
      {scrollDown && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center flex items-center justify-center p-1.5 bg-slate-700 rounded-full shadow-md animate-fadeIn animation-fill-mode:backwards]"
        >
          <FontAwesomeIcon icon={faArrowDown} className="w-5 h-5 text-white" />
        </button>
      )}
    </div>
  );
};

export default Messages;
