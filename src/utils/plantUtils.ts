import type { PlantResult } from "../../model/plant.interface";

export const getCurrentPlantId = (): string | null => {
  return localStorage.getItem("plantId");
};

export const clearSelectedPlant = (): void => {
  localStorage.removeItem("plantId");
};

export const setSelectedPlant = (plantId: string): void => {
  localStorage.setItem("plantId", plantId);
};

export const getDefaultPlantId = (plants: PlantResult[]): string | null => {
  if (plants && plants.length > 0) {
    return plants[0].plant_id.toString();
  }
  return null;
};
