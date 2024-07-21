import { createMachine, assign, ActorRefFrom, StateFrom } from "xstate";

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

const updateDuration = assign(({ context, event } ) => {
  return { duration: event.type === "LOADED" ? event.duration : undefined };
});

const updateCurrentTime = assign(({ context, event } ) => {
  return { currentTime: event.type === "TIME_UPDATE" ? event.currentTime : 0 }
});

const seekToTime = assign(({ context, event } ) => {
  return { currentTime: event.type === "SEEK" ? event.time : 0 }
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
          actions: updateDuration
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

export type AudioPlayerMachine = typeof audioPlayerMachine;
export type AudioPlayerActor = ActorRefFrom<AudioPlayerMachine>;
export type AudioPlayerState = StateFrom<AudioPlayerMachine>;