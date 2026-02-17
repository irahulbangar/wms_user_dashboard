import domtoimage from "dom-to-image";

interface CaptureScreenshotOptions {
  route: string;
  functionName?: string;
  maxWaitTime?: number;
}

export const captureRouteScreenshot = async (
  options: CaptureScreenshotOptions,
): Promise<string | null> => {
  const { route, functionName, maxWaitTime = 30000 } = options;

  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.left = "-9999px";
    iframe.style.top = "0";
    iframe.style.width = "1920px";
    iframe.style.height = "1080px";
    iframe.style.border = "none";
    iframe.style.zIndex = "-1";

    const basePath = (import.meta.env.BASE_URL || "/").replace(/\/$/, "");
    const baseUrl = window.location.origin + basePath;

    const targetRoute = route.startsWith("/") ? route : `/${route}`;
    const fullUrl = new URL(targetRoute, baseUrl + "/").toString();

    console.log(
      `[${functionName}] Loading iframe with browser route: ${fullUrl}`,
    );

    iframe.setAttribute(
      "sandbox",
      "allow-same-origin allow-scripts allow-forms allow-popups",
    );

    iframe.src = fullUrl;

    iframe.style.visibility = "hidden";
    iframe.style.pointerEvents = "none";

    document.body.appendChild(iframe);

    let resolved = false;
    const startTime = Date.now();

    const cleanup = () => {
      if (iframe.parentNode) {
        try {
          document.body.removeChild(iframe);
        } catch {
          // Ignore cleanup errors
        }
      }
      try {
        iframe.src = "about:blank";
      } catch {
        // Ignore errors
      }
    };

    const tryCaptureViaFunction = async (): Promise<string | null> => {
      try {
        const iframeWindow = iframe.contentWindow as any;
        const iframeDoc = iframe.contentDocument || iframeWindow?.document;
        if (!iframeWindow || !iframeDoc) {
          console.warn(
            `[${functionName}] Iframe window or document not available`,
          );
          return null;
        }

        if (functionName === "__capturePlantDiagramScreenshot") {
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } else {
          await new Promise((resolve) => setTimeout(resolve, 3000));
        }

        const currentPath = iframeWindow.location?.pathname || "";
        const expectedRoute = route.startsWith("/") ? route : `/${route}`;
        const routeParts = expectedRoute.split("/").filter(Boolean);

        const actualPath = currentPath;
        const isCorrectRoute =
          routeParts.length > 0 &&
          (actualPath.includes(routeParts[0]) ||
            actualPath === expectedRoute ||
            actualPath.endsWith(expectedRoute));

        console.log(
          `[${functionName}] Route check - current pathname: ${currentPath}, expected: ${expectedRoute}, match: ${isCorrectRoute}`,
        );

        if (actualPath && !isCorrectRoute) {
          const orgComponent = iframeDoc.querySelector(
            '[class*="Organization"], [id*="organization"]',
          );
          if (orgComponent) {
            console.error(
              `[${functionName}] Organization component detected in iframe! Route may be incorrect.`,
            );
          }
          const loginComponent = iframeDoc.querySelector(
            '[class*="Login"], [id*="login"]',
          );
          if (loginComponent) {
            console.error(
              `[${functionName}] Login page detected in iframe! Authentication may be required.`,
            );
          }

          if (
            functionName === "__captureSystemDevicesScreenshot" ||
            functionName === "__captureDepartmentDevicesScreenshot"
          ) {
            const componentContainer = iframeDoc.querySelector(
              "div.flex.flex-col.w-full.h-full",
            );
            if (componentContainer) {
              console.log(
                `[${functionName}] Component container found but route check failed. Current path: ${actualPath}, Expected: ${expectedRoute}. Will continue anyway.`,
              );
            } else {
              console.warn(
                `[${functionName}] Component container not found in iframe. Route may be incorrect or component not mounted yet.`,
              );
            }

            if (functionName === "__captureSystemDevicesScreenshot") {
              const systemHeader = iframeDoc.querySelector(
                '[class*="SystemHeader"]',
              );
              const deviceCards = iframeDoc.querySelectorAll(
                '[class*="DeviceCard"]',
              );
              const analysisCards = iframeDoc.querySelectorAll(
                '[class*="AnalysisPieChartCard"]',
              );
              console.log(
                `[${functionName}] SystemDevices elements check - SystemHeader: ${!!systemHeader}, DeviceCards: ${
                  deviceCards.length
                }, AnalysisCards: ${analysisCards.length}`,
              );
            }
          }
        }

        if (functionName === "__capturePlantDiagramScreenshot") {
          let functionWaitAttempts = 0;
          const maxFunctionWaitAttempts = 20;

          while (
            iframeWindow.__capturePlantDiagramScreenshot === undefined &&
            functionWaitAttempts < maxFunctionWaitAttempts
          ) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            functionWaitAttempts++;
          }

          const hasCaptureFunction =
            iframeWindow.__capturePlantDiagramScreenshot !== undefined;
          const waterBalanceComponent = iframeDoc.querySelector(
            '[class*="WaterBalance"], [class*="plant-diagram"]',
          );
          const diagramPage = iframeDoc.querySelector('[class*="DiagramPage"]');
          const reactFlow = iframeDoc.querySelector(".react-flow");

          console.log(
            `[${functionName}] Component check - hasCaptureFunction: ${hasCaptureFunction}, WaterBalance: ${!!waterBalanceComponent}, DiagramPage: ${!!diagramPage}, ReactFlow: ${!!reactFlow}`,
          );

          if (!hasCaptureFunction) {
            console.error(
              `[${functionName}] Capture function not found after ${maxFunctionWaitAttempts} attempts! Component may not be mounting.`,
            );
          }
        } else if (
          functionName === "__captureDepartmentDevicesScreenshot" ||
          functionName === "__captureSystemDevicesScreenshot"
        ) {
          let functionWaitAttempts = 0;
          const maxFunctionWaitAttempts = 30;

          while (
            iframeWindow[functionName] === undefined &&
            functionWaitAttempts < maxFunctionWaitAttempts
          ) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            functionWaitAttempts++;

            if (functionWaitAttempts % 5 === 0) {
              console.log(
                `[${functionName}] Waiting for capture function... attempt ${functionWaitAttempts}/${maxFunctionWaitAttempts}`,
              );

              const componentContainer = iframeDoc.querySelector(
                "div.flex.flex-col.w-full.h-full",
              );
              if (componentContainer) {
                console.log(
                  `[${functionName}] Component container found but capture function not registered yet`,
                );
              }
            }
          }

          const hasCaptureFunction = iframeWindow[functionName] !== undefined;

          if (!hasCaptureFunction) {
            console.warn(
              `[${functionName}] Capture function not found after ${maxFunctionWaitAttempts} attempts! Component may not be mounting. Will try fallback capture.`,
            );
          } else {
            console.log(
              `[${functionName}] Capture function found after ${functionWaitAttempts} attempts`,
            );
          }
        }

        const initialWait =
          functionName === "__capturePlantDiagramScreenshot"
            ? 3000
            : functionName === "__captureDepartmentDevicesScreenshot" ||
                functionName === "__captureSystemDevicesScreenshot"
              ? 5000
              : 2000;
        await new Promise((resolve) => setTimeout(resolve, initialWait));

        let attempts = 0;
        const maxAttempts = 60;
        let hasCalledCaptureFunction = false;

        while (attempts < maxAttempts) {
          let componentReady = false;

          if (functionName === "__capturePlantDiagramScreenshot") {
            const hasCaptureFunction =
              iframeWindow.__capturePlantDiagramScreenshot !== undefined;
            const mainElement = iframeDoc.querySelector("main");
            const reactFlow = mainElement?.querySelector(".react-flow");
            const reactFlowViewport = reactFlow?.querySelector(
              ".react-flow__viewport",
            );
            const hasSVG = reactFlowViewport?.querySelector("svg") !== null;
            const hasViewportSize =
              reactFlowViewport &&
              (reactFlowViewport as HTMLElement).offsetWidth > 0 &&
              (reactFlowViewport as HTMLElement).offsetHeight > 0;

            componentReady = hasCaptureFunction;

            if (attempts % 5 === 0) {
              console.log(
                `[${functionName}] Component ready check - hasFunction: ${hasCaptureFunction}, reactFlow: ${!!reactFlow}, hasSVG: ${hasSVG}, hasSize: ${hasViewportSize}, ready: ${componentReady}`,
              );
            }
          } else if (
            functionName === "__captureDepartmentDevicesScreenshot" ||
            functionName === "__captureSystemDevicesScreenshot"
          ) {
            const hasCaptureFunction =
              functionName === "__captureDepartmentDevicesScreenshot"
                ? iframeWindow.__captureDepartmentDevicesScreenshot !==
                  undefined
                : iframeWindow.__captureSystemDevicesScreenshot !== undefined;

            const mainElement = iframeDoc.querySelector("main");
            const componentContainer = iframeDoc.querySelector(
              "div.flex.flex-col.w-full.h-full",
            );
            const bodyElement = iframeDoc.body;

            const searchRoot = componentContainer || mainElement || bodyElement;

            const hasSkeletons =
              (searchRoot?.querySelectorAll(
                '[class*="animate-pulse"]:not([style*="display: none"])',
              ).length || 0) > 0;
            const hasCharts =
              (searchRoot?.querySelectorAll("canvas").length || 0) > 0;
            const hasTables =
              (searchRoot?.querySelectorAll(
                "table tbody tr:not([class*='animate-pulse'])",
              ).length || 0) > 0;

            const hasUIElements =
              (searchRoot?.querySelectorAll(
                ".bg-card, [class*='card'], [class*='chart'], table",
              ).length || 0) > 0;

            componentReady =
              hasCaptureFunction &&
              (mainElement !== null || componentContainer !== null) &&
              !hasSkeletons &&
              (hasCharts || hasTables || hasUIElements || attempts >= 10);

            if (attempts % 5 === 0) {
              console.log(
                `[${functionName}] Component ready check - hasFunction: ${hasCaptureFunction}, hasMain: ${!!mainElement}, hasContainer: ${!!componentContainer}, hasSkeletons: ${hasSkeletons}, hasCharts: ${hasCharts}, hasTables: ${hasTables}, hasUIElements: ${hasUIElements}, ready: ${componentReady}`,
              );
            }
          } else {
            const mainElement = iframeDoc.querySelector("main");
            componentReady = mainElement && mainElement.children.length > 0;
          }

          if (
            functionName &&
            iframeWindow[functionName] &&
            !hasCalledCaptureFunction
          ) {
            const shouldTryCapture =
              functionName === "__capturePlantDiagramScreenshot"
                ? iframeWindow.__capturePlantDiagramScreenshot && attempts >= 5
                : functionName === "__captureDepartmentDevicesScreenshot" ||
                    functionName === "__captureSystemDevicesScreenshot"
                  ? (componentReady && attempts >= 10) ||
                    (iframeWindow[functionName] && attempts >= 20) ||
                    attempts >= 40
                  : (componentReady && attempts >= 10) || attempts >= 30;

            if (shouldTryCapture) {
              hasCalledCaptureFunction = true;
              try {
                const preCallWait =
                  functionName === "__capturePlantDiagramScreenshot"
                    ? 3000
                    : functionName === "__captureDepartmentDevicesScreenshot" ||
                        functionName === "__captureSystemDevicesScreenshot"
                      ? 3000
                      : 1000;
                await new Promise((resolve) =>
                  setTimeout(resolve, preCallWait),
                );

                const screenshot = await iframeWindow[functionName]();
                if (
                  screenshot &&
                  screenshot.trim() !== "" &&
                  screenshot.startsWith("data:")
                ) {
                  return screenshot;
                } else {
                  hasCalledCaptureFunction = false;
                }
              } catch (funcError) {
                console.error(
                  `[${functionName}] Failed to call capture function:`,
                  funcError,
                );
                if (attempts < maxAttempts - 1) {
                  hasCalledCaptureFunction = false;
                } else {
                  console.warn(
                    `[${functionName}] Max attempts reached after error, will use fallback capture`,
                  );
                }
              }
            }
          }

          attempts++;

          if (hasCalledCaptureFunction && attempts < maxAttempts - 1) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            hasCalledCaptureFunction = false;
            continue;
          }

          if (attempts >= maxAttempts) {
            break;
          }

          if (!hasCalledCaptureFunction) {
            await new Promise((resolve) => setTimeout(resolve, 500));
          } else {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            break;
          }
        }

        if (iframeDoc) {
          const images = iframeDoc.querySelectorAll("img");
          const imagePromises = Array.from(images).map((img) => {
            const htmlImg = img as HTMLImageElement;
            if (htmlImg.complete) return Promise.resolve();
            return new Promise((resolve) => {
              htmlImg.onload = resolve;
              htmlImg.onerror = resolve;
            });
          });
          await Promise.all(imagePromises);

          let fullPageElement =
            iframeDoc.querySelector("main.overflow-y-auto") ||
            iframeDoc.querySelector("main") ||
            iframeDoc.querySelector("div.min-h-full") ||
            iframeDoc.body ||
            iframeDoc.documentElement;

          if (
            fullPageElement &&
            fullPageElement.classList?.contains("h-screen")
          ) {
            const scrollableContent =
              fullPageElement.querySelector("main") ||
              fullPageElement.querySelector("[class*='overflow']") ||
              fullPageElement.querySelector("div.flex-1");
            if (scrollableContent) {
              fullPageElement = scrollableContent as HTMLElement;
            }
          }

          if (fullPageElement) {
            void (fullPageElement as HTMLElement).offsetHeight;

            const rect = fullPageElement.getBoundingClientRect();
            const element = fullPageElement as HTMLElement;

            const scrollWidth = Math.max(
              element.scrollWidth || 0,
              element.offsetWidth || 0,
              rect?.width || 0,
              1920,
            );
            const scrollHeight = Math.max(
              element.scrollHeight || 0,
              element.offsetHeight || 0,
              element.clientHeight || 0,
              rect?.height || 0,
              1080,
            );

            try {
              const jpegDataUrl = await domtoimage.toJpeg(
                fullPageElement as HTMLElement,
                {
                  width: scrollWidth,
                  height: scrollHeight,
                  quality: 0.85,
                  filter: (node: any) => {
                    const el = node as HTMLElement;
                    if (
                      el.style?.display === "none" ||
                      el.style?.visibility === "hidden"
                    ) {
                      return false;
                    }
                    return true;
                  },
                },
              );
              return jpegDataUrl;
            } catch (error) {
              console.error("Full page capture failed:", error);
            }
          }
        }
      } catch (error) {
        console.error("Failed to call capture function:", error);
      }
      return null;
    };

    const checkContent = async () => {
      if (resolved) return;

      try {
        const iframeDoc =
          iframe.contentDocument || iframe.contentWindow?.document;
        if (!iframeDoc) {
          if (Date.now() - startTime < maxWaitTime) {
            setTimeout(checkContent, 100);
            return;
          }
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve(null);
          }
          return;
        }

        const bodyElement = iframeDoc.body || iframeDoc.documentElement;
        if (!bodyElement) {
          if (Date.now() - startTime < maxWaitTime) {
            setTimeout(checkContent, 100);
            return;
          }
          if (!resolved) {
            resolved = true;
            cleanup();
            resolve(null);
          }
          return;
        }

        const rootElement = (bodyElement.querySelector("#root") ||
          bodyElement) as HTMLElement;
        const hasReactContent =
          rootElement.children.length > 0 &&
          (rootElement.querySelector("div") ||
            (rootElement.innerText || rootElement.textContent || "").trim()
              .length > 50);

        let hasComponentContainer = false;
        if (
          functionName === "__captureSystemDevicesScreenshot" ||
          functionName === "__captureDepartmentDevicesScreenshot"
        ) {
          const componentContainer = rootElement.querySelector(
            "div.flex.flex-col.w-full.h-full",
          );
          hasComponentContainer = componentContainer !== null;
          if (hasComponentContainer) {
            console.log(
              `[${functionName}] Component container found, considering React content available`,
            );
          }
        }

        const hasContent = hasReactContent || hasComponentContainer;

        if (!hasContent) {
          if (Date.now() - startTime < maxWaitTime) {
            setTimeout(checkContent, 100);
            return;
          }
          if (!resolved) {
            console.error(
              `[${functionName}] No React content or component container found after ${maxWaitTime}ms timeout`,
            );
            resolved = true;
            cleanup();
            resolve(null);
          }
          return;
        }

        let functionCheckAttempts = 0;
        const adjustedMaxWaitTime =
          functionName === "__captureSystemDevicesScreenshot"
            ? maxWaitTime * 1.5 // 50% more time for SystemDevices
            : maxWaitTime;
        const maxAttempts = Math.floor(adjustedMaxWaitTime / 500);

        const functionCheck = async () => {
          functionCheckAttempts++;

          const screenshot = await tryCaptureViaFunction();
          if (
            screenshot &&
            screenshot.trim() !== "" &&
            screenshot.startsWith("data:")
          ) {
            if (!resolved) {
              resolved = true;
              cleanup();
              resolve(screenshot);
            }
            return;
          }

          const currentElapsed = Date.now() - startTime;
          if (
            currentElapsed < adjustedMaxWaitTime &&
            functionCheckAttempts < maxAttempts
          ) {
            setTimeout(functionCheck, 300);
          } else {
            setTimeout(async () => {
              if (resolved) return;
              const iframeDoc =
                iframe.contentDocument || iframe.contentWindow?.document;
              if (!iframeDoc) {
                cleanup();
                resolve(null);
                return;
              }

              const images = iframeDoc.querySelectorAll("img");
              const imagePromises = Array.from(images).map((img) => {
                if ((img as HTMLImageElement).complete)
                  return Promise.resolve();
                return new Promise((resolve) => {
                  img.onload = resolve;
                  img.onerror = resolve;
                  setTimeout(resolve, 1000);
                });
              });
              await Promise.all(imagePromises);

              await new Promise((resolve) => setTimeout(resolve, 100));

              const bodyElement = iframeDoc.body || iframeDoc.documentElement;
              const rootElement = (bodyElement.querySelector("#root") ||
                bodyElement) as HTMLElement;

              let mainContent: HTMLElement | null = null;

              if (
                functionName === "__captureSystemDevicesScreenshot" ||
                functionName === "__captureDepartmentDevicesScreenshot"
              ) {
                const containerDiv = rootElement.querySelector(
                  "div.flex.flex-col.w-full.h-full",
                ) as HTMLElement;
                if (containerDiv && containerDiv.offsetHeight > 0) {
                  mainContent = containerDiv;
                } else {
                  const selectors = [
                    "div.flex.flex-col",
                    "[class*='flex'][class*='flex-col']",
                  ];
                  for (const selector of selectors) {
                    const div = rootElement.querySelector(
                      selector,
                    ) as HTMLElement;
                    if (div && div.offsetHeight > 100) {
                      mainContent = div;
                      break;
                    }
                  }
                }
              }

              if (!mainContent) {
                mainContent = (rootElement.querySelector(
                  "main.overflow-y-auto",
                ) ||
                  rootElement.querySelector("main") ||
                  rootElement.querySelector("div.min-h-full") ||
                  rootElement.querySelector("body") ||
                  rootElement) as HTMLElement;
              }

              if (
                mainContent &&
                (mainContent as HTMLElement).classList?.contains("h-screen")
              ) {
                const scrollableContent =
                  (mainContent as HTMLElement).querySelector("main") ||
                  (mainContent as HTMLElement).querySelector(
                    "[class*='overflow']",
                  ) ||
                  (mainContent as HTMLElement).querySelector("div.flex-1");
                if (scrollableContent) {
                  mainContent = scrollableContent as HTMLElement;
                }
              }

              void (mainContent as HTMLElement).offsetHeight;

              const rect = mainContent.getBoundingClientRect();
              const element = mainContent as HTMLElement;

              const scrollWidth = Math.max(
                element.scrollWidth || 0,
                element.offsetWidth || 0,
                rect?.width || 0,
                1920,
              );
              const scrollHeight = Math.max(
                element.scrollHeight || 0,
                element.offsetHeight || 0,
                element.clientHeight || 0,
                rect?.height || 0,
                1080,
              );

              try {
                const jpegDataUrl = await domtoimage.toJpeg(mainContent, {
                  width: scrollWidth,
                  height: scrollHeight,
                  quality: 0.85,
                  filter: (node: any) => {
                    const el = node as HTMLElement;
                    if (
                      el.style?.display === "none" ||
                      el.style?.visibility === "hidden"
                    ) {
                      return false;
                    }
                    return true;
                  },
                });
                cleanup();
                resolve(jpegDataUrl);
              } catch (jpegError) {
                console.error(
                  `[${functionName}] Fallback JPEG capture failed:`,
                  jpegError,
                );
                cleanup();
                resolve(null);
              }
            }, 2000);
          }
        };

        const initialWait =
          functionName === "__capturePlantDiagramScreenshot"
            ? 12000
            : functionName === "__captureDepartmentDevicesScreenshot" ||
                functionName === "__captureSystemDevicesScreenshot"
              ? 6000
              : 3000;
        setTimeout(() => {
          functionCheck();
        }, initialWait);
      } catch {
        if (Date.now() - startTime < maxWaitTime) {
          setTimeout(checkContent, 500);
          return;
        }
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(null);
        }
      }
    };

    iframe.onload = () => {
      const onloadDelay =
        functionName === "__capturePlantDiagramScreenshot" ? 4000 : 2000;
      setTimeout(() => {
        checkContent();
      }, onloadDelay);
    };

    iframe.onerror = () => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(null);
      }
    };

    setTimeout(() => {
      if (!resolved) {
        checkContent();
      }
    }, 300);

    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve(null);
      }
    }, maxWaitTime + 10000);
  });
};
