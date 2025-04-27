import { faPause, faPlay } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";

interface AudioWaveformProps {
  fileSrc: string;
  userSent: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ fileSrc, userSent }) => {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurfer = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    if (!waveformRef.current) return;

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      height: 35, // Taller waveform
      cursorWidth: 3,
      cursorColor: userSent ? "#f8fafc" : "#374151",
      barWidth: 3, // Slim bars for a clean look
      barRadius: 5, // Nicely rounded edges
      barGap: 3, // Small gap between bars
      waveColor: userSent ? "#a7f3d0" : "#9ca3af",
      progressColor: userSent ? "#f8fafc" : "#374151",
      normalize: true, // Normalize the waveform peaks
    });

    wavesurfer.current.load(fileSrc);

    wavesurfer.current.on("ready", () => {
      setDisplayTime(wavesurfer.current?.getDuration() || 0);
    });

    wavesurfer.current.on("finish", () => {
      if (wavesurfer.current) {
        setDisplayTime(wavesurfer.current.getDuration());
      }
      setIsPlaying(false);
    });

    wavesurfer.current.on("audioprocess", () => {
      if (wavesurfer.current) {
        const newTime = wavesurfer.current.getCurrentTime() || 0;
        setDisplayTime(wavesurfer.current.getDuration() - newTime);
      }
    });
    return () => {
      wavesurfer.current?.destroy();
    };
  }, [fileSrc]);

  const togglePlay = () => {
    if (!wavesurfer.current) return;
    wavesurfer.current.playPause();
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? "0" + s : s}`;
  };

  return (
    <div className={`w-full flex items-center gap-2 mb-1.5`}>
      <button onClick={togglePlay} className="w-5">
        <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} size="lg" />
      </button>
      <div ref={waveformRef} className="flex-1" />
      <div
        className={`text-xs font-semibold ${
          userSent ? "text-slate-100" : "text-gray-700"
        }`}
      >
        {formatTime(displayTime)}
      </div>
    </div>
  );
};

export default AudioWaveform;
