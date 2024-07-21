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

const updateDuration = assign<AudioPlayerContext, AudioPlayerEvent>({
  duration: (context) => (event.type === "LOADED" ? event.duration : 0),
});


const updateCurrentTime = assign<AudioPlayerContext, AudioPlayerEvent>({
  currentTime: (context) => (event.type === "TIME_UPDATE" ? event.currentTime : 0),
});

const seekToTime = assign<AudioPlayerContext, AudioPlayerEvent>({
  currentTime: (_, event) => (event.type === "SEEK" ? event.time : 0),
});

const updateDuration: AssignAction<AudioPlayerContext, AudioPlayerEvent> = assign(
  ({ event }) => {
    if (event.type === "LOADED") {
      return { duration: event.duration };
    }
    return {};
  }
);


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
          actions: assign(({ context, event }) => {
            return {
              duration: (event.type === "LOADED" ? event.duration : 0)
            };
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