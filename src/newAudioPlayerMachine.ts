import {
  createMachine,
  assign,
  ActorRefFrom,
  setup,
  emit,
  sendTo,
} from "xstate";
import { lyricsPavan, lyricsVikesh, outline } from "./utils/lyrics.ts";
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
  | { type: "lyric_update"; index: number; outlineIndex: number }
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

type LyricMachineEvent =
  | {
      type: "UPDATE";
      index: number;
      outlineIndex: number;
    }
  | { type: "data_loading_started" }
  | { type: "data_loaded"; duration: number }
  | { type: "play_audio" };
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
    // notifyParent: ({ context, event }) => {
    //   // emit({
    //   //   type: "lyric_update",
    //   //   index: context.currentLyricIndex,
    //   //   outlineIndex: context.currentOutlineIndex,
    //   // });
    //   sendTo(({ event }) => event.sender, {
    //     type: "lyric_update",
    //     index: context.currentLyricIndex,
    //     outlineIndex: context.currentOutlineIndex,
    //   });
    // },
    notifyParent: sendTo("audioPlayer", ({ context, event }) => {
      return {
        type: "lyric_update",
        index: context.currentLyricIndex,
        outlineIndex: context.currentOutlineIndex,
      };
    }),
  },
}).createMachine({
  id: "lyricMachine",
  context: { currentLyricIndex: 0, currentOutlineIndex: 0 },
  initial: "idle",
  states: {
    idle: {
      on: {
        UPDATE: {
          actions: ["updateLyricIndices", "notifyParent"],
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
    updateTimeAndLyric: sendTo("lyricMachine", ({ context, self }) => {
      const newLyricIndex = findLyricIndex(
        context.lyrics,
        context.currentPosition,
      );
      const newOutlineIndex = findOutlineIndex(context.lyrics, newLyricIndex);

      return {
        type: "UPDATE",
        index: newLyricIndex,
        outlineIndex: newOutlineIndex,
      };
    }),
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
    updateLyricIndices: ({ context, event }) => {
      if (event.type === "lyric_update") {
        context.currentLyricIndex = event.index;
        context.currentOutlineIndex = event.outlineIndex;
      }
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuECWB7ACgG2QE8wAnAOgDssARZAF2QGIJ7kB9PLZTCqN2BiTqQA2gAYAuolAAHLLAx1sFaSAAeiAIwAWABxkxAdl2axugEyGrYgKyWANCEKITZG2I86AzAE5NNn21fAF9gxzRMXAJicipaBmZWDi4IUUlVOQUlLBUkdS09A2NTCytDWwcnArEDbQA2XV1bPXK6usNQ8PRsfCJSMhYGAGEsAFsZPDBhPEIAGRTIRgmiNgjscSk8zMVlVQ0EO0dnBE1zTS8yP3P3Ly8bXTtNTpA1qL7yQeQR8cnpuYWIIw1AJ6GAyMgAGbCEgAClMYgAlIxXr0YgNWN8JlMwDN5tw0ptZPIdjk9og6uYji5tDVbIZzNpLOY7uYfHVnijov1loQMLwAMqoCgsEgAa2QwvB3SwAAIeXyoDKQcJYGR5bwAILSpZoWBgDYZYnZXKgfZ6Go2cq3YxeM7aHyGKkIXT1Mg0uqaHwmLyGbQ2W4c6Wo7nRBWC4XIMUSiBSyJy0O8JUMFVqhNQLWRRgQrAkADukYgBq2Rt2eX2jTqlx0YjZvhsdUeTqsNjI53MDwsARr5nMgciwfI6qg4ZF4slr3jRAVSdBqqHGewjAARsgAMai-MkQvpYtZUumlxsqs02s+euNqoHCxkHsN+usu7+p5hF5BrmDtMjyNjmMToczlN521PUwFFIsiT3UkyxcXRKz8E86jrBszidHRDE0NxzCMDwxHtQwfHbPsenfVMpwFIVR2jWNsEnXlE2VOBSLo9NtSUUYwDYVAZEGfUdwgkkTXyBBzHrVt0N0Hwrkkl1HUvCxK3uW18Mk05GRsIi3jRIcvyjcdpVo6cGLnNMFywRhVwACwlGA2AANywPBUHY8CQG2Y0yWEhoikZbRNDqIxtHw+smy8GpzjETQHkZWDGXZF9OXeJiwwo78qL-NMAMYmRdUgUylmiVYoVINhstQPUXLc-chPNNwrR9XRbR0B0mzPS4xApMRQruM8Ag0gckvIiNdN-fT-yMtUcogPLszzAsKpLKCDwQHx2uPGtELPZDNCdXR0LcB4z3bM46gI7Q+pI7SUuG6jZTG5MssmvKV3XTdt0JVyFsE8sj3g9akIvY52n0do2XcB4PX9OKun7C7Pyun8boM+j7rnR7gLAUD5sgr7Dzg6tT3PFDLx0M4DCw8p7T0Vl7nOxLLqGhH0rIxVxtKvUpu1SzrI4+zHOcviPuxjy2gw21OvKWDwb8ptAsuJ9OstPR-V7eK3zpuGGao2ALKwXNaIAWjZsAZToLgBDICyMAgVIKCzHNXqxgSPNOQwLkZSLfRdQJIadNlDDaj0mhsXzyhrWmtI1yjJW13WDaNk2zboC2rZt5c1w3OaBcqxahJdt2zl2vRKZ9uSToDvy7mMX0QlVmH1eZnSEZjvWeUNnKE+Qc3m4VAAxe2CwAFUTu3Zq3R33Ogk4-X0FaKRWyWC90X3-TIK0XY8KLEPDkMG-hrWdZb6I27K43Tc7pPu94PvR4gIfz6BBjwSK2F3ERZE1Yj3fNejg+4-bs+u4H17v3Lcd8BDjyqvsPOboC6e2Ll4OovssJunav4SWYgGSaGfNDYi9dmKN33rHVu8cAEXyAbwAAQunV6YC6Bpxepnd62ccZTwCDeW8Z5NBWG0Dwykl50LaFXp1Colp6R1D9NvD8X8o4xmbn-E+HdAG6wVFQhhoDh7Anuk-aEMJX5IgSp-fBe8f5EKPiQxOZBL5QFURndR58IE5ygZYfOHsi7ewQTtHsKCKTBxsJaCkhFa64MMclb+sjf4gVFIopOVtJiMEiQ4lh1Z-a3ktLaB8p1ULtkrP4D0aC-YBHUkEzSO8jFhMsREjGUTSGWKqQqeJVS2CrjGFiYQiTnYPjIP5HwtoJKu09MYVCQQLimAIrYesZhLSSIGsOYx4TY6ROibU0C9TIlsAhMgDAkw3qGiFpPU4PSuk1l6Q6LwAyl7E1uJWBseSaxehEu0aZ9MZFkBmCQDAq4ZR8mhGuY0ZBYlgHMngD5ooOCEHeaudpk8HliUiipT0XpApZJrG6WK7V7SSUMA0J5kdUqSjeR8r5FAfmrj+QCxgowJSoGQHgfgq4SAOTwFCpaIl-YSRdCdc4DofHaFQlg8wlwJI2CwT012WK4ovioKkeAeQDGkF2U7Se+tEGXmVdMuIrAFUTyWoyHa+hfJtCaJgl0vgvDTM+HiHgUAtWQMQAgwRRd6pNBpFczxBgcLeD8AEIIPhzUYhab8HE-x8QQBtY4xArIfByzObcPyVgfFDItDhGs9pQp+AbDi6ReLQ27kVUtPyYVxLwukkiy8lNV7mAbOUfluEAzFP6s87NiM7qzjDSwrC+guFwqkoi2SgNGRdNCgihk6FbS+vrbDLN10mbMUysZZmpk20eUsPoJoZgIq7REiYFVxwzyCK9GeUKDYggnTOhOvBoSXkzsMijCaJ8OaRCXZPdoGF-TCtgscmkLodr2m8Z6b0vp-RmvPSEwaLy5HEP-onJ9+bTCVgQfST0dgC5tCdBSFJwi2h1kMMHXQmayngd-pBhRNTLbWzAIJZhzt-CCIQ2cQ6KGd2IHggYesXCRKv3pB0EDpTL1Nog2YqD58KnKKviA2+0Hc3atzoyKNfozmWnauK9qqFxmtnvGcS0WD6hFJwSUqRBH+NEcEyRixVibE0Mk-xaTUDZNuifIp9obQVNyT8upj0gUuUxW43phtuLrpyMWaQmDQkvQYXqIXHQFIT1MZOP+rpbHWToTsPaPDPGDN8YC5U0CSyAUhage4QRxQC6sg9FYVCCCBWIUrf5ekjQzDAd85OwzWWFlVKWZEhU+WtAYLkw0X0UWGQINi9WB1PpfAOhNUEfDmWEYEs+d80gvyqpUehWYWFEke0yVUyJN0QrWV+Ngj518ddQOzPKfNolJKyUQEmN1hAZyai3C9K7Nkph7UjftWQI1EVbSIUQkYUIoQgA */
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
    lyrics: lyricsPavan,
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
                {
                  type: "updateSeekPosition",
                  params: { msg: "seeking to a position" },
                },
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
                lyric_update: {
                  actions: ["updateLyricIndices"],
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
