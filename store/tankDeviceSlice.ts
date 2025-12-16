import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { TankDeviceResultItem } from "../model/tank-device.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface TankDeviceState {
  tankDevices: TankDeviceResultItem[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: TankDeviceState = {
  tankDevices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const tankDeviceSlice = createSlice({
  name: "tankDevice",
  initialState,
  reducers: {
    setTankDevices: (state, action) => {
      state.tankDevices = action.payload;
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
    builder.addCase(getDeviceTankLogs.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDeviceTankLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.tankDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDeviceTankLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getTankCustomReport.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getTankCustomReport.fulfilled, (state, action) => {
      state.loading = false;
      state.tankDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getTankCustomReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

interface GetDeviceTankLogsPayload {
  deviceId: number;
  plantId: number;
  date: string;
}

export const getDeviceTankLogs = createAsyncThunk(
  "tankDevice/getDeviceTankLogs",
  async ({ deviceId, plantId, date }: GetDeviceTankLogsPayload, thunkAPI) => {
    try {
      const response = await api().post(
        `/tank/device/tank-logs/${plantId}/${deviceId}`,
        {
          date,
        },
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

interface GetCustomReportPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}
export const getTankCustomReport = createAsyncThunk(
  "tankDevice/getCustomReport",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetCustomReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post(
        `/tank/device/tank-reports/${plantId}/${deviceId}`,
        {
          from_date,
          to_date,
          duration,
        },
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

export const { setTankDevices, setLoading, setError, setStatus, setMessage, setSuccess } = tankDeviceSlice.actions;

export default tankDeviceSlice.reducer;
