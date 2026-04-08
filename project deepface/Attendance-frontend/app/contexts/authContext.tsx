// AuthContext.tsx

import React, { createContext, useState, ReactNode } from "react";
import { login, logout, getCurrentUser } from "../../api/auth"; // Import from the API folder
import { User } from "../../types/auth"; // Import the types

interface AuthContextType {
  user: User | null;
  loading: boolean;
  authToken: string; // ✅ Add this
  signIn: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => void;
  setAuthToken: (token: string) => void;
}

const defaultValue: AuthContextType = {
  user: null,
  loading: false,
  authToken: "", // ✅ Add this
  signIn: async () => ({ success: false, error: "signIn function not initialized" }),
  signOut: () => {},
  setAuthToken: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultValue);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authToken, setAuthToken] = useState<string>("");

  const fetchUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser.user);
    setLoading(false);
  };

  const signIn = async (username: string, password: string) => {
    const result = await login(username, password);
    if (result.success && result.token) {
      setAuthToken(result.token);
      await fetchUser();
    }
    return result;
  };

  const signOut = async () => {
    await logout();
    setUser(null);
    setAuthToken("");
  };

  return (
    <AuthContext.Provider value={{ user, loading, authToken, signIn, signOut, setAuthToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
