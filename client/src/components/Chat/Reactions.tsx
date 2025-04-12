import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faHeart,
  faLaugh,
} from "@fortawesome/free-solid-svg-icons";
import { useUserStore } from "../../store/useUserStore";
import { useEffect, useRef } from "react";
import { useChat } from "../../hooks/useChat";
import { Message } from "../../types/Message";

const emojiOptions = [
  { icon: faThumbsUp, label: "like", color: "text-blue-500" },
  { icon: faHeart, label: "love", color: "text-red-500" },
  { icon: faLaugh, label: "haha", color: "text-amber-400" },
];

interface ReactionsProps {
  message: Message;
  sender: number;
  reaction?: string;
  openReactions: boolean;
  setOpenReactions: (open: boolean) => void;
}

const Reactions: React.FC<ReactionsProps> = ({
  message,
  sender,
  reaction,
  openReactions,
  setOpenReactions,
}) => {
  const { user } = useUserStore();
  const { sendReaction } = useChat();
  const reactionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        openReactions &&
        reactionsRef.current &&
        !reactionsRef.current.contains(event.target as Node)
      ) {
        setOpenReactions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openReactions]);

  const handleReaction = (label: string) => {
    if (label === reaction) label = "";
    message.reaction = label;
    sendReaction(message);
    setOpenReactions(false);
  };

  const getIcon = (label: string) => {
    return emojiOptions.find((emoji) => emoji.label === label)?.icon;
  };

  const getColor = (label: string) => {
    return emojiOptions.find((emoji) => emoji.label === label)?.color;
  };

  return (
    <>
      {openReactions ? (
        <div
          ref={reactionsRef}
          className={`absolute ${
            sender === user?.id ? "-left-10" : "-right-10"
          } ${
            !openReactions && !reaction && "opacity-0 -z-50"
          } -bottom-6 z-50 flex gap-1 p-1 border-t border-gray-200 bg-slate-100 rounded-md justify-center [animation-fill-mode:backwards]`}
          style={{ animation: "fadeIn 0.15s ease-in-out" }}
        >
          {emojiOptions.map(({ icon, label, color }) => {
            const isSelected = reaction === label;

            return (
              <button
                key={"reaction-" + message + label}
                onClick={() => handleReaction(label)}
                className={`flex items-center gap-1 px-1 py-1 rounded-lg transition ${
                  isSelected ? "bg-slate-300" : "hover:bg-slate-200"
                }`}
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={`text-base ${color} ${
                    isSelected ? "scale-110" : ""
                  } transition-transform`}
                />
              </button>
            );
          })}
        </div>
      ) : (
        reaction && (
          <button
            key={`reaction-${message}-${reaction}`}
            type="button"
            onClick={() => {
              if (user?.id === message.receiver) setOpenReactions(true);
            }}
            disabled={user?.id !== message.receiver}
            title="React"
            className={`absolute top-full translate-y-[-18px] ${
              sender === user?.id ? "-left-4" : "-right-4"
            } flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200 shadow-sm transition 
            ${
              user?.id === message.receiver
                ? "hover:bg-slate-200 cursor-pointer"
                : "cursor-default"
            }`}
          >
            <FontAwesomeIcon
              icon={getIcon(reaction) || faThumbsUp}
              className={`text-base ${getColor(
                reaction
              )} scale-110 transition-transform`}
            />
          </button>
        )
      )}
    </>
  );
};

export default Reactions;
