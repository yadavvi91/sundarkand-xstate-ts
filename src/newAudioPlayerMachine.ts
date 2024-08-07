import { createMachine, assign, ActorRefFrom, setup } from "xstate";
import { lyricsVikesh, outline } from "./utils/lyrics.ts";
import { send } from "vite";

type AudioPlayerEvent =
  | { type: "data_loading_started" }
  | { type: "data_loaded"; duration: number }
  | { type: "play_audio" }
  | { type: "play_after_pause" }
  | { type: "pause" }
  | { type: "forward" }
  | { type: "backward" }
  | { type: "seek"; position: number }
  | { type: "seek_complete" }
  | { type: "seek_failed" }
  | { type: "time_update"; currentTime: number }
  | { type: "click_lyric"; index: number }
  | { type: "manual_scroll" }
  | { type: "change_volume"; volume: number };

export interface Lyric {
  time: number;
  type: "chaupai" | "samput" | "doha" | "sortha" | "chhand";
  text: string;
  outlineIndex: number;
  footnoteIds: number[];
}

type AudioPlayerContext = {
  currentPosition: number;
  seekPosition: number | null;
  duration: number;
  currentLyricIndex: number;
  currentOutlineIndex: number;
  volume: number;
  isManualScrolling: boolean;
  scrollTimeout: number | null;
  lyrics: Lyric[];
  outline: string[];
  scrollActor: ActorRefFrom<typeof scrollMachine> | null;
  lyricActor: ActorRefFrom<typeof lyricMachine> | null;
};

// Actor Machines
type ScrollMachineEvent = { type: "SCROLL" };

const scrollMachine = setup({
  types: {} as {
    events: ScrollMachineEvent;
  },
}).createMachine({
  id: "scroll",
  initial: "idle",
  states: {
    idle: {
      on: { SCROLL: "scrolling" },
    },
    scrolling: {
      after: {
        15000: "idle",
      },
      on: {
        SCROLL: {
          target: "scrolling",
          internal: true,
        },
      },
    },
  },
});

type LyricMachineEvent = {
  type: "UPDATE";
  index: number;
  outlineIndex: number;
};
type LyricMachineContext = {
  currentLyricIndex: number;
  currentOutlineIndex: number;
};

const lyricMachine = setup({
  types: {} as {
    context: LyricMachineContext;
    events: LyricMachineEvent;
  },
  actions: {
    updateLyricIndices: ({ context, event }) => {
      if (event.type === "UPDATE") {
        context.currentLyricIndex = event.index;
        context.currentOutlineIndex = event.outlineIndex;
      }
    },
  },
}).createMachine({
  id: "lyric",
  context: { currentLyricIndex: 0, currentOutlineIndex: 0 },
  initial: "idle",
  states: {
    idle: {
      on: {
        UPDATE: {
          actions: "updateLyricIndices",
        },
      },
    },
  },
});

export const audioPlayerMachine = setup({
  types: {} as {
    context: AudioPlayerContext;
    events: AudioPlayerEvent;
  },
  actions: {
    // spawnActors: ({ spawn, context, event }, params) => {
    //   context.scrollActor = spawn(scrollMachine);
    //   context.lyricActor = spawn(lyricMachine);
    // },
    setDuration: ({ context, event }) => {
      if (event.type === "data_loaded") {
        context.duration = event.duration;
      }
    },
    showDataLoadedToast: ({ context, event }) => {
      console.log("Data loaded toast", context, event);
    },
    showStartPlayingToast: ({ context, event }) => {
      console.log("Start playing toast", context, event);
    },
    // startPlayingSundarKand: ({ context, event }) => {
    //   console.log("Start Playing Sundarkand", context, event);
    //   // send({ type: "play_audio" });
    // },
    showForwardingToast: ({ context, event }) => {
      console.log("Show forwarding toast", context, event);
    },
    showBackwardingToast: ({ context, event }) => {
      console.log("Show backwarding toast", context, event);
    },
    hideToast: ({ context, event }) => {
      console.log("Hide toast", context, event);
    },
    showSeekingToast: ({ context, event }) => {
      console.log("Show seeking toast", context, event);
    },
    hideSeekingToast: ({ context, event }) => {
      console.log("Hide seeking toast", context, event);
    },
    updateSeekPosition: ({ context, event }) => {
      if (event.type === "seek") {
        context.seekPosition = event.position;
      }
    },
    updateCurrentPosition: ({ context, event }) => {
      if (context.seekPosition !== null) {
        context.currentPosition = context.seekPosition;
        context.seekPosition = null;
      }
    },
    updateTime: ({ context, event }) => {
      if (event.type === "time_update") {
        context.currentPosition = event.currentTime;
      }
    },
    updateVolume: ({ context, event }) => {
      if (event.type === "change_volume") {
        context.volume = event.volume;
      }
    },
    scrollToCurrentLyric: ({ context, event }) => {
      // Logic to scroll to the current lyric
      console.log("Scrolling to lyric index:", context.currentLyricIndex);
    },
    updateTimeAndLyric: ({ context }) => {
      const newLyricIndex = findLyricIndex(
        context.lyrics,
        context.currentPosition,
      );
      const newOutlineIndex = findOutlineIndex(context.lyrics, newLyricIndex);

      context.lyricActor?.send({
        type: "UPDATE",
        index: newLyricIndex,
        outlineIndex: newOutlineIndex,
      });
    },
    handleLyricClick: ({ context, event }) => {
      if (event.type === "click_lyric") {
        const newOutlineIndex = findOutlineIndex(context.lyrics, event.index);
        context.lyricActor?.send({
          type: "UPDATE",
          index: event.index,
          outlineIndex: newOutlineIndex,
        });
      }
    },
    triggerManualScroll: ({ context }) => {
      context.scrollActor?.send({ type: "SCROLL" });
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuECWB7ACgG2QE8wAnAOgDssARZAF2QGIJ7kB9PLZTCqN2BiTqQA2gAYAuolAAHLLAx1sFaSAAeiAIwAWABxkxAdl2aATAFYANCEKITZc2Kfax5zQDYAnGO3aAvn7WaJi4BMTkLAwAMlw8UMysHLGikqpyCkpYKkjqiOam1rYIAMzm7gamxdrGYh7evgFB6Nj4RKRkkcgAwlgAtjJ4YMJ4hDHckIwDRGzB2OJSOemKyqoaCPmFWqYeZKYmpWaepqbumo0gs6Ft5FOEGLwAyqgULCQA1sgvZJcABLf3UB+AnocDI-14AEFmlhJmhYGB5ml5MssqtENVzGRDGJimYrDYtDjytpzMVTNp3OZHIZNGTzpdWuEwWEAU8Xsh3p8IN9oX8WbwgQxhLBmUQAVCQowAGZYEgAdw5EERi2RmWyoDWul0pgMFN0hnxRU8lLImkMnl0Ym81Nppnp0MZ7XBUDZrw+X1+zsFIJFzol2EYACNkABjN4KkhK1IqjIrHKao669z6w2IQyGHWmQylczWoy2+0hR03fku55urk8kJ8sUC4HC0V3SHQxjwsBvZWyVVxjV2bVJlObBAeU4OdzGbEuK2OXSFlphJ2l10c93cz2l70Nv0tpS9MBsVAySII6Nd2Oo+OICyaMjFHzJg1DzS1cruO9ki26FwU-yBC4OhcS1rMt2U5D1eS9etQW3SUQwAC0+GA2AANywPBUD3TsQCWNU0QQE5il2IwcTxIcjjEU101MHwtW-dxfyaItAMbVlyxXSt12AzdoLhSB-RhW4ZilYQSDYGReKwnCe1yBAMSxEiLDI3RMU8UlyUpG06T-BlmOdZcwLXCCNyg31eIgfjpVlCMowWM8UXVGTvB1e9BwJYcxFHN9TE8KpXHzLTGPna4WMeNiDKrbAaybQETLBMyLODMNrMk7sL17BBdETFzHzc3RkyxE5kxcTS7W0gDgr0sLVwirAooBbjTNQeFzJbNsO1PbDUochNnL1HKig8TQbw8icfCcVSxFnMqmIqpcqo4oyuNi8Smr4lt4MQ-dUPQzCOqktKZMpYlSVItyfP0Jxam2Kl-NKwKriZSrQOq2A4KwOUooAWhW+EfjoLgBDIOCMAgCAwAoSz5UVFLz26rZ8qpPrU2HTRzEMMhVLJCkbppAL-xmx65ueytXver6frAP6AboIGQbBiHEvDaG9q6vCzAR8wkafVxPAxtTsZKucHsXYD9Jet6Ptub7eKp5BAdJuUAQAMSsxUABVqch5KWdhtmSW0Axim8dxFLcobtEIg0rtRwXpqCwnRfmr4FfJmX-rlmmFeV1XIw1j3GDUKDvmE0gAApHDEABKRgdNmx3iediXXdW2X5Yl72od96mYfstmTn0RGH2RobnzIEksY026heLEKQIrROyalinU899PeAAIVDJms-9xntdszrdcvYd9dvQvXKNHwsUcMwbaru3haA6KxZJpOm7d6myC9juu+sv2BADoPkBDkhw6caPY4d5ene5F315T920-egFO6S9Xs513Ph-ZgvOaL7mzBl35pXXGd18b2xFtfBOt8k5tRbmQEGgxWxgHbDnXC38XA6lKD5fqWhqjlGomSfUI1TiGHcNXXSRN64wLJnAx+nsUFvABMg9sbAQx9AGEME8A99pw2HHsfQhhtDbAnloE2hFUb0TMCQs05CF41yetQresDGHwLaswtqbApTIAwIMGySIh7pTMFqLEwjNCiOHPkco2IiHYnHKQuR90FFUPYl8EYJAMAhh+PcESoY1QIIgEgkMeBPFvA4IQDxIY0HSTWNeW82Vi5G15noTwk5aL3gYuAxetcV5uIiZ47xFBfEhn8YgsAjBeifFQMgPA-AQwkDQngaJB1YmkkNqdAa75DaUnNOkn8AQ-xUDBvAHIl9SAGK-ulT67ghzTIocFKgtAGATPQelYRQ5+yXTGm4LwPhMljIiKwMYcQVkxMQMUeiZcvzFFwRlZyl1ip1D2fMpknQej9EGMMUYyQICnJaVeHEZALFVEIlsx5uyGjyMofHahfy+E23iVzNyRUsTZjcMpYoxRLRaheZA1i0Cap1TrEKOAcK8KEMRf-XKZIyDjhpPRC5NJhG4qXvipRnFooNVrvxMlw8syER8tgm5xcdCYiJGjT8dF9nlSvmy1xhlqyQRJY1ZqPKYyTMOu4V845jQWOfEbIBFccYFihXHKBSi75hGlg-amvKjHPhvMjEw6MLBOBMDiLFk0ppOOhea+VyjG5WubvQ2moNwZ2pkubXmIqp76vUsazFLKck3wDZLING8PapoznvW16rVmRuEQbcwykcHF3JJiQh8bbY+rNXK8KlqiDWt+iG7eUBX7dwgPvOgEa1g6HJA4EtwruYeSIka6tWTnEwv9S7Ohua7L5rWKk18tQyim06SYmxVb541tlaFAlM7VEhrKT2vBnheaeB0B5NdWgqQ6h1V+VS9jZFJsUdOlR7Y1GMIBCe9y-b3ArpNsXXMBs9DlzsWQ59prd1139e4gpPjSB+Okrw8lgK7xIoGtdBwFyJV9Poi+lx4U4NeIQyQJDWQAmDB-XeTE1QTirqA5zIF2hvC9K-BkgZfggA */
  id: "audioPlayer",
  context: {
    currentPosition: 0,
    seekPosition: null,
    duration: 0,
    currentLyricIndex: 0,
    currentOutlineIndex: 0,
    volume: 1,
    isManualScrolling: false,
    scrollTimeout: null,
    lyrics: lyricsVikesh,
    outline: outline,
    scrollActor: null,
    lyricActor: null,
  },
  initial: "noData",
  states: {
    noData: {
      on: {
        data_loading_started: "dataLoading",
        data_loaded: {
          target: "dataCompletelyLoaded",
          actions: [
            assign({
              scrollActor: ({ spawn }) => spawn(scrollMachine),
              lyricActor: ({ spawn }) => spawn(lyricMachine),
            }),
            { type: "setDuration" },
          ],
        },
      },
    },
    dataLoading: {
      // on: {
      //   data_loaded: {
      //     target: "dataCompletelyLoaded",
      //     actions: { type: "spawnActors" },
      //   },
      // },
    },
    dataCompletelyLoaded: {
      entry: [
        { type: "showDataLoadedToast", params: { msg: "Data loaded" } },
        { type: "showStartPlayingToast", params: { msg: "Start playing" } },
      ],
      // exit: [
      //   {
      //     type: "startPlayingSundarKand",
      //     params: { msg: "Playing Sundarkand" },
      //   },
      // ],
      after: {
        100: "playingSundarkand", // Alternative 1: Automatic transition
      },
      on: {
        play_audio: "playingSundarkand",
      },
    },
    playingSundarkand: {
      type: "parallel",
      states: {
        "audio playing states": {
          initial: "playingAudio",
          states: {
            playingAudio: {
              on: {
                pause: "pausedAudio",
                forward: {
                  actions: {
                    type: "showForwardingToast",
                    params: { msg: "Forwarding" },
                  },
                  target: "#audioPlayerToast.showingForwardToast",
                },
                backward: {
                  actions: {
                    type: "showBackwardingToast",
                    params: { msg: "Backwarding" },
                  },
                  target: "#audioPlayerToast.showingBackwardToast",
                },
                seek: {
                  target: "#audioPlayerSeek.seeking",
                },
                time_update: {
                  actions: ["updateTime", "updateTimeAndLyric"],
                },
                change_volume: {
                  actions: "updateVolume",
                },
              },
            },
            pausedAudio: {
              on: {
                play_after_pause: "playingAudio",
                forward: {
                  actions: {
                    type: "showForwardingToast",
                    params: { msg: "Forwarding" },
                  },
                  target: "#audioPlayerToast.showingForwardToast",
                },
                backward: {
                  actions: {
                    type: "showBackwardingToast",
                    params: { msg: "Backwarding" },
                  },
                  target: "#audioPlayerToast.showingBackwardToast",
                },
                seek: {
                  target: "#audioPlayerSeek.seeking",
                },
                change_volume: {
                  actions: "updateVolume",
                },
              },
            },
          },
        },
        "show play-pause toast": {
          id: "audioPlayerToast",
          initial: "hidden",
          states: {
            hidden: {
              on: {
                forward: "showingForwardToast",
                backward: "showingBackwardToast",
              },
            },
            showingForwardToast: {
              entry: "showForwardingToast",
              after: {
                500: "hidden",
              },
              on: {
                forward: {
                  actions: "showForwardingToast",
                  target: "showingForwardToast",
                },
              },
              exit: "hideToast",
            },
            showingBackwardToast: {
              entry: "showBackwardingToast",
              after: {
                500: "hidden",
              },
              on: {
                backward: {
                  actions: "showBackwardingToast",
                  target: "showingBackwardToast",
                },
              },
              exit: "hideToast",
            },
          },
        },
        "show seek toast": {
          id: "audioPlayerSeek",
          initial: "idle",
          states: {
            idle: {
              on: {
                seek: "seeking",
              },
            },
            seeking: {
              entry: [
                { type: "updateSeekPosition", params: {} },
                {
                  type: "showSeekingToast",
                  params: { msg: "Seeking in progress" },
                },
              ],
              on: {
                seek_complete: {
                  actions: [
                    { type: "updateCurrentPosition", params: {} },
                    { type: "hideSeekingToast", params: {} },
                  ],
                  target: "idle",
                },
                seek_failed: {
                  actions: { type: "hideSeekingToast", params: {} },
                  target: "idle",
                },
              },
            },
          },
        },
        "lyric interaction": {
          initial: "idle",
          states: {
            idle: {
              on: {
                click_lyric: {
                  actions: [
                    "updateSeekPosition",
                    "handleLyricClick",
                    "scrollToCurrentLyric",
                  ],
                },
                manual_scroll: {
                  actions: "triggerManualScroll",
                },
              },
            },
          },
        },
      },
    },
  },
});

// Helper functions
function findLyricIndex(lyrics: Lyric[], currentTime: number): number {
  return lyrics.findIndex((lyric) => lyric.time > currentTime) - 1;
}

function findOutlineIndex(lyrics: Lyric[], lyricIndex: number): number {
  return lyrics[lyricIndex]?.outlineIndex || 0;
}
