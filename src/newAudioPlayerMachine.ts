import { setup } from "xstate";

type AudioPlayerEvent =
  | { type: "data_loading_started" }
  | { type: "data_loaded" }
  | { type: "play_audio" }
  | { type: "play_after_pause" }
  | { type: "pause" }
  | { type: "forward" }
  | { type: "backward" }
  | { type: "seek"; position: number }
  | { type: "seek_complete" }
  | { type: "seek_failed" }
  | { type: "time_update"; currentTime: number }
  | { type: "click_lyric"; index: number }
  | { type: "manual_scroll" }
  | { type: "change_volume"; volume: number };

export interface Lyric {
  time: number;
  type: "chaupai" | "samput" | "doha" | "sortha" | "chhand";
  text: string;
  outlineIndex: number;
  footnoteIds: number[];
}

type AudioPlayerContext = {
  currentPosition: number;
  seekPosition: number | null;
  duration: number;
  currentLyricIndex: number;
  currentOutlineIndex: number;
  volume: number;
  isManualScrolling: boolean;
  scrollTimeout: number | null;
  lyrics: Lyric[];
};

export const audioPlayerMachine = setup({
  types: {} as {
    context: AudioPlayerContext;
    events: AudioPlayerEvent;
  },
  actions: {
    showDataLoadedToast: ({ context, event }) => {
      console.log("Data loaded toast", context, event);
    },
    showStartPlayingToast: ({ context, event }) => {
      console.log("Start playing toast", context, event);
    },
    showForwardingToast: ({ context, event }) => {
      console.log("Show forwarding toast", context, event);
    },
    showBackwardingToast: ({ context, event }) => {
      console.log("Show backwarding toast", context, event);
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
    updateSeekPosition: ({ context, event }, params) => {
      if (event.type === "seek") {
        context.seekPosition = event.position;
      }
    },
    updateCurrentPosition: ({ context, event }, params) => {
      if (context.seekPosition !== null) {
        context.currentPosition = context.seekPosition;
        context.seekPosition = null;
      }
    },
    updateTime: ({ context, event }, params) => {
      if (event.type === "time_update") {
        context.currentPosition = event.currentTime;
      }
    },
    updateLyricIndex: ({ context, event }, params) => {
      // Logic to find the correct lyric index based on currentPosition
      // This is a placeholder and should be implemented based on your lyrics data structure
      const newLyricIndex = findLyricIndex(
        context.lyrics,
        context.currentPosition,
        context.duration,
      );
      context.currentLyricIndex = newLyricIndex;

      // Logic to find the correct outline index based on currentLyricIndex
      // This is a placeholder and should be implemented based on your outline data structure
      context.currentOutlineIndex = findOutlineIndex(
        context.lyrics,
        newLyricIndex,
      );
    },
    scrollToCurrentLyric: ({ context, event }, params) => {
      // Logic to scroll to the current lyric
      console.log("Scrolling to lyric index:", context.currentLyricIndex);
    },
    setManualScrolling: ({ context, event }, params) => {
      context.isManualScrolling = true;
    },
    resetScrollTimeout: ({ context, event }, params) => {
      if (context.scrollTimeout) {
        clearTimeout(context.scrollTimeout);
      }
      context.scrollTimeout = setTimeout(() => {
        context.isManualScrolling = false;
      }, 15000) as unknown as number;
    },
    updateVolume: ({ context, event }, params) => {
      if (event.type === "change_volume") {
        context.volume = event.volume;
      }
    },
  },
}).createMachine({
  context: {
    currentPosition: 0,
    seekPosition: null,
    duration: 0,
    currentLyricIndex: 0,
    currentOutlineIndex: 0,
    volume: 1,
    isManualScrolling: false,
    scrollTimeout: null,
    lyrics: [],
  },
  initial: "noData",
  states: {
    noData: {
      on: {
        data_loading_started: "dataLoading",
      },
    },
    dataLoading: {
      on: {
        data_loaded: "dataCompletelyLoaded",
      },
    },
    dataCompletelyLoaded: {
      entry: [
        { type: "showDataLoadedToast", params: { msg: "Data loaded" } },
        { type: "showStartPlayingToast", params: { msg: "Start playing" } },
      ],
      on: {
        play_audio: "playingSundarkand",
      },
    },
    playingSundarkand: {
      type: "parallel",
      states: {
        "audio playing states": {
          initial: "playingAudio",
          states: {
            playingAudio: {
              on: {
                pause: "pausedAudio",
                forward: {
                  actions: {
                    type: "showForwardingToast",
                    params: { msg: "Forwarding" },
                  },
                  target: "#audioPlayerToast.showingForwardToast",
                },
                backward: {
                  actions: {
                    type: "showBackwardingToast",
                    params: { msg: "Backwarding" },
                  },
                  target: "#audioPlayerToast.showingBackwardToast",
                },
                seek: {
                  target: "#audioPlayerSeek.seeking",
                },
                time_update: {
                  actions: [
                    "updateTime",
                    "updateLyricIndex",
                    "scrollToCurrentLyric",
                  ],
                },
                click_lyric: {
                  actions: [
                    "updateSeekPosition",
                    "updateLyricIndex",
                    "scrollToCurrentLyric",
                  ],
                },
                manual_scroll: {
                  actions: ["setManualScrolling", "resetScrollTimeout"],
                },
                change_volume: {
                  actions: "updateVolume",
                },
              },
            },
            pausedAudio: {
              on: {
                play_after_pause: "playingAudio",
                forward: {
                  actions: {
                    type: "showForwardingToast",
                    params: { msg: "Forwarding" },
                  },
                  target: "#audioPlayerToast.showingForwardToast",
                },
                backward: {
                  actions: {
                    type: "showBackwardingToast",
                    params: { msg: "Backwarding" },
                  },
                  target: "#audioPlayerToast.showingBackwardToast",
                },
                seek: {
                  target: "#audioPlayerSeek.seeking",
                },
                click_lyric: {
                  actions: [
                    "updateSeekPosition",
                    "updateLyricIndex",
                    "scrollToCurrentLyric",
                  ],
                },
                change_volume: {
                  actions: "updateVolume",
                },
              },
            },
          },
        },
        "show play-pause toast": {
          id: "audioPlayerToast",
          initial: "hidden",
          states: {
            hidden: {
              on: {
                forward: "showingForwardToast",
                backward: "showingBackwardToast",
              },
            },
            showingForwardToast: {
              entry: "showForwardingToast",
              after: {
                500: "hidden",
              },
              on: {
                forward: {
                  actions: "showForwardingToast",
                  target: "showingForwardToast",
                },
              },
              exit: "hideToast",
            },
            showingBackwardToast: {
              entry: "showBackwardingToast",
              after: {
                500: "hidden",
              },
              on: {
                backward: {
                  actions: "showBackwardingToast",
                  target: "showingBackwardToast",
                },
              },
              exit: "hideToast",
            },
          },
        },
        "show seek toast": {
          id: "audioPlayerSeek",
          initial: "idle",
          states: {
            idle: {
              on: {
                seek: "seeking",
              },
            },
            seeking: {
              entry: [
                { type: "updateSeekPosition", params: {} },
                {
                  type: "showSeekingToast",
                  params: { msg: "Seeking in progress" },
                },
              ],
              on: {
                seek_complete: {
                  actions: [
                    { type: "updateCurrentPosition", params: {} },
                    { type: "hideSeekingToast", params: {} },
                  ],
                  target: "idle",
                },
                seek_failed: {
                  actions: { type: "hideSeekingToast", params: {} },
                  target: "idle",
                },
              },
            },
          },
        },
      },
    },
  },
});

function findLyricIndex(
  lyrics: Lyric[],
  currentPosition: number,
  duration: number,
): number {
  // Implementation to find the correct lyric index based on currentTime
  const newTime = currentPosition * duration;
  return lyrics.findIndex((lyric) => lyric.time > newTime) - 1;
}

function findOutlineIndex(lyrics: Lyric[], newLyricIndex: number): number {
  // Implementation to find the correct outline index based on lyricIndex
  return lyrics[newLyricIndex]?.outlineIndex || 0;
}
