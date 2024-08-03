import XStateAudioPlayer from "./XStateAudioPlayer";
import soundVikesh from "./assets/vikesh-june15-2024.wav";
import { lyricsVikesh as lyrics } from "./utils/lyrics";
import "./App.css";

function App() {
  return <XStateAudioPlayer audioSrc={soundVikesh} lyrics={lyrics} />;
}

export default App;
