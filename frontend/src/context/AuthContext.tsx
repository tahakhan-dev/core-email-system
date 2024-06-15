import React, { createContext, useContext, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
import {
  login as loginApi,
  register as registerApi,
  resetPassword as resetPasswordApi,
} from "../services/api";
import { toast } from "react-toastify";
import axios from "axios";

interface AuthContextProps {
  user: string | null;
  login: (
    userName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  register: (
    userName: string,
    email: string,
    password: string
  ) => Promise<boolean>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface Props {
  children?: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<string | null>(null);

  const login = async (userName: string, email: string, password: string) => {
    try {
      console.log(userName);

      const response = await loginApi(
        { email, password },
        {
          headers: {
            deviceId: "ABCD1234563",
          },
        }
      );
      if (response.data.status === 1) {
        localStorage.setItem("userId", response.data.result[0].id);
        localStorage.setItem("authToken", response.data.result[0].authToken);
        localStorage.setItem("deviceId", "ABCD1234563");
        localStorage.setItem(
          "emailConnected",
          response.data.result[0].emailConnected
        );
        localStorage.setItem(
          "isEmailSync",
          response.data.result[0].isEmailSync
        );
        setUser(response.data.result[0].userName); // Saving the user's name in state
        toast.success(response.data.message);
        return true; // Indicate success
      } else {
        toast.error("Unexpected status code returned from API");
        return false;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        toast.error(error.response.data.message);
      } else {
        toast.error("An error occurred during login");
      }
      return false;
    }
  };

  const register = async (
    userName: string,
    email: string,
    password: string
  ) => {
    try {
      const response = await registerApi({ userName, email, password });
      if (response.status === 201) {
        toast.success(response.data.message);
        setUser(response.data.result[0].userName); // Assuming you want to auto-login
        return true; // Indicate success
      } else {
        toast.error("Unexpected status code returned from API");
        return false;
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        // error is now typed as an AxiosError
        if (error.response) {
          toast.error(error.response.data.message);
        } else {
          toast.error("Network Error");
        }
      } else {
        toast.error("An error occurred during registration");
      }
      return false;
    }
  };

  const resetPassword = async (email: string) => {
    await resetPasswordApi({ email });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, resetPassword, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
