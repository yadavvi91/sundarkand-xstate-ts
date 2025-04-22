import { Lyric } from "../newAudioPlayerMachine";
import { lyricsVikesh } from "./lyrics";

// Extended Lyric interface with narrative context
export interface EnhancedLyric extends Lyric {
  narrativeContext?: {
    narrator: string;
    listener: string;
    description: string;
  };
}

// Create a copy of lyricsVikesh with narrative context added to specific verses
export const enhancedLyricsVikesh: EnhancedLyric[] = lyricsVikesh.map(lyric => {
  // Create a deep copy of the lyric
  const enhancedLyric: EnhancedLyric = { ...lyric };
  
  // Add narrative context to specific verses
  
  // Example: Add narrative context to the verse at time 389
  if (lyric.time === 389) {
    enhancedLyric.narrativeContext = {
      narrator: "Shiva",
      listener: "Parvati",
      description: "This verse is part of Shiva's narration to Parvati, representing an outer narrative layer of the story. Shiva is explaining to Parvati the importance of devotion to Ram."
    };
  }
  
  // Example: Add narrative context to the verse at time 375
  if (lyric.time === 375) {
    enhancedLyric.narrativeContext = {
      narrator: "Shiva",
      listener: "Parvati",
      description: "Shiva is telling Parvati about the conversation between Ram and Hanuman."
    };
  }
  
  // Example: Add narrative context to the verse at time 402
  if (lyric.time === 402) {
    enhancedLyric.narrativeContext = {
      narrator: "Shiva",
      listener: "Parvati",
      description: "Shiva concludes his teaching to Parvati about the importance of this dialogue between Ram and Hanuman."
    };
  }
  
  return enhancedLyric;
});

// Usage example in the application:
/*
import { enhancedLyricsVikesh } from "./utils/enhancedLyrics";

// Replace the original lyrics with enhanced ones
const [lyrics, setLyrics] = useState(enhancedLyricsVikesh);

// Then use EnhancedLyricRenderer instead of LyricRenderer in your components
*/