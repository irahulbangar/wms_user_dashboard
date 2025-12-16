import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAppSelector } from "../../store/store";

const HomeRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.user
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/login", { replace: true });
      return;
    }

    const userRole = user.plantsList[0].role;
    const organizationId = user.organization_id;

    if (userRole === "org_admin") {
      if (organizationId) {
        navigate(`/organization/${organizationId}`, { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
      return;
    }

    if (userRole === "org_user") {
      if (user.plantsList && user.plantsList.length > 0) {
        const firstPlant = user.plantsList[0];
        if (firstPlant?.plant_id) {
          navigate(`/plant/${firstPlant.plant_id}`, { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } else {
        navigate("/login", { replace: true });
      }
      return;
    }

    if (user.plantsList && user.plantsList.length > 0) {
      const firstPlant = user.plantsList[0];
      if (firstPlant?.plant_id) {
        navigate(`/plant/${firstPlant.plant_id}`, { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } else {
      navigate("/login", { replace: true });
    }
  }, [user, isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
    </div>
  );
};

export default HomeRedirect;
