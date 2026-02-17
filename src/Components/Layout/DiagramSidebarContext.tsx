import { createContext, useContext } from "react";

export interface DiagramSidebarContextType {
  onDiagramSidebarToggle: (isOpen: boolean) => void;
  isDiagramSidebarOpen: boolean;
}

export const DiagramSidebarContext =
  createContext<DiagramSidebarContextType | null>(null);

export const useDiagramSidebar = () => {
  return useContext(DiagramSidebarContext);
};
