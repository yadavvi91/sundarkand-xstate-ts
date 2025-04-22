import React, { memo } from "react";
import { Lyric } from "../improvedAudioPlayerMachine";

interface LyricRendererProps {
  lyric: Lyric;
  index: number;
  isFirstOccurrence: (footnoteId: number, currentIndex: number) => boolean;
  currentDialogueId: number | null;
  onDialogueClick: (e: React.MouseEvent<HTMLElement, MouseEvent>, dialogueId: number) => void;
  onNarrativeContextClick: (e: React.MouseEvent<HTMLElement, MouseEvent>, narrativeContext: { narrator: string; listener: string; description: string }) => void;
}

const LyricRenderer: React.FC<LyricRendererProps> = memo(({
  lyric,
  index,
  isFirstOccurrence,
  currentDialogueId,
  onDialogueClick,
  onNarrativeContextClick
}) => {
  // No longer need local state for narrative context panel
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
        onClick={(e) => onNarrativeContextClick(e, lyric.narrativeContext!)}
      >
        [📜]
      </sup>
    </div>
  ) : null;

  // Helper function to split text
  function splitOnSpaceExceptLast(str: string) {
    // Find the last space in the string
    const secondLastSpaceIndex = str.lastIndexOf(" ");

    // If there's no space or only one space, return the string as the only element in an array
    if (secondLastSpaceIndex === -1) {
      return [str];
    }

    // Find the second-to-last space in the string
    const lastSpaceIndex = str.lastIndexOf(" ", secondLastSpaceIndex - 1);

    // Split the string into two parts: before the last space and after
    const beforeLastSpace = str.slice(0, lastSpaceIndex);
    const afterLastSpace = str.slice(lastSpaceIndex + 1);

    // Split the part before the last space on spaces
    const splitBeforeLastSpace = beforeLastSpace.split(" ");

    // Combine the two parts
    return [...splitBeforeLastSpace, afterLastSpace];
  }

  // For verses with partial dialogue
  if (hasDialogue && lyric.dialogueTextRange) {
    // Special case for the first verse at time 943
    if (lyric.time === 943) {
      const midPoint = lyric.text.indexOf("।");
      const firstPart = lyric.text.slice(0, midPoint + 1);
      const secondPart = lyric.text.slice(midPoint + 1);

      return (
        <div className="flex items-center style={{ minHeight: '2em' }}">
          <div className="flex w-full px-2" style={{ width: "500px" }}>
            <p className="w-[245px] flex justify-between">
              {splitOnSpaceExceptLast(firstPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
            <p className={`w-[255px] flex justify-between pl-2 ${currentDialogueId === lyric.dialogueId ? 'bg-green-300 bg-opacity-50' : ''}`}>
              {splitOnSpaceExceptLast(secondPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
          </div>
          <div className="w-[20px]">
            {dialogueIndicator}
            {footnoteIndicator}
          </div>
        </div>
      );
    }

    // For the verse at time 123 (Sugriv's dialogue)
    if (lyric.time === 123) {
      const beforeDialogue = lyric.text.substring(0, lyric.dialogueTextRange.start);
      const dialogueText = lyric.text.substring(lyric.dialogueTextRange.start, lyric.dialogueTextRange.end);

      const midPoint = lyric.text.indexOf("।");
      if (midPoint >= lyric.dialogueTextRange.start) {
        // If the middle dot is within the dialogue part
        const firstPart = lyric.text.slice(0, midPoint + 1);
        const secondPart = lyric.text.slice(midPoint + 1);

        return (
          <div className="flex items-center style={{ minHeight: '2em' }}">
            <div className="flex w-full px-2" style={{ width: "500px" }}>
              <p className="w-[245px] flex justify-between">
                <span>{beforeDialogue}</span>
                <span className={`${currentDialogueId === lyric.dialogueId ? 'bg-green-300 bg-opacity-50' : ''}`}>
                  {firstPart.substring(beforeDialogue.length)}
                </span>
              </p>
              <p className={`w-[255px] flex justify-between pl-2 ${currentDialogueId === lyric.dialogueId ? 'bg-green-300 bg-opacity-50' : ''}`}>
                {splitOnSpaceExceptLast(secondPart.trim()).map((word, i) => (
                  <span key={i}>{word}</span>
                ))}
              </p>
            </div>
            <div className="w-[20px]">
              {dialogueIndicator}
              {footnoteIndicator}
            </div>
          </div>
        );
      }
    }
  }

  // For regular verses with full dialogue
  if (hasDialogue && !lyric.dialogueTextRange) {
    if (lyric.type === "doha" || lyric.type === "sortha") {
      const pattern = /॥\d+॥/;
      const isLine2 = pattern.test(lyric.text);
      return (
        <div className="flex items-center">
          <p
            className={`flex justify-between w-full px-2 ${currentDialogueId === lyric.dialogueId ? 'bg-green-300 bg-opacity-50' : ''}`}
            style={{ width: isLine2 ? "400px" : "370px" }}
          >
            {splitOnSpaceExceptLast(lyric.text.trim()).map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </p>
          <div className="w-[20px]">
            {dialogueIndicator}
            {footnoteIndicator}
          </div>
        </div>
      );
    }
    else if (lyric.type === "samput") {
      const midPoint = lyric.text.indexOf("।");
      const firstPart = lyric.text.slice(0, midPoint + 1);
      const secondPart = lyric.text.slice(midPoint + 1) + "  ";
      return (
        <div className="flex items-center">
          <div
            className={`flex w-full px-2 italic text-gray-600 font-bold ${currentDialogueId === lyric.dialogueId ? 'bg-green-300 bg-opacity-50' : ''}`}
            style={{ width: "500px" }}
          >
            <p className="w-[245px] flex justify-between">
              {splitOnSpaceExceptLast(firstPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
            <p className="w-[255px] flex justify-between pl-2">
              {splitOnSpaceExceptLast(secondPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
          </div>
          <div className="w-[20px]">
            {dialogueIndicator}
            {footnoteIndicator}
          </div>
        </div>
      );
    }
    else {
      const midPoint = lyric.text.indexOf("।");
      const firstPart = lyric.text.slice(0, midPoint + 1);
      const secondPart = lyric.text.slice(midPoint + 1) + "  ";
      return (
        <div className="flex items-center style={{ minHeight: '2em' }}">
          <div className={`flex w-full px-2 ${currentDialogueId === lyric.dialogueId ? 'bg-green-300 bg-opacity-50' : ''}`} style={{ width: "500px" }}>
            <p className="w-[245px] flex justify-between">
              {splitOnSpaceExceptLast(firstPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
            <p className="w-[255px] flex justify-between pl-2">
              {splitOnSpaceExceptLast(secondPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
          </div>
          <div className="w-[20px]">
            {dialogueIndicator}
            {footnoteIndicator}
          </div>
        </div>
      );
    }
  }

  // Narrative context panel is now rendered in the InfoPanel component

  // For regular verses without dialogue
  if (lyric.type === "doha" || lyric.type === "sortha") {
    const pattern = /॥\d+॥/;
    const isLine2 = pattern.test(lyric.text);
    return (
      <div className={`flex items-center ${hasNarrativeContext ? 'border-l-4 border-amber-500 pl-2' : ''}`} style={{ minHeight: '2em' }}>
        <p
          className="flex justify-between w-full px-2"
          style={{ width: isLine2 ? "400px" : "370px" }}
        >
          {splitOnSpaceExceptLast(lyric.text.trim()).map((word, i) => (
            <span key={i}>{word}</span>
          ))}
        </p>
        <div className="w-[40px] flex">
          {dialogueIndicator}
          {narrativeContextIndicator}
          {footnoteIndicator}
        </div>
      </div>
    );
  }
  else if (lyric.type === "samput") {
    const midPoint = lyric.text.indexOf("।");
    const firstPart = lyric.text.slice(0, midPoint + 1);
    const secondPart = lyric.text.slice(midPoint + 1) + "  ";
    return (
      <div className={`flex items-center ${hasNarrativeContext ? 'border-l-4 border-amber-500 pl-2' : ''}`} style={{ minHeight: '2em' }}>
        <div
          className="flex w-full px-2 italic text-gray-600 font-bold"
          style={{ width: "500px" }}
        >
          <p className="w-[245px] flex justify-between">
            {splitOnSpaceExceptLast(firstPart.trim()).map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </p>
          <p className="w-[255px] flex justify-between pl-2">
            {splitOnSpaceExceptLast(secondPart.trim()).map((word, i) => (
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
    );
  }
  else {
    const midPoint = lyric.text.indexOf("।");
    const firstPart = lyric.text.slice(0, midPoint + 1);
    const secondPart = lyric.text.slice(midPoint + 1) + "  ";
    return (
      <div className={`flex items-center ${hasNarrativeContext ? 'border-l-4 border-amber-500 pl-2' : ''}`} style={{ minHeight: '2em' }}>
        <div className="flex w-full px-2" style={{ width: "500px" }}>
          <p className="w-[245px] flex justify-between">
            {splitOnSpaceExceptLast(firstPart.trim()).map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </p>
          <p className="w-[255px] flex justify-between pl-2">
            {splitOnSpaceExceptLast(secondPart.trim()).map((word, i) => (
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
    );
  }
}, (prevProps, nextProps) => {
  // Only re-render if these props change
  return (
    prevProps.lyric === nextProps.lyric &&
    prevProps.index === nextProps.index &&
    prevProps.currentDialogueId === nextProps.currentDialogueId &&
    prevProps.onNarrativeContextClick === nextProps.onNarrativeContextClick
  );
});

export default LyricRenderer;
