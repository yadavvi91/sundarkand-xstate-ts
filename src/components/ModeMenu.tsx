import React, { useState } from "react";
import { MoreVertical, MessageSquare, Languages } from "lucide-react";

interface ModeMenuProps {
  currentMode: "who-said-to-whom" | "translations";
  onModeChange: (mode: "who-said-to-whom" | "translations") => void;
}

const ModeMenu: React.FC<ModeMenuProps> = ({ currentMode, onModeChange }) => {
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
          </div>
        </div>
      )}
    </div>
  );
};

export default ModeMenu;