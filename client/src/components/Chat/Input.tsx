import {
  faFileImage,
  faMicrophoneLines,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../store/useChatStore";
import { Message } from "../../types/Message";
import VoiceRecorder from "./VoiceRecorder";

interface InputProps {
  reply: Message | null;
  setReply: (message: Message | null) => void;
}

const Input: React.FC<InputProps> = ({ reply, setReply }) => {
  const [userInput, setUserInput] = useState("");
  const [recording, setRecording] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
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
      <div className="flex w-full gap-2 items-center">
        {!recording && (
          <>
            <button
              className={`w-6 h-6 flex items-center justify-center bg-emerald-500 text-white py-2 rounded-full hover:bg-emerald-600 transition`}
              onClick={() => fileInputRef.current?.click()}
            >
              <FontAwesomeIcon icon={faPlus} className="h-4 w-4" />
            </button>
            <button
              className={`w-6 h-6 flex items-center justify-center`}
              onClick={() => imageInputRef.current?.click()}
            >
              <FontAwesomeIcon
                icon={faFileImage}
                className="h-6 w-6 bg-white text-emerald-500 hover:text-emerald-600 transition"
              />
            </button>
          </>
        )}
        <button
          className="w-6 h-6 flex items-center justify-center"
          onClick={() => setRecording(!recording)}
        >
          <FontAwesomeIcon
            icon={!recording ? faMicrophoneLines : faTrash}
            className="h-6 w-6 bg-white text-emerald-500 hover:text-emerald-600 transition"
          />
        </button>
        <input
          type="file"
          className="hidden"
          ref={fileInputRef}
          accept={""}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && openUser) {
              sendMessage(openUser?.id, " ", undefined, file);
            }
          }}
        />
        <input
          type="file"
          className="hidden"
          ref={imageInputRef}
          accept={
            "image/jpeg,image/png,image/jpg,video/mp4,video/webm,video/ogg"
          }
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file && openUser) {
              sendMessage(openUser?.id, " ", undefined, file);
            }
          }}
        />
        {!recording && (
          <input
            ref={inputRef}
            type="text"
            maxLength={200}
            className="flex-1 py-2 px-3 border border-slate-300 rounded-2xl text-base focus:outline-emerald-500 transition-all"
            placeholder={reply ? "Reply..." : `Type a message...`}
            value={userInput}
            onChange={(e) => {
              setUserInput(e.target.value);
              if (e.target.value) sendTyping();
              else sendRemoveTyping(openUser?.id || 0);
            }}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
        )}
        {recording && <VoiceRecorder setRecording={setRecording} />}
      </div>
    </div>
  );
};

export default Input;
