import React, { useEffect, useRef, useState } from "react";
import { Message as MessageType } from "../../types/Message";
import { useUserStore } from "../../store/useUserStore";
import { useTimeAgo } from "../../hooks/useTimeAgo";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheck,
  faCheckDouble,
  faFaceSmile,
  faReply,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import Reactions from "./Reactions";
import useApi from "../../hooks/useApi";
import { formatBytes } from "../../utils/byteCalculation";
import { useChatStore } from "../../store/useChatStore";
import ChatImage from "./ChatImage";
import { FileDetails } from "../../types/FileDetails";
import { useChat } from "../../hooks/useChat";

interface MessageProps {
  current: MessageType;
  prev?: MessageType;
  next?: MessageType;
  last: boolean;
  setReply: (reply: MessageType) => void;
  refMap: React.RefObject<Map<number, HTMLDivElement>>;
  onReplyClick?: (messageId: number) => void;
  scrollToBottom: (smooth: boolean) => void;
}

const Message: React.FC<MessageProps> = ({
  current,
  prev,
  next,
  last,
  setReply,
  refMap,
  onReplyClick,
  scrollToBottom,
}) => {
  const [hover, setHover] = useState(false);
  const [openReactions, setOpenReactions] = useState(false);
  const [fileDetails, setFileDetails] = useState<FileDetails | null>(null);
  const { user } = useUserStore();
  const { openUser } = useChatStore();
  const { deleteMessage: delMessage } = useChat();
  const { formatTime, formatDate, formatSent, getDiff } = useTimeAgo();
  const { get, del } = useApi();
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messageRef.current) {
      refMap.current.set(current.id, messageRef.current);
    }
    if (current.file) {
      getFileDetails();
    }
  }, [current.id]);

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
    if (next?.sender !== current.sender) return " mb-3";
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

  const replyText = () => {
    if (!current.replyTo?.file) return current.replyTo?.text;
    if (
      current.replyTo.file !== "image" &&
      current.replyTo.file !== "video" &&
      current.replyTo.file !== "audio" &&
      current.replyTo.file !== "voice"
    )
      return "File";
    return current.replyTo.file;
  };

  const getFileDetails = async () => {
    const { filename, size, type, file } = await get(`/file/${current.id}`);
    if (filename) {
      let formattedSize = formatBytes(size);
      setFileDetails({
        filename,
        size: formattedSize,
        type: type.slice(0, type.indexOf("/")),
        contentType: type,
        file,
      });
      scrollToBottom(false);
    }
  };

  const deleteMessage = async () => {
    const { deleted } = await del(`/chat/${current.id}/${current.sender}`);
    if (deleted) {
      delMessage(current);
    }
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
        className="w-full"
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <div
          ref={messageRef}
          className={`relative ${
            fileDetails?.type === "image" || fileDetails?.type === "video"
              ? "p-1 pb-2"
              : "py-2 px-3"
          } rounded-lg ${getNonConsecutive()} font-medium flex flex-col gap-2 text-base max-w-[70%] ${
            fileDetails
              ? fileDetails?.type === "audio"
                ? "w-1/2"
                : "w-fit"
              : current.file === "audio"
              ? "w-1/2"
              : current.file === "image" || current.file === "video"
              ? "w-full"
              : "w-fit"
          } transition delay-300 ${current.file && "cursor-pointer"} ${
            !userSent()
              ? "bg-gray-200 text-gray-800 self-start"
              : "bg-emerald-500 text-white self-end ml-auto"
          } ${
            last
              ? !userSent() && current.reaction
                ? "mb-5"
                : "mb-3"
              : current.reaction && "mb-2"
          } ${current.created && "animate-fadeIn"} ${
            current.deleted && "animate-fadeOut"
          } [animation-fill-mode:backwards]`}
        >
          <div className="w-full flex flex-col mb-3 mr-12">
            {current.replyTo && (
              <div
                onClick={() => onReplyClick?.(current.replyTo?.id || 0)}
                className={`w-full px-2 py-1 mb-1 rounded border-l-4 cursor-pointer ${
                  userSent()
                    ? "border-white bg-emerald-400/40"
                    : "border-emerald-500 bg-gray-300/50"
                }`}
              >
                <p className="text-sm font-semibold truncate">
                  {current.replyTo.sender === user?.id
                    ? "You"
                    : openUser?.fullName}
                </p>
                <p
                  className={`text-sm italic ${
                    userSent() ? "text-slate-200" : "text-gray-700"
                  } truncate capitalize`}
                >
                  {replyText()}
                </p>
              </div>
            )}

            {/* Message Text */}
            {!current.file ? (
              <p className="relative">{current.text}</p>
            ) : (
              <ChatImage
                key={"file-" + current.id}
                fileDetails={fileDetails}
                type={current.file}
                messageId={current.id}
                userSent={userSent()}
                scrollToBottom={scrollToBottom}
              />
            )}
          </div>

          {/* Message Time and Ticks */}
          <div
            className={`w-full h-3 flex justify-end gap-1 ${
              fileDetails?.type === "image" || fileDetails?.type === "video"
                ? "-mt-9 -ml-2"
                : "-mt-6 ml-0.5"
            } ${userSent() ? "text-gray-200" : "text-slate-500"} text-xs z-50`}
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
              className={`absolute w-0 h-0 z-0 border-t-8 ${
                current.sender !== user?.id
                  ? "border-l-transparent border-r-transparent border-r-8 border-bl-8 border-t-gray-200 -bottom-2 left-2"
                  : "border-l-transparent border-r-transparent border-br-8 border-l-8 border-t-emerald-500 -bottom-2 right-2"
              }`}
            ></div>
          )}

          {/* Reactions */}
          <Reactions
            message={current}
            sender={current.sender}
            reaction={current.reaction}
            openReactions={openReactions}
            setOpenReactions={setOpenReactions}
          />

          {/* Reply */}
          <div
            className={`absolute h-full flex  items-center gap-2 bottom-0.5 ${
              !hover && "opacity-0 -z-50"
            } cursor-pointer ${
              userSent()
                ? "-left-12 text-emerald-500"
                : "-right-12 text-gray-300"
            }`}
          >
            <FontAwesomeIcon
              icon={faReply}
              onClick={() => {
                setHover(false);
                setReply(current);
              }}
            />
            <FontAwesomeIcon
              icon={userSent() ? faTrash : faFaceSmile}
              onClick={() => {
                setHover(false);
                if (!userSent()) {
                  setOpenReactions(true);
                } else {
                  deleteMessage();
                }
              }}
            />
          </div>
        </div>
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
