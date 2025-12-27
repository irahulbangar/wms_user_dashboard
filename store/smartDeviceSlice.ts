import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { SmartDeviceResultItem } from "../model/smart-device.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface SmartDeviceState {
  smartDevices: SmartDeviceResultItem[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: SmartDeviceState = {
  smartDevices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const smartDeviceSlice = createSlice({
  name: "smartDevice",
  initialState,
  reducers: {
    setSmartDevices: (state, action) => {
      state.smartDevices = action.payload;
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
    builder.addCase(getSmartDeviceLogs.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getSmartDeviceLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.smartDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getSmartDeviceLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getSmartDeviceCustomReport.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getSmartDeviceCustomReport.fulfilled, (state, action) => {
      state.loading = false;
      state.smartDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getSmartDeviceCustomReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

interface GetSmartDeviceLogsPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

export const getSmartDeviceLogs = createAsyncThunk(
  "smartDevice/getSmartDeviceLogs",
  async ({ plantId, deviceId, date }: GetSmartDeviceLogsPayload, thunkAPI) => {
    try {
      const response = await api().post(
        `/smart/device/smart-logs/${plantId}/${deviceId}`,
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

interface GetSmartDeviceCustomReportPayload {
  plantId: number;
  deviceId: number;
  from_date: string;
  to_date: string;
  duration: string;
}

export const getSmartDeviceCustomReport = createAsyncThunk(
  "smartDevice/getSmartDeviceCustomReport",
  async (
    {
      plantId,
      deviceId,
      from_date,
      to_date,
      duration,
    }: GetSmartDeviceCustomReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post(
        `/smart/device/smart-reports/${plantId}/${deviceId}`,
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
  setSmartDevices,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = smartDeviceSlice.actions;

export default smartDeviceSlice.reducer;
