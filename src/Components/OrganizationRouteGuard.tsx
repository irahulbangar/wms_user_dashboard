import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store/store";
import { getCurrentPlantId } from "../utils/plantUtils";
import Organization from "./Organization/Organization";

const OrganizationRouteGuard = () => {
  const { user } = useAppSelector((state) => state.user);
  const userRole = user?.role || user?.plantsList?.[0]?.role;

  if (userRole === "org_user") {
    const currentPlantId = getCurrentPlantId();
    if (currentPlantId) {
      return <Navigate to={`/plant/${currentPlantId}`} replace />;
    } else if (user?.plantsList && user.plantsList.length > 0) {
      const firstPlantId = user.plantsList[0].plant_id;
      return <Navigate to={`/plant/${firstPlantId}`} replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Organization />;
};

export default OrganizationRouteGuard;
