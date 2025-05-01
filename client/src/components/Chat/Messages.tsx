import { useEffect, useRef } from "react";
import { useChatStore } from "../../store/useChatStore";
import Message from "./Message";
import Typing from "./Typing";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowDown } from "@fortawesome/free-solid-svg-icons";
import Reply from "./Reply";
import { Message as MessageType } from "../../types/Message";
import { useUserStore } from "../../store/useUserStore";

interface MessagesProps {
  reply: MessageType | null;
  setReply: (message: MessageType | null) => void;
  scrollDown: boolean;
  setScrollDown: (scroll: boolean) => void;
  setHasNewMessage: (has: boolean) => void;
}

const Messages: React.FC<MessagesProps> = ({
  reply,
  setReply,
  scrollDown,
  setScrollDown,
  setHasNewMessage,
}) => {
  const { messages, typing, openUser } = useChatStore();
  const { user } = useUserStore();
  const messagesRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const prevMessageCount = useRef(messages.length);

  useEffect(() => {
    if (messages.length > prevMessageCount.current) {
      if (!scrollDown) {
        setScrollDown(false);
        scrollToBottom(false);
      } else {
        setHasNewMessage(true);
      }
    }
    prevMessageCount.current = messages.length;
  }, [messages, scrollDown]);

  const scrollToBottom = (behavior: boolean) => {
    setHasNewMessage(false);
    messagesRef.current?.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: behavior ? "smooth" : "instant",
    });
  };

  const scrollToMessage = (messageId: number) => {
    const target = messageRefs.current.get(messageId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      const classList = target.classList;
      if (classList.contains("bg-emerald-500")) {
        classList.replace("bg-emerald-500", "bg-emerald-700");
      } else if (classList.contains("bg-gray-200"))
        classList.replace("bg-gray-200", "bg-gray-400");
      setTimeout(() => {
        if (classList.contains("bg-emerald-700"))
          classList.replace("bg-emerald-700", "bg-emerald-500");
        else if (classList.contains("bg-gray-400"))
          classList.replace("bg-gray-400", "bg-gray-200");
      }, 1500);
    }
  };

  const handleScroll = () => {
    if (!messagesRef.current) return;
    const element = messagesRef.current;
    const isUserScrolledUp =
      element.scrollTop + element.clientHeight < element.scrollHeight - 50;
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
            setReply={setReply}
            refMap={messageRefs}
            onReplyClick={scrollToMessage}
            scrollToBottom={scrollToBottom}
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
          className="absolute bottom-20 left-1/2 -translate-x-1/2 text-center flex items-center z-50 justify-center p-1.5 bg-emerald-500 border border-slate-100 rounded-full shadow-md animate-fadeIn animation-fill-mode:backwards]"
        >
          <FontAwesomeIcon icon={faArrowDown} className="w-5 h-5 text-white" />
        </button>
      )}
      {reply && (
        <Reply
          senderName={reply.sender === user?.id ? "You" : openUser.fullName}
          text={
            reply.file !== "image" &&
            reply.file !== "video" &&
            reply.file !== "audio" &&
            reply.file !== "voice"
              ? "file"
              : reply.file || reply.text
          }
          setReply={setReply}
        />
      )}
    </div>
  );
};

export default Messages;
