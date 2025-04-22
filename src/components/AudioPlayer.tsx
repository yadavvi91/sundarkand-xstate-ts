import React, { useRef, forwardRef } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";

interface AudioPlayerProps {
  currentPosition: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  audioSrc: string;
  imageSrc: string;
  imageAlt?: string;
  recitationTitle?: string;
  onPlayPause: () => void;
  onForward: () => void;
  onBackward: () => void;
  onVolumeChange: (volume: number) => void;
  onProgressClick: (clickPosition: number) => void;
  onTimeUpdate: (currentTime: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onEnded: () => void;
}

const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  ({
    currentPosition,
    duration,
    volume,
    isPlaying,
    audioSrc,
    imageSrc,
    imageAlt = "Recitation Image",
    recitationTitle = "Recitation",
    onPlayPause,
    onForward,
    onBackward,
    onVolumeChange,
    onProgressClick,
    onTimeUpdate,
    onLoadedMetadata,
    onEnded,
  }, ref) => {
    const progressRef = useRef<HTMLDivElement>(null);

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current) return;

      const progressBar = progressRef.current;
      const clickPosition =
        (e.clientX - progressBar.getBoundingClientRect().left) /
        progressBar.offsetWidth;

      onProgressClick(clickPosition);
    };

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newVolume = parseFloat(e.target.value);
      onVolumeChange(newVolume);
    };

    const formatTime = (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    return (
      <div className="w-full">
        <div className="mb-4">
          <div className="w-full h-32 bg-gray-200 mb-4 flex justify-center items-center p-2">
            <div className="h-full w-full bg-gray-200 flex justify-center items-center">
              <img
                src={imageSrc}
                className="max-h-full max-w-full object-contain"
                alt={imageAlt}
              />
            </div>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            {recitationTitle}
          </div>
          <div
            ref={progressRef}
            className="h-2 bg-gray-300 rounded-full cursor-pointer"
            onClick={handleProgressClick}
          >
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{
                width: `${(currentPosition / duration) * 100}%`,
              }}
            ></div>
          </div>
          <div className="flex justify-between mt-1 text-sm text-gray-600">
            <span>{formatTime(currentPosition)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onBackward}
          >
            <SkipBack size={20} />
          </button>
          <button
            onClick={onPlayPause}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button
            className="text-gray-600 hover:text-gray-800"
            onClick={onForward}
          >
            <SkipForward size={20} />
          </button>
          <button
            onClick={() => onVolumeChange(volume === 0 ? 1 : 0)}
            className="text-gray-600 hover:text-gray-800"
          >
            {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
        </div>
        <audio
          key={audioSrc} // Add key to force recreation when src changes
          ref={ref}
          src={audioSrc}
          onTimeUpdate={(e) => {
            const audio = e.currentTarget;
            onTimeUpdate(audio.currentTime);
          }}
          onLoadedMetadata={(e) => {
            const audio = e.currentTarget;
            onLoadedMetadata(audio.duration);
          }}
          onEnded={onEnded}
        />
      </div>
    );
  }
);

export default AudioPlayer;
