import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "../api/authApi";

const AuthContext = createContext(null);

const getStoredUser = () => {
  try {
    const user = localStorage.getItem("ems_user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser);
  const [token, setToken] = useState(localStorage.getItem("ems_token"));
  const [loading, setLoading] = useState(true);

  const isAuthenticated = Boolean(token && user);

  const saveAuth = ({ user: authUser, token: authToken }) => {
    localStorage.setItem("ems_token", authToken);
    localStorage.setItem("ems_user", JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const login = async (payload) => {
    const res = await authApi.login(payload);
    saveAuth(res.data.data);
    toast.success("Login successful");
    return res.data.data.user;
  };

  const signup = async (payload) => {
    const res = await authApi.signup(payload);
    saveAuth(res.data.data);
    toast.success("Signup successful");
    return res.data.data.user;
  };

  const logout = () => {
    localStorage.removeItem("ems_token");
    localStorage.removeItem("ems_user");
    setToken(null);
    setUser(null);
    toast.success("Logged out successfully");
  };

  const refreshProfile = async () => {
    try {
      if (!localStorage.getItem("ems_token")) return;

      const res = await authApi.me();
      const freshUser = res.data.data.user;

      localStorage.setItem("ems_user", JSON.stringify(freshUser));
      setUser(freshUser);
    } catch {
      logout();
    }
  };

  useEffect(() => {
    const init = async () => {
      await refreshProfile();
      setLoading(false);
    };

    init();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated,
      login,
      signup,
      logout,
      refreshProfile,
    }),
    [user, token, loading, isAuthenticated]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);