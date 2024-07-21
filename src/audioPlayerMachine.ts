import { createMachine, assign } from "xstate";

export interface AudioPlayerContext {
  duration: number;
  currentTime: number;
}

export type AudioPlayerEvent =
  | { type: "LOADED"; duration: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TIME_UPDATE"; currentTime: number }
  | { type: "SEEK"; time: number };

const updateDuration = assign(({ event }) => {
  if (event.type !== "LOADED") return {};
  return { duration: event.duration };
});

const updateCurrentTime = assign(({ event }) => {
  if (event.type !== "TIME_UPDATE") return {};
  return { currentTime: event.currentTime };
});

const seekToTime = assign(({ event }) => {
  if (event.type !== "SEEK") return {};
  return { currentTime: event.time };
});

export const audioPlayerMachine = createMachine({
  id: "audioPlayer",
  types: {} as {
    context: AudioPlayerContext;
    events: AudioPlayerEvent;
  },
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
          actions: updateDuration,
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
          actions: updateCurrentTime,
        },
        SEEK: {
          actions: [seekToTime, updateCurrentTime],
        },
      },
    },
  },
});
