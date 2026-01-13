# Hướng dẫn Tích hợp API Backend

## Cấu hình

### 1. File `src/services/apiService.js`
- Base URL: `http://localhost:5000/api`
- Tự động thêm token vào header Authorization khi có
- Xử lý lỗi 401/403 tự động (xóa token và redirect về login)

### 2. API Endpoints

#### Đăng nhập
- **Method**: `POST`
- **URL**: `/auth/login`
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "123456"
  }
  ```
- **Response thành công**:
  ```json
  {
    "success": true,
    "message": "Đăng nhập thành công",
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "full_name": "Nguyễn Văn An",
      "email": "user@example.com",
      "role": "user",
      "avatar": null
    }
  }
  ```

#### Đăng ký
- **Method**: `POST`
- **URL**: `/auth/register`
- **Body**:
  ```json
  {
    "full_name": "Nguyễn Văn An",
    "email": "user@example.com",
    "password": "123456",
    "phone": "0912345678"
  }
  ```

#### Lấy thông tin cá nhân
- **Method**: `GET`
- **URL**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`

## Cách sử dụng

### Trong Component

```typescript
import { useAuth } from '@/contexts/AuthContext';

const MyComponent = () => {
  const { login, user, isLoading, logout } = useAuth();
  
  const handleLogin = async () => {
    const result = await login({ 
      email: 'user@example.com', 
      password: '123456' 
    });
    
    if (result.success) {
      // Đăng nhập thành công
      // Token và user đã được lưu tự động
    }
  };
  
  return <div>...</div>;
};
```

### Trực tiếp gọi API (nếu cần)

```typescript
import { loginAPI, registerAPI, getMeAPI } from '@/services/apiService';

// Đăng nhập
const result = await loginAPI('user@example.com', '123456');

// Đăng ký
const result = await registerAPI({
  full_name: 'Nguyễn Văn An',
  email: 'user@example.com',
  password: '123456',
  phone: '0912345678'
});

// Lấy thông tin (cần token)
const userInfo = await getMeAPI();
```

## Lưu trữ dữ liệu

- **accessToken**: Lưu trong `localStorage` với key `accessToken`
- **user**: Lưu trong `localStorage` với key `user` (JSON string)

## Xử lý lỗi

### Lỗi kết nối
- Timeout: 10 giây
- Hiển thị thông báo lỗi từ server hoặc "Lỗi kết nối đến server"

### Lỗi xác thực (401/403)
- Tự động xóa token và user khỏi localStorage
- Tự động redirect về `/login` (nếu không đang ở trang login)

## Lưu ý

1. **CORS**: Đảm bảo backend cho phép CORS từ frontend (http://localhost:5173 hoặc port Vite của bạn)

2. **Environment Variables**: Có thể tạo file `.env` để cấu hình baseURL:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```
   Sau đó cập nhật `apiService.js`:
   ```javascript
   baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'
   ```

3. **Token Expiration**: Token có thời hạn 1 ngày. Khi hết hạn, user cần đăng nhập lại.

4. **Loading State**: Sử dụng `isLoading` từ `AuthContext` để hiển thị loading state.

