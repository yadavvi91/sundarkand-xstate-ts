import XStateAudioPlayer from "./XStateAudioPlayer";
import soundVikesh from "./assets/vikesh-june15-2024.wav";
import { lyricsVikesh as lyrics } from "./utils/lyrics";
import "./App.css";
import AudioPlayerWithLyricsAndOutline from "./AudioPlayerWithLyricsAndOutline.tsx";

function App() {
  // return <XStateAudioPlayer audioSrc={soundVikesh} lyrics={lyrics} />;
  return <AudioPlayerWithLyricsAndOutline />;
}

export default App;
