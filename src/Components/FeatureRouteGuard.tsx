/**
 * Route guard component to check feature flags before allowing access to routes
 */

import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import { checkRouteFeature } from "../utils/featureFlagHelpers";
import { AlertCircle } from "lucide-react";

interface FeatureRouteGuardProps {
  children: React.ReactNode;
}

const FeatureRouteGuard: React.FC<FeatureRouteGuardProps> = ({ children }) => {
  const location = useLocation();
  const { sidebarMenu: sidebarMenuFromStore } = useAppSelector(
    (state) => state.plant
  );
  const [isChecking, setIsChecking] = useState(true);
  const [currentPlantId, setCurrentPlantId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("plantId");
    }
    return null;
  });

  useEffect(() => {
    const checkPlantId = () => {
      const plantId = localStorage.getItem("plantId");
      setCurrentPlantId(plantId);
    };

    checkPlantId();

    const handleStorageChange = () => {
      checkPlantId();
    };

    window.addEventListener("plantChanged", handleStorageChange);
    window.addEventListener("storage", handleStorageChange);

    checkPlantId();

    return () => {
      window.removeEventListener("plantChanged", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarMenuFromStore || sidebarMenuFromStore.length === 0) {
      const timer = setTimeout(() => {
        setIsChecking(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsChecking(false);
    }
  }, [sidebarMenuFromStore, location.pathname, currentPlantId]);

  if (
    isChecking &&
    (!sidebarMenuFromStore || sidebarMenuFromStore.length === 0)
  ) {
    return <>{children}</>;
  }

  if (!sidebarMenuFromStore || sidebarMenuFromStore.length === 0) {
    return <>{children}</>;
  }

  const plantIdFromStorage = localStorage.getItem("plantId");
  const routeCheck = checkRouteFeature(
    location.pathname,
    sidebarMenuFromStore,
    plantIdFromStorage
  );

  if (!routeCheck.available) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[calc(100vh-200px)]">
        <div className="max-w-md w-full mx-4">
          <div className="bg-primary rounded-lg shadow-lg p-6 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-status-danger/80 p-3">
                <AlertCircle className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">
              Feature Not Available
            </h2>
            <p className="text-text-secondary mb-1">
              This feature not available with the current subscription.
            </p>
            <div className="text-sm text-text-secondary">
              Please contact your administrator to upgrade your subscription
              plan.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default FeatureRouteGuard;
