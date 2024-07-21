import React, { useRef, useEffect } from "react";
import { useMachine } from "@xstate/react";
import { audioPlayerMachine } from "./audioPlayerMachine";
import { Play, Pause } from "lucide-react";

interface XStateAudioPlayerProps {
  audioSrc: string;
}

const XStateAudioPlayer: React.FC<XStateAudioPlayerProps> = ({ audioSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
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

  const togglePlayPause = () => {
    if (state.matches("ready.playing")) {
      audioRef.current?.pause();
      send({ type: "PAUSE" });
    } else {
      audioRef.current?.play();
      send({ type: "PLAY" });
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div>
      <audio ref={audioRef} src={audioSrc} />
      <button onClick={togglePlayPause}>
        {state.matches("ready.playing") ? (
          <Pause size={20} />
        ) : (
          <Play size={20} />
        )}
      </button>
      <div>
        {formatTime(state.context.currentTime)} /{" "}
        {formatTime(state.context.duration)}
      </div>
    </div>
  );
};

export default XStateAudioPlayer;
