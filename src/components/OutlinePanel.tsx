import React, { RefObject } from "react";

interface OutlinePanelProps {
  outline: string[];
  currentOutlineIndex: number;
  onOutlineClick: (index: number) => void;
  outlineContainerRef: RefObject<HTMLDivElement>;
}

const OutlinePanel: React.FC<OutlinePanelProps> = ({
  outline,
  currentOutlineIndex,
  onOutlineClick,
  outlineContainerRef
}) => {
  return (
    <div
      ref={outlineContainerRef}
      className="w-[300px] bg-gray-100 p-4 overflow-y-auto border-r border-gray-200 outline-container"
    >
      <h3 className="font-bold mb-4 text-lg pl-4">प्रसंग</h3>
      {outline.map((item, index) => (
        <div
          key={index}
          className={`mb-2 text-sm cursor-pointer p-2 rounded pl-4 ${
            index === currentOutlineIndex
              ? "bg-blue-100"
              : "hover:bg-gray-200"
          }`}
          onClick={() => onOutlineClick(index)}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default OutlinePanel;