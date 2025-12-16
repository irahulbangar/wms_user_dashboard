import { combineReducers } from "@reduxjs/toolkit";
import usersReducer from "./usersSlice";
import deviceReducer from "./deviceSlice";
import plantReducer from "./plantSlice";
import systemReducer from "./systemSlice";
import departmentReducer from "./departmentSlice";

const rootReducer = combineReducers({
  user: usersReducer,
  device: deviceReducer,
  plant: plantReducer,
  system: systemReducer,
  department: departmentReducer,
});

export default rootReducer;
