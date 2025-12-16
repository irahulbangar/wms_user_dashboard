import { useNavigate } from "react-router-dom";
import { ChevronRight, Building2, Factory } from "lucide-react";
import { getCurrentPlantId } from "../../../utils/plantUtils";

interface DiagramBreadcrumbProps {
  userRole?: string;
  plantName?: string;
}

const DiagramBreadcrumb = ({ userRole, plantName }: DiagramBreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center gap-2 text-sm text-text-secondary font-roboto bg-primary/50 px-2 py-1.5 rounded-lg">
      <nav className="flex items-center space-x-2 text-sm font-roboto">
        {userRole === "org_admin" && (
          <>
            <button
              onClick={() => {
                const organizationId = localStorage.getItem("organizationId");
                if (organizationId) {
                  navigate(`/organization/${organizationId}`);
                }
              }}
              className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
            >
              <Building2 className="w-4 h-4" />
              <span className="text-text-primary font-normal font-roboto">
                Organization
              </span>
            </button>
            <ChevronRight className="w-4 h-4 text-text-muted" />
          </>
        )}
        <button
          onClick={() => {
            const plantId = getCurrentPlantId();
            if (plantId) {
              navigate(`/plant/${plantId}`);
            }
          }}
          className="flex items-center gap-1 hover:text-text-primary hover:bg-overlay/20 px-2 py-1 rounded transition-all duration-200 cursor-pointer font-roboto"
        >
          {userRole === "org_user" && <Factory className="w-4 h-4" />}
          <span className="text-text-primary font-normal font-roboto">
            Plant
          </span>
        </button>
        <ChevronRight className="w-4 h-4 text-text-muted" />
        <span className="text-text-primary font-normal font-roboto">
          Plant Layout
        </span>
        <ChevronRight className="w-4 h-4 text-text-muted" />
        <span className="text-text-primary font-normal font-roboto">
          {plantName || "Plant"}
        </span>
      </nav>
    </div>
  );
};

export default DiagramBreadcrumb;
