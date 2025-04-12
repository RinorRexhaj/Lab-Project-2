import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../store/useChatStore";
import { Message } from "../../types/Message";

interface InputProps {
  reply: Message | null;
  setReply: (message: Message | null) => void;
}

const Input: React.FC<InputProps> = ({ reply, setReply }) => {
  const [userInput, setUserInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, sendTyping, sendRemoveTyping } = useChat();
  const { openUser } = useChatStore();

  useEffect(() => {
    inputRef.current?.focus();
  }, [reply]);

  const send = () => {
    if (!userInput || !openUser) return;
    sendMessage(openUser?.id, userInput, reply || undefined);
    setUserInput("");
    setReply(null);
    sendRemoveTyping(openUser.id);
  };

  return (
    <div className={`flex items-center mt-2`}>
      <input
        ref={inputRef}
        type="text"
        className="flex-1 p-2 border border-slate-300 rounded-xl text-base focus:outline-emerald-500"
        placeholder={reply ? "Reply..." : `Type a message...`}
        value={userInput}
        onChange={(e) => {
          setUserInput(e.target.value);
          if (e.target.value) sendTyping();
          else sendRemoveTyping(openUser?.id || 0);
        }}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button
        className="ml-2 bg-emerald-500 text-white pl-3 pr-4 py-2 rounded-xl hover:bg-emerald-600 transition"
        onClick={send}
      >
        <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Input;
