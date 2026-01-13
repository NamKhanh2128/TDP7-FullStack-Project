# Hướng dẫn Test API Authentication

## 1. Đăng ký (Register)

### Endpoint
```
POST http://localhost:5000/api/auth/register
```

### Request Body
```json
{
  "full_name": "Nguyễn Văn An",
  "email": "test@example.com",
  "password": "123456",
  "phone": "0912345678"
}
```

### Response thành công (201)
```json
{
  "success": true,
  "message": "Đăng ký thành công!",
  "data": {
    "id": "uuid-here",
    "full_name": "Nguyễn Văn An",
    "email": "test@example.com",
    "status": "pending"
  }
}
```

---

## 2. Đăng nhập (Login)

### Endpoint
```
POST http://localhost:5000/api/auth/login
```

### Request Body
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```

### Response thành công (200)
```json
{
  "success": true,
  "message": "Đăng nhập thành công",
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid-here",
    "full_name": "Nguyễn Văn An",
    "email": "test@example.com",
    "role": "user",
    "avatar": null
  }
}
```

**Lưu ý**: Lưu lại `accessToken` để sử dụng cho các API yêu cầu xác thực.

---

## 3. Lấy thông tin cá nhân (Get Me)

### Endpoint
```
GET http://localhost:5000/api/auth/me
```

### Headers (QUAN TRỌNG)
```
Authorization: Bearer <accessToken>
```

Ví dụ:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Response thành công (200)
```json
{
  "success": true,
  "message": "Lấy thông tin user thành công",
  "data": {
    "id": "uuid-here",
    "full_name": "Nguyễn Văn An",
    "email": "test@example.com",
    "phone": "0912345678",
    "role": "user",
    "avatar": null,
    "status": "pending",
    "created_at": "2024-12-26T...",
    "updated_at": "2024-12-26T..."
  }
}
```

### Response lỗi - Không có token (401)
```json
{
  "success": false,
  "message": "Không tìm thấy token. Vui lòng đăng nhập."
}
```

### Response lỗi - Token không hợp lệ (403)
```json
{
  "success": false,
  "message": "Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.",
  "error": "jwt expired"
}
```

---

## Test với cURL

### 1. Đăng ký
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyễn Văn An",
    "email": "test@example.com",
    "password": "123456",
    "phone": "0912345678"
  }'
```

### 2. Đăng nhập (lưu token)
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "123456"
  }'
```

### 3. Lấy thông tin cá nhân (thay YOUR_TOKEN bằng token từ bước 2)
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Test với Postman

### 1. Đăng ký
- Method: `POST`
- URL: `http://localhost:5000/api/auth/register`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "full_name": "Nguyễn Văn An",
  "email": "test@example.com",
  "password": "123456",
  "phone": "0912345678"
}
```

### 2. Đăng nhập
- Method: `POST`
- URL: `http://localhost:5000/api/auth/login`
- Headers: `Content-Type: application/json`
- Body (raw JSON):
```json
{
  "email": "test@example.com",
  "password": "123456"
}
```
- Copy `accessToken` từ response

### 3. Lấy thông tin cá nhân
- Method: `GET`
- URL: `http://localhost:5000/api/auth/me`
- Headers:
  - `Authorization: Bearer <paste_token_here>`

---

## Lưu ý

1. **JWT_SECRET**: Đảm bảo đã thêm `JWT_SECRET` vào file `.env`
2. **Token expiration**: Token có thời hạn 1 ngày (24 giờ)
3. **Format token**: Phải có prefix "Bearer " trước token trong header Authorization
4. **Bảo mật**: Không commit token vào git, không log token ra console

