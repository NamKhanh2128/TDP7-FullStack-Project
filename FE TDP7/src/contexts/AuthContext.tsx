import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAPI, registerAPI, getMeAPI } from '@/services/apiService';

type User = {
  id: string;
  full_name: string;
  email: string;
  status?: 'pending' | 'active';
  role?: 'admin' | 'user';
  phone?: string;
  avatar?: string;
};

type LoginResult = { 
  success?: boolean; 
  status?: string; 
  error?: string; 
  message?: string;
  role?: 'admin' | 'user';
  user?: User;
  accessToken?: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: (creds: { email: string; password: string }) => Promise<LoginResult>;
  loginWithToken: (token: string, userData: User) => void; // Hàm mới: login trực tiếp với token và userData
  logout: () => void;
  register: (data: { full_name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string; message?: string }>;
  updateUser: (userData: User) => void; // Hàm cập nhật thông tin user
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user từ localStorage khi khởi động app
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('accessToken');
        
        if (storedUser && storedToken) {
          try {
            // Parse user từ localStorage
            const parsedUser = JSON.parse(storedUser) as User;
            // Set user vào state ngay lập tức
            setUser(parsedUser);
            
            // (Tùy chọn) Có thể verify token với API để lấy thông tin mới nhất
            // try {
            //   const response = await getMeAPI();
            //   if (response.success && response.data) {
            //     setUser(response.data);
            //     localStorage.setItem('user', JSON.stringify(response.data));
            //   }
            // } catch (error) {
            //   // Nếu API lỗi, vẫn dùng user từ localStorage
            //   console.warn('Không thể verify token, sử dụng user từ localStorage');
            // }
          } catch (parseError) {
            console.error("Lỗi parse user từ localStorage:", parseError);
            // Xóa dữ liệu không hợp lệ
            localStorage.removeItem('user');
            localStorage.removeItem('accessToken');
          }
        } else if (storedUser) {
          // Chỉ có user, không có token - vẫn load user
          try {
            const parsedUser = JSON.parse(storedUser) as User;
            setUser(parsedUser);
          } catch (parseError) {
            console.error("Lỗi parse user:", parseError);
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error("Lỗi load user:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  // Hàm login với email/password (gọi API)
  const login = async ({ email, password }: { email: string; password: string }): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      const response = await loginAPI(email, password);
      
      if (response.success && response.accessToken) {
        // Lưu token và user vào localStorage
        localStorage.setItem('accessToken', response.accessToken);
        if (response.user) {
          localStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
        }
        
        return {
          success: true,
          role: response.user?.role || 'user',
          user: response.user,
          accessToken: response.accessToken,
          status: response.status || response.user?.status, // Thêm status vào return
        };
      } else {
        return {
          success: false,
          error: response.message || 'Đăng nhập thất bại',
          status: response.status, // Thêm status vào return (có thể là 'pending')
        };
      }
    } catch (error: any) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Email hoặc mật khẩu không đúng',
        message: error.message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm login trực tiếp với token và userData (không gọi API)
  const loginWithToken = (token: string, userData: User) => {
    // Lưu token và user vào localStorage
    localStorage.setItem('accessToken', token);
    localStorage.setItem('user', JSON.stringify(userData));
    // Cập nhật state
    setUser(userData);
  };

  // --- LOGIC LOGOUT CHUẨN ---
  const logout = () => {
    setUser(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    // Chuyển hướng cứng về Landing Page
    window.location.href = '/'; 
  };

  const register = async (data: { full_name: string; email: string; phone: string; password: string }) => {
    setIsLoading(true);
    try {
      const response = await registerAPI(data);
      return {
        success: response.success || false,
        error: response.success ? undefined : (response.message || 'Đăng ký thất bại'),
        message: response.message,
      };
    } catch (error: any) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.message || 'Đăng ký thất bại',
        message: error.message,
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm cập nhật thông tin user
  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, loginWithToken, logout, register, updateUser }}>
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