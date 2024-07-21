import React from 'react'
import XStateAudioPlayer from './XStateAudioPlayer'
import soundVikesh from "./assets/vikesh-june15-2024.wav";

function App() {
  return (
    <XStateAudioPlayer audioSrc={soundVikesh} />
  )
}

export default App;
