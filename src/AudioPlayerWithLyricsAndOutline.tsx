import React, { useRef } from "react";
import { useMachine } from "@xstate/react";
import { audioPlayerMachine, Lyric } from "./newAudioPlayerMachine.ts"; // Assume this is imported from your machine file
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
} from "lucide-react";
import soundPavan from "./assets/pavan-dec23-2024.wav";
import hanumanji from "./assets/hanumanji.jpg";

const AudioPlayerWithLyricsAndOutline: React.FC = () => {
  const [state, send] = useMachine(audioPlayerMachine);

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const outlineContainerRef = useRef<HTMLDivElement>(null);

  const togglePlayPause = () => {
    if (state.matches({ "audio playing states": "playingAudio" })) {
      send({ type: "pause" });
    } else {
      send({ type: "play_after_pause" });
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;

    const progressBar = progressRef.current;
    const clickPosition =
      (e.clientX - progressBar.getBoundingClientRect().left) /
      progressBar.offsetWidth;
    const newTime = clickPosition * state.context.duration;

    send({ type: "seek", position: newTime });
    audioRef.current.currentTime = newTime;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    send({ type: "change_volume", volume: newVolume });
  };

  const handleForward = () => {
    send({ type: "forward" });
  };

  const handleBackward = () => {
    send({ type: "backward" });
  };

  const isFirstOccurrence = (footnoteId: number, currentIndex: number) => {
    return (
      state.context.lyrics.findIndex((lyric) =>
        lyric.footnoteIds.includes(footnoteId),
      ) === currentIndex
    );
  };

  const handleFootnoteClick = (
    e: React.MouseEvent<HTMLElement, MouseEvent>,
    footnoteId: number,
  ) => {
    console.log(e, footnoteId);
  };

  function splitOnSpaceExceptLast(str: string) {
    // Find the last space in the string
    const secondLastSpaceIndex = str.lastIndexOf(" ");

    // If there's no space or only one space, return the string as the only element in an array
    if (secondLastSpaceIndex === -1) {
      return [str];
    }

    // Find the second-to-last space in the string
    const lastSpaceIndex = str.lastIndexOf(" ", secondLastSpaceIndex - 1);

    // Split the string into two parts: before the last space and after
    const beforeLastSpace = str.slice(0, lastSpaceIndex);
    const afterLastSpace = str.slice(lastSpaceIndex + 1);

    // Split the part before the last space on spaces
    const splitBeforeLastSpace = beforeLastSpace.split(" ");

    // Combine the two parts
    return [...splitBeforeLastSpace, afterLastSpace];
  }

  const renderLyric = (lyric: Lyric, index: number) => {
    const footnoteIds = lyric.footnoteIds.reduce(
      (acc: number[], footnoteId: number, i: number) => {
        if (isFirstOccurrence(footnoteId, index)) {
          acc.push(footnoteId);
        }
        return acc;
      },
      [],
    );
    const footnoteIndicator =
      footnoteIds && footnoteIds.length > 0 ? (
        <div className="flex items-center">
          {footnoteIds.map((noteId) => (
            <sup
              key={`notedId-${noteId}`}
              className="text-blue-500 cursor-pointer ml-1"
              onClick={(e) => handleFootnoteClick(e, noteId)}
            >
              [{noteId}]
            </sup>
          ))}
        </div>
      ) : null;

    if (lyric.type === "doha" || lyric.type === "sortha") {
      const pattern = /॥\d+॥/;
      const isLine2 = pattern.test(lyric.text);
      return (
        <div className="flex items-center">
          <p
            className="flex justify-between w-full px-2"
            style={{ width: isLine2 ? "400px" : "370px" }}
          >
            {splitOnSpaceExceptLast(lyric.text.trim()).map((word, i) => (
              <span key={i}>{word}</span>
            ))}
          </p>
          <div className="w-[20px]">
            {" "}
            {/* Fixed width container for footnote */}
            {footnoteIndicator}
          </div>
        </div>
      );
    }
    //
    else if (lyric.type === "samput") {
      const midPoint = lyric.text.indexOf("।");
      const firstPart = lyric.text.slice(0, midPoint + 1);
      const secondPart = lyric.text.slice(midPoint + 1) + "  ";
      return (
        <div className="flex items-center">
          <div
            className="flex w-full px-2 italic text-gray-600 font-bold"
            style={{ width: "500px" }}
          >
            <p className="w-[245px] flex justify-between">
              {splitOnSpaceExceptLast(firstPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
            <p className="w-[255px] flex justify-between pl-2">
              {splitOnSpaceExceptLast(secondPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
          </div>
          <div className="w-[20px]">
            {" "}
            {/* Fixed width container for footnote */}
            {footnoteIndicator}
          </div>
        </div>
      );
    }
    //
    else {
      const midPoint = lyric.text.indexOf("।");
      const firstPart = lyric.text.slice(0, midPoint + 1);
      const secondPart = lyric.text.slice(midPoint + 1) + "  ";
      return (
        <div className="flex items-center style={{ minHeight: '2em' }}">
          <div className="flex w-full px-2" style={{ width: "500px" }}>
            <p className="w-[245px] flex justify-between">
              {splitOnSpaceExceptLast(firstPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
            <p className="w-[255px] flex justify-between pl-2">
              {splitOnSpaceExceptLast(secondPart.trim()).map((word, i) => (
                <span key={i}>{word}</span>
              ))}
            </p>
          </div>
          <div className="w-[20px]">
            {" "}
            {/* Fixed width container for footnote */}
            {footnoteIndicator}
          </div>
        </div>
      );
    }
  };

  function handleLyricClick(index: number, lyric: Lyric) {
    send({ type: "click_lyric", index });
    if (audioRef.current) {
      audioRef.current.currentTime = lyric.time;
    }
  }

  const renderLyrics = () => {
    let currentSection = 0;
    return (
      <div className="w-full flex flex-col items-center">
        {state.context.lyrics.reduce((acc, lyric, index) => {
          if (lyric.outlineIndex !== currentSection) {
            currentSection = lyric.outlineIndex;
            acc.push(
              <div
                key={`section-${lyric.outlineIndex}`}
                className={`w-full mb-4 p-2 ${
                  lyric.outlineIndex === state.context.currentOutlineIndex
                    ? "bg-blue-100"
                    : ""
                }`}
              >
                {[]}
              </div>,
            );
          }
          acc[acc.length - 1].props.children.push(
            <div
              key={index}
              className={`text-lg cursor-pointer flex justify-center items-center w-full 
                ${index === state.context.currentLyricIndex ? "bg-yellow-200" : ""}`}
              onClick={() => handleLyricClick(index, lyric)}
            >
              {renderLyric(lyric, index)}
            </div>,
          );
          return acc;
        }, [] as React.ReactElement[])}
      </div>
    );
  };

  const renderOutline = (outline) => {
    return (
      <div
        ref={outlineContainerRef}
        className="w-[300px] bg-gray-100 p-4 overflow-y-auto border-r border-gray-200 outline-container"
      >
        <h3 className="font-bold mb-4 text-lg pl-4">प्रसंग</h3>
        {outline.map((item, index) => (
          <div
            key={index}
            className={`mb-2 text-sm cursor-pointer p-2 rounded pl-4 ${
              index === state.context.currentOutlineIndex
                ? "bg-blue-100"
                : "hover:bg-gray-200"
            }`}
            onClick={() => {
              const firstLyricOfOutline = state.context.lyrics.find(
                (lyric) => lyric.outlineIndex === index,
              );
              if (firstLyricOfOutline) {
                send({ type: "SEEK", position: firstLyricOfOutline.time });
                if (audioRef.current) {
                  audioRef.current.currentTime = firstLyricOfOutline.time;
                }
              }
            }}
          >
            {item}
          </div>
        ))}
      </div>
    );
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-50 absolute inset-0">
      <div className="flex w-full max-w-[1600px]">
        {renderOutline(state.context.outline)}
        <div
          className="flex-grow p-8 overflow-y-auto flex flex-col items-center"
          ref={lyricsContainerRef}
          onScroll={() => send({ type: "manual_scroll" })}
        >
          <div className="w-full max-w-[1000px]">
            <h2 className="text-4xl font-bold mb-8 text-center w-full">
              सुंदरकाण्‍‍ड़
            </h2>
            {renderLyrics()}
          </div>
        </div>
        <div className="w-[400px] bg-white p-8 flex flex-col justify-end border-l border-gray-200">
          <div className="mb-4">
            <div className="w-full h-32 bg-gray-200 mb-4 flex justify-center items-center p-2">
              <div className="h-full w-full bg-gray-200 flex justify-center items-center">
                <img
                  src={hanumanji}
                  className="max-h-full max-w-full object-contain"
                  alt="Hanumanji"
                />
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              Vikesh Bhaiyya Recitation June 15 2024
            </div>
            <div
              ref={progressRef}
              className="h-2 bg-gray-300 rounded-full cursor-pointer"
              onClick={handleProgressClick}
            >
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${(state.context.currentPosition / state.context.duration) * 100}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between mt-1 text-sm text-gray-600">
              <span>{formatTime(state.context.currentPosition)}</span>
              <span>{formatTime(state.context.duration)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <button className="text-gray-600 hover:text-gray-800">
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlayPause}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
            >
              {state.matches("playing") ? (
                <Pause size={20} />
              ) : (
                <Play size={20} />
              )}
            </button>
            <button className="text-gray-600 hover:text-gray-800">
              <SkipForward size={20} />
            </button>
            <button
              onClick={toggleMute}
              className="text-gray-600 hover:text-gray-800"
            >
              {state.context.isMuted ? (
                <VolumeX size={20} />
              ) : (
                <Volume2 size={20} />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={state.context.isMuted ? 0 : state.context.volume}
              onChange={handleVolumeChange}
              className="w-20"
            />
          </div>
          <audio
            ref={audioRef}
            src={soundPavan}
            onTimeUpdate={() =>
              send({
                type: "TIME_UPDATE",
                currentTime: audioRef.current?.currentTime || 0,
              })
            }
            onLoadedMetadata={() =>
              send({
                type: "DURATION_SET",
                duration: audioRef.current?.duration || 0,
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default AudioPlayerWithLyricsAndOutline;
