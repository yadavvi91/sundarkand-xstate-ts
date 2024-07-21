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

const updateDuration = assign<AudioPlayerContext, AudioPlayerEvent>({
  duration: (_, event) => (event.type === "LOADED" ? event.duration : 0),
});

const updateCurrentTime = assign<AudioPlayerContext, AudioPlayerEvent>({
  currentTime: (_, event) => (event.type === "TIME_UPDATE" ? event.currentTime : 0),
});

const seekToTime = assign<AudioPlayerContext, AudioPlayerEvent>({
  currentTime: (_, event) => (event.type === "SEEK" ? event.time : 0),
});
  
export const audioPlayerMachine = createMachine(
  {
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
            actions: "updateDuration",
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
            actions: "updateCurrentTime",
          },
          SEEK: {
            actions: ["seekToTime", "updateCurrentTime"],
          },
        },
      },
    },
  },
  {
    actions: {
      updateDuration,
      updateCurrentTime,
      seekToTime,
    },
  }
);
