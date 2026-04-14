"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAccount, useSignMessage, useDisconnect } from "wagmi";
import { SiweMessage } from "siwe";
import { api } from "./api";

interface User {
  id: string;
  walletAddress: string;
  role: string;
  displayName?: string;
  avatarUrl?: string;
  cachedCallBalance?: string;
  tier?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  // Check for existing token on mount
  useEffect(() => {
    const token = api.getToken();
    if (token) {
      api
        .getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          api.setToken(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async () => {
    if (!address) throw new Error("Wallet not connected");

    try {
      // 1. Get nonce
      const { nonce } = await api.getNonce();

      // 2. Build SIWE message
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address,
        statement: "Sign in to CricCall — Predict Cricket. Win Rewards.",
        uri: window.location.origin,
        version: "1",
        chainId: 92533,
        nonce,
      });
      const message = siweMessage.prepareMessage();

      // 3. Sign message
      const signature = await signMessageAsync({ message });

      // 4. Verify with backend
      const { accessToken, user: userData } = await api.verify(
        message,
        signature,
      );

      // 5. Store token and user
      api.setToken(accessToken);

      // 6. Fetch full profile
      const fullUser = await api.getProfile();
      setUser(fullUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }, [address, signMessageAsync]);

  const logout = useCallback(() => {
    api.setToken(null);
    setUser(null);
    disconnect();
  }, [disconnect]);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await api.getProfile();
      setUser(userData);
    } catch {
      // Token expired or invalid
      api.setToken(null);
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
