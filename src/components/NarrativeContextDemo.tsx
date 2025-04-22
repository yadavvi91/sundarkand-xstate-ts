import React, { useState } from "react";
import { enhancedLyricsVikesh } from "../utils/enhancedLyrics";
import EnhancedLyricsPanel from "./EnhancedLyricsPanel";

const NarrativeContextDemo: React.FC = () => {
  // State for tracking current lyric and outline
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0);
  const [currentOutlineIndex, setCurrentOutlineIndex] = useState(0);

  // Filter lyrics to show only the narrative context section (around time 389)
  // This is just for the demo to focus on the relevant verses
  const demoLyrics = enhancedLyricsVikesh.filter(
    lyric => lyric.time >= 367 && lyric.time <= 409
  );

  // Handle lyric click
  const handleLyricClick = (index: number, lyric: any) => {
    setCurrentLyricIndex(index);
    setCurrentOutlineIndex(lyric.outlineIndex);

    // Log for demonstration
    console.log(`Clicked lyric at time ${lyric.time}`);
    if (lyric.narrativeContext) {
      console.log('Narrative context:', lyric.narrativeContext);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="bg-amber-100 border-l-4 border-amber-500 p-4 mb-6 rounded">
        <h1 className="text-2xl font-bold mb-2">Narrative Context Demo</h1>
        <p className="text-amber-800">
          This is a demonstration of the narrative context feature. You can return to the main application using the button in the top-right corner.
        </p>
      </div>
      <p className="mb-4">
        This demo shows how to implement narrative context indicators and expandable panels
        for verses that represent narrative shifts in Sundarkand.
      </p>
      <p className="mb-4">
        <strong>Instructions:</strong> Notice the amber-colored left border on verses that have narrative context.
        Click on the [📜] icon to expand the narrative context panel.
      </p>
      <div className="border border-gray-300 rounded-lg shadow-lg">
        <EnhancedLyricsPanel
          lyrics={demoLyrics}
          currentLyricIndex={currentLyricIndex}
          currentOutlineIndex={currentOutlineIndex}
          onLyricClick={handleLyricClick}
        />
      </div>
      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Implementation Details</h2>
        <ol className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Extended Lyric Interface:</strong> Added <code>narrativeContext</code> property to the Lyric interface
          </li>
          <li>
            <strong>Visual Indicator:</strong> Added amber-colored left border to verses with narrative context
          </li>
          <li>
            <strong>Context Icon:</strong> Added [📜] icon that can be clicked to toggle the context panel
          </li>
          <li>
            <strong>Expandable Panel:</strong> Created a collapsible panel that shows narrative context details
          </li>
          <li>
            <strong>Data Enhancement:</strong> Extended existing lyrics data with narrative context information
          </li>
        </ol>
      </div>
    </div>
  );
};

export default NarrativeContextDemo;
