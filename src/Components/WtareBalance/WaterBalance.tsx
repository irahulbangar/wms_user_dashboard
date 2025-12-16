import { useRef, useCallback, useEffect } from "react";
import DiagramPage from "./DiagramPage";
import domtoimage from "dom-to-image";
import { useDiagramSidebar } from "../Layout/RootLayout";

interface WaterBalanceProps {
  onDiagramSidebarToggle?: (isOpen: boolean) => void;
  isDiagramSidebarOpen?: boolean;
}

const WaterBalance = ({
  onDiagramSidebarToggle,
  isDiagramSidebarOpen,
}: WaterBalanceProps) => {
  const context = useDiagramSidebar();

  const finalOnDiagramSidebarToggle =
    onDiagramSidebarToggle || context?.onDiagramSidebarToggle;
  const finalIsDiagramSidebarOpen =
    isDiagramSidebarOpen ?? context?.isDiagramSidebarOpen ?? false;
  const plantDiagramRef = useRef<HTMLDivElement>(null);

  const captureScreenshot = useCallback(async (): Promise<string | null> => {
    if (!plantDiagramRef.current) {
      return null;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const element = plantDiagramRef.current;

      let reactFlowReady = false;
      let reactFlowAttempts = 0;
      const maxReactFlowAttempts = 60;

      while (!reactFlowReady && reactFlowAttempts < maxReactFlowAttempts) {
        const reactFlow = element.querySelector(".react-flow");
        const reactFlowNodes = reactFlow?.querySelectorAll(".react-flow__node");
        const reactFlowEdges = reactFlow?.querySelectorAll(".react-flow__edge");
        const reactFlowViewport = reactFlow?.querySelector(
          ".react-flow__viewport"
        );

        const hasNodes = reactFlowNodes && reactFlowNodes.length > 0;
        const hasEdges = reactFlowEdges && reactFlowEdges.length > 0;
        const hasViewport =
          reactFlowViewport && reactFlowViewport.children.length > 0;
        const hasVisibleContent =
          reactFlowViewport &&
          (reactFlowViewport as HTMLElement).offsetWidth > 0 &&
          (reactFlowViewport as HTMLElement).offsetHeight > 0;
        const hasSVGContent = reactFlowViewport
          ? (reactFlowViewport as HTMLElement).querySelector("svg") !== null
          : false;

        if (
          (hasNodes || hasEdges || hasViewport) &&
          hasVisibleContent &&
          hasSVGContent
        ) {
          reactFlowReady = true;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 300));
          reactFlowAttempts++;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));

      let captureElement: HTMLElement = element;
      const reactFlowViewport = element.querySelector(
        ".react-flow__viewport"
      ) as HTMLElement;
      const reactFlowContainer = element.querySelector(
        ".react-flow"
      ) as HTMLElement;

      if (
        reactFlowViewport &&
        reactFlowViewport.offsetWidth > 0 &&
        reactFlowViewport.offsetHeight > 0
      ) {
        captureElement = reactFlowViewport;
      } else if (
        reactFlowContainer &&
        reactFlowContainer.offsetWidth > 0 &&
        reactFlowContainer.offsetHeight > 0
      ) {
        captureElement = reactFlowContainer;
      } else {
        return null;
      }

      const originalStyle = captureElement.style.cssText;
      const originalParentStyle =
        captureElement.parentElement?.style.cssText || "";

      if (captureElement.parentElement) {
        captureElement.parentElement.style.overflow = "visible";
      }

      captureElement.style.height = "auto";
      captureElement.style.maxHeight = "none";
      captureElement.style.overflow = "visible";
      captureElement.style.position = "relative";

      void captureElement.offsetHeight;
      void captureElement.offsetWidth;

      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => requestAnimationFrame(resolve));
      await new Promise((resolve) => setTimeout(resolve, 300));

      const rect = captureElement.getBoundingClientRect();
      const scrollWidth = Math.max(
        captureElement.scrollWidth || 0,
        captureElement.offsetWidth || 0,
        rect?.width || 0,
        1920
      );
      const scrollHeight = Math.max(
        captureElement.scrollHeight || 0,
        captureElement.offsetHeight || 0,
        rect?.height || 0,
        1080
      );

      if (scrollWidth <= 0 || scrollHeight <= 0) {
        if (originalStyle) {
          captureElement.style.cssText = originalStyle;
        }
        if (originalParentStyle && captureElement.parentElement) {
          captureElement.parentElement.style.cssText = originalParentStyle;
        }
        return null;
      }

      try {
        const svgDataUrl = await domtoimage.toSvg(captureElement, {
          width: scrollWidth,
          height: scrollHeight,
          style: {
            width: `${scrollWidth}px`,
            height: `${scrollHeight}px`,
          },
          quality: 1,
          filter: (node: any) => {
            const el = node as HTMLElement;
            if (
              el.tagName === "NAV" ||
              el.tagName === "BUTTON" ||
              el.classList?.contains("sidebar") ||
              el.classList?.contains("react-flow__controls") ||
              el.classList?.contains("react-flow__minimap") ||
              el.classList?.contains("react-flow__attribution")
            ) {
              return false;
            }
            return true;
          },
        });

        if (originalStyle) {
          captureElement.style.cssText = originalStyle;
        }
        if (originalParentStyle && captureElement.parentElement) {
          captureElement.parentElement.style.cssText = originalParentStyle;
        }

        const img = new Image();
        img.crossOrigin = "anonymous";

        const dataUrl = await new Promise<string>((resolve, reject) => {
          img.onload = () => {
            const canvas = document.createElement("canvas");
            const scale = 1.5;
            canvas.width = scrollWidth * scale;
            canvas.height = scrollHeight * scale;
            const ctx = canvas.getContext("2d");
            if (ctx) {
              ctx.fillStyle = "#ffffff";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              ctx.scale(scale, scale);
              ctx.drawImage(img, 0, 0);
              resolve(canvas.toDataURL("image/jpeg", 0.85));
            } else {
              reject("Could not get canvas context");
            }
          };
          img.onerror = reject;
          img.src = svgDataUrl;
        });

        return dataUrl;
      } catch (svgError) {
        console.warn(
          "[WaterBalance] SVG capture failed, trying JPEG:",
          svgError
        );

        const fallbackOriginalStyle = captureElement.style.cssText;
        const fallbackOriginalParentStyle =
          captureElement.parentElement?.style.cssText || "";

        if (captureElement.parentElement) {
          captureElement.parentElement.style.overflow = "visible";
        }
        captureElement.style.height = "auto";
        captureElement.style.maxHeight = "none";
        captureElement.style.overflow = "visible";
        captureElement.style.position = "relative";

        void captureElement.offsetHeight;
        await new Promise((resolve) => requestAnimationFrame(resolve));
        await new Promise((resolve) => requestAnimationFrame(resolve));

        const jpegDataUrl = await domtoimage.toJpeg(captureElement, {
          width: scrollWidth,
          height: scrollHeight,
          quality: 0.85,
          filter: (node: any) => {
            const el = node as HTMLElement;
            if (
              el.tagName === "BUTTON" ||
              el.classList?.contains("react-flow__controls") ||
              el.classList?.contains("react-flow__minimap") ||
              el.classList?.contains("react-flow__attribution")
            ) {
              return false;
            }
            return true;
          },
        });

        // Restore original styles
        if (fallbackOriginalStyle) {
          captureElement.style.cssText = fallbackOriginalStyle;
        }
        if (fallbackOriginalParentStyle && captureElement.parentElement) {
          captureElement.parentElement.style.cssText =
            fallbackOriginalParentStyle;
        }

        return jpegDataUrl;
      }
    } catch (error) {
      console.error("Failed to capture WaterBalance screenshot:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    (window as any).__capturePlantDiagramScreenshot = captureScreenshot;
    return () => {
      delete (window as any).__capturePlantDiagramScreenshot;
    };
  }, [captureScreenshot]);

  return (
    <div
      ref={plantDiagramRef}
      className="flex flex-col w-full h-full bg-primary"
    >
      <div className="flex-1 overflow-hidden">
        <DiagramPage
          onDiagramSidebarToggle={finalOnDiagramSidebarToggle}
          isDiagramSidebarOpen={finalIsDiagramSidebarOpen}
        />
      </div>
    </div>
  );
};

export default WaterBalance;
