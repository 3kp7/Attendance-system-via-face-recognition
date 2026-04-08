// auth.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginResponse, CurrentUserResponse } from "@/types/auth";
import { API_ENDPOINTS } from "@/config/api";

// Simulate an API endpoint for login
export const login = async (username: string, password: string): Promise<LoginResponse> => {
  try {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);

    const response = await fetch(API_ENDPOINTS.login, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    const data = await response.json();
    
    if (data.access_token) {
      // Store the token in localStorage
      await AsyncStorage.setItem('authToken', data.access_token);
      return { success: true, token: data.access_token };
    } else {
      return { success: false, error: data.detail || "Invalid credentials" };
    }
  } catch (error) {
    return { success: false, error: "An error occurred while logging in" };
  }
};

// Simulate an API endpoint for logging out
export const logout = async (): Promise<void> => {
  // Here, we would call an API to log the user out or simply clear the token from localStorage
  await AsyncStorage.removeItem("authToken");
};

// Simulate an API endpoint for fetching the current authenticated user
export const getCurrentUser = async (): Promise<CurrentUserResponse> => {
  const token = await AsyncStorage.getItem("authToken");

  if (!token) {
    return { user: null };
  }

  try {
    const response = await fetch(API_ENDPOINTS.currentUser, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      await AsyncStorage.removeItem("authToken");
      return { user: null };
    }

    const data = await response.json();
    return { user: data };
  } catch (error) {
    await AsyncStorage.removeItem("authToken");
    return { user: null };
  }
};
