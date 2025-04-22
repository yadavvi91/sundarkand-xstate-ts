import { useState, useEffect } from "react";
import "./App.css";
import AudioPlayerWithLyricsAndOutline from "./AudioPlayerWithLyricsAndOutline.tsx";
import NarrativeContextDemo from "./components/NarrativeContextDemo";

function App() {
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    // Check URL parameters for demo mode
    const urlParams = new URLSearchParams(window.location.search);
    const demoParam = urlParams.get('demo');
    const shouldShowDemo = demoParam === 'narrative-context';
    console.log('URL parameter "demo":', demoParam);
    console.log('Showing narrative context demo:', shouldShowDemo);
    setShowDemo(shouldShowDemo);
  }, []);

  // Add a button to toggle between main app and demo
  const toggleDemo = () => {
    const newShowDemo = !showDemo;
    console.log('Toggling demo mode. New state:', newShowDemo);
    setShowDemo(newShowDemo);

    // Update URL without refreshing the page
    const url = new URL(window.location.href);
    if (newShowDemo) {
      url.searchParams.set('demo', 'narrative-context');
      console.log('Updated URL with demo parameter:', url.toString());
    } else {
      url.searchParams.delete('demo');
      console.log('Removed demo parameter from URL:', url.toString());
    }
    window.history.pushState({}, '', url);
  };

  return (
    <div>
      <button 
        onClick={toggleDemo}
        className="fixed top-4 right-4 z-50 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        {showDemo ? "Back to Main App" : "View Narrative Context Demo"}
      </button>

      {showDemo ? <NarrativeContextDemo /> : <AudioPlayerWithLyricsAndOutline />}
    </div>
  );
}

export default App;
