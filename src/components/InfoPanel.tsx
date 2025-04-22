import React, { RefObject } from "react";
import { DialogueInfo, Lyric } from "../improvedAudioPlayerMachine";
import DialogueDisplay from "./DialogueDisplay";
import TranslationsDisplay from "./TranslationsDisplay";
import AudioPlayer from "./AudioPlayer";
import ModeMenu from "./ModeMenu";

interface InfoPanelProps {
  displayMode: "who-said-to-whom" | "translations";
  currentDialogueId: number | null;
  dialogues: DialogueInfo[];
  lyrics: Lyric[];
  currentLyricIndex: number;
  onModeChange: (mode: "who-said-to-whom" | "translations") => void;
  onDialogueClose: () => void;
  audioRef: RefObject<HTMLAudioElement>;
  currentPosition: number;
  duration: number;
  volume: number;
  isPlaying: boolean;
  audioSrc: string;
  imageSrc: string;
  imageAlt: string;
  recitationTitle: string;
  onPlayPause: () => void;
  onForward: () => void;
  onBackward: () => void;
  onVolumeChange: (volume: number) => void;
  onProgressClick: (clickPosition: number) => void;
  onTimeUpdate: (currentTime: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onEnded: () => void;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  displayMode,
  currentDialogueId,
  dialogues,
  lyrics,
  currentLyricIndex,
  onModeChange,
  onDialogueClose,
  audioRef,
  currentPosition,
  duration,
  volume,
  isPlaying,
  audioSrc,
  imageSrc,
  imageAlt,
  recitationTitle,
  onPlayPause,
  onForward,
  onBackward,
  onVolumeChange,
  onProgressClick,
  onTimeUpdate,
  onLoadedMetadata,
  onEnded
}) => {
  const currentDialogue = dialogues.find(d => d.id === currentDialogueId);

  return (
    <div className="w-[400px] bg-white p-8 flex flex-col border-l border-gray-200">
      <div className="flex-grow">
        {displayMode === "who-said-to-whom" ? (
          currentDialogueId && currentDialogue ? (
            <DialogueDisplay 
              dialogue={currentDialogue} 
              onClose={onDialogueClose} 
              onModeChange={onModeChange}
              currentMode={displayMode}
            />
          ) : (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Who Said to Whom</h3>
                <ModeMenu currentMode={displayMode} onModeChange={onModeChange} />
              </div>
              <div className="mb-2 p-4 rounded bg-gray-100 text-center">
                <p>Click on a dialogue indicator [👥] in the text to see who said what to whom.</p>
              </div>
            </div>
          )
        ) : (
          <TranslationsDisplay 
            lyrics={lyrics} 
            currentLyricIndex={currentLyricIndex} 
            onModeChange={onModeChange}
            currentMode={displayMode}
          />
        )}
      </div>
      <AudioPlayer
        ref={audioRef}
        currentPosition={currentPosition || 0}
        duration={duration}
        volume={volume}
        isPlaying={isPlaying}
        audioSrc={audioSrc}
        imageSrc={imageSrc}
        imageAlt={imageAlt}
        recitationTitle={recitationTitle}
        onPlayPause={onPlayPause}
        onForward={onForward}
        onBackward={onBackward}
        onVolumeChange={onVolumeChange}
        onProgressClick={onProgressClick}
        onTimeUpdate={onTimeUpdate}
        onLoadedMetadata={onLoadedMetadata}
        onEnded={onEnded}
      />
    </div>
  );
};

export default InfoPanel;