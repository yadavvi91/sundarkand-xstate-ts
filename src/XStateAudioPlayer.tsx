import React, { useRef, useEffect } from "react";
import { useMachine } from "@xstate/react";
import { createBrowserInspector } from "@statelyai/inspect";
import { audioPlayerMachine, Lyric } from "./audioPlayerMachine";
import {
  Play,
  Pause,
  Volume,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface XStateAudioPlayerProps {
  audioSrc: string;
  lyrics: Lyric[];
}
const { inspect } = createBrowserInspector();

const XStateAudioPlayer: React.FC<XStateAudioPlayerProps> = ({
  audioSrc,
  lyrics,
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [state, send] = useMachine(audioPlayerMachine, { inspect });

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

    send({ type: "SET_LYRICS", lyrics });

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [send, lyrics]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (state.matches("ready.playing")) {
      audio
        .play()
        .catch((error) => console.error("Error playing audio:", error));
    } else {
      audio.pause();
    }

    audio.volume = state.context.isMuted ? 0 : state.context.volume;
  }, [state]);

  useEffect(() => {
    const container = lyricsContainerRef.current;
    if (!container) return;

    const activeLyric = container.querySelector(".active-lyric");
    if (activeLyric) {
      activeLyric.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [state.context.currentLyricIndex]);

  const togglePlayPause = () => {
    send({ type: state.matches("ready.playing") ? "PAUSE" : "PLAY" });
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const progressBar = progressRef.current;
    const audio = audioRef.current;
    if (!progressBar || !audio) return;

    const clickPosition =
      (e.clientX - progressBar.getBoundingClientRect().left) /
      progressBar.offsetWidth;
    const newTime = clickPosition * state.context.duration;

    audio.currentTime = newTime;
    send({ type: "SEEK", time: newTime });
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    send({ type: "VOLUME_CHANGE", volume: newVolume });
  };

  const toggleMute = () => {
    send({ type: "TOGGLE_MUTE" });
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleForward = () => {
    send({ type: "FORWARD" });
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.duration,
        audioRef.current.currentTime + 5,
      );
    }
  };

  const handleBackward = () => {
    send({ type: "BACKWARD" });
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        0,
        audioRef.current.currentTime - 5,
      );
    }
  };

  return (
    <div className="audio-player">
      <audio ref={audioRef} src={audioSrc} />
      <button onClick={handleBackward}>
        <SkipBack size={20} />
      </button>
      <button onClick={togglePlayPause}>
        {state.matches("ready.playing") ? (
          <Pause size={20} />
        ) : (
          <Play size={20} />
        )}
      </button>
      <button onClick={handleForward}>
        <SkipForward size={20} />
      </button>
      <div className="progress-container">
        <div
          ref={progressRef}
          className="progress-bar"
          onClick={handleProgressClick}
        >
          <div
            className="progress"
            style={{
              width: `${(state.context.currentTime / state.context.duration) * 100}%`,
            }}
          ></div>
        </div>
      </div>
      <div className="time-display">
        {formatTime(state.context.currentTime)} /{" "}
        {formatTime(state.context.duration)}
      </div>
      <div className="volume-control">
        <button onClick={toggleMute}>
          {state.context.isMuted ? <VolumeX size={20} /> : <Volume size={20} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={state.context.isMuted ? 0 : state.context.volume}
          onChange={handleVolumeChange}
        />
      </div>
      <div className="lyrics-container" ref={lyricsContainerRef}>
        {state.context.lyrics.map((lyric, index) => (
          <div
            key={index}
            className={`lyric ${index === state.context.currentLyricIndex ? "active-lyric" : ""}`}
          >
            {lyric.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default XStateAudioPlayer;
