import { createMachine, assign } from 'xstate';

interface AudioPlayerContext {
  duration: number;
  currentTime: number;
}

type AudioPlayerEvent = 
  | { type: 'LOADED'; duration: number }
  | { type: 'PLAY' }
  | { type: 'PAUSE' }
  | { type: 'TIME_UPDATE'; currentTime: number };

export const audioPlayerMachine = createMachine({
  id: 'audioPlayer',
  initial: 'loading',
  context: {
    duration: 0,
    currentTime: 0,
  },
  states: {
    loading: {
      on: {
        LOADED: {
          target: 'ready',
          actions: assign({
            duration: (_, event) => event.duration,
          }),
        },
      },
    },
    ready: {
      initial: 'paused',
      states: {
        playing: {
          on: { PAUSE: 'paused' },
        },
        paused: {
          on: { PLAY: 'playing' },
        },
      },
      on: {
        TIME_UPDATE: {
          actions: assign({
            currentTime: (_, event) => event.currentTime,
          }),
        },
      },
    },
  },
});