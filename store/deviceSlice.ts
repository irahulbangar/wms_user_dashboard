import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  DevicesResponse,
  DevicesResult,
} from "../model/devices.interface";
import type { SingleDeviceResponse } from "../model/single-device.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface DeviceState {
  devices: DevicesResult[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: DeviceState = {
  devices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const deviceSlice = createSlice({
  name: "device",
  initialState,
  reducers: {
    setDevices: (state, action) => {
      state.devices = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setMessage: (state, action) => {
      state.message = action.payload;
    },
    setSuccess: (state, action) => {
      state.success = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(getDeviceByOrganizationIdAndPlantId.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(
      getDeviceByOrganizationIdAndPlantId.fulfilled,
      (state, action) => {
        state.loading = false;
        state.devices = action.payload.data;
        state.status = 0;
        state.message = action.payload.message;
        state.success = action.payload.success;
      }
    );
    builder.addCase(
      getDeviceByOrganizationIdAndPlantId.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
        state.status = 0;
        state.message = "";
        state.success = false;
      }
    );
    builder.addCase(
      getDeviceByOrganizationIdAndPlantIdAndDepartmentId.pending,
      (state) => {
        state.loading = true;
      }
    );
    builder.addCase(
      getDeviceByOrganizationIdAndPlantIdAndDepartmentId.fulfilled,
      (state, action) => {
        state.loading = false;
        state.devices = action.payload.data;
        state.status = 0;
        state.message = action.payload.message;
        state.success = action.payload.success;
      }
    );
    builder.addCase(
      getDeviceByOrganizationIdAndPlantIdAndDepartmentId.rejected,
      (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
        state.status = 0;
        state.message = "";
        state.success = false;
      }
    );
  },
});

// get device by id
export const getDeviceById = createAsyncThunk(
  "device/getDeviceById",
  async (id: number, thunkAPI) => {
    try {
      const response = await api().get<SingleDeviceResponse>(
        `/device/user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

interface getPlantByOrganizationId {
  organizationId: number;
  plantId: number;
}

// Get device by organizationId and plantId
export const getDeviceByOrganizationIdAndPlantId = createAsyncThunk(
  "device/getDeviceByOrganizationIdAndPlantId",
  async ({ organizationId, plantId }: getPlantByOrganizationId, thunkAPI) => {
    try {
      const response = await api().get<DevicesResponse>(
        `/device/plant-organization/${organizationId}/${plantId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

interface getDeviceByOrganizationIdAndPlantIdAndDepartmentId {
  organizationId: number;
  plantId: number;
  departmentId: number;
}

// get device by organizationId and plantId and departmentId
export const getDeviceByOrganizationIdAndPlantIdAndDepartmentId =
  createAsyncThunk(
    "device/getDeviceByOrganizationIdAndPlantIdAndDepartmentId",
    async (
      {
        organizationId,
        plantId,
        departmentId,
      }: getDeviceByOrganizationIdAndPlantIdAndDepartmentId,
      thunkAPI
    ) => {
      try {
        const response = await api().get<DevicesResponse>(
          `/device/user/organization-plant-department/${organizationId}/${plantId}/${departmentId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        return response.data;
      } catch (error: unknown) {
        const apiError = handleApiError(error);
        return thunkAPI.rejectWithValue(apiError);
      }
    }
  );

interface getDeviceByOrganizationIdAndPlantIdAndSystemId {
  organizationId: number;
  plantId: number;
  systemId: number;
}

// Get device by organizationId and plantId and systemId
export const getDeviceByOrganizationIdAndPlantIdAndSystemId =
  createAsyncThunk(
    "device/getDeviceByOrganizationIdAndPlantIdAndSystemId",
    async (
      {
        organizationId,
        plantId,
        systemId,
      }: getDeviceByOrganizationIdAndPlantIdAndSystemId,
      thunkAPI
    ) => {
      try {
        const response = await api().get<DevicesResponse>(
          `/device/user/organization-plant-system/${organizationId}/${plantId}/${systemId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        return response.data;
      } catch (error: unknown) {
        const apiError = handleApiError(error);
        return thunkAPI.rejectWithValue(apiError);
      }
    }
  );

export const {
  setDevices,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = deviceSlice.actions;

export default deviceSlice.reducer;
