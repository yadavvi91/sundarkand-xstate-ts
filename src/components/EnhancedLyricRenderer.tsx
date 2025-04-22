import React, { memo, useState } from "react";
import { Lyric } from "../improvedAudioPlayerMachine";
import NarrativeContextPanel from "./NarrativeContextPanel";

// Extended Lyric interface with narrative context
interface EnhancedLyric extends Lyric {
  narrativeContext?: {
    narrator: string;
    listener: string;
    description: string;
  };
}

interface EnhancedLyricRendererProps {
  lyric: EnhancedLyric;
  index: number;
  isFirstOccurrence: (footnoteId: number, currentIndex: number) => boolean;
  currentDialogueId: number | null;
  onDialogueClick: (e: React.MouseEvent<HTMLElement, MouseEvent>, dialogueId: number) => void;
}

const EnhancedLyricRenderer: React.FC<EnhancedLyricRendererProps> = memo(({
  lyric,
  index,
  isFirstOccurrence,
  currentDialogueId,
  onDialogueClick
}) => {
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  
  const footnoteIds = lyric.footnoteIds.reduce(
    (acc: number[], footnoteId: number, i: number) => {
      if (isFirstOccurrence(footnoteId, index)) {
        acc.push(footnoteId);
      }
      return acc;
    },
    [],
  );
  const footnoteIndicator = null;

  const hasDialogue = lyric.dialogueId !== undefined;
  const dialogueIndicator = hasDialogue ? (
    <div className="flex items-center">
      <sup
        className="text-green-500 cursor-pointer ml-1"
        onClick={(e) => onDialogueClick(e, lyric.dialogueId!)}
      >
        [👥]
      </sup>
    </div>
  ) : null;

  const hasNarrativeContext = lyric.narrativeContext !== undefined;
  const narrativeContextIndicator = hasNarrativeContext ? (
    <div className="flex items-center">
      <sup
        className="text-amber-500 cursor-pointer ml-1"
        onClick={() => setIsContextPanelOpen(!isContextPanelOpen)}
      >
        [📜]
      </sup>
    </div>
  ) : null;

  // Helper function to split text
  function splitOnSpaceExceptLast(str: string) {
    const secondLastSpaceIndex = str.lastIndexOf(" ");
    if (secondLastSpaceIndex === -1) {
      return [str];
    }
    const lastSpaceIndex = str.lastIndexOf(" ", secondLastSpaceIndex - 1);
    const beforeLastSpace = str.slice(0, lastSpaceIndex);
    const afterLastSpace = str.slice(lastSpaceIndex + 1);
    const splitBeforeLastSpace = beforeLastSpace.split(" ");
    return [...splitBeforeLastSpace, afterLastSpace];
  }

  // For verses with partial dialogue
  if (hasDialogue && lyric.dialogueTextRange) {
    // Handle special cases as in the original LyricRenderer
    // ...
  }

  // Default rendering for regular verses
  return (
    <div className="flex flex-col w-full">
      <div className={`flex items-center ${hasNarrativeContext ? 'border-l-4 border-amber-500 pl-2' : ''}`}>
        <div className="flex w-full px-2" style={{ width: "500px" }}>
          <p className="w-full flex justify-between">
            {splitOnSpaceExceptLast(lyric.text).map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </p>
        </div>
        <div className="w-[40px] flex">
          {dialogueIndicator}
          {narrativeContextIndicator}
          {footnoteIndicator}
        </div>
      </div>
      
      {hasNarrativeContext && isContextPanelOpen && (
        <NarrativeContextPanel
          isOpen={isContextPanelOpen}
          contextInfo={lyric.narrativeContext!}
          onClose={() => setIsContextPanelOpen(false)}
        />
      )}
    </div>
  );
});

export default EnhancedLyricRenderer;