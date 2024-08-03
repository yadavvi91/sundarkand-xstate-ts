import { createMachine, assign, ActorRefFrom, StateFrom, setup } from "xstate";

export interface Lyric {
  time: number;
  text: string;
}

export interface AudioPlayerContext {
  duration: number;
  currentTime: number;
  volume: number;
  isMuted: boolean;
  lyrics: Lyric[];
  currentLyricIndex: number;
}

export type AudioPlayerEvent =
  | { type: "LOADED"; duration: number }
  | { type: "PLAY" }
  | { type: "PAUSE" }
  | { type: "TIME_UPDATE"; currentTime: number }
  | { type: "SEEK"; time: number }
  | { type: "VOLUME_CHANGE"; volume: number }
  | { type: "TOGGLE_MUTE" }
  | { type: "SET_LYRICS"; lyrics: Lyric[] };

const updateDuration = assign(({ event }) => {
  return { duration: event.type === "LOADED" ? event.duration : undefined };
});

const updateCurrentTime = assign(({ context, event }) => {
  if (event.type !== "TIME_UPDATE") return {};

  const newCurrentTime = event.currentTime;
  const newLyricIndex = context.lyrics.findIndex(
    (lyric: Lyric, index: number) =>
      lyric.time <= newCurrentTime &&
      (index === context.lyrics.length - 1 || context.lyrics[index + 1].time > newCurrentTime)
  );

  return {
    currentTime: newCurrentTime,
    currentLyricIndex: newLyricIndex !== -1 ? newLyricIndex : context.currentLyricIndex,
  };
});

const seekToTime = assign(({ context, event }) => {
  if (event.type !== "SEEK") return {};

  const newTime = event.time;
  const newLyricIndex = context.lyrics.findIndex(
    (lyric: Lyric, index: number) =>
      lyric.time <= newTime &&
      (index === context.lyrics.length - 1 || context.lyrics[index + 1].time > newTime)
  );

  return {
    currentTime: newTime,
    currentLyricIndex: newLyricIndex !== -1 ? newLyricIndex : context.currentLyricIndex,
  };
});

const changeVolume = assign(({ event }) => {
  return { volume: event.type === "VOLUME_CHANGE" ? event.volume : undefined };
});

const toggleMute = assign(({ context }) => {
  return { isMuted: !context.isMuted };
});

const setLyrics = assign(({ event }) => {
  return { lyrics: event.type === "SET_LYRICS" ? event.lyrics : undefined };
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
    lyrics: [],
    currentLyricIndex: -1,
  },
  states: {
    loading: {
      on: {
        LOADED: {
          target: "ready",
          actions: updateDuration,
        },
        SET_LYRICS: {
          actions: setLyrics,
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
