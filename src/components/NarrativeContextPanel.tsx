import React, { useState } from "react";

interface NarrativeContextInfo {
  narrator: string;
  listener: string;
  description: string;
}

interface NarrativeContextPanelProps {
  isOpen: boolean;
  contextInfo: NarrativeContextInfo;
  onClose: () => void;
}

const NarrativeContextPanel: React.FC<NarrativeContextPanelProps> = ({
  isOpen,
  contextInfo,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="narrative-context-panel bg-amber-50 border border-amber-200 rounded-md p-4 mt-2 mb-4 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-amber-800">Narrative Context</h3>
        <button 
          onClick={onClose}
          className="text-amber-600 hover:text-amber-800"
        >
          ✕
        </button>
      </div>
      <div className="text-sm">
        <p className="mb-1">
          <span className="font-medium">Narrator:</span> {contextInfo.narrator}
        </p>
        <p className="mb-1">
          <span className="font-medium">Listener:</span> {contextInfo.listener}
        </p>
        <p className="text-amber-700">
          {contextInfo.description}
        </p>
      </div>
    </div>
  );
};

export default NarrativeContextPanel;