import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import { handleApiError } from "../src/utils/errorHandler";
import type { DwlrDeviceResultItem } from "../model/dwlr-device.interface";

interface DwlrDeviceState {
  dwlrDevices: DwlrDeviceResultItem[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: DwlrDeviceState = {
  dwlrDevices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const dwlrDeviceSlice = createSlice({
  name: "dwlrDevice",
  initialState,
  reducers: {
    setDwlrDevices: (state, action) => {
      state.dwlrDevices = action.payload;
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
    builder.addCase(getDeviceDwlrLogs.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDeviceDwlrLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.dwlrDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDeviceDwlrLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDwlrCustomReport.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDwlrCustomReport.fulfilled, (state, action) => {
      state.loading = false;
      state.dwlrDevices = action.payload.data;
      state.status = 0;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDwlrCustomReport.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

interface GetDeviceFmLogsPayload {
  plantId: number;
  deviceId: number;
  date: string;
}

export const getDeviceDwlrLogs = createAsyncThunk(
  "dwlrDevice/getDeviceFmLogs",
  async ({ plantId, deviceId, date }: GetDeviceFmLogsPayload, thunkAPI) => {
    try {
      const response = await api().post(
        `/dwlr/device/dwlr-logs/${plantId}/${deviceId}`,
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
export const getDwlrCustomReport = createAsyncThunk(
  "dwlrDevice/getCustomReport",
  async (
    { plantId, deviceId, from_date, to_date, duration }: GetCustomReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post(
        `/dwlr/device/dwlr-reports/${plantId}/${deviceId}`,
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
  setDwlrDevices,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = dwlrDeviceSlice.actions;

export default dwlrDeviceSlice.reducer;
