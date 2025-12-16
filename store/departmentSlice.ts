import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../api.service";
import type {
  DepartmentResponse,
  DepartmentResult,
} from "../model/department.interface";
import { handleApiError } from "../src/utils/errorHandler";
import type { DepartmentWaterBalanceDaywiseReportResponse } from "../model/department-water-balance.interface";

interface DepartmentState {
  departments: DepartmentResult[];
  loading: boolean;
  error: string | null;
  status: number;
  message: string;
  success: boolean;
}

const initialState: DepartmentState = {
  departments: [],
  loading: false,
  error: null,
  status: 0,
  message: "",
  success: false,
};

export const departmentSlice = createSlice({
  name: "department",
  initialState,
  reducers: {
    setDepartments: (state, action) => {
      state.departments = action.payload;
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
    builder.addCase(getDepartmentsByPlantId.pending, (state) => {
      state.loading = true;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
    builder.addCase(getDepartmentsByPlantId.fulfilled, (state, action) => {
      state.loading = false;
      state.departments = action.payload.data;
      state.status = 0;
      state.message = action.payload.message;
      state.success = action.payload.success;
    });
    builder.addCase(getDepartmentsByPlantId.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || null;
      state.status = 0;
      state.message = "";
      state.success = false;
    });
  },
});

export const getDepartmentsByPlantId = createAsyncThunk(
  "department/getDepartmentsByPlantId",
  async (plantId: number, thunkAPI) => {
    try {
      const response = await api().get<DepartmentResponse>(
        `/department/user/department-plant/${plantId}`,
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

interface GetDepartmentWaterBalanceDaywiseReportPayload {
  department_id: number;
  year: number;
  month: string;
}
export const getDepartmentWaterBalanceDaywiseReport = createAsyncThunk(
  "department/getDepartmentWaterBalanceDaywiseReport",
  async (
    {
      department_id,
      year,
      month,
    }: GetDepartmentWaterBalanceDaywiseReportPayload,
    thunkAPI
  ) => {
    try {
      const response =
        await api().post<DepartmentWaterBalanceDaywiseReportResponse>(
          `/department/department-month-report`,
          { department_id, year, month },
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
  setDepartments,
  setLoading,
  setError,
  setStatus,
  setMessage,
  setSuccess,
} = departmentSlice.actions;

export default departmentSlice.reducer;
