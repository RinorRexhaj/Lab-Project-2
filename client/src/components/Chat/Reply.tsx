import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { Message } from "../../types/Message";

interface ReplyProps {
  senderName: string;
  text: string;
  setReply: (message: Message | null) => void;
}

const Reply: React.FC<ReplyProps> = ({ senderName, text, setReply }) => {
  return (
    <div className="absolute w-[336px] sm:w-[316px] bottom-14 flex items-start justify-between gap-2 p-2 border-l-4 border-emerald-500 bg-emerald-50 rounded-sm mb-2 animate-fadeIn [animation-fill-mode:backwards]">
      <div className="flex flex-col overflow-hidden">
        <span className="text-sm font-semibold text-emerald-700 truncate">
          {senderName}
        </span>
        <span className="text-sm text-gray-700 truncate capitalize">
          {text}
        </span>
      </div>
      <button
        onClick={() => setReply(null)}
        className="text-gray-500 hover:text-gray-700 transition"
        aria-label="Cancel reply"
      >
        <FontAwesomeIcon icon={faTimes} />
      </button>
    </div>
  );
};

export default Reply;
