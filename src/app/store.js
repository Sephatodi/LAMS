import { configureStore } from '@reduxjs/toolkit';
import { employeeApi } from './api/employeeApi';

export const store = configureStore({
  reducer: {
    [employeeApi.reducerPath]: employeeApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(employeeApi.middleware),
});