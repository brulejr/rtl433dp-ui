import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";

import layoutReducer from "../features/layout/layoutSlice";
import settingsReducer from "../features/settings/settingsSlice";
import sessionReducer from "../features/session/sessionSlice";
import toastsReducer from "../features/toasts/toastsSlice";

import knownDevicesReducer from "../features/knownDevices/knownDevicesSlice";
import modelsReducer from "../features/models/modelsSlice";
import recommendationsUiReducer from "../features/recommendations/recommendationsSlice";

import { baseApi } from "../services/api/baseApi";

export const store = configureStore({
  reducer: {
    // app-level slices
    layout: layoutReducer,
    settings: settingsReducer,
    session: sessionReducer,
    toasts: toastsReducer,

    // feature slices
    knownDevices: knownDevicesReducer,
    models: modelsReducer,
    recommendationsUi: recommendationsUiReducer,

    // RTK Query
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
