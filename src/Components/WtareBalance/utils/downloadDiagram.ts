import domtoimage from "dom-to-image";
import { Error } from "../../../utils/toast";

export const downloadDiagramAsImage = async (): Promise<void> => {
  try {
    const reactFlowElement = document.querySelector(".react-flow");
    if (!reactFlowElement) {
      Error("ReactFlow container not found");
      return;
    }

    const tempStyle = document.createElement("style");
    tempStyle.id = "dom-to-image-fix";
    tempStyle.textContent = `
      /* Hide controls and attribution */
      .react-flow__controls {
        display: none !important;
      }
      .react-flow__attribution {
        display: none !important;
      }
      .react-flow__minimap {
        display: none !important;
      }
      
      /* Ensure all text is visible and readable */
      .react-flow__node-label,
      .react-flow__node-text,
      text,
      [class*="label"] {
        color: #000000 !important;
        fill: #000000 !important;
        visibility: visible !important;
        opacity: 1 !important;
      }
      
      /* Fix any oklab color issues */
      [style*="oklab"] {
        color: #000000 !important;
        background-color: #ffffff !important;
      }
    `;

    document.head.appendChild(tempStyle);

    await new Promise((resolve) => setTimeout(resolve, 200));

    let dataUrl: string;

    try {
      const rect = reactFlowElement?.getBoundingClientRect();
      const scrollWidth = Math.max(
        reactFlowElement?.scrollWidth || 0,
        rect?.width || 0,
      );
      const scrollHeight = Math.max(
        reactFlowElement?.scrollHeight || 0,
        rect?.height || 0,
      );

      try {
        const svgDataUrl = await domtoimage.toSvg(
          reactFlowElement as HTMLElement,
          {
            width: scrollWidth,
            height: scrollHeight,
            style: {
              width: `${scrollWidth}px`,
              height: `${scrollHeight}px`,
            },
            filter: (node: any) => {
              if (
                node.classList?.contains("react-flow__controls") ||
                node.classList?.contains("react-flow__attribution") ||
                node.classList?.contains("react-flow__minimap")
              ) {
                return false;
              }
              return true;
            },
          },
        );

        const img = new Image();
        img.crossOrigin = "anonymous";

        dataUrl = await new Promise((resolve, reject) => {
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
      } catch (svgError) {
        console.warn("SVG method failed, trying PNG directly:", svgError);

        dataUrl = await domtoimage.toJpeg(reactFlowElement as HTMLElement, {
          quality: 0.85,
          bgcolor: "#ffffff",
          width: scrollWidth,
          height: scrollHeight,
          style: {
            width: `${scrollWidth}px`,
            height: `${scrollHeight}px`,
          },
          filter: (node: any) => {
            if (
              node.classList?.contains("react-flow__controls") ||
              node.classList?.contains("react-flow__attribution") ||
              node.classList?.contains("react-flow__minimap")
            ) {
              return false;
            }
            return true;
          },
        });
      }
    } catch (domError) {
      console.warn(
        "All dom-to-image methods failed, trying basic method:",
        domError,
      );

      dataUrl = await domtoimage.toJpeg(reactFlowElement as HTMLElement, {
        quality: 0.85,
        bgcolor: "#ffffff",
      });
    }

    const styleElement = document.getElementById("dom-to-image-fix");
    if (styleElement) {
      styleElement.remove();
    }

    const link = document.createElement("a");
    link.download = `Plant-Layout-${
      new Date().toISOString().split("T")[0]
    }.png`;
    link.href = dataUrl;

    document.body.appendChild(link);
    link.click();
    try {
      if (link.parentNode && link.parentNode.contains(link)) {
        link.parentNode.removeChild(link);
      } else if (document.body.contains(link)) {
        document.body.removeChild(link);
      } else {
        link.remove();
      }
    } catch (removeError) {
      console.warn("Error removing download link:", removeError);
    }
  } catch (error) {
    console.log(error);
    const styleElement = document.getElementById("dom-to-image-fix");
    if (styleElement && styleElement.parentNode) {
      try {
        if (styleElement.parentNode.contains(styleElement)) {
          styleElement.parentNode.removeChild(styleElement);
        } else {
          styleElement.remove();
        }
      } catch (styleError) {
        console.warn("Error removing style element:", styleError);
      }
    }
    Error((error as Error).message || "Failed to download diagram image");
  }
};
