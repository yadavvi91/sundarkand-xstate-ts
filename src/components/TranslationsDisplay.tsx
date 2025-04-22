import React from "react";
import { Lyric } from "../improvedAudioPlayerMachine";
import ModeMenu from "./ModeMenu";

interface TranslationsDisplayProps {
  lyrics: Lyric[];
  currentLyricIndex: number;
  onModeChange: (mode: "who-said-to-whom" | "translations") => void;
  currentMode: "who-said-to-whom" | "translations";
}

const TranslationsDisplay: React.FC<TranslationsDisplayProps> = ({
  lyrics,
  currentLyricIndex,
  onModeChange,
  currentMode
}) => {
  // Find lyrics with translations around the current lyric index
  const startIndex = Math.max(0, currentLyricIndex - 2);
  const endIndex = Math.min(lyrics.length - 1, currentLyricIndex + 2);

  // Find consecutive lyrics with translations
  let translationGroups = [];
  let currentGroup = [];

  for (let i = startIndex; i <= endIndex; i++) {
    const lyric = lyrics[i];
    if (lyric.translation) {
      // If this is a doha or sortha and the next one is also a doha or sortha with the same translation,
      // they should be grouped together
      if (
        (lyric.type === "doha" || lyric.type === "sortha") &&
        i < lyrics.length - 1 &&
        (lyrics[i + 1].type === "doha" || lyrics[i + 1].type === "sortha") &&
        lyrics[i + 1].translation === lyric.translation
      ) {
        currentGroup.push(lyric);
      } else if (currentGroup.length > 0 && currentGroup[0].translation === lyric.translation) {
        // If this lyric has the same translation as the current group, add it
        currentGroup.push(lyric);
      } else {
        // Start a new group
        if (currentGroup.length > 0) {
          translationGroups.push([...currentGroup]);
        }
        currentGroup = [lyric];
      }
    }
  }

  // Add the last group if it exists
  if (currentGroup.length > 0) {
    translationGroups.push(currentGroup);
  }

  if (translationGroups.length === 0) {
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Translations</h3>
          <ModeMenu currentMode={currentMode} onModeChange={onModeChange} />
        </div>
        <div className="mb-2 p-4 rounded bg-yellow-100 text-center">
          <p>No translations available for the current verses.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Translations</h3>
        <ModeMenu currentMode={currentMode} onModeChange={onModeChange} />
      </div>
      {translationGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="mb-4 p-4 rounded bg-yellow-100">
          <div className="mb-2">
            {group.map((lyric, i) => (
              <div key={i} className="mb-1">
                <p className="font-medium">{lyric.text}</p>
              </div>
            ))}
          </div>
          <p className="text-sm mt-2 border-t pt-2 border-yellow-200">{group[0].translation}</p>
        </div>
      ))}
    </div>
  );
};

export default TranslationsDisplay;