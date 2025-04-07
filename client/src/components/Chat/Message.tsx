import React from "react";
import { Message as MessageType } from "../../types/Message";
import { useUserStore } from "../../store/useUserStore";
import { useTimeAgo } from "../../hooks/useTimeAgo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faCheckDouble } from "@fortawesome/free-solid-svg-icons";

interface MessageProps {
  current: MessageType;
  prev?: MessageType;
  next?: MessageType;
  last: boolean;
}

const Message: React.FC<MessageProps> = ({ current, prev, next, last }) => {
  const { user } = useUserStore();
  const { formatTime, formatDate, formatSent, getDiff } = useTimeAgo();

  const getLastMessageAgo = () => {
    if (!last) return;
    if (current.sender !== user?.id) return;
    let date, text;
    if (isSeen()) {
      text = "Seen ";
      date = current.seen;
    } else if (isDelivered()) {
      text = "Delivered ";
      date = current.delivered;
    } else {
      text = "Sent ";
      date = current.sent;
    }
    return text + formatTime(date);
  };

  const getNonConsecutive = () => {
    if (next?.sender !== current.sender) return " mb-2";
  };

  const getDiffDate = () => {
    if (!prev) return false;
    if (getDiff(new Date(prev?.sent), new Date(current.sent))) return true;
    return false;
  };

  const getMessageTail = () => {
    if (
      !next ||
      getNonConsecutive() ||
      getDiff(new Date(next?.sent), new Date(current.sent))
    )
      return true;
    return false;
  };

  const userSent = () => {
    return current.sender === user?.id;
  };

  const isSeen = () => {
    return new Date(current.seen).getFullYear() > 2000;
  };

  const isDelivered = () => {
    return new Date(current.delivered).getFullYear() > 2000;
  };

  return (
    <>
      {/* Message Time Separator */}
      {getDiffDate() && (
        <p className="w-full my-5 flex justify-center text-slate-500 text-sm font-light">
          {formatDate(current.sent)}
        </p>
      )}

      <div
        className={`relative py-2 px-3 rounded-lg ${getNonConsecutive()} font-medium flex gap-2 text-base max-w-[70%] w-fit ${
          !userSent()
            ? "bg-gray-200 text-gray-800 self-start"
            : "bg-emerald-500 text-white self-end ml-auto"
        } ${last && "mb-3"} ${
          current.created && "animate-fadeIn [animation-fill-mode:backwards]"
        }`}
      >
        <p className="relative">{current.text}</p>

        {/* Message Time and Ticks */}
        <div
          className={`relative w-fit h-2 flex gap-1 -right-1 ${
            userSent() ? "text-gray-200" : "text-slate-500"
          } text-xs`}
          style={{
            top: "calc(100% - 10px)",
          }}
        >
          {formatSent(current.sent)}{" "}
          {userSent() && (
            <FontAwesomeIcon
              icon={isSeen() || isDelivered() ? faCheckDouble : faCheck}
              className={`relative top-0.5 ${isSeen() && "text-teal-700"}`}
            />
          )}
        </div>

        {/* Last Consecutive Message Tail */}
        {getMessageTail() && (
          <div
            className={`absolute w-0 h-0 border-t-8 ${
              current.sender !== user?.id
                ? "border-l-transparent border-r-transparent border-r-8 border-bl-8 border-t-gray-200 -bottom-2 left-2"
                : "border-l-transparent border-r-transparent border-br-8 border-l-8 border-t-emerald-500 -bottom-2 right-2"
            }`}
          ></div>
        )}
      </div>

      {/* Last Message Ago Indicator */}
      {last && userSent() && (
        <p className="relative w-full text-end bottom-1 right-1 text-sm text-slate-500">
          {getLastMessageAgo()}
        </p>
      )}
    </>
  );
};

export default Message;
