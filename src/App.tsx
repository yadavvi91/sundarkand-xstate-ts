import React from 'react'
import XStateAudioPlayer from './XStateAudioPlayer'
import soundVikesh from "./assets/vikesh-june15-2024.wav";
import './App.css';
import { lyricsVikesh as lyrics } from './utils/lyrics';

function App() {
  return (
    <XStateAudioPlayer audioSrc={soundVikesh} lyrics={lyrics} />
  )
}

export default App;
