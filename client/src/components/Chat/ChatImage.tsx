import { faImage, faPlayCircle } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";

interface ChatImageProps {
  image?: { data: number[] };
  contentType?: string;
  scrollToBottom: (smooth: boolean) => void;
}

const ChatImage: React.FC<ChatImageProps> = ({
  image,
  contentType,
  scrollToBottom,
}) => {
  const [fileSrc, setFileSrc] = useState<string>();

  useEffect(() => {
    if (image && contentType) {
      const uint8Array = new Uint8Array(image.data);
      const blob = new Blob([uint8Array], { type: contentType });
      const url = URL.createObjectURL(blob);
      setFileSrc(url);

      return () => URL.revokeObjectURL(url);
    }
    scrollToBottom(false);
  }, [image, contentType]);

  if (!fileSrc) {
    return (
      <FontAwesomeIcon
        icon={contentType?.startsWith("video") ? faPlayCircle : faImage}
        className="w-5 h-5 p-2"
      />
    );
  }

  return (
    <a
      href={fileSrc}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full"
    >
      {contentType?.startsWith("video") ? (
        <div className="relative">
          <video
            src={fileSrc}
            className="rounded-md w-full h-auto max-h-[300px] object-cover hover:opacity-90 cursor-pointer"
            controls={true}
            muted
            playsInline
          />
          <FontAwesomeIcon
            icon={faPlayCircle}
            className="w-6 h-6 p-2 absolute top-1/2 -translate-x-1/2 left-1/2 -translate-y-1/2"
          />
        </div>
      ) : (
        <img
          src={fileSrc}
          alt="Image"
          className="rounded-md w-full h-auto max-h-[300px] object-cover hover:opacity-90 cursor-zoom-in"
        />
      )}
    </a>
  );
};

export default ChatImage;
