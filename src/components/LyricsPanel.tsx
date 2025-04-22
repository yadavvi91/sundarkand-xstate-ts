import React, { RefObject } from "react";
import { Lyric } from "../improvedAudioPlayerMachine";
import LyricRenderer from "./LyricRenderer";

interface LyricsPanelProps {
  lyrics: Lyric[];
  currentLyricIndex: number;
  currentOutlineIndex: number;
  lyricsContainerRef: RefObject<HTMLDivElement>;
  onLyricClick: (index: number, lyric: Lyric) => void;
  onManualScroll: (e: React.UIEvent<HTMLDivElement>) => void;
  isFirstOccurrence: (footnoteId: number, currentIndex: number) => boolean;
  currentDialogueId: number | null;
  onDialogueClick: (e: React.MouseEvent<HTMLElement, MouseEvent>, dialogueId: number) => void;
  onNarrativeContextClick: (e: React.MouseEvent<HTMLElement, MouseEvent>, narrativeContext: { narrator: string; listener: string; description: string }) => void;
}

const LyricsPanel: React.FC<LyricsPanelProps> = ({
  lyrics,
  currentLyricIndex,
  currentOutlineIndex,
  lyricsContainerRef,
  onLyricClick,
  onManualScroll,
  isFirstOccurrence,
  currentDialogueId,
  onDialogueClick,
  onNarrativeContextClick
}) => {
  const renderLyrics = () => {
    let currentOutline = -1;
    return (
      <div className="w-full flex flex-col items-center">
        {lyrics.reduce((acc, lyric, index) => {
          // we first add an outline <div>
          // and then *inside* this <div> we add list of <div>s for lyrics with props.children.push()
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
          acc[acc.length - 1].props.children.push(
            <div
              key={index}
              className={`text-lg cursor-pointer flex justify-center items-center w-full 
                ${index === currentLyricIndex ? "bg-yellow-200" : ""}`}
              onClick={() => onLyricClick(index, lyric)}
            >
              <LyricRenderer
                lyric={lyric}
                index={index}
                isFirstOccurrence={isFirstOccurrence}
                currentDialogueId={currentDialogueId}
                onDialogueClick={onDialogueClick}
                onNarrativeContextClick={onNarrativeContextClick}
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
      onScroll={onManualScroll}
    >
      <div className="w-full max-w-[1000px]">
        <h2 className="text-4xl font-bold mb-8 text-center w-full">
          सुंदरकाण्‍‍ड़
        </h2>
        {renderLyrics()}
      </div>
    </div>
  );
};

export default LyricsPanel;
