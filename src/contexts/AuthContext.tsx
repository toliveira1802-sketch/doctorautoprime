import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  phone: string;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  biometricEnabled: boolean;
  login: (phone: string) => void;
  verifyOTP: (otp: string) => boolean;
  enableBiometric: () => void;
  skipBiometric: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    // Check localStorage for existing session
    const savedUser = localStorage.getItem('drprime_user');
    const savedBiometric = localStorage.getItem('drprime_biometric');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
    if (savedBiometric === 'true') {
      setBiometricEnabled(true);
    }
  }, []);

  const login = (phone: string) => {
    // Store phone temporarily for OTP verification
    localStorage.setItem('drprime_pending_phone', phone);
  };

  const verifyOTP = (otp: string): boolean => {
    // Mock verification - accepts any 6-digit code
    if (otp.length === 6) {
      const phone = localStorage.getItem('drprime_pending_phone') || '';
      const newUser = { phone, name: 'Usuário' };
      setUser(newUser);
      localStorage.setItem('drprime_user', JSON.stringify(newUser));
      localStorage.removeItem('drprime_pending_phone');
      return true;
    }
    return false;
  };

  const enableBiometric = () => {
    setBiometricEnabled(true);
    setIsAuthenticated(true);
    localStorage.setItem('drprime_biometric', 'true');
  };

  const skipBiometric = () => {
    setIsAuthenticated(true);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    setBiometricEnabled(false);
    localStorage.removeItem('drprime_user');
    localStorage.removeItem('drprime_biometric');
    localStorage.removeItem('drprime_pending_phone');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        biometricEnabled,
        login,
        verifyOTP,
        enableBiometric,
        skipBiometric,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
