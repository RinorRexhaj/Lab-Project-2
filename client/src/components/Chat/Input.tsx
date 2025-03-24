import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../store/useChatStore";

const Input = () => {
  const [userInput, setUserInput] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { sendMessage } = useChat();
  const { currentUser } = useChatStore();

  const send = () => {
    if (!userInput || !currentUser) return;
    sendMessage(currentUser?.id, userInput);
    setUserInput("");
  };

  return (
    <div
      className={`flex pl-2 items-center border rounded-lg text-base ${
        inputRef.current && "outline-emerald-500"
      }`}
    >
      <input
        ref={inputRef}
        type="text"
        className="flex-1 p-2 focus:outline-none"
        placeholder="Type a message..."
        value={userInput}
        onChange={(e) => setUserInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && send()}
      />
      <button
        className="ml-2 bg-emerald-500 text-white pl-3 pr-4 py-2 rounded-tr-lg rounded-br-lg hover:bg-emerald-600 transition"
        onClick={send}
      >
        <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
      </button>
    </div>
  );
};

export default Input;
