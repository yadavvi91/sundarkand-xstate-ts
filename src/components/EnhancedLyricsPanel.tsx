import React, { useState, useRef } from "react";
import { EnhancedLyric } from "../utils/enhancedLyrics";
import EnhancedLyricRenderer from "./EnhancedLyricRenderer";

interface EnhancedLyricsPanelProps {
  lyrics: EnhancedLyric[];
  currentLyricIndex: number;
  currentOutlineIndex: number;
  onLyricClick: (index: number, lyric: EnhancedLyric) => void;
}

const EnhancedLyricsPanel: React.FC<EnhancedLyricsPanelProps> = ({
  lyrics,
  currentLyricIndex,
  currentOutlineIndex,
  onLyricClick,
}) => {
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const [currentDialogueId, setCurrentDialogueId] = useState<number | null>(null);

  // Mock function for isFirstOccurrence
  const isFirstOccurrence = (footnoteId: number, currentIndex: number) => {
    return true; // Simplified for demo
  };

  // Handle dialogue click
  const handleDialogueClick = (e: React.MouseEvent<HTMLElement, MouseEvent>, dialogueId: number) => {
    e.stopPropagation();
    setCurrentDialogueId(dialogueId === currentDialogueId ? null : dialogueId);
  };

  const renderLyrics = () => {
    let currentOutline = -1;
    return (
      <div className="w-full flex flex-col items-center">
        {lyrics.reduce((acc, lyric, index) => {
          // Add outline section if needed
          if (lyric.outlineIndex !== currentOutline) {
            currentOutline = lyric.outlineIndex;
            acc.push(
              <div
                key={`outline-${lyric.outlineIndex}`}
                id={`outline-${lyric.outlineIndex}`}
                className={`w-full mb-4 p-2 ${
                  lyric.outlineIndex === currentOutlineIndex
                    ? "bg-blue-100"
                    : ""
                }`}
              >
                {[]}
              </div>,
            );
          }
          
          // Add lyric to the current outline section
          acc[acc.length - 1].props.children.push(
            <div
              key={index}
              className={`text-lg cursor-pointer flex justify-center items-center w-full 
                ${index === currentLyricIndex ? "bg-yellow-200" : ""}`}
              onClick={() => onLyricClick(index, lyric)}
            >
              <EnhancedLyricRenderer
                lyric={lyric}
                index={index}
                isFirstOccurrence={isFirstOccurrence}
                currentDialogueId={currentDialogueId}
                onDialogueClick={handleDialogueClick}
              />
            </div>,
          );
          return acc;
        }, [] as React.ReactElement[])}
      </div>
    );
  };

  return (
    <div
      className="flex-grow p-8 overflow-y-auto flex flex-col items-center"
      ref={lyricsContainerRef}
    >
      <div className="w-full max-w-[1000px]">
        <h2 className="text-4xl font-bold mb-8 text-center w-full">
          सुंदरकाण्‍‍ड़ (Enhanced with Narrative Context)
        </h2>
        {renderLyrics()}
      </div>
    </div>
  );
};

export default EnhancedLyricsPanel;