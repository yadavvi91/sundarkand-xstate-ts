import React from "react";

interface NarrativeContextInfo {
  narrator: string;
  listener: string;
  description: string;
}

interface NarrativeContextDisplayProps {
  narrativeContext: NarrativeContextInfo;
  onClose: () => void;
}

const NarrativeContextDisplay: React.FC<NarrativeContextDisplayProps> = ({ 
  narrativeContext, 
  onClose 
}) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Narrative Context</h3>
      </div>
      <div className="mb-2 p-4 rounded bg-amber-100">
        <div className="flex justify-between">
          <div>
            <span className="font-bold">{narrativeContext.narrator}</span> to <span className="font-bold">{narrativeContext.listener}</span>
          </div>
          <button 
            className="text-gray-500 hover:text-gray-700"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <p className="text-sm mt-2 text-center">{narrativeContext.description}</p>
      </div>
    </div>
  );
};

export default NarrativeContextDisplay;