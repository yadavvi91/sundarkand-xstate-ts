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

const feedbackMachine = setup({
  actions: {
    updateFeedback: assign({
      feedback: ({ event }) => {
        return event.value;
      }
    })
  },
  guards: {
    feedbackValid: ({ context }) => {
      return context.feedback.trim().length > 0;
    }
  }
}).createMachine({
  context: {
    feedback: ''
  },
  inital: 'prompt',
  states: {
    prompt: {
      on: {
        'feedback.good': {
          target: 'thanks'
        },
        'feedback.bad': {
          target: 'form'
        },
      }
    },
    form: {
      on: {
        'feedback.update': {
          actions: assign(({ event }) => {
            return event.value
          })
        }
      }
    }
  }
});

export const audioPlayerMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuECWB7ACgG2QE8wAnAOjy2UwDsoBiAGQHkBBAEQFF2BtABgC6iUAAcssDABdsNYSAAeiAIwAOAOxkAbAFZNAJgAsATgDM27QYPa+JgDQhCibSoNkTRvSZV6jfTy4BfAPs0TFwCYnJKagw6egBlTgAVAH1GAE0AJQBJAGF4-iEkEDEJaSxZYsUEAz17RwRrTTIDJWczH209TS8gkPRsfCJSMhIwakJ6JOyAWU4UgFUcdlYkzkK5UqkZOWra5qMlNSNNIwNNAxVtVU16xHcNFRNDIzPjtSVLAz6QUMGIkZjCYJTicADSG2KW3KlVAe20JjIZ0+nx6n0OagMdwQekxLW6enMah6KlePR+f3Cw3IQIgkwAasxGAs5ilcgAJVgAOQA4utBJtxNsKrtEK0+FolM91AZnmorudsUcNEY1CYlHoVEobJpVJ8KQMqZFRuM6VNmDyeYx5jMFmtIaIhTDRTU9HoyLi1cYLK95SYsQ5EFqyF0+GG+JYTFHNDGDWEhsbaYQyCIIrEGDhWAtEg6Sk6dlUxRYyEdVJi+NcDGpMbdA41NCoyPLdLj2lHunH-tSTRMU2hYJB6DhGKx0rnoQW4UXXKWZRXPtXFXXdUYPVddWoK5o+NujEFgiAaFgIHA5JSE6RBWVJwpEABaWsNO-aJEqcPvj-fA-ngFRKi0KAr2FWFbwQXUyArK5Dm8f0bBMNRsW3R4GxOTpzCsExOyNQFTQaR1rxFQscVMFpiV0GwjG0VUwwQutLiUNcWw+dxXior9+njX8ezpFM0zoIDnSI3RmmlDUXAsawlCMbFtGrNwUJjc4nmrLCLxpXC+1QAcIAEm9qn9Biqx0bd3Cozc+FohpZNcFQUOuK5nAuPR9wCIA */
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

export type AudioPlayerMachine = typeof audioPlayerMachine;
export type AudioPlayerActor = ActorRefFrom<AudioPlayerMachine>;
export type AudioPlayerState = StateFrom<AudioPlayerMachine>;