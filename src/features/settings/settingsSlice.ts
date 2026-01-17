import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ThemeMode = "light" | "dark" | "system";

type SettingsState = {
  themeMode: ThemeMode;
  language: string; // i18next language code
};

const initialState: SettingsState = {
  themeMode: "system",
  language: "en",
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.themeMode = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.language = action.payload;
    },
  },
});

export const { setThemeMode, setLanguage } = settingsSlice.actions;
export default settingsSlice.reducer;
