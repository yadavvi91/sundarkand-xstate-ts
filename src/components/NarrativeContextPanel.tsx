import React from "react";

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
    <div className="narrative-context-panel fixed right-4 top-1/4 bg-amber-50 border border-amber-200 rounded-md p-4 shadow-md z-10 max-w-xs">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-amber-800">Narrative Context</h3>
        <button 
          onClick={onClose}
          className="text-amber-600 hover:text-amber-800"
        >
          ✕
        </button>
      </div>
      <div className="text-sm text-center">
        <p className="mb-1 text-center">
          <span className="font-medium">Narrator:</span> {contextInfo.narrator}
        </p>
        <p className="mb-1 text-center">
          <span className="font-medium">Listener:</span> {contextInfo.listener}
        </p>
        <p className="text-amber-700 text-center">
          {contextInfo.description}
        </p>
      </div>
    </div>
  );
};

export default NarrativeContextPanel;
