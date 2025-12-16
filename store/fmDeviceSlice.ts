import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { FmDeviceResultItem } from "../model/fm-device.interface";
import { handleApiError } from "../src/utils/errorHandler";

interface FmDeviceState {
  fmDevices: FmDeviceResultItem[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: FmDeviceState = {
  fmDevices: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const fmDeviceSlice = createSlice({
  name: "fmDevice",
  initialState,
  reducers: {
    setFmDevices: (state, action) => {
      state.fmDevices = action.payload;
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
    builder.addCase(getDeviceFmLogs.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDeviceFmLogs.fulfilled, (state, action) => {
      state.loading = false;
      state.fmDevices = action.payload.data;
      state.status = action.payload.status;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDeviceFmLogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getFmCustomReport.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getFmCustomReport.fulfilled, (state, action) => {
      state.loading = false;
      state.fmDevices = action.payload.data;
      state.status = 0;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getFmCustomReport.rejected, (state, action) => {
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

export const getDeviceFmLogs = createAsyncThunk(
  "fmDevice/getDeviceFmLogs",
  async ({ plantId, deviceId, date }: GetDeviceFmLogsPayload, thunkAPI) => {
    try {
      const response = await api().post(
        `/fm/device/fm-logs/${plantId}/${deviceId}`,
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
export const getFmCustomReport = createAsyncThunk(
  "fmDevice/getCustomReport",
  async (
    { plantId, deviceId, from_date, to_date, duration }: GetCustomReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post(
        `/fm/device/fm-reports/${plantId}/${deviceId}`,
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
  setFmDevices,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = fmDeviceSlice.actions;

export default fmDeviceSlice.reducer;
