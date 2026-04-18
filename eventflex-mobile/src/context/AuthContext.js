import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";
import socketService from "../services/socket";
import * as Notifications from "expo-notifications";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user?.id) {
      socketService.disconnect();
      socketService.connect(user.id);

      // Register for push notifications when user logs in
      registerForPushNotificationsAsync();
    } else {
      socketService.disconnect();
    }
  }, [user?.id]);

  const loadUser = async () => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      if (!token) return;
      const data = await api.get("/auth/profile");
      setUser(data.user);
    } catch {
      await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await api.post("/auth/login", credentials);
    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await api.post("/auth/register", userData);
    await AsyncStorage.setItem("accessToken", data.accessToken);
    await AsyncStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    socketService.disconnect();
    setUser(null);
    await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
  };

  const updateUser = (updates) => setUser((prev) => ({ ...prev, ...updates }));

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, loadUser, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
