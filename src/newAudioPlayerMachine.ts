import { ActorRefFrom, assign, sendTo, setup } from "xstate";
import { lyricsPavan, outline, dialogues } from "./utils/lyrics.ts";

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
  | { type: "change_volume"; volume: number }
  | { type: "dialogue_click"; dialogueId: number }
  | { type: "dialogue_close" }
  | { type: "abcd" };

export interface DialogueInfo {
  id: number;
  speaker: string;
  listener: string;
  description: string;
}

export interface Lyric {
  time: number;
  type: "chaupai" | "samput" | "doha" | "sortha" | "chhand";
  text: string;
  outlineIndex: number;
  footnoteIds: number[];
  dialogueId?: number;
  dialogueTextRange?: {
    start: number;
    end: number;
  };
}

type AudioPlayerContext = {
  currentPosition: number | null;
  seekPosition: number | null;
  duration: number;
  currentLyricIndex: number;
  currentOutlineIndex: number;
  volume: number;
  isManualScrolling: boolean;
  scrollTimeout: number | null;
  lyrics: Lyric[];
  outline: string[];
  dialogues: DialogueInfo[];
  currentDialogueId: number | null;
  scrollActor: ActorRefFrom<typeof scrollMachine> | null;
  lyricActor: ActorRefFrom<typeof lyricMachine> | null;
  scrollEffect: (() => void) | null;
};

// Actor Machines
type ScrollMachineEvent = { type: "SCROLL" };

const scrollMachine = setup({
  types: {} as {
    events: ScrollMachineEvent;
  },
  actions: {
    scrollAgain: sendTo(
      ({ system }) => {
        return system.get("root");
      },
      ({ context, event }) => {
        return {
          type: "abcd",
        };
      },
    ),
  },
}).createMachine({
  id: "scroll",
  initial: "idle",
  states: {
    idle: {
      entry: [
        {
          type: "scrollAgain",
          params: { msg: "seeking to a position" },
        },
      ],
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
          reenter: true,
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
    emitted: { type: "lyric_update"; index: number; outlineIndex: number };
  },
  actions: {
    updateLyricIndices: ({ context, event }) => {
      if (event.type === "UPDATE") {
        context.currentLyricIndex = event.index;
        context.currentOutlineIndex = event.outlineIndex;
      }
    },
    emitLyricUpdate: sendTo(
      ({ system }) => {
        return system.get("root");
      },
      ({ context, event }) => {
        return {
          type: "lyric_update",
          index: context.currentLyricIndex,
          outlineIndex: context.currentOutlineIndex,
        };
      },
    ),
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QBsCeAnAlgYwLIENsALTAOzADpMJkwBiAVQAUARAQQBUBRAbQAYAuolAAHAPaxMAF0xjSwkAA9EAFgBMAGhCpEARjW6Avsa2kxEOArRY8hEuQXjJMuQuUIAtADYtOz15MQaxwCYjJKalpHCWlZeSQlRABONQoAZhU0gHYAVl9ENRUADgoVPi81HONjIA */
  id: "lyricMachine",
  context: {
    currentLyricIndex: 0,
    currentOutlineIndex: 0,
    emitter: { emit: () => {} }, // This will be replaced by the actual emitter when spawned
  },
  initial: "idle",
  states: {
    idle: {
      on: {
        UPDATE: {
          // actions: ["updateLyricIndices", "notifyParent"],
          actions: ["updateLyricIndices", "emitLyricUpdate"],
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
    // setDuration: ({ context, event }) => {
    //   if (event.type === "data_loaded") {
    //     context.duration = event.duration;
    //   }
    // },
    setDuration: assign({
      duration: ({ context, event }) => {
        if (event.type === "data_loaded") {
          return event.duration;
        }
        return context.duration;
      },
    }),
    handleDialogueClick: assign({
      currentDialogueId: ({ context, event }) => {
        if (event.type === "dialogue_click") {
          return event.dialogueId;
        }
        return context.currentDialogueId;
      }
    }),
    clearDialogue: assign({
      currentDialogueId: () => null
    }),
    showDataLoadedToast: ({ context, event }) => {
      console.log("Data loaded toast", context, event);
    },
    showStartPlayingToast: ({ context, event }) => {
      console.log("Start playing toast", context, event);
    },
    // loadInitialIndices: ({ context, event }) => {
    //   console.log("Start playing toast", context, event);
    //   const newLyricIndex = findLyricIndex(
    //     context.lyrics,
    //     context.currentPosition || 0,
    //   );
    //   const newOutlineIndex = findOutlineIndex(context.lyrics, newLyricIndex);
    //
    //   return {
    //     type: "UPDATE",
    //     index: newLyricIndex,
    //     outlineIndex: newOutlineIndex,
    //   };
    // },
    loadInitialIndices: assign({
      currentLyricIndex: ({ context, event }) => {
        const newLyricIndex = findLyricIndex(
          context.lyrics,
          context.currentPosition || 0,
        );
        return newLyricIndex;
      },
      currentOutlineIndex: ({ context, event }) => {
        const newLyricIndex = findLyricIndex(
          context.lyrics,
          context.currentPosition || 0,
        );
        const newOutlineIndex = findOutlineIndex(context.lyrics, newLyricIndex);
        return newOutlineIndex;
      },
    }),
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
    scrollToAPosition: ({ context, event }) => {
      if (context.scrollEffect) {
        context.scrollEffect();
      }
    },
    updateSeekPosition: assign({
      seekPosition: ({ context, event }) => {
        return event.type === "seek" ? event.position : context.seekPosition;
      },
    }),
    updateCurrentPosition: assign({
      currentPosition: ({ context, event }) => {
        return context.seekPosition != null ? context.seekPosition : null;
      },
      seekPosition: ({ context, event }) => {
        return context.seekPosition != null ? null : context.seekPosition;
      },
    }),
    updateTime: assign({
      currentPosition: ({ context, event }) => {
        if (event.type === "time_update") {
          return event.currentTime;
        }
        return context.currentPosition;
      },
    }),
    updateVolume: assign({
      volume: ({ context, event }) => {
        if (event.type === "change_volume") {
          return event.volume;
        }
        return context.volume;
      },
    }),
    scrollToCurrentLyric: ({ context, event }) => {
      // Logic to scroll to the current lyric
      console.log("Scrolling to lyric index:", context.currentLyricIndex);
    },
    updateTimeAndLyric: sendTo(
      ({ context }) => context.lyricActor,
      ({ context, event }) => {
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
      },
    ),
    handleLyricClick: sendTo(
      ({ context }) => context.lyricActor,
      ({ context, event }) => {
        if (event?.type === "click_lyric") {
          return {
            type: "UPDATE",
            index: event?.index,
            outlineIndex: findOutlineIndex(context.lyrics, event?.index),
          };
        }
        return { type: "NOOP" };
      },
    ),
    // triggerManualScroll: ({ context }) => {
    //   context.scrollActor?.send({ type: "SCROLL" });
    // },
    triggerManualScroll: sendTo(
      ({ context }) => context.scrollActor,
      ({ context, event }) => {
        return { type: "SCROLL" };
      },
    ),
    updateLyricIndices: assign({
      currentLyricIndex: ({ context, event }) => {
        return event.type === "lyric_update"
          ? event.index
          : context.currentLyricIndex;
      },
      currentOutlineIndex: ({ context, event }) => {
        return event.type === "lyric_update"
          ? event.outlineIndex
          : context.currentOutlineIndex;
      },
    }),
    doAbcd: ({ context, event }) => {
      console.log(`doAbcd: ${event}`);
      const scrollState = context.scrollActor?.getSnapshot();
      if (scrollState?.matches("scrolling")) {
        // do nothing
        console.log(`scrollState: ${scrollState}`);
      } else {
        // scrollToAPositionEffect(context, event);
      }
    },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QEMCuECWB7ACgG2QE8wAnAOgDssARZAF2QGIJ7kB9PLZTCqN2BiTqQA2gAYAuolAAHLLAx1sFaSAAeiAIwAWABxkxAdl2aATAFYANCEKITZcwF9H1tJlwFi5KrQbNWHFwQopKqcgpKWCpI6lp6BsZmVjZa5gDMDtoAbLqGTi4gbtj4RKRkLAwAwlgAtjJ4YMJ4hAAyQZCM9URsRVjiUjHhisqqGgjmpta2CJppeWSGaQCcWbO65mJLmppZzq7oxZ5lFcjVdQ1Nre0QjGoC9GBkyABmwiQAFJpiYgCUjL0lLzlVhneqNMDNNrcEIDWTyYZRUaILKTFIIJZpDKmbR6UymTS6bTY7RLPaFA4eUrkLqEDC8ADKqAoLBIAGtkMynhSAAQ0ulQbn3YSwMh83gAQQpnTQsDA-TC8Mi0VAY3M6TIJgsUy0YiJCyy5gNas0eUSZIBR2pnn5jOZyDZHIgXPcvOtvEFDGFordUEl7kYzywJAA7vaIPLBoqRjExkttGIyKYxGkktqZmJtmQ0rpTIS0hnTSZzRTAWUxVBbSz2Zzeq6iPyPQ8ReW-dhGAAjZAAY1ZoZI4dCkYi0ZViAxCaTKa1aK25jIRKWhgJBfMZoKFqp3vrDKZVcdzuwddp7qFcC3x99UtlYFZEbhw8RMbHScTydTaN0WW0ZCWpkXy5NVci3XEtLXPG1d3tasnVrctGy9FspSUGowDYVAZAqOVB3vBFlViBAsiyDIFxyPI0xWfR1jjMRjULTRi3cUsrW3CtIIdGseTg09mx9VssEYLsAAsORgNgADcsDwVAULvEAhiVJECPmTFzAxMiP0MUwfzEFFdBowC132RiwPLSsoP3WCfXgs9EP9ZB2y7AdYTkqNH1HAjDQMFFkmmPIEw2b583MAzgKMw5N1MtjoIPLAjwbbjRRlSA+M6TweleUg2BkJLZPkkd8O0ZT32mL4MUTA0jWCuiGPCoFIrtdiYM4qyEuy1BZQgFLAxDMNctcvDYxfSdiq0SdE10JZNnzEL6JA4yIp9MzGpiuKT09Gyks6qVOx7PsnIVB8BrHeNXynHytC+QwszSVSchXQzyXmurFqiizmpY6zm02lLr1vbCXMOxTfwnN9p2mFElgWAKgpmmrKWeliluiyyPta76kIwFC0Iwh4+sBp8EFMIiHGWHSwbHYmqPjWigNmsL4bLF6GuR96L0+xL2uSqUhJE1CJKkmT-rytz8NMeYcXSEaEE-K7Jt0-Tqrm2rGcR16OJdLj1q+zmtrshz9qHXDFIsLIyBNAl1N87Q5wC5MFdpuGmPAndmf3WBBKwYMjwAWja2VuToLgBDIQSMAgYIKADIM9rxo2CdmHYszl8mZmWU2zphxX6ad+q905d3PZ9v2wADoO6BDsOI47bte16oX+sUhP0+T86Zj-fQM-th6NwRi8kbdj2vZpX2ktL5Bg4L4N+QAMWjsMABUy6jnr+1jhT442TQNRzTVW7WLSsk2amqodpWGeYvu1adSei9HwPx-LyeZ7n-tF4f25TyeDKPgCv4e5Vy+rt86D1vpzMeE9B7PxXhAN+Ag175TGE3JOZM95pHiLvTOp9s4mSZnna+IDh7F3AY-SBvAABCNc9qwLoNXXaddnLCyOjMDYWlNBLElinbY2gMiH2ojTbuoEFqqyAfgwuhC75lzIE-chlCF5LzuOtL+bx3i-3+II3uEERFSIIZ4EeYD74QM9vyChdDX5l3gSLRBKZm4oLTEkBMGCu6hUesrC+mi8HaMLr9YhZAw4NEYL9CxTDNDmF0BkWxaIsiGEht8CY2Z1ibG2PkbBQjAEeJvt4gxj8wA3n5AEnJrI2BdlqGCYQQTG7ZFNnobhls7AWHnKEtIREElbBCY7HBwj0kgMyZI36eTfpsGeMgDADQDY4XXu5HQhF5x5lqQgTSkMNhxN0C0pJ7TUnuPMpyZoJAMBdm5HSN43YlS+IgP4rseA9mFJ2Xs8pBMibfhzKDPeoTvzeTtifART0AGbOWjc-ZhzSDHOUKc-xNQOSoGQHgfgXYSCSTwHc9yRNTbmGyLkPeeh9BRLYTRT5zj-5uJdh4-5ByKBHK7CcvxYBGD-OxphRFotPLm3RXYpppsiaGjVHi2aBQqDBHgDEAlB047uW9lkNMYr1lAh8KwYVEyCqommCs+cOxCJqvVVEqVxxWBQh4FAOVCDEBNO-NUuYrccxavICcUEFwIRXGhBAA1ljEB-khuws6diTrJJcefZ2rERFOuCYfM2S4WVog2N+WJph4kbFad6glfr+7q0PJrJsgbjZiH0MyuZBp9DfECk4umPqc64K2U1DWLUtZ+r4umgmORTYRJKpsdlFUuWwzPiWzpZaVqpoQujdwtakXrDIBVThiTyqcv4fi9RPyiXdpvuI-RZdB34S4ZDNIuYpZfCZUfXF7aUkaLnctBduiiFZIruHMAeFGGNzYVdDdu9WV6myBYTBxhTCWsTVfTxQ9T0SIfj+qBVDl2G3lYgwqWkiQWwxWEhw3k33Tu+YS-1XSxF-qXQB6RUATG1zMQ-Fd4HNLznxGGkqxI4OvsLZ+3O87ukFOIQRi6qKsybpTqpLeSzo0rNjWsjtHS0m0a8fR89VLGMzDuiOlOeQ5zRoAjdRJbS+MbKPdFDJwnekFP5GJswYgtIPqlnpRZsx9LybjdR0tfzCC7IBWSoFFL8o3vuZmkN0G7Fi30IYVtU6i0Jpo5Z6zpLyWUrOWAMTKYPNQdI1oRY+hqnH3bc4IAA */
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
    dialogues: dialogues,
    currentDialogueId: null,
    scrollActor: null,
    lyricActor: null,
    scrollEffect: null,
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
        { type: "loadInitialIndices", params: { msg: "Load Initial Indices" } },
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
          initial: "pausedAudio",
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
                abcd: {
                  actions: ["doAbcd", "scrollToAPositionEffect"],
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
                time_update: {
                  actions: ["updateTime", "updateTimeAndLyric"],
                },
                change_volume: {
                  actions: "updateVolume",
                },
                abcd: {
                  actions: ["doAbcd", "scrollToAPositionEffect"],
                },
              },
            },
          },
        },
        "dialogue manager": {
          id: "dialogueManager",
          initial: "idle",
          states: {
            idle: {
              on: {
                dialogue_click: {
                  target: "showingDialogue",
                  actions: ["handleDialogueClick"]
                }
              }
            },
            showingDialogue: {
              on: {
                dialogue_close: {
                  target: "idle",
                  actions: ["clearDialogue"]
                },
                dialogue_click: {
                  target: "showingDialogue",
                  actions: ["handleDialogueClick"]
                }
              }
            }
          }
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
                    { type: "scrollToAPositionEffect", params: {} },
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
                  actions: ["updateLyricIndices", "scrollToAPositionEffect"],
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
