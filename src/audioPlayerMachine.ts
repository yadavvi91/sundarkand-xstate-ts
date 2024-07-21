import { createMachine, assign } from "xstate";

interface AudioPlayerContext {
  duration: number;
  currentTime: number;
}

type AudioPlayerEvent =
  | { type: "LOADED"; duration: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TIME_UPDATE"; currentTime: number };

export const audioPlayerMachine = createMachine({
  id: "audioPlayer",
  initial: "loading",
  context: {
    duration: 0,
    currentTime: 0,
  },
  states: {
    loading: {
      on: {
        LOADED: {
          target: "ready",
          actions: assign((context) => {
            const { event } = context;
            if (event.type === "LOADED") {
              return { duration: event.duration };
            }
            return {};
          }),
        },
      },
    },
    ready: {
      initial: "paused",
      states: {
        playing: {
          on: { PAUSE: "paused" },
        },
        paused: {
          on: { PLAY: "playing" },
        },
      },
      on: {
        TIME_UPDATE: {
          actions: assign((context) => {
            const { event } = context;
            if (event.type === "TIME_UPDATE") {
              return { currentTime: event.currentTime };
            }
            return {};
          }),
        },
      },
    },
  },
});
