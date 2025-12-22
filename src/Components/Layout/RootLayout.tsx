import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Header from "./Header";
import { useAppSelector } from "../../../store/store";
import { useEffect, useState, createContext, useContext } from "react";
import Loader from "../Loader";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useWebSocketConnection } from "../../hooks/useWebSocketConnection";

interface DiagramSidebarContextType {
  onDiagramSidebarToggle: (isOpen: boolean) => void;
  isDiagramSidebarOpen: boolean;
}

const DiagramSidebarContext = createContext<DiagramSidebarContextType | null>(
  null
);

export const useDiagramSidebar = () => {
  return useContext(DiagramSidebarContext);
};

export default function RootLayout() {
  const { isAuthenticated, isLoading } = useAppSelector((state) => state.user);
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPage] = useState("dashboard");
  const [isDiagramSidebarOpen, setIsDiagramSidebarOpen] = useState(false);
  const location = useLocation();

  const { connectionStatus, isConnected } = useWebSocketConnection();

  useEffect(() => {
    if (isAuthenticated && isConnected) {
      console.log("WebSocket is connected:", connectionStatus);
    }
  }, [isAuthenticated, isConnected, connectionStatus]);

  const isWaterBalanceRoute = location.pathname === "/plant-layout";

  const handleDiagramSidebarToggle = (isOpen: boolean) => {
    setIsDiagramSidebarOpen(isOpen);
    if (isOpen && isWaterBalanceRoute) {
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Outlet />;
  }

  return (
    <DiagramSidebarContext.Provider
      value={{
        onDiagramSidebarToggle: handleDiagramSidebarToggle,
        isDiagramSidebarOpen,
      }}
    >
      <div className="min-h-full transition-all duration-500">
        <div className="flex h-screen overflow-hidden">
          {(!isWaterBalanceRoute || sidebarOpen) && (
            <Sidebar
              currentPage={currentPage}
              isOpen={sidebarOpen}
              setIsOpen={setSidebarOpen}
            />
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              onMenuClick={() => setSidebarOpen(!sidebarOpen)}
              isDiagramSidebarOpen={isDiagramSidebarOpen}
              isWaterBalanceRoute={isWaterBalanceRoute}
              sidebarOpen={sidebarOpen}
            />

            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-input-bg p-4 space-y-4">
              <Outlet />
            </main>
            {!isWaterBalanceRoute && <Footer />}
          </div>
        </div>
      </div>
    </DiagramSidebarContext.Provider>
  );
}
