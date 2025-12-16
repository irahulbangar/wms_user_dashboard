import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type { PlantResult, PlantsResponse } from "../model/plant.interface";
import { handleApiError } from "../src/utils/errorHandler";
import type { PlantWaterBalanceDaywiseReportResponse } from "../model/plant-water-balance.interface";
import type { PlantAlertResponse } from "../model/plant-alert.interface";
import type {
  SidebarMenuResponse,
  SidebarMenuResult,
} from "../model/sidebar-menu.interface";
import type { PlantReportResponse } from "../model/plant-report.interface";

interface PlantState {
  plants: PlantResult[];
  sidebarMenu: SidebarMenuResult[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: PlantState = {
  plants: [],
  sidebarMenu: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const plantSlice = createSlice({
  name: "plant",
  initialState,
  reducers: {
    setPlants: (state, action) => {
      state.plants = action.payload;
    },
    setSidebarMenu: (state, action) => {
      state.sidebarMenu = action.payload;
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
    builder.addCase(getPlantsByUserId.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getPlantsByUserId.fulfilled, (state, action) => {
      state.loading = false;
      state.plants = action.payload.data;
      state.status = 0;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getPlantsByUserId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getSidebarMenu.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getSidebarMenu.fulfilled, (state, action) => {
      state.loading = false;
      state.sidebarMenu = action.payload.data;
      state.status = 0;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getSidebarMenu.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

export const getPlantsByUserId = createAsyncThunk(
  "plants/getPlantsByUserId",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<PlantsResponse>(`/plant/all-plants`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      return response.data;
    } catch (error: unknown) {
      const apiError = handleApiError(error);
      return thunkAPI.rejectWithValue(apiError);
    }
  }
);

interface GetPlantWaterBalanceDaywiseReportPayload {
  plant_id: number;
  year: number;
  month: string;
}
export const getPlantWaterBalanceDaywiseReport = createAsyncThunk(
  "plants/getPlantWaterBalanceDaywiseReport",
  async (
    { plant_id, year, month }: GetPlantWaterBalanceDaywiseReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post<PlantWaterBalanceDaywiseReportResponse>(
        `/plant/plant-month-report`,
        { plant_id, year, month },
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

interface GetPlantAlertsPayload {
  plant_id: number;
  yyyy: number;
  mm: number;
  page_no: number;
  page_size: number;
}
// Plant Alert
export const getPlantAlerts = createAsyncThunk(
  "plants/getPlantAlerts",
  async (
    { plant_id, yyyy, mm, page_no, page_size }: GetPlantAlertsPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post<PlantAlertResponse>(
        `/plant/plant-alerts`,
        {
          plant_id,
          yyyy,
          mm,
          page_no,
          page_size,
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

export const getSidebarMenu = createAsyncThunk(
  "plants/getSidebarMenu",
  async (_, thunkAPI) => {
    try {
      const response = await api().get<SidebarMenuResponse>(
        "/system/user/sidebar-menu",
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

// Get Plant Report
interface GetPlantReportPayload {
  plant_id: number;
  department_id: number;
  system_id: number;
  from_date: string;
  to_date: string;
  duration: string;
}

export const getPlantReport = createAsyncThunk(
  "plants/getPlantReport",
  async (
    {
      plant_id,
      department_id,
      system_id,
      from_date,
      to_date,
      duration,
    }: GetPlantReportPayload,
    thunkAPI
  ) => {
    try {
      const response = await api().post<PlantReportResponse>(
        `/reports/user/plant-report`,
        { plant_id, department_id, system_id, from_date, to_date, duration },
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
  setPlants,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
  setSidebarMenu,
} = plantSlice.actions;

export default plantSlice.reducer;
