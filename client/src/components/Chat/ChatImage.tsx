import {
  faCirclePlay,
  faFile,
  faFileLines,
  faImage,
  faMicrophoneLines,
  faPlayCircle,
  faVolumeHigh,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { FileDetails } from "../../types/FileDetails";
import useApi from "../../hooks/useApi";
import ChatAudio from "./ChatAudio";

interface ChatImageProps {
  fileDetails: FileDetails | null;
  messageId: number;
  userSent: boolean;
  type: string;
  scrollToBottom: (smooth: boolean) => void;
}

const ChatImage: React.FC<ChatImageProps> = ({
  fileDetails,
  messageId,
  type,
  userSent,
  scrollToBottom,
}) => {
  const [fileSrc, setFileSrc] = useState<string>();
  const { download } = useApi();

  const isMediaFile = ["image", "video", "audio", "voice"].includes(type);

  useEffect(() => {
    if (fileDetails?.file && fileDetails.contentType && isMediaFile) {
      const uint8Array = new Uint8Array(fileDetails.file.data);
      const blob = new Blob([uint8Array], { type: fileDetails.contentType });
      const url = URL.createObjectURL(blob);
      setFileSrc(url);
      // setTimeout(() => setFileSrc(url), 200);

      return () => URL.revokeObjectURL(url);
    }
    scrollToBottom(false);
  }, [fileDetails?.file, fileDetails?.contentType]);

  if (isMediaFile && !fileSrc) {
    let icon;
    if (type === "image") {
      icon = faImage;
    } else if (type === "video") {
      icon = faCirclePlay;
    } else if (type === "audio") {
      icon = faVolumeHigh;
    } else if (type === "voice") {
      icon = faMicrophoneLines;
    } else {
      icon = faFile;
    }

    return (
      <div
        className={`relative ${
          type.startsWith("video") || type.startsWith("image")
            ? "h-[300px]"
            : "h-9 w-[100px]"
        }`}
      >
        <FontAwesomeIcon
          icon={icon}
          className={`absolute ${
            type.startsWith("video") || type.startsWith("image")
              ? "top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2"
              : "left-0"
          } w-6 h-6 ${!userSent && "text-gray-700"}`}
        />
      </div>
    );
  }

  if (!isMediaFile) {
    return (
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => download(`/file/download/${messageId}`)}
      >
        <FontAwesomeIcon icon={faFileLines} className="h-6" />
        <div className="flex flex-col">
          <p className="w-full max-w-40 truncate">{fileDetails?.filename}</p>
          <p
            className={`text-xs ${
              userSent ? "text-white/80" : "text-slate-700"
            }`}
          >
            {fileDetails?.size}
          </p>
        </div>
      </div>
    );
  }

  // Render media file when ready
  return (
    <div className="block w-full">
      {fileDetails?.contentType?.startsWith("video") ? (
        <div className="relative">
          <video
            src={fileSrc}
            className="rounded-md w-full h-auto max-h-[300px] object-cover hover:opacity-90 cursor-pointer"
            controls
            muted
            playsInline
          />
          <FontAwesomeIcon
            icon={faPlayCircle}
            className="w-6 h-6 p-2 absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2"
          />
        </div>
      ) : fileDetails?.contentType.startsWith("image") ? (
        <a
          href={fileSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <img
            src={fileSrc}
            alt="Image"
            className="rounded-md w-full h-auto max-h-[300px] object-cover hover:opacity-90 cursor-zoom-in"
          />
        </a>
      ) : fileDetails?.contentType.startsWith("audio") ? (
        <ChatAudio fileSrc={fileSrc || ""} userSent={userSent} />
      ) : (
        <a
          href={fileSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2"
        >
          <FontAwesomeIcon icon={faFileLines} className="h-6" />
          <div className="flex flex-col">
            <p>{fileDetails?.filename}</p>
            <p
              className={`text-xs ${
                userSent ? "text-white/80" : "text-slate-700"
              }`}
            >
              {fileDetails?.size}
            </p>
          </div>
        </a>
      )}
    </div>
  );
};

export default ChatImage;
