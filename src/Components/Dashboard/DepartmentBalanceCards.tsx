import { useNavigate } from "react-router-dom";

interface DepartmentBalance {
  id: number;
  name: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  unit: string | undefined;
}

interface Department {
  department_id: number;
  organization_id?: string | number;
  plant_id?: string | number;
  department_name: string;
}

interface DepartmentBalanceCardsProps {
  isLoading: boolean;
  departmentBalances: DepartmentBalance[];
  departments: Department[] | null;
  organizationId: string | null;
  plantId: string | null;
}

export const DepartmentBalanceCards = ({
  isLoading,
  departmentBalances,
  departments,
  organizationId,
  plantId,
}: DepartmentBalanceCardsProps) => {
  const navigate = useNavigate();

  const hasAnyData =
    departmentBalances.some((item) => item.totalIn > 0) ||
    departmentBalances.some((item) => item.totalOut > 0) ||
    departmentBalances.some((item) => item.balance > 0);

  if (!hasAnyData && !isLoading) {
    return null;
  }

  return (
    <>
      <h1 className="text-text-secondary text-xl font-roboto font-normal whitespace-nowrap">
        Departments Water Balance
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {isLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div className="h-[70px] bg-card rounded-lg px-4 py-3 shadow-md flex flex-col gap-2 items-start justify-center">
                <div className="flex items-center gap-2">
                  <div className="w-[150px] h-3 rounded-sm bg-input-bg animate-pulse"></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-[50px] h-3 rounded-sm bg-input-bg animate-pulse"></div>
                  <div className="h-3 w-20 bg-input-bg rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          ))
        ) : departmentBalances.length > 0 ? (
          departmentBalances.map((dept) => {
            const department = departments?.find(
              (d) => d.department_id === dept.id
            );
            const deptOrganizationId =
              department?.organization_id || organizationId;
            const deptPlantId = department?.plant_id || plantId;

            return (
              <div
                key={dept.id}
                onClick={() => {
                  if (deptOrganizationId && deptPlantId && dept.id) {
                    localStorage.setItem("departmentId", dept.id.toString());
                    navigate(
                      `/department/device/${deptOrganizationId}/${deptPlantId}/${dept.id}`
                    );
                  }
                }}
                className="bg-card rounded-lg px-4 py-3 shadow-md cursor-pointer hover:shadow-lg hover:scale-99 hover:bg-card/50 transition-all duration-200"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-text-primary font-roboto text-lg text-start font-normal">
                    {dept.name}
                  </h3>
                  <div className="flex items-start flex-col">
                    <span className="text-base font-roboto text-text-secondary text-start w-full">
                      Total In
                    </span>
                    <span className="text-lg font-roboto font-normal text-text-primary w-full text-start">
                      {dept.unit === "M^3"
                        ? (Math.abs(dept.totalIn) / 1000).toFixed(3)
                        : Math.abs(dept.totalIn)} {" "}
                      <span className="text-lg italic">
                        {dept.unit === "M^3" ? "m³" : dept.unit || ""}
                      </span>
                    </span>
                    <span className="text-base font-roboto text-text-secondary text-start w-full">
                      Total Out
                    </span>
                    <span className="text-lg font-roboto font-normal w-full text-start text-text-primary">
                      {dept.unit === "M^3"
                        ? (Math.abs(dept.totalOut) / 1000).toFixed(3)
                        : Math.abs(dept.totalOut)} {" "}
                      <span className="text-lg italic">
                        {dept.unit === "M^3" ? "m³" : dept.unit || ""}
                      </span>
                    </span>
                    <span className="text-base font-roboto text-text-secondary text-start w-full">
                      Un-Accountable Water
                    </span>
                    <span
                      className={`text-lg font-roboto font-normal w-full text-start ${
                        dept.balance >= 0
                          ? "text-status-success"
                          : "text-status-danger"
                      }`}
                      title={
                        dept.balance >= 0
                          ? "+" +
                            Math.abs(dept.balance) +
                            " " +
                            (dept.unit === "M^3" ? "m³" : dept.unit || "")
                          : "- " +
                            Math.abs(dept.balance) +
                            " " +
                            (dept.unit === "M^3" ? "m³" : dept.unit || "")
                      }
                    >
                      {dept.balance >= 0 ? "" : "- "}
                      {dept.unit === "M^3"
                        ? (Math.abs(dept.balance) / 1000).toFixed(3)
                        : Math.abs(dept.balance)}{" "}
                      <span className="text-lg italic">
                        {dept.unit === "M^3" ? "m³" : dept.unit || ""}
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-card rounded-lg px-4 py-3 shadow-md">
            <div className="flex flex-col gap-2">
              <h3 className="text-text-secondary text-sm font-medium">
                No departments card found
              </h3>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
