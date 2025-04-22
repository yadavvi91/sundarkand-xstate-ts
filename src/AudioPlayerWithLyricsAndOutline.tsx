import React, { useEffect, useRef } from "react";
import { useMachine } from "@xstate/react";
import { audioPlayerMachine, Lyric } from "./improvedAudioPlayerMachine.ts";
import soundPavan from "./assets/pavan-dec23-2024.wav";
import hanumanji from "./assets/hanumanji.jpg";
import { createBrowserInspector } from "@statelyai/inspect";
import OutlinePanel from "./components/OutlinePanel";
import LyricsPanel from "./components/LyricsPanel";
import InfoPanel from "./components/InfoPanel";

const { inspect } = createBrowserInspector();

const AudioPlayerWithLyricsAndOutline: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const outlineContainerRef = useRef<HTMLDivElement>(null);

  const scrollEffect = ({ context, event }) => {
    if (context !== undefined) {
      const scrollState = context.scrollActor?.getSnapshot();
      if (scrollState?.matches("scrolling")) {
        // do nothing
        console.log("scrolling");
        return;
      }
    }
    const container = lyricsContainerRef.current;
    if (!container) return;
    const highlightedLyric = container.querySelector(".bg-yellow-200");
    if (highlightedLyric) {
      const containerRect = container.getBoundingClientRect();
      const lyricRect = highlightedLyric.getBoundingClientRect();
      const containerHeight = containerRect.height;
      const lyricTop = lyricRect.top - containerRect.top;
      const lyricBottom = lyricRect.bottom - containerRect.top;

      console.log(
        `lyricTop < containerHeight * 0.25: ${lyricTop < containerHeight * 0.25}, lyricBottom > containerHeight * 0.75: ${lyricBottom > containerHeight * 0.75}`,
      );
      console.log(`lyricTop: ${lyricTop}, containerHeight: ${containerHeight}`);
      if (
        lyricTop < containerHeight * 0.25 ||
        lyricBottom > containerHeight * 0.75
      ) {
        const top = container.scrollTop + lyricTop - containerHeight * 0.25;
        container.scrollTo({
          top: top,
          behavior: "smooth",
        });
      }
    }
  };

  const [state, send] = useMachine(
    audioPlayerMachine.provide({
      actions: { scrollToPosition: scrollEffect },
    }),
    {
      inspect,
      systemId: "root",
    },
  );

  useEffect(() => {
    // console.log("State changed", state.value, state.context);
  }, [state]);

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (
      state.matches({
        playing: { playback: "playing" },
      })
    ) {
      audio?.pause();
      send({ type: "audio.pause" });
    } else {
      audio?.play();
      send({ type: "audio.resume" });
    }
  };

  const handleManualScroll = (e: React.UIEvent<HTMLDivElement>) => {
    send({ type: "scroll.manual" });
  };

  const handleForward = () => {
    send({ type: "audio.forward" });
  };

  const handleBackward = () => {
    send({ type: "audio.backward" });
  };

  const isFirstOccurrence = (footnoteId: number, currentIndex: number) => {
    return (
      state.context.lyrics.findIndex((lyric) =>
        lyric.footnoteIds.includes(footnoteId),
      ) === currentIndex
    );
  };



  const handleDialogueClick = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    dialogueId: number,
  ) => {
    e.stopPropagation(); // Prevent triggering the lyric click event
    send({ type: "dialogue.click", dialogueId });
  };



  function handleLyricClick(index: number, lyric: Lyric) {
    send({ type: "lyric.clicked", index });
    if (audioRef.current) {
      audioRef.current.currentTime = lyric.time;
    }
  }

  function handleOutlineClick(index: number) {
    const firstLyricOfOutline = state.context.lyrics.find(
      (lyric) => lyric.outlineIndex === index,
    );
    if (firstLyricOfOutline) {
      send({ type: "audio.seek", position: firstLyricOfOutline.time });
      if (audioRef.current) {
        audioRef.current.currentTime = firstLyricOfOutline.time;
      }
    }
  }


  return (
    <div className="flex justify-center min-h-screen bg-gray-50 absolute inset-0">
      <div className="flex w-full max-w-[1600px]">
        <OutlinePanel
          outline={state.context.outline}
          currentOutlineIndex={state.context.currentOutlineIndex}
          onOutlineClick={handleOutlineClick}
          outlineContainerRef={outlineContainerRef}
        />
        <LyricsPanel
          lyrics={state.context.lyrics}
          currentLyricIndex={state.context.currentLyricIndex}
          currentOutlineIndex={state.context.currentOutlineIndex}
          lyricsContainerRef={lyricsContainerRef}
          onLyricClick={handleLyricClick}
          onManualScroll={handleManualScroll}
          isFirstOccurrence={isFirstOccurrence}
          currentDialogueId={state.context.currentDialogueId}
          onDialogueClick={handleDialogueClick}
        />
        <InfoPanel
          displayMode={state.context.displayMode}
          currentDialogueId={state.context.currentDialogueId}
          dialogues={state.context.dialogues}
          lyrics={state.context.lyrics}
          currentLyricIndex={state.context.currentLyricIndex}
          onModeChange={(mode) => send({ type: "display.mode.change", mode })}
          onDialogueClose={() => send({ type: "dialogue.close" })}
          audioRef={audioRef}
          currentPosition={state.context.currentPosition || 0}
          duration={state.context.duration}
          volume={state.context.volume}
          isPlaying={state.matches({
            playing: { playback: "playing" },
          })}
          audioSrc={soundPavan}
          imageSrc={hanumanji}
          imageAlt="Hanumanji"
          recitationTitle="Vikesh Bhaiyya Recitation June 15 2024"
          onPlayPause={togglePlayPause}
          onForward={handleForward}
          onBackward={handleBackward}
          onVolumeChange={(volume) => 
            send({
              type: "volume.change",
              volume
            })
          }
          onProgressClick={(clickPosition) => {
            const newTime = clickPosition * state.context.duration;
            send({ type: "audio.seek", position: newTime });
            send({ type: "audio.seek.complete" });
            if (audioRef.current) {
              audioRef.current.currentTime = newTime;
            }
          }}
          onTimeUpdate={(currentTime) => {
            send({
              type: "audio.time.update",
              currentTime
            });
          }}
          onLoadedMetadata={(duration) => {
            send({ type: "data.loaded", duration });
          }}
          onEnded={() => send({ type: "audio.pause" })}
        />
      </div>
    </div>
  );
};

export default AudioPlayerWithLyricsAndOutline;
