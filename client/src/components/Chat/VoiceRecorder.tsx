import { useEffect, useRef, useState } from "react";
import { useChat } from "../../hooks/useChat";
import { useChatStore } from "../../store/useChatStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane } from "@fortawesome/free-solid-svg-icons";

interface VoiceRecorderProps {
  setRecording: (recording: boolean) => void;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ setRecording }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startedRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  const { sendMessage } = useChat();
  const { openUser } = useChatStore();

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    initRecording();

    return () => {
      stopRecording();
    };
  }, []);

  const initRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (audioChunksRef.current.length > 0 && openUser) {
          const blob = new Blob(audioChunksRef.current, {
            type: "audio/webm",
          });
          const file = new File([blob], "voice-message.webm", {
            type: "audio/webm",
          });
          sendMessage(openUser?.id, " ", undefined, file);
        }

        stopRecording();

        // Cleanup
        audioChunksRef.current = [];
        setIsRecording(false);
        setRecording(false);
        setSeconds(0);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Microphone access denied or error:", error);
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleSend = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }
  };

  return (
    <>
      <div
        className={`w-full h-10 flex justify-between items-center flex-1 py-2 px-3 border border-slate-300 ${
          isRecording
            ? "animate-color-pulse text-white"
            : "bg-slate-300 text-black"
        } rounded-2xl text-base transition-all`}
      >
        <p className="w-full font-semibold">
          {isRecording ? "Recording..." : "Waiting"}
        </p>
        {isRecording && (
          <div className="w-14 px-1 py-0.5 rounded-lg text-emerald-500 text-sm bg-white flex items-center justify-center font-semibold">
            {formatTime(seconds)}
          </div>
        )}
      </div>
      {isRecording && (
        <button
          className="bg-emerald-500 text-white px-3 py-3 flex items-center justify-center rounded-xl hover:bg-emerald-600 transition"
          onClick={handleSend}
        >
          <FontAwesomeIcon icon={faPaperPlane} className="h-4 w-4" />
        </button>
      )}
    </>
  );
};

export default VoiceRecorder;
