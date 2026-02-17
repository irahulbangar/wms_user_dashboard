import { useState, useEffect, useCallback } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  Info,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Download,
  Mouse,
  Move,
} from "lucide-react";

interface ZoomControlsProps {
  onDownload: () => void;
}

const ZoomControls = ({ onDownload }: ZoomControlsProps) => {
  const { zoomIn, zoomOut, fitView, setCenter, getNodes } = useReactFlow();
  const [isInfoDropdownOpen, setIsInfoDropdownOpen] = useState(false);

  const handleZoomIn = useCallback(() => {
    zoomIn();
  }, [zoomIn]);

  const handleZoomOut = useCallback(() => {
    zoomOut();
  }, [zoomOut]);

  const handleFitView = useCallback(() => {
    fitView();
  }, [fitView]);

  const handleResetView = useCallback(() => {
    window.location.reload();
    const nodes = getNodes();
    if (nodes.length > 0) {
      const bounds = nodes.reduce(
        (acc: any, node: any) => {
          const x = node.position.x;
          const y = node.position.y;
          const width = node.width || 100;
          const height = node.height || 100;

          return {
            minX: Math.min(acc.minX, x),
            maxX: Math.max(acc.maxX, x + width),
            minY: Math.min(acc.minY, y),
            maxY: Math.max(acc.maxY, y + height),
          };
        },
        {
          minX: Infinity,
          maxX: -Infinity,
          minY: Infinity,
          maxY: -Infinity,
        },
      );

      const centerX = (bounds.minX + bounds.maxX) / 2;
      const centerY = (bounds.minY + bounds.maxY) / 2;
      setCenter(centerX, centerY, { zoom: 0.8 });
    } else {
      setCenter(0, 0, { zoom: 1 });
    }
  }, [getNodes, setCenter]);

  const handleInfo = useCallback(() => {
    setIsInfoDropdownOpen(!isInfoDropdownOpen);
  }, [isInfoDropdownOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isInfoDropdownOpen && !target.closest(".diagram-zoom-controls")) {
        setIsInfoDropdownOpen(false);
      }
    };

    if (isInfoDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isInfoDropdownOpen]);

  return (
    <div className="diagram-zoom-controls relative">
      <button onClick={handleInfo} title="Info" className="zoom-control-btn">
        <Info className="w-4 h-4 text-status-warning hover:text-status-warning/80" />
      </button>
      <button
        onClick={handleZoomOut}
        title="Zoom Out"
        className="zoom-control-btn"
      >
        <ZoomOut className="w-4 h-4 text-status-success hover:text-status-success/80" />
      </button>
      <button
        onClick={handleFitView}
        title="Fit to Screen"
        className="zoom-control-btn"
      >
        <Maximize2 className="w-4 h-4 text-status-info hover:text-status-info/80" />
      </button>
      <button
        onClick={handleZoomIn}
        title="Zoom In"
        className="zoom-control-btn"
      >
        <ZoomIn className="w-4 h-4 text-status-success hover:text-status-success/80" />
      </button>
      <button
        onClick={handleResetView}
        title="Reset View"
        className="zoom-control-btn"
      >
        <RotateCcw className="w-4 h-4 text-text-primary hover:text-text-primary/80" />
      </button>
      <button
        onClick={onDownload}
        title="Download Diagram"
        className="zoom-control-btn"
      >
        <Download className="w-4 h-4 text-status-info hover:text-status-info/80" />
      </button>

      {isInfoDropdownOpen && (
        <div className="absolute top-12 right-0 bg-primary border border-border-primary rounded-lg shadow-lg z-50 min-w-80 p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-normal text-text-primary font-roboto border-b border-border-primary pb-2">
              Diagram Information
            </h3>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Mouse className="w-4 h-4 text-status-warning" />
                <span className="text-xs text-status-warning font-roboto">
                  <span className="font-normal">Horizontal Movement:</span>{" "}
                  Shift + Wheel or Ctrl + Wheel
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-status-success" />
                <span className="text-xs text-status-success font-roboto">
                  <span className="font-normal">Diagram Panning :</span> Click
                  and Drag
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-status-info" />
                <span className="text-xs text-status-info font-roboto">
                  <span className="font-normal">System Group Zoom:</span> Double
                  Click
                </span>
              </div>

              <div className="flex items-center gap-2">
                <ZoomIn className="w-4 h-4 text-status-success" />
                <span className="text-xs text-status-success font-roboto">
                  <span className="font-normal">Zoom In :</span> Use buttons
                  above
                </span>
              </div>

              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-status-info" />
                <span className="text-xs text-status-info font-roboto">
                  <span className="font-normal">Reset View :</span> Use buttons
                  above
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ZoomOut className="w-4 h-4 text-status-success" />
                <span className="text-xs text-status-success font-roboto">
                  <span className="font-normal">Zoom Out :</span> Use buttons
                  above
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-border-primary flex justify-end">
              <button
                onClick={() => setIsInfoDropdownOpen(false)}
                className="w-fit text-xs text-text-secondary bg-secondary cursor-pointer justify-end hover:text-text-primary font-roboto transition-colors flex items-center gap-2 px-2 py-1 rounded-md"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ZoomControls;
