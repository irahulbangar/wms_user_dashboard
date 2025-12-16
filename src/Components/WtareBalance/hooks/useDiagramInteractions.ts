import { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useReactFlow } from "@xyflow/react";

interface UseDiagramInteractionsParams {
  devices: any[];
  isSidebarOpen: boolean;
  setSelectedNode: (node: any) => void;
  handleSidebarToggle: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  zoomToGroup: (groupId: string) => void;
}

export const useDiagramInteractions = ({
  isSidebarOpen,
  setSelectedNode,
  handleSidebarToggle,
  openSidebar,
  closeSidebar,
  zoomToGroup,
}: UseDiagramInteractionsParams) => {
  const navigate = useNavigate();
  const { getNodes, screenToFlowPosition } = useReactFlow();
  const isZoomingRef = useRef(false);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: any) => {
      setSelectedNode(node);

      if (!isSidebarOpen) {
        handleSidebarToggle();
      }

      if (node?.type && node?.type !== "group") {
        const deviceType = node?.type || node?.data?.deviceType;
        const deviceId = node?.data?.deviceId || node?.id;

        switch (deviceType) {
          case "tank":
            navigate(`/device-details/tank-device/${deviceId}`);
            break;
          case "fm":
            navigate(`/device-details/fm-device/${deviceId}`);
            break;
          case "brwhms":
            navigate(`/device-details/brwhms-device/${deviceId}`);
            break;
          case "phmc":
            navigate(`/device-details/phmc-device/${deviceId}`);
            break;
          case "arg":
            navigate(`/device-details/arg-device/${deviceId}`);
            break;
          case "virtual":
          case "resultant":
            // Virtual devices don't have detail pages, just show in sidebar
            break;
          default:
        }
      }
    },
    [navigate, isSidebarOpen, handleSidebarToggle, setSelectedNode]
  );

  const handleDoubleClick = useCallback(
    (event: React.MouseEvent, node: any) => {
      if (node && node.type === "group") {
        event.preventDefault();
        event.stopPropagation();

        const wasSidebarOpen = isSidebarOpen;
        isZoomingRef.current = true;

        if (wasSidebarOpen) {
          closeSidebar();
          setTimeout(() => {
            zoomToGroup(node.id);

            setTimeout(() => {
              openSidebar();
            }, 100);
          }, 150);
        } else {
          zoomToGroup(node.id);

          setTimeout(() => {
            openSidebar();
          }, 100);
        }
      }
    },
    [zoomToGroup, closeSidebar, openSidebar, isSidebarOpen]
  );

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    if (isSidebarOpen) {
      handleSidebarToggle();
    }
  }, [setSelectedNode, isSidebarOpen, handleSidebarToggle]);

  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      const nodeElement = target.closest(".react-flow__node");

      if (nodeElement) {
        const nodeId = nodeElement.getAttribute("data-id");
        if (nodeId) {
          const allNodes = getNodes();
          const clickedNode = allNodes.find((node) => node.id === nodeId);

          if (clickedNode && clickedNode.type === "group") {
            event.preventDefault();
            event.stopPropagation();

            const wasSidebarOpen = isSidebarOpen;
            isZoomingRef.current = true;

            if (wasSidebarOpen) {
              closeSidebar();
              setTimeout(() => {
                zoomToGroup(clickedNode.id);

                setTimeout(() => {
                  openSidebar();
                }, 100);
              }, 150);
            } else {
              zoomToGroup(clickedNode.id);

              setTimeout(() => {
                openSidebar();
              }, 100);
            }
          }
        }
      } else {
        if (screenToFlowPosition) {
          try {
            const reactFlowElement = event.currentTarget as HTMLElement;
            const rect = reactFlowElement.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            const flowPosition = screenToFlowPosition({ x, y });

            const allNodes = getNodes();
            const clickedNode = allNodes.find((node) => {
              if (!node.position) return false;
              const nodeX = node.position.x;
              const nodeY = node.position.y;
              const nodeWidth = (node.width as number) || 200;
              const nodeHeight = (node.height as number) || 150;

              return (
                flowPosition.x >= nodeX &&
                flowPosition.x <= nodeX + nodeWidth &&
                flowPosition.y >= nodeY &&
                flowPosition.y <= nodeY + nodeHeight &&
                node.type === "group"
              );
            });

            if (clickedNode && clickedNode.type === "group") {
              event.preventDefault();
              event.stopPropagation();

              const wasSidebarOpen = isSidebarOpen;
              isZoomingRef.current = true;

              if (wasSidebarOpen) {
                closeSidebar();
                setTimeout(() => {
                  zoomToGroup(clickedNode.id);

                  setTimeout(() => {
                    openSidebar();
                  }, 100);
                }, 150);
              } else {
                zoomToGroup(clickedNode.id);

                setTimeout(() => {
                  openSidebar();
                }, 100);
              }
            }
          } catch (error) {
            console.warn(
              "Failed to convert screen to flow coordinates:",
              error
            );
          }
        }
      }
    },
    [
      screenToFlowPosition,
      getNodes,
      zoomToGroup,
      closeSidebar,
      openSidebar,
      isSidebarOpen,
    ]
  );

  const handleWheel = useCallback((event: React.WheelEvent) => {
    if (event.shiftKey || event.ctrlKey) {
      event.preventDefault();
      event.stopPropagation();

      const deltaX = event.deltaY;
      const deltaY = 0;

      const reactFlowElement = event.currentTarget as HTMLElement;
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
        const newX = currentX - deltaX * scrollSpeed;
        const newY = currentY - deltaY;

        viewport.style.transform = `translate(${newX}px, ${newY}px) scale(1)`;
      }
    }
  }, []);

  return {
    handleNodeClick,
    handleDoubleClick,
    handlePaneClick,
    handlePaneDoubleClick,
    handleWheel,
    isZoomingRef,
  };
};
