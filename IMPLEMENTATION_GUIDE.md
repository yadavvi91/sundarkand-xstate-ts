# Narrative Context Implementation Guide

This guide explains how to implement the narrative context feature in the Sundarkand application, which adds visual indicators and expandable panels for verses that represent narrative shifts (like when Shiva is speaking to Parvati).

## Overview

The implementation consists of:

1. **Extended Lyric Interface**: Adding narrative context information to lyrics
2. **Visual Indicator**: A colored left border for verses with narrative context
3. **Context Icon**: A clickable icon to toggle the narrative context panel
4. **Expandable Panel**: A collapsible panel showing narrative context details

## Implementation Steps

### 1. Extended Lyric Interface

We extend the base `Lyric` interface to include narrative context information:

```typescript
interface EnhancedLyric extends Lyric {
  narrativeContext?: {
    narrator: string;
    listener: string;
    description: string;
  };
}
```

### 2. Enhanced Lyrics Data

We enhance the existing lyrics data to include narrative context for specific verses:

```typescript
export const enhancedLyricsVikesh: EnhancedLyric[] = lyricsVikesh.map(lyric => {
  const enhancedLyric: EnhancedLyric = { ...lyric };
  
  // Add narrative context to specific verses
  if (lyric.time === 389) {
    enhancedLyric.narrativeContext = {
      narrator: "Shiva",
      listener: "Parvati",
      description: "This verse is part of Shiva's narration to Parvati..."
    };
  }
  
  return enhancedLyric;
});
```

### 3. Narrative Context Panel Component

We create a component to display narrative context information:

```tsx
const NarrativeContextPanel: React.FC<NarrativeContextPanelProps> = ({
  isOpen,
  contextInfo,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="narrative-context-panel bg-amber-50 border border-amber-200 rounded-md p-4 mt-2 mb-4 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-amber-800">Narrative Context</h3>
        <button onClick={onClose} className="text-amber-600 hover:text-amber-800">✕</button>
      </div>
      <div className="text-sm">
        <p className="mb-1"><span className="font-medium">Narrator:</span> {contextInfo.narrator}</p>
        <p className="mb-1"><span className="font-medium">Listener:</span> {contextInfo.listener}</p>
        <p className="text-amber-700">{contextInfo.description}</p>
      </div>
    </div>
  );
};
```

### 4. Enhanced Lyric Renderer

We enhance the lyric renderer to display the visual indicator and context panel:

```tsx
const EnhancedLyricRenderer: React.FC<EnhancedLyricRendererProps> = memo(({
  lyric,
  index,
  isFirstOccurrence,
  currentDialogueId,
  onDialogueClick
}) => {
  const [isContextPanelOpen, setIsContextPanelOpen] = useState(false);
  
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

  return (
    <div className="flex flex-col w-full">
      <div className={`flex items-center ${hasNarrativeContext ? 'border-l-4 border-amber-500 pl-2' : ''}`}>
        {/* Lyric content */}
        <div className="w-[40px] flex">
          {dialogueIndicator}
          {narrativeContextIndicator}
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
```

## Integration with Existing Code

To integrate this feature with the existing application:

1. Add the new components to the project
2. Enhance the lyrics data with narrative context information
3. Replace the original `LyricRenderer` with `EnhancedLyricRenderer` in the `LyricsPanel` component
4. Update the application to use the enhanced lyrics data

## Example for Verse at Time 389

The verse at time 389 in lyricsVikesh ("उमा राम सुभाउ जेहिं जाना । ताहि भजनु तजि भाव न आना ॥") is enhanced with narrative context information indicating that it's part of Shiva's narration to Parvati. When rendered, this verse will have:

1. An amber-colored left border
2. A [📜] icon that can be clicked to toggle the narrative context panel
3. An expandable panel showing that this is Shiva speaking to Parvati

## Visual Design

The implementation uses amber colors for narrative context to differentiate it from the existing UI elements:
- Blue background for current outline section
- Yellow background for currently playing verse
- Green background for who-said-to-whom dialogues
- Amber left border and icon for narrative context

This color scheme ensures that the narrative context feature is visually distinct while maintaining harmony with the existing UI.