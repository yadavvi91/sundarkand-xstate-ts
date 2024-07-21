import { createMachine, assign, ActorRefFrom, StateFrom } from "xstate";

export interface AudioPlayerContext {
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
}

export type AudioPlayerEvent =
  | { type: "LOADED"; duration: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TIME_UPDATE"; currentTime: number }
  | { type: "SEEK"; time: number }
  | { type: "VOLUME_CHANGE"; volume: number }
  | { type: "TOGGLE_MUTE" };

const updateDuration = assign(({ event }) => {
  return { duration: event.type === "LOADED" ? event.duration : undefined };
});

const updateCurrentTime = assign(({ event }) => {
  return { currentTime: event.type === "TIME_UPDATE" ? event.currentTime : undefined };
});

const seekToTime = assign(({ event }) => {
  return { currentTime: event.type === "SEEK" ? event.time : undefined };
});

const changeVolume = assign(({ event }) => {
  return { volume: event.type === "VOLUME_CHANGE" ? event.volume : undefined };
});

const toggleMute = assign(({ context }) => {
  return { isMuted: !context.isMuted };
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
    volume: 1,
    isMuted: false,
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
        VOLUME_CHANGE: {
          actions: changeVolume,
        },
        TOGGLE_MUTE: {
          actions: toggleMute,
        },
      },
    },
  },
});

export type AudioPlayerMachine = typeof audioPlayerMachine;
export type AudioPlayerActor = ActorRefFrom<AudioPlayerMachine>;
export type AudioPlayerState = StateFrom<AudioPlayerMachine>;