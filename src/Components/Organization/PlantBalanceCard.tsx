import { useNavigate } from "react-router-dom";
import { setSelectedPlant } from "../../utils/plantUtils";

interface PlantBalance {
  id: number;
  name: string;
  totalIn: number;
  totalOut: number;
  balance: number;
  unit: string | undefined;
}

interface Plant {
  plant_id: number;
  plant_name: string;
  organization_id: number;
  organization_name: string;
}

interface PlantBalanceCardProps {
  plantBalances: PlantBalance[];
  plants: Plant[] | null;
  organizationId: string | null;
  plantId: string | null;
  isLoading: boolean;
}

export const PlantBalanceCard = ({
  plantBalances,
  plants,
  organizationId,
  plantId,
  isLoading,
}: PlantBalanceCardProps) => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-text-secondary text-xl font-roboto font-normal whitespace-nowrap">
        Plants Water Balance
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
        ) : plantBalances.length >= 0 ? (
          plantBalances.map((plant) => {
            const plantData = plants?.find((p) => p.plant_id === plant.id);
            const plantOrganizationId =
              plantData?.organization_id || organizationId;
            const plantPlantId = plantData?.plant_id || plantId;
            const displayUnit = plant.unit || "";

            return (
              <div
                key={plant.id}
                onClick={() => {
                  if (plantOrganizationId && plantPlantId && plant.id) {
                    setSelectedPlant(plant.id.toString());
                    navigate(`/plant/${plant.id}`);
                  }
                }}
                className="bg-card rounded-lg px-4 py-3 shadow-md cursor-pointer hover:shadow-lg hover:scale-99 hover:bg-card/50 transition-all duration-200"
              >
                <div className="flex flex-col gap-1">
                  <h3 className="text-text-primary font-roboto text-lg text-start font-normal">
                    {plant.name}
                  </h3>
                  <div className="flex items-start flex-col">
                    <span className="text-base font-roboto text-text-secondary text-start w-full">
                      Total In
                    </span>
                    <span className="text-lg font-roboto font-normal w-full text-start text-text-primary">
                      {plant.unit === "M^3"
                        ? (Math.abs(plant.totalIn) / 1000).toFixed(3)
                        : Math.abs(plant.totalIn)}
                      {/* <span className="text-lg italic">
                        {plant.unit === "M^3" ? "m³" : plant.unit || ""}
                      </span> */}
                    </span>
                    <span className="text-base font-roboto text-text-secondary text-start w-full">
                      Total Out
                    </span>
                    <span className="text-lg font-roboto font-normal w-full text-start text-text-primary">
                      {plant.unit === "M^3"
                        ? (Math.abs(plant.totalOut) / 1000).toFixed(3)
                        : Math.abs(plant.totalOut)}
                      {/* <span className="text-lg italic">
                        {plant.unit === "M^3" ? "m³" : plant.unit || ""}
                      </span> */}
                    </span>
                    <span className="text-base font-roboto text-text-secondary text-start w-full">
                      Un-Accounted Water
                    </span>
                    <span
                      className={`text-lg font-roboto font-normal w-full text-start ${
                        plant.balance >= 0
                          ? "text-status-success"
                          : "text-status-danger"
                      }`}
                      title={
                        plant.balance >= 0
                          ? "+" +
                            Math.abs(plant.balance) +
                            " " +
                            (plant.unit === "M^3" ? "m³" : plant.unit || "")
                          : "- " +
                            Math.abs(plant.balance) +
                            " " +
                            (plant.unit === "M^3" ? "m³" : plant.unit || "")
                      }
                    >
                      {plant.balance >= 0 ? "" : "- "}
                      {displayUnit === "M^3"
                        ? (Math.abs(plant.balance) / 1000).toFixed(3)
                        : Math.abs(plant.balance)}{" "}
                      <span className="text-lg italic">
                        {displayUnit === "M^3" ? "m³" : displayUnit}
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
                No plants card found
              </h3>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
