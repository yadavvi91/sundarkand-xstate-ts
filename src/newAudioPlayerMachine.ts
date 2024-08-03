import { createMachine, setup, interpret } from "xstate";

export const audioPlayerMachine = setup({
  actions: {
    showDataLoadedToast: ({ context, event }, params) => {
      console.log(context);
      console.log(event);
      console.log(params);
    },
    showStartPlayingToast: ({ context, event }, params) => {
      console.log(context);
      console.log(event);
      console.log(params);
    },
    showForwardingToast: ({ context, event }) => {
      console.log("Show forwarding toast");
      console.log(context);
      console.log(event);
    },
    hideForwardingToast: ({ context, event }) => {
      console.log("Hide forwarding toast");
      console.log(context);
      console.log(event);
    },
  },
  types: {
    context: {} as {},
    events: {} as
      | { type: "data_loading_started" }
      | { type: "data_loaded" }
      | { type: "play_audio" }
      | { type: "play_after_pause" }
      | { type: "pause" }
      | { type: "forward" },
  },
}).createMachine({
  initial: "noData",
  types: {} as {
    actions:
      | { type: "showDataLoadedToast"; params: { msg: string } }
      | { type: "showStartPlayingToast"; params: { msg: string } }
      | { type: "showForwardingToast" }
      | { type: "hideForwardingToast" };
  },
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
        audio: {
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
        toast: {
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
