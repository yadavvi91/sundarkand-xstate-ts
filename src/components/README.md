# Component Structure

This document explains the component structure of the Sundarkand audio player application.

## Overview

The application has been refactored to use a more modular component structure. The main component, `AudioPlayerWithLyricsAndOutline`, has been broken down into smaller, more focused components:

1. `OutlinePanel`: Displays the outline of the audio content and allows navigation to different sections.
2. `LyricsPanel`: Displays the lyrics of the audio content and handles the highlighting of the current lyric.
3. `InfoPanel`: Displays additional information about the audio content, such as dialogue information and translations.
4. `LyricRenderer`: Handles the rendering of individual lyrics with different formatting based on the lyric type.
5. `DialogueDisplay`: Displays information about who said what to whom in the audio.
6. `TranslationsDisplay`: Displays translations for the lyrics.
7. `ModeMenu`: Provides a menu for switching between different display modes.
8. `AudioPlayer`: Handles the audio playback controls.

## Component Hierarchy

```
AudioPlayerWithLyricsAndOutline
├── OutlinePanel
├── LyricsPanel
│   └── LyricRenderer
└── InfoPanel
    ├── DialogueDisplay
    │   └── ModeMenu
    ├── TranslationsDisplay
    │   └── ModeMenu
    └── AudioPlayer
```

## Benefits of the Refactoring

1. **Improved Maintainability**: Each component has a single responsibility, making it easier to understand and modify.
2. **Better Code Organization**: Related functionality is grouped together in separate components.
3. **Enhanced Reusability**: Components can be reused in different parts of the application or in other applications.
4. **Easier Testing**: Smaller components are easier to test in isolation.
5. **Improved Performance**: React can optimize rendering for smaller components more effectively.
6. **Better Collaboration**: Different team members can work on different components without conflicts.

## Component Details

### OutlinePanel

Displays the outline of the audio content and allows navigation to different sections.

### LyricsPanel

Displays the lyrics of the audio content and handles the highlighting of the current lyric. It uses the `LyricRenderer` component to render individual lyrics.

### InfoPanel

Displays additional information about the audio content, such as dialogue information and translations. It uses the `DialogueDisplay` and `TranslationsDisplay` components to display this information, and the `AudioPlayer` component to handle audio playback.

### LyricRenderer

Handles the rendering of individual lyrics with different formatting based on the lyric type (doha, sortha, samput, chaupai).

### DialogueDisplay

Displays information about who said what to whom in the audio. It uses the `ModeMenu` component to allow switching between display modes.

### TranslationsDisplay

Displays translations for the lyrics. It uses the `ModeMenu` component to allow switching between display modes.

### ModeMenu

Provides a menu for switching between different display modes (who-said-to-whom, translations).

### AudioPlayer

Handles the audio playback controls, including play/pause, forward/backward, volume control, and progress tracking.