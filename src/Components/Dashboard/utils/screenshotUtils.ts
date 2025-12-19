import { type RefObject } from "react";
import domtoimage from "dom-to-image";
import { captureRouteScreenshot } from "../../../utils/screenshotCapture";

export const captureDashboardScreenshot = async (
  dashboardRef: RefObject<HTMLDivElement>
): Promise<string | null> => {
  if (!dashboardRef.current) return null;

  let originalStyle = "";
  let originalContentStyle = "";
  let originalOverflowStyle = "";

  try {
    const dashboardElement = dashboardRef.current;

    originalStyle = dashboardElement.style.cssText;

    const contentContainer = dashboardElement.querySelector(
      ".flex.flex-col.gap-3.overflow-y-auto"
    ) as HTMLElement | null;

    if (contentContainer) {
      originalContentStyle = contentContainer.style.cssText;
      originalOverflowStyle = contentContainer.style.overflow || "";
    }

    dashboardElement.style.height = "auto";
    dashboardElement.style.maxHeight = "none";
    dashboardElement.style.overflow = "visible";

    if (contentContainer) {
      contentContainer.style.overflow = "visible";
      contentContainer.style.height = "auto";
      contentContainer.style.maxHeight = "none";
    }

    const loadingIndicator = dashboardElement.querySelector(
      '[class*="animate-pulse"][class*="status-warning"]'
    ) as HTMLElement | null;
    const originalDisplay = loadingIndicator?.style.display;
    if (loadingIndicator) {
      loadingIndicator.style.display = "none";
    }

    const progressBar = dashboardElement.querySelector(
      '[data-exclude-from-screenshot="true"]'
    ) as HTMLElement | null;
    const originalProgressDisplay = progressBar?.style.display;
    if (progressBar) {
      progressBar.style.display = "none";
    }

    const images = dashboardElement.querySelectorAll("img");
    const imagePromises = Array.from(images).map((img) => {
      if ((img as HTMLImageElement).complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
        setTimeout(resolve, 2000);
      });
    });
    await Promise.all(imagePromises);

    let chartDimensionReady = false;
    let chartDimensionAttempts = 0;
    const maxChartDimensionAttempts = 50;
    while (
      !chartDimensionReady &&
      chartDimensionAttempts < maxChartDimensionAttempts
    ) {
      const canvases = dashboardElement.querySelectorAll("canvas");
      let allHaveDimensions = true;
      let hasContent = false;

      if (canvases.length > 0) {
        for (const canvas of Array.from(canvases)) {
          const htmlCanvas = canvas as HTMLCanvasElement;
          if (htmlCanvas.width === 0 || htmlCanvas.height === 0) {
            allHaveDimensions = false;
            break;
          }
          try {
            const ctx = htmlCanvas.getContext("2d", {
              willReadFrequently: true,
            });
            if (ctx && htmlCanvas.width > 0 && htmlCanvas.height > 0) {
              const centerX = Math.floor(htmlCanvas.width / 2);
              const centerY = Math.floor(htmlCanvas.height / 2);
              const imageData = ctx.getImageData(centerX, centerY, 1, 1);
              if (imageData.data[3] > 0) {
                hasContent = true;
              }
            }
          } catch {
            // Continue checking
          }
        }
        chartDimensionReady =
          allHaveDimensions && (canvases.length === 0 || hasContent);
      } else {
        chartDimensionReady = true;
      }

      if (!chartDimensionReady) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        chartDimensionAttempts++;
      }
    }

    let contentReady = false;
    let contentAttempts = 0;
    const maxContentAttempts = 30;
    while (!contentReady && contentAttempts < maxContentAttempts) {
      const lineChart = dashboardElement.querySelector(
        '[class*="h-[300px]"], [class*="min-h-[300px]"]'
      );
      const balanceTable = dashboardElement.querySelector("table tbody");
      const departmentCards = dashboardElement.querySelectorAll(
        '[class*="DepartmentBalance"], [class*="department-balance"]'
      );

      const hasLineChart = lineChart !== null;
      const hasTable = balanceTable
        ? balanceTable.querySelectorAll("tr").length > 0
        : false;
      const hasCards = departmentCards.length > 0;

      let lineChartHasContent = false;
      if (lineChart) {
        const lineChartCanvas = lineChart.querySelector(
          "canvas"
        ) as HTMLCanvasElement | null;
        if (
          lineChartCanvas &&
          lineChartCanvas.width > 0 &&
          lineChartCanvas.height > 0
        ) {
          try {
            const ctx = lineChartCanvas.getContext("2d", {
              willReadFrequently: true,
            });
            if (ctx) {
              const centerX = Math.floor(lineChartCanvas.width / 2);
              const centerY = Math.floor(lineChartCanvas.height / 2);
              const imageData = ctx.getImageData(centerX, centerY, 1, 1);
              lineChartHasContent = imageData.data[3] > 0;
            }
          } catch {
            // Continue checking
          }
        }
      }

      contentReady = Boolean(
        hasLineChart &&
          (lineChartHasContent || !lineChart) &&
          hasTable &&
          (hasCards || departmentCards.length === 0)
      );

      if (contentAttempts % 5 === 0) {
        console.log(
          `[Dashboard Screenshot] Content ready check - lineChart: ${hasLineChart}, lineChartContent: ${lineChartHasContent}, table: ${hasTable}, cards: ${hasCards}, ready: ${contentReady}`
        );
      }

      if (!contentReady) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        contentAttempts++;
      }
    }

    console.log(
      `[Dashboard Screenshot] Content ready after ${contentAttempts} attempts. Line chart: ${
        dashboardElement.querySelector(
          '[class*="h-[300px]"], [class*="min-h-[300px]"]'
        ) !== null
      }, Table: ${
        dashboardElement.querySelector("table tbody") !== null
      }, Cards: ${
        dashboardElement.querySelectorAll(
          '[class*="DepartmentBalance"], [class*="department-balance"]'
        ).length
      }`
    );

    await new Promise((resolve) => setTimeout(resolve, 1000));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => requestAnimationFrame(resolve));
    await new Promise((resolve) => setTimeout(resolve, 500));

    void dashboardElement.offsetHeight;
    void dashboardElement.offsetWidth;
    void dashboardElement.scrollHeight;
    void dashboardElement.scrollWidth;

    const allHeights = [
      dashboardElement.scrollHeight,
      dashboardElement.offsetHeight,
      dashboardElement.clientHeight,
      dashboardElement.getBoundingClientRect().height,
    ].filter((h) => h > 0);

    const allWidths = [
      dashboardElement.scrollWidth,
      dashboardElement.offsetWidth,
      dashboardElement.clientWidth,
      dashboardElement.getBoundingClientRect().width,
    ].filter((w) => w > 0);

    const scrollWidth = Math.max(...allWidths, 1920);
    const scrollHeight = Math.max(...allHeights, 2000);

    try {
      const svgDataUrl = await domtoimage.toSvg(dashboardElement, {
        width: scrollWidth,
        height: scrollHeight,
        style: {
          width: `${scrollWidth}px`,
          height: `${scrollHeight}px`,
        },
        quality: 1,
        filter: (node: any) => {
          const element = node as HTMLElement;

          if (
            element.getAttribute?.("data-exclude-from-screenshot") === "true"
          ) {
            return false;
          }

          let parent = element.parentElement;
          while (parent) {
            if (
              parent.getAttribute?.("data-exclude-from-screenshot") === "true"
            ) {
              return false;
            }
            parent = parent.parentElement;
          }

          if (element.tagName === "BUTTON") {
            const buttonText = element.textContent?.toLowerCase() || "";
            if (buttonText.includes("download")) {
              return false;
            }
          }
          if (element.className && typeof element.className === "string") {
            const className = element.className;
            if (
              className.includes("animate-pulse") &&
              className.includes("status-warning")
            ) {
              const text = element.textContent?.toLowerCase() || "";
              if (
                text.includes("generating report") ||
                text.includes("please wait")
              ) {
                return false;
              }
            }
          }
          parent = element.parentElement;
          while (parent) {
            if (
              parent.className &&
              typeof parent.className === "string" &&
              parent.className.includes("animate-pulse") &&
              parent.className.includes("status-warning")
            ) {
              const text = parent.textContent?.toLowerCase() || "";
              if (
                text.includes("generating report") ||
                text.includes("please wait")
              ) {
                return false;
              }
            }
            parent = parent.parentElement;
          }
          return true;
        },
      });

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

      if (dashboardRef.current && originalStyle) {
        dashboardRef.current.style.cssText = originalStyle;
      }
      const contentContainerToRestore = dashboardRef.current?.querySelector(
        ".flex.flex-col.gap-3.overflow-y-auto"
      ) as HTMLElement | null;
      if (contentContainerToRestore && originalContentStyle) {
        contentContainerToRestore.style.cssText = originalContentStyle;
      } else if (contentContainerToRestore && originalOverflowStyle) {
        contentContainerToRestore.style.overflow = originalOverflowStyle;
      }

      if (loadingIndicator) {
        loadingIndicator.style.display = originalDisplay || "";
      }
      if (progressBar) {
        progressBar.style.display = originalProgressDisplay || "";
      }

      return dataUrl;
    } catch (svgError) {
      console.warn("SVG capture failed, trying PNG:", svgError);
      const jpegDataUrl = await domtoimage.toJpeg(dashboardElement, {
        width: scrollWidth,
        height: scrollHeight,
        quality: 0.85,
        filter: (node: any) => {
          const element = node as HTMLElement;

          if (
            element.getAttribute?.("data-exclude-from-screenshot") === "true"
          ) {
            return false;
          }

          let parent = element.parentElement;
          while (parent) {
            if (
              parent.getAttribute?.("data-exclude-from-screenshot") === "true"
            ) {
              return false;
            }
            parent = parent.parentElement;
          }

          if (element.tagName === "BUTTON") {
            const buttonText = element.textContent?.toLowerCase() || "";
            if (buttonText.includes("download")) {
              return false;
            }
          }
          return true;
        },
      });

      if (dashboardRef.current && originalStyle) {
        dashboardRef.current.style.cssText = originalStyle;
      }
      const contentContainerToRestore = dashboardRef.current?.querySelector(
        ".flex.flex-col.gap-3.overflow-y-auto"
      ) as HTMLElement | null;
      if (contentContainerToRestore && originalContentStyle) {
        contentContainerToRestore.style.cssText = originalContentStyle;
      } else if (contentContainerToRestore && originalOverflowStyle) {
        contentContainerToRestore.style.overflow = originalOverflowStyle;
      }

      if (loadingIndicator) {
        loadingIndicator.style.display = originalDisplay || "";
      }
      if (progressBar) {
        progressBar.style.display = originalProgressDisplay || "";
      }

      return jpegDataUrl;
    }
  } catch (error) {
    console.error("Failed to capture dashboard screenshot:", error);

    if (dashboardRef.current && originalStyle) {
      dashboardRef.current.style.cssText = originalStyle;
    }
    const contentContainerToRestore = dashboardRef.current?.querySelector(
      ".flex.flex-col.gap-3.overflow-y-auto"
    ) as HTMLElement | null;
    if (contentContainerToRestore && originalContentStyle) {
      contentContainerToRestore.style.cssText = originalContentStyle;
    } else if (contentContainerToRestore && originalOverflowStyle) {
      contentContainerToRestore.style.overflow = originalOverflowStyle;
    }

    const loadingIndicator = dashboardRef.current?.querySelector(
      '[class*="animate-pulse"][class*="status-warning"]'
    ) as HTMLElement | null;
    if (loadingIndicator) {
      loadingIndicator.style.display = "";
    }
    const progressBar = dashboardRef.current?.querySelector(
      '[data-exclude-from-screenshot="true"]'
    ) as HTMLElement | null;
    if (progressBar) {
      progressBar.style.display = "";
    }
    return null;
  }
};

export const captureDepartmentScreenshot = async (
  departmentId: number | null
): Promise<string | null> => {
  const organizationId = localStorage.getItem("organizationId");
  const plantId = localStorage.getItem("plantId");

  if (!organizationId || !plantId || !departmentId) {
    console.warn("Missing required IDs for department route");
    return null;
  }

  return captureRouteScreenshot({
    route: `/department/device/${organizationId}/${plantId}/${departmentId}`,
    functionName: "__captureDepartmentDevicesScreenshot",
  });
};

export const captureSystemScreenshot = async (
  systemId: number | null
): Promise<string | null> => {
  const organizationId = localStorage.getItem("organizationId");
  const plantId = localStorage.getItem("plantId");

  if (!organizationId || !plantId || !systemId) {
    console.warn(
      `[captureSystemScreenshot] Missing required IDs - organizationId: ${organizationId}, plantId: ${plantId}, systemId: ${systemId}`
    );
    return null;
  }

  const route = `/system/device/${organizationId}/${plantId}/${systemId}`;
  console.log(
    `[captureSystemScreenshot] Starting capture for system ${systemId} at route: ${route}`
  );

  try {
    const result = await captureRouteScreenshot({
      route,
      functionName: "__captureSystemDevicesScreenshot",
      maxWaitTime: 45000,
    });

    if (result) {
      console.log(
        `[captureSystemScreenshot] ✅ Successfully captured screenshot for system ${systemId}, length: ${result.length}`
      );
    } else {
      console.error(
        `[captureSystemScreenshot] ❌ Failed to capture screenshot for system ${systemId} - returned null. This could be due to:`
      );
    }

    return result;
  } catch (error) {
    console.error(
      `[captureSystemScreenshot] ❌ Error capturing screenshot for system ${systemId}:`,
      error
    );
    return null;
  }
};

export const capturePlantDiagramScreenshot = async (): Promise<
  string | null
> => {
  return captureRouteScreenshot({
    route: "/plant-layout",
    functionName: "__capturePlantDiagramScreenshot",
  });
};
