import React from "react";
import { DialogueInfo } from "../improvedAudioPlayerMachine";
import ModeMenu from "./ModeMenu";

interface DialogueDisplayProps {
  dialogue: DialogueInfo;
  onClose: () => void;
  onModeChange: (mode: "who-said-to-whom" | "translations") => void;
  currentMode: "who-said-to-whom" | "translations";
  lyricsSource: "pavan" | "vikesh";
  showSamput: boolean;
  onLyricsSourceChange: (source: "pavan" | "vikesh") => void;
  onSamputFilterToggle: (showSamput: boolean) => void;
}

const DialogueDisplay: React.FC<DialogueDisplayProps> = ({ 
  dialogue, 
  onClose, 
  onModeChange,
  currentMode,
  lyricsSource,
  showSamput,
  onLyricsSourceChange,
  onSamputFilterToggle
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Who Said to Whom</h3>
        <ModeMenu 
          currentMode={currentMode} 
          onModeChange={onModeChange}
          lyricsSource={lyricsSource}
          showSamput={showSamput}
          onLyricsSourceChange={onLyricsSourceChange}
          onSamputFilterToggle={onSamputFilterToggle}
        />
      </div>
      <div className="mb-2 p-4 rounded bg-green-100">
        <div className="flex justify-between">
          <div>
            <span className="font-bold">{dialogue.speaker}</span> to <span className="font-bold">{dialogue.listener}</span>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="text-sm mt-2">{dialogue.description}</p>
      </div>
    </div>
  );
};

export default DialogueDisplay;
