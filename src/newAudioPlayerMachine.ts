import { setup } from "xstate";

type AudioPlayerEvent =
  | { type: "data_loading_started" }
  | { type: "data_loaded" }
  | { type: "play_audio" }
  | { type: "play_after_pause" }
  | { type: "pause" }
  | { type: "forward" };

type AudioPlayerContext = {
  // Define your context properties here, for example:
  // currentTrack: string;
  // volume: number;
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
      if (event.type === "forward") {
        console.log("Starting audio player", context, event);
      }
      console.log("Start playing toast", context, event);
    },
    showForwardingToast: ({ context, event }) => {
      console.log("Show forwarding toast", context, event);
    },
    hideForwardingToast: ({ context, event }) => {
      console.log("Hide forwarding toast", context, event);
    },
  },
}).createMachine({
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
        'audio playing states': {
          initial: "playingAudio",
          states: {
            playingAudio: {
              on: {
                pause: "pausedAudio",
                forward: {
                  actions: "showForwardingToast",
                  target: "#audioPlayerToast.showingToast",
                },
              },
            },
            pausedAudio: {
              on: {
                play_after_pause: "playingAudio",
                forward: {
                  actions: "showForwardingToast",
                  target: "#audioPlayerToast.showingToast",
                },
              },
            },
          },
        },
        'show play-pause toast': {
          id: "audioPlayerToast",
          initial: "hidden",
          states: {
            hidden: {
              on: {
                forward: "showingToast",
              },
            },
            showingToast: {
              entry: "showForwardingToast",
              after: {
                500: "hidden",
              },
              on: {
                forward: {
                  actions: "showForwardingToast",
                  internal: false,
                  target: "showingToast",
                },
              },
              exit: "hideForwardingToast",
            },
          },
        },
      },
    },
  },
});
