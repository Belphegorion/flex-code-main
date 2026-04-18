import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { colors } from "../theme";

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
