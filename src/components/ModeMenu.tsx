import React, { useState } from "react";
import { MoreVertical, MessageSquare, Languages, Music, Eye, EyeOff, Mic } from "lucide-react";

interface ModeMenuProps {
  currentMode: "who-said-to-whom" | "translations";
  onModeChange: (mode: "who-said-to-whom" | "translations") => void;
  lyricsSource: "pavan" | "vikesh";
  showSamput: boolean;
  onLyricsSourceChange: (source: "pavan" | "vikesh") => void;
  onSamputFilterToggle: (showSamput: boolean) => void;
}

const ModeMenu: React.FC<ModeMenuProps> = ({ 
  currentMode, 
  onModeChange,
  lyricsSource,
  showSamput,
  onLyricsSourceChange,
  onSamputFilterToggle
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative">
      <button 
        className="text-gray-600 hover:text-gray-800 p-2"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <MoreVertical size={24} />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
          <div className="py-1">
            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Display Mode
            </div>
            <button
              className={`flex items-center px-4 py-2 text-sm w-full text-left ${currentMode === "who-said-to-whom" ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => {
                onModeChange("who-said-to-whom");
                setMenuOpen(false);
              }}
            >
              <MessageSquare size={16} className="mr-2" />
              Who Said to Whom
            </button>
            <button
              className={`flex items-center px-4 py-2 text-sm w-full text-left ${currentMode === "translations" ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => {
                onModeChange("translations");
                setMenuOpen(false);
              }}
            >
              <Languages size={16} className="mr-2" />
              Translations
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Lyrics Source
            </div>
            <button
              className={`flex items-center px-4 py-2 text-sm w-full text-left ${lyricsSource === "pavan" ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => {
                onLyricsSourceChange("pavan");
                setMenuOpen(false);
              }}
            >
              <Mic size={16} className="mr-2" />
              Pavan Recitation
            </button>
            <button
              className={`flex items-center px-4 py-2 text-sm w-full text-left ${lyricsSource === "vikesh" ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
              onClick={() => {
                onLyricsSourceChange("vikesh");
                setMenuOpen(false);
              }}
            >
              <Mic size={16} className="mr-2" />
              Vikesh Recitation
            </button>

            <div className="border-t border-gray-200 my-1"></div>

            <div className="px-4 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Filters
            </div>
            <button
              className={`flex items-center px-4 py-2 text-sm w-full text-left hover:bg-gray-100`}
              onClick={() => {
                onSamputFilterToggle(!showSamput);
                setMenuOpen(false);
              }}
            >
              {showSamput ? (
                <>
                  <Eye size={16} className="mr-2" />
                  Hide Samput
                </>
              ) : (
                <>
                  <EyeOff size={16} className="mr-2" />
                  Show Samput
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeMenu;
