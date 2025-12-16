import { useEffect } from "react";

export const useGlobalWheelHandler = () => {
  useEffect(() => {
    const handleGlobalWheel = (event: WheelEvent) => {
      const reactFlowElement = document.querySelector(
        ".react-flow"
      ) as HTMLElement;
      if (
        !reactFlowElement ||
        !reactFlowElement.contains(event.target as HTMLElement)
      ) {
        return;
      }

      if (event.shiftKey || event.ctrlKey) {
        event.preventDefault();
        event.stopPropagation();

        const viewport = reactFlowElement.querySelector(
          ".react-flow__viewport"
        ) as HTMLElement;
        if (viewport) {
          const currentTransform =
            viewport.style.transform || "translate(0px, 0px) scale(1)";
          const translateMatch = currentTransform.match(
            /translate\(([^,]+),\s*([^)]+)\)/
          );

          let currentX = 0;
          let currentY = 0;

          if (translateMatch) {
            currentX = parseFloat(translateMatch[1].replace("px", ""));
            currentY = parseFloat(translateMatch[2].replace("px", ""));
          }

          const scrollSpeed = 2;
          const newX = currentX - event.deltaY * scrollSpeed;
          const newY = currentY;

          viewport.style.transform = `translate(${newX}px, ${newY}px) scale(1)`;
        }
      }
    };

    document.addEventListener("wheel", handleGlobalWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", handleGlobalWheel);
    };
  }, []);
};
