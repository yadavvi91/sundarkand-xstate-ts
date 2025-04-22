import { ActorRefFrom, assign, sendTo, setup } from "xstate";
import { lyricsPavan, outline, dialogues } from "./utils/lyrics.ts";

// Event types using dot notation convention
type AudioPlayerEvent =
  | { type: "data.loading.started" }
  | { type: "data.loaded"; duration: number }
  | { type: "audio.play" }
  | { type: "audio.resume" }
  | { type: "audio.pause" }
  | { type: "audio.forward" }
  | { type: "audio.backward" }
  | { type: "audio.seek"; position: number }
  | { type: "audio.seek.complete" }
  | { type: "audio.seek.failed" }
  | { type: "audio.time.update"; currentTime: number }
  | { type: "lyric.clicked"; index: number }
  | { type: "lyric.updated"; index: number; outlineIndex: number }
  | { type: "scroll.manual" }
  | { type: "volume.change"; volume: number }
  | { type: "scroll.sync.needed" }
  | { type: "dialogue.click"; dialogueId: number }
  | { type: "dialogue.close" };

export interface DialogueInfo {
  id: number;
  speaker: string;
  listener: string;
  description: string;
}

export interface Lyric {
  time: number;
  type: "chaupai" | "samput" | "doha" | "sortha" | "chhand";
  text: string;
  outlineIndex: number;
  footnoteIds: number[];
  dialogueId?: number;
  dialogueTextRange?: {
    start: number;
    end: number;
  };
}

type AudioPlayerContext = {
  currentPosition: number | null;
  seekPosition: number | null;
  duration: number;
  currentLyricIndex: number;
  currentOutlineIndex: number;
  volume: number;
  isManualScrolling: boolean;
  scrollTimeout: number | null;
  lyrics: Lyric[];
  outline: string[];
  dialogues: DialogueInfo[];
  currentDialogueId: number | null;
  scrollActor: ActorRefFrom<typeof scrollMachine> | null;
  lyricActor: ActorRefFrom<typeof lyricMachine> | null;
  scrollEffect: (() => void) | null;
};

// Actor Machines
type ScrollMachineEvent = { type: "scroll.requested" };

const scrollMachine = setup({
  types: {
    context: {} as { lastScrollTime: number },
    events: {} as ScrollMachineEvent,
    emitted: {} as { type: "scroll.sync.needed" }
  },
  actions: {
    notifyParentOfScrollChange: sendTo(
      ({ system }) => {
        return system.get("root");
      },
      ({ context, event }) => {
        return {
          type: "scroll.sync.needed",
        };
      },
    ),
  },
}).createMachine({
  id: "scroll",
  initial: "idle",
  context: {
    lastScrollTime: 0
  },
  states: {
    idle: {
      entry: [
        {
          type: "notifyParentOfScrollChange",
          params: { msg: "notifying parent of scroll change" },
        },
      ],
      on: { "scroll.requested": "scrolling" },
    },
    scrolling: {
      after: {
        15000: "idle",
      },
      on: {
        "scroll.requested": {
          target: "scrolling",
          internal: true,
          reenter: true,
          actions: assign({
            lastScrollTime: () => Date.now()
          })
        },
      },
    },
  },
});

type LyricMachineEvent =
  | {
      type: "lyric.update";
      index: number;
      outlineIndex: number;
    }
  | { type: "data.loading.started" }
  | { type: "data.loaded"; duration: number }
  | { type: "audio.play" };

type LyricMachineContext = {
  currentLyricIndex: number;
  currentOutlineIndex: number;
};

const lyricMachine = setup({
  types: {
    context: {} as LyricMachineContext,
    events: {} as LyricMachineEvent,
    emitted: {} as { type: "lyric.updated"; index: number; outlineIndex: number },
  },
  actions: {
    updateLyricIndices: ({ context, event }) => {
      if (event.type === "lyric.update") {
        context.currentLyricIndex = event.index;
        context.currentOutlineIndex = event.outlineIndex;
      }
    },
    emitLyricUpdate: sendTo(
      ({ system }) => {
        return system.get("root");
      },
      ({ context, event }) => {
        return {
          type: "lyric.updated",
          index: context.currentLyricIndex,
          outlineIndex: context.currentOutlineIndex,
        };
      },
    ),
  },
}).createMachine({
  id: "lyricTracker",
  context: {
    currentLyricIndex: 0,
    currentOutlineIndex: 0,
  },
  initial: "tracking",
  states: {
    tracking: {
      on: {
        "lyric.update": {
          actions: ["updateLyricIndices", "emitLyricUpdate"],
        },
      },
    },
  },
});

export const audioPlayerMachine = setup({
  types: {
    context: {} as AudioPlayerContext,
    events: {} as AudioPlayerEvent,
  },
  actions: {
    setDuration: assign({
      duration: ({ context, event }) => {
        if (event.type === "data.loaded") {
          return event.duration;
        }
        return context.duration;
      },
    }),
    handleDialogueClick: assign({
      currentDialogueId: ({ context, event }) => {
        if (event.type === "dialogue.click") {
          return event.dialogueId;
        }
        return context.currentDialogueId;
      }
    }),
    clearDialogue: assign({
      currentDialogueId: () => null
    }),
    showDataLoadedToast: ({ context, event }) => {
      console.log("Data loaded toast", context, event);
    },
    showStartPlayingToast: ({ context, event }) => {
      console.log("Start playing toast", context, event);
    },
    loadInitialIndices: assign({
      currentLyricIndex: ({ context, event }) => {
        const newLyricIndex = findLyricIndex(
          context.lyrics,
          context.currentPosition || 0,
        );
        return newLyricIndex;
      },
      currentOutlineIndex: ({ context, event }) => {
        const newLyricIndex = findLyricIndex(
          context.lyrics,
          context.currentPosition || 0,
        );
        const newOutlineIndex = findOutlineIndex(context.lyrics, newLyricIndex);
        return newOutlineIndex;
      },
    }),
    showForwardToast: ({ context, event }) => {
      console.log("Show forward toast", context, event);
    },
    showBackwardToast: ({ context, event }) => {
      console.log("Show backward toast", context, event);
    },
    hideToast: ({ context, event }) => {
      console.log("Hide toast", context, event);
    },
    showSeekingToast: ({ context, event }) => {
      console.log("Show seeking toast", context, event);
    },
    hideSeekingToast: ({ context, event }) => {
      console.log("Hide seeking toast", context, event);
    },
    scrollToPosition: ({ context, event }) => {
      if (context.scrollEffect) {
        context.scrollEffect();
      }
    },
    updateSeekPosition: assign({
      seekPosition: ({ context, event }) => {
        return event.type === "audio.seek" ? event.position : context.seekPosition;
      },
    }),
    updateCurrentPosition: assign({
      currentPosition: ({ context, event }) => {
        return context.seekPosition != null ? context.seekPosition : null;
      },
      seekPosition: ({ context, event }) => {
        return context.seekPosition != null ? null : context.seekPosition;
      },
    }),
    updateTime: assign({
      currentPosition: ({ context, event }) => {
        if (event.type === "audio.time.update") {
          return event.currentTime;
        }
        return context.currentPosition;
      },
    }),
    updateVolume: assign({
      volume: ({ context, event }) => {
        if (event.type === "volume.change") {
          return event.volume;
        }
        return context.volume;
      },
    }),
    scrollToCurrentLyric: ({ context, event }) => {
      // Logic to scroll to the current lyric
      console.log("Scrolling to lyric index:", context.currentLyricIndex);
    },
    updateTimeAndLyric: sendTo(
      ({ context }) => context.lyricActor,
      ({ context, event }) => {
        const newLyricIndex = findLyricIndex(
          context.lyrics,
          context.currentPosition,
        );
        const newOutlineIndex = findOutlineIndex(context.lyrics, newLyricIndex);

        return {
          type: "lyric.update",
          index: newLyricIndex,
          outlineIndex: newOutlineIndex,
        };
      },
    ),
    handleLyricClick: sendTo(
      ({ context }) => context.lyricActor,
      ({ context, event }) => {
        if (event?.type === "lyric.clicked") {
          return {
            type: "lyric.update",
            index: event?.index,
            outlineIndex: findOutlineIndex(context.lyrics, event?.index),
          };
        }
        return { type: "noop" };
      },
    ),
    triggerManualScroll: sendTo(
      ({ context }) => context.scrollActor,
      ({ context, event }) => {
        return { type: "scroll.requested" };
      },
    ),
    updateLyricIndices: assign({
      currentLyricIndex: ({ context, event }) => {
        return event.type === "lyric.updated"
          ? event.index
          : context.currentLyricIndex;
      },
      currentOutlineIndex: ({ context, event }) => {
        return event.type === "lyric.updated"
          ? event.outlineIndex
          : context.currentOutlineIndex;
      },
    }),
    handleScrollSync: ({ context, event }) => {
      console.log(`Handling scroll synchronization: ${event}`);
      const scrollState = context.scrollActor?.getSnapshot();
      if (scrollState?.matches("scrolling")) {
        // do nothing
        console.log(`scrollState: ${scrollState}`);
      } else {
        // scrollToPosition logic
      }
    },
  },
}).createMachine({
  id: "audioPlayer",
  context: {
    currentPosition: 0,
    seekPosition: null,
    duration: 0,
    currentLyricIndex: 0,
    currentOutlineIndex: 0,
    volume: 1,
    isManualScrolling: false,
    scrollTimeout: null,
    lyrics: lyricsPavan,
    outline: outline,
    dialogues: dialogues,
    currentDialogueId: null,
    scrollActor: null,
    lyricActor: null,
    scrollEffect: null,
  },
  initial: "initializing",
  states: {
    initializing: {
      on: {
        "data.loading.started": "loading",
        "data.loaded": {
          target: "ready",
          actions: [
            assign({
              scrollActor: ({ spawn }) => spawn(scrollMachine),
              lyricActor: ({ spawn }) => spawn(lyricMachine),
            }),
            { type: "setDuration" },
          ],
        },
      },
    },
    loading: {
      // Loading state for when data is being loaded
    },
    ready: {
      entry: [
        { type: "showDataLoadedToast", params: { msg: "Data loaded" } },
        { type: "showStartPlayingToast", params: { msg: "Start playing" } },
        { type: "loadInitialIndices", params: { msg: "Load Initial Indices" } },
      ],
      after: {
        100: "playing", // Automatic transition after data is loaded
      },
      on: {
        "audio.play": "playing",
      },
    },
    playing: {
      type: "parallel",
      states: {
        dialogueManager: {
          id: "dialogueManager",
          initial: "idle",
          states: {
            idle: {
              on: {
                "dialogue.click": {
                  target: "showingDialogue",
                  actions: ["handleDialogueClick"]
                }
              }
            },
            showingDialogue: {
              on: {
                "dialogue.close": {
                  target: "idle",
                  actions: ["clearDialogue"]
                },
                "dialogue.click": {
                  target: "showingDialogue",
                  actions: ["handleDialogueClick"]
                }
              }
            }
          }
        },
        playback: {
          initial: "paused",
          states: {
            playing: {
              on: {
                "audio.pause": "paused",
                "audio.forward": {
                  actions: {
                    type: "showForwardToast",
                    params: { msg: "Forwarding" },
                  },
                  target: "#toastManager.showingForward",
                },
                "audio.backward": {
                  actions: {
                    type: "showBackwardToast",
                    params: { msg: "Backwarding" },
                  },
                  target: "#toastManager.showingBackward",
                },
                "audio.seek": {
                  target: "#seekManager.seeking",
                },
                "audio.time.update": {
                  actions: ["updateTime", "updateTimeAndLyric"],
                },
                "volume.change": {
                  actions: "updateVolume",
                },
                "scroll.sync.needed": {
                  actions: ["handleScrollSync", "scrollToPosition"],
                },
              },
            },
            paused: {
              on: {
                "audio.resume": "playing",
                "audio.forward": {
                  actions: {
                    type: "showForwardToast",
                    params: { msg: "Forwarding" },
                  },
                  target: "#toastManager.showingForward",
                },
                "audio.backward": {
                  actions: {
                    type: "showBackwardToast",
                    params: { msg: "Backwarding" },
                  },
                  target: "#toastManager.showingBackward",
                },
                "audio.seek": {
                  target: "#seekManager.seeking",
                },
                "audio.time.update": {
                  actions: ["updateTime", "updateTimeAndLyric"],
                },
                "volume.change": {
                  actions: "updateVolume",
                },
                "scroll.sync.needed": {
                  actions: ["handleScrollSync", "scrollToPosition"],
                },
              },
            },
          },
        },
        toastManager: {
          id: "toastManager",
          initial: "hidden",
          states: {
            hidden: {
              on: {
                "audio.forward": "showingForward",
                "audio.backward": "showingBackward",
              },
            },
            showingForward: {
              entry: "showForwardToast",
              after: {
                500: "hidden",
              },
              on: {
                "audio.forward": {
                  actions: "showForwardToast",
                  target: "showingForward",
                },
              },
              exit: "hideToast",
            },
            showingBackward: {
              entry: "showBackwardToast",
              after: {
                500: "hidden",
              },
              on: {
                "audio.backward": {
                  actions: "showBackwardToast",
                  target: "showingBackward",
                },
              },
              exit: "hideToast",
            },
          },
        },
        seekManager: {
          id: "seekManager",
          initial: "idle",
          states: {
            idle: {
              on: {
                "audio.seek": "seeking",
              },
            },
            seeking: {
              entry: [
                {
                  type: "updateSeekPosition",
                  params: { msg: "seeking to a position" },
                },
                {
                  type: "showSeekingToast",
                  params: { msg: "Seeking in progress" },
                },
              ],
              on: {
                "audio.seek.complete": {
                  actions: [
                    { type: "updateCurrentPosition", params: {} },
                    { type: "hideSeekingToast", params: {} },
                    { type: "scrollToPosition", params: {} },
                  ],
                  target: "idle",
                },
                "audio.seek.failed": {
                  actions: { type: "hideSeekingToast", params: {} },
                  target: "idle",
                },
              },
            },
          },
        },
        lyricInteraction: {
          initial: "active",
          states: {
            active: {
              on: {
                "lyric.clicked": {
                  actions: [
                    "updateSeekPosition",
                    "handleLyricClick",
                    "scrollToCurrentLyric",
                  ],
                },
                "scroll.manual": {
                  actions: "triggerManualScroll",
                },
                "lyric.updated": {
                  actions: ["updateLyricIndices", "scrollToPosition"],
                },
              },
            },
          },
        },
      },
    },
  },
});

// Helper functions
function findLyricIndex(lyrics: Lyric[], currentTime: number): number {
  return lyrics.findIndex((lyric) => lyric.time > currentTime) - 1;
}

function findOutlineIndex(lyrics: Lyric[], lyricIndex: number): number {
  return lyrics[lyricIndex]?.outlineIndex || 0;
}
