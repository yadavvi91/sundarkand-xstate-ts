import React, { useRef, useEffect } from "react";
import { useMachine } from "@xstate/react";
import { audioPlayerMachine, AudioPlayerContext, AudioPlayerEvent } from "./audioPlayerMachine";
import { Play, Pause } from "lucide-react";

interface XStateAudioPlayerProps {
  audioSrc: string;
}

const XStateAudioPlayer: React.FC<XStateAudioPlayerProps> = ({ audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [state, send] = useMachine(audioPlayerMachine);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      send({ type: "LOADED", duration: audio.duration });
    };

    const handleTimeUpdate = () => {
      send({ type: "TIME_UPDATE", currentTime: audio.currentTime });
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [send]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.matches("ready.playing")) {
      audio.play().catch((error) => console.error("Error playing audio:", error));
    } else {
      audio.pause();
    }
  }, [state]);

  const togglePlayPause = () => {
    send({ type: state.matches("ready.playing") ? "PAUSE" : "PLAY" });
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const audio = audioRef.current;
    if (!progressBar || !audio) return;

    const clickPosition = (e.clientX - progressBar.getBoundingClientRect().left) / progressBar.offsetWidth;
    const newTime = clickPosition * state.context.duration;
    
    audio.currentTime = newTime;
    send({ type: "SEEK", time: newTime });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioSrc} />
      <button onClick={togglePlayPause}>
        {state.matches("ready.playing") ? <Pause size={20} /> : <Play size={20} />}
      </button>
      <div className="progress-container">
        <div
          ref={progressRef}
          className="progress-bar"
          onClick={handleProgressClick}
        >
          <div
            className="progress"
            style={{ width: `${(state.context.currentTime / state.context.duration) * 100}%` }}
          ></div>
        </div>
      </div>
      <div className="time-display">
        {formatTime(state.context.currentTime)} / {formatTime(state.context.duration)}
      </div>
    </div>
  );
};

export default XStateAudioPlayer;