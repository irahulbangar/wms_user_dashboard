import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  className?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = true,
  className = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      className={`bg-secondary rounded-lg border border-border-primary ${className}`}
    >
      <button
        onClick={toggleExpanded}
        className={`w-full px-4 py-3 flex items-center justify-between hover:bg-primary transition-colors duration-200 ${
          isExpanded ? "hover:rounded-t-lg" : "hover:rounded-lg"
        }`}
      >
        <h4 className="text-xl font-normal text-text-primary font-roboto whitespace-nowrap">
          {title}
        </h4>
        <div className="flex items-center cursor-pointer">
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-text-secondary" />
          ) : (
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          )}
        </div>
      </button>

      {isExpanded && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
};

export default CollapsibleSection;
