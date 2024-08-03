import { createMachine, setup } from "xstate";

export const audioPlayerMachine = setup({
  actions: {
    showDataLoadedToast: ({ context, event }, params) => {
      console.log(context);
      console.log(event);
      console.log(params);
    },
    showStartPlayingToast: ({ context, event }, params) => {
      console.log(context);
      console.log(event);
      console.log(params);
    },
  },
  actors: {},
  delays: {},
  guards: {},
  // schemas: {}, // schemas is deprecated in v5
  types: {
    // this is of type SetupTypes, in SetupTypes we can only specify
    // - context, events, children, tags, input, output, emitted, meta
    // other things like actions, actors etc. for them the types should
    // be declared in createMachine() as they are MachineTypes
    context: {} as {},
    events: {} as
      | { type: "data_loading_started" }
      | { type: "data_loaded" }
      | { type: "play_audio" }
      | { type: "play_after_pause" }
      | { type: "pause" }
      | { type: "forward" },
  },
}).createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5QAoC2BDAxgCwJYDswBKAOnwHsACCdAF3QGIb6B9AG3PQgKhdnoBOtSAG0ADAF1EoAA7lYuWrnL5pIAB6IAjAHYALCS0A2PQE4jAVjFitYozoAcAGhABPRACYPAZhKnvFiYWHg46RsYBAL6RLmhYeISkzOiUHFw8THTo7JwQopJqcgpKKmqaCMEu7gjeOqYk1o0OpmIWoWKmOtGxGDgExCTJlJjkqDJsYMJsrqm5kAzj6K4s6ACu3OTiUkggRYrKqjvlALQ6Wn6W3gEODnrWejpViKEWfp12YQ5XJlrdIHF9RIkRauHiUWCrfA0AQAa3QUOBbCWYLWGwWa1gYC2hXk+1KR0QLVeDjED28lhJDwcWieCAc9hIbSuNw6D1MFgsfwBCQGILBEKh6Fh8IgiOR+CglFRyjI5AEGDY00ofIlUvWygYADM5QB3IUQbE7PYlQ6gcq1Xy2cn06k6QJ6PS0m5GEhfbx6IzUoyejwWX4xf69HmkFWSgXQuEI0NqjYkbUCPUCbiq6XkBjqfh0MAkdCa4QCZBWMREBjc-ohpGg1XhoWR0XR1Nx3X6lHqzYFI24k1lRAWwxia2e3T2x1uZ7eepXAJaDyOHRXYxcoPlsVVsOQiMi4EYyAxjUglZ5sACFgyHeG2Rdg49hBE12k+cUh-U2l1F16Yye7wODyWMTzpd4hXaMa2FKMdwgPdyFleV0EVGYz1WBQUzbLVmyTC9divfEzW0EJXg5M4Wn0OpmiMWlTGMEgP3sX9QndNougDMsgRAjday3RDMUgxt40TZNJVTdNM2EHMjwLIsSxY3lK35diwPrCCoKbBMWxQjZMONa8CQQLR3QcEgdHnPR6QHKwdA8Udqi+AxfRsGwLHnCzvA8aIAwoPJ4B2aSiBxYptNwhBji0LR6nMCwrjaW57keMddPJaiAhMX0Qu8MQvG8QDAQGChqCyPy8VNDREA-Ehfw6IxWjCexOlMWlLI8aiHGCcJOl9YI9Cy4NBiyWZ0glArux0kJGqqsw-XsbwZys3takMvSrg-X8fU5ZjlyBIYRjGCYphmNI8ggQaAuKoK0oaUxTA8GwjA8Uxbk6YxaQ9XxbpCSiLEusxOrWoDWNk6t5LrI6cJOiwDAuvRbruKbwh8WlkoaRotA+kyBy8LrgP+9dBQU1dWw2YGivKWxGohqGB2MGdvFfd1GTdfR2QCdqMb+8Vsc3KMseUihYPg5UudTQmb2RsQ3kh0xocpuG4tuXxKJ9HwJzu4IWZktnwUBziBbbFT+Px5QhZ0qx6j08aPBCyGQmpmWvAaGzKK+ZLLNVit1dAuttyQ3dBc7fyQeJ-9fA5MkvjqYJv1fW7GUaW6fyMimXbxgGcY9rjvZ1nmFSVLj9fIQ3ApC83GTB+dQ-ZHxnBl79XUW26Ram25E7YlPOKU3j0IEqD85OrQTIMSk7QW3RyWt6zdERmwPTOVoLocNzIiAA */
  initial: "no data",
  types: {} as {
    // this is of type MachineTypes
    actions:
      | { type: "showDataLoadedToast"; params: { msg: string } }
      | { type: "showStartPlayingToast"; params: { msg: string } };
  },
  states: {
    "no data": {
      on: {
        data_loading_started: {
          target: "data loading",
        },
      },
    },
    "data loading": {
      on: {
        data_loaded: {
          target: "data completely loaded",
        },
      },
    },
    "data completely loaded": {
      on: {
        play_audio: {
          target: "playing sundarkand",
        },
      },
      entry: [
        {
          type: "showDataLoadedToast",
          params: { msg: "entered" },
        },
        {
          type: "showStartPlayingToast",
          params: { msg: "playing" },
        },
      ],
    },
    "playing sundarkand": {
      initial: "playing audio",
      states: {
        "playing audio": {
          initial: "normally playing audio",
          states: {
            "normally playing audio": {
              on: {
                "forward": {
                  target: "forwarding audio"
                }
              }
            },
            "forwarding audio": {
              entry: "showForwardingToast",
              after: {
                500: "normally playing audio",
              },
              exit: "hideForwardingToast",
            },
          },
          on: {
            pause: {
              target: "paused audio",
            },
          },
        },

        "paused audio": {
          initial: "normally pausing audio",
          states: {
            "normally pausing audio": {
              on: {
                "forward": {
                  target: "forwarding audio"
                }
              }
            },
            "forwarding audio": {
              entry: "showForwardingToast",
              after: {
                500: "normally pausing audio",
              },
              exit: "hideForwardingToast",
            },
          },
          on: {
            play_after_pause: {
              target: "playing audio",
            },
          },

        },
      },
    },
  },
});
