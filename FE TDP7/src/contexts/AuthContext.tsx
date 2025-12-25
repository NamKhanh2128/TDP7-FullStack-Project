import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
  id: string;
  full_name: string;
  email: string;
  status?: 'pending' | 'active';
  role?: 'admin' | 'user';
};

type LoginResult = { 
  success?: boolean; 
  status?: string; 
  error?: string; 
  role?: 'admin' | 'user';
  user?: User;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (creds: { email: string; password: string }) => Promise<LoginResult>;
  logout: () => void;
  register: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user từ localStorage khi F5
  useEffect(() => {
    const storedUser = localStorage.getItem('mock_user_session');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Lỗi data", error);
        localStorage.removeItem('mock_user_session');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async ({ email, password }: { email: string; password: string }): Promise<LoginResult> => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setIsLoading(false);

    if (email.includes('pending')) return { success: false, status: 'pending' };

    // Login User
    if (email === 'user@example.com' && password === 'password') {
      const u: User = { id: 'u1', full_name: 'Nguyễn Văn An', email, status: 'active', role: 'user' };
      setUser(u);
      localStorage.setItem('mock_user_session', JSON.stringify(u));
      return { success: true, role: 'user', user: u };
    }

    // Login Admin
    if (email.includes('admin') && password === 'admin') {
      const u: User = { id: 'a1', full_name: 'Quản Trị Viên', email, status: 'active', role: 'admin' };
      setUser(u);
      localStorage.setItem('mock_user_session', JSON.stringify(u));
      return { success: true, role: 'admin', user: u };
    }

    return { success: false, error: 'Sai email hoặc mật khẩu' };
  };

  // --- LOGIC LOGOUT CHUẨN ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem('mock_user_session');
    // Chuyển hướng cứng về Landing Page
    window.location.href = '/'; 
  };

  const register = async (data: { full_name: string; email: string; phone: string; password: string }) => {
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setIsLoading(false);
    if (data.email.includes('exists')) return { success: false, error: 'Email đã tồn tại' };
    return { success: true };
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, register }}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;