import { useCallback, useEffect } from "react";
import { useAppDispatch } from "../../../../store/store";
import {
  getDeviceByOrganizationIdAndPlantId,
  setDevices,
} from "../../../../store/deviceSlice";
import { getPlantsByUserId, setPlants } from "../../../../store/plantSlice";
import { Error } from "../../../utils/toast";

interface UseDiagramDataParams {
  plantId: string | null;
  organizationId: string | null;
}

export const useDiagramData = ({
  plantId,
  organizationId,
}: UseDiagramDataParams) => {
  const dispatch = useAppDispatch();

  const fetchPlantData = useCallback(() => {
    if (plantId) {
      dispatch(getPlantsByUserId())
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setPlants(res.data));
          } else {
            Error(res.message || "Failed to fetch plant data");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to fetch plant data");
        });
    }
  }, [dispatch, plantId]);

  const fetchDevices = useCallback(() => {
    if (plantId && organizationId) {
      dispatch(
        getDeviceByOrganizationIdAndPlantId({
          plantId: Number(plantId),
          organizationId: Number(organizationId),
        }),
      )
        .unwrap()
        .then((res) => {
          if (res.success) {
            dispatch(setDevices(res.data));
          } else {
            Error(res.message || "Failed to fetch devices");
          }
        })
        .catch((err) => {
          console.log(err);
          Error(err.message || "Failed to fetch devices");
        });
    }
  }, [dispatch, plantId, organizationId]);

  useEffect(() => {
    fetchDevices();
    fetchPlantData();

    const interval = setInterval(() => {
      fetchDevices();
      // 15 minutes
    }, 900000);

    return () => clearInterval(interval);
  }, [fetchDevices, fetchPlantData]);

  return { fetchPlantData, fetchDevices };
};
