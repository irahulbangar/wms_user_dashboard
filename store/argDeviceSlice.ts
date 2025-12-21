import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { ArgDeviceResultItem } from "../model/arg-device.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface ArgDeviceState {
  argDevices: ArgDeviceResultItem[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: ArgDeviceState = {
  argDevices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const argDeviceSlice = createSlice({
  name: "argDevice",
  initialState,
  reducers: {
    setArgDevices: (state, action) => {
      state.argDevices = action.payload;
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
    builder.addCase(getDeviceArgLogs.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDeviceArgLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.argDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDeviceArgLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getArgCustomReport.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getArgCustomReport.fulfilled, (state, action) => {
      state.loading = false;
      state.argDevices = action.payload.data;
      state.status = 0;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getArgCustomReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

interface GetDeviceArgLogsPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

export const getDeviceArgLogs = createAsyncThunk(
  "argDevice/getDeviceArgLogs",
  async ({ plantId, deviceId, date }: GetDeviceArgLogsPayload, thunkAPI) => {
    try {
      const response = await api().post(
        `/arg/device/arg-logs/${plantId}/${deviceId}`,
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

// get custom report
export const getArgCustomReport = createAsyncThunk(
  "argDevice/getCustomReport",
  async (
    { plantId, deviceId, from_date, to_date, duration }: GetCustomReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post(
        `/arg/device/arg-reports/${plantId}/${deviceId}`,
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

export const {
  setArgDevices,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = argDeviceSlice.actions;

export default argDeviceSlice.reducer;
