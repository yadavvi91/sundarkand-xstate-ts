import { createMachine, setup } from "xstate";

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
  | { type: "seek_failed" };

type AudioPlayerContext = {
  currentPosition: number;
  seekPosition: number | null;
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
    updateSeekPosition: ({ context, event }) => {
      if (event.type === "seek") {
        context.seekPosition = event.position;
      }
    },
    updateCurrentPosition: ({ context }) => {
      if (context.seekPosition !== null) {
        context.currentPosition = context.seekPosition;
        context.seekPosition = null;
      }
    },
  },
}).createMachine({
  context: {
    currentPosition: 0,
    seekPosition: null,
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
                  actions: "showForwardingToast",
                  target: "#audioPlayerToast.showingForwardToast",
                },
                backward: {
                  actions: "showBackwardingToast",
                  target: "#audioPlayerToast.showingBackwardToast",
                },
                seek: {
                  actions: ["updateSeekPosition", "showSeekingToast"],
                  target: "#audioPlayerSeek.seeking",
                },
              },
            },
            pausedAudio: {
              on: {
                play_after_pause: "playingAudio",
                forward: {
                  actions: "showForwardingToast",
                  target: "#audioPlayerToast.showingForwardToast",
                },
                backward: {
                  actions: "showBackwardingToast",
                  target: "#audioPlayerToast.showingBackwardToast",
                },
                seek: {
                  actions: ["updateSeekPosition", "showSeekingToast"],
                  target: "#audioPlayerSeek.seeking",
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
              entry: "showSeekingToast",
              on: {
                seek_complete: {
                  actions: ["updateCurrentPosition", "hideSeekingToast"],
                  target: "idle",
                },
                seek_failed: {
                  actions: "hideSeekingToast",
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
