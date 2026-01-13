# Hướng dẫn Test API Đăng ký

## Cài đặt bcryptjs

Trước khi chạy, cần cài đặt package `bcryptjs`:

```bash
cd "BE TDP 7/Admin"
npm install bcryptjs
```

## Test API Register

### Endpoint
```
POST http://localhost:5000/api/auth/register
```

### Request Body (JSON)
```json
{
  "full_name": "Nguyễn Văn An",
  "email": "nguyenvanan@example.com",
  "password": "123456",
  "phone": "0912345678"
}
```

### Test với cURL
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyễn Văn An",
    "email": "nguyenvanan@example.com",
    "password": "123456",
    "phone": "0912345678"
  }'
```

### Test với Postman
1. Method: `POST`
2. URL: `http://localhost:5000/api/auth/register`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "full_name": "Nguyễn Văn An",
  "email": "nguyenvanan@example.com",
  "password": "123456",
  "phone": "0912345678"
}
```

### Response thành công (201)
```json
{
  "success": true,
  "message": "Đăng ký tài khoản thành công. Tài khoản đang chờ phê duyệt từ quản trị viên.",
  "data": {
    "id": "uuid-hoặc-id",
    "full_name": "Nguyễn Văn An",
    "email": "nguyenvanan@example.com",
    "phone": "0912345678",
    "role": "user",
    "status": "pending",
    "created_at": "2024-12-26T..."
  }
}
```

### Response lỗi - Email đã tồn tại (409)
```json
{
  "success": false,
  "message": "Email đã được sử dụng. Vui lòng sử dụng email khác."
}
```

### Response lỗi - Thiếu thông tin (400)
```json
{
  "success": false,
  "message": "Vui lòng điền đầy đủ thông tin",
  "errors": {
    "full_name": null,
    "email": "Email là bắt buộc",
    "password": null,
    "phone": null
  }
}
```

## Lưu ý về Database

Đảm bảo bảng `[User]` có các cột sau:
- `id` (unique identifier)
- `full_name` (nvarchar)
- `email` (nvarchar, unique)
- `password` (nvarchar - lưu mật khẩu đã hash)
- `phone` (nvarchar)
- `role` (nvarchar, default: 'user')
- `status` (nvarchar, default: 'pending')
- `created_at` (datetime)
- `updated_at` (datetime)

### SQL Script tạo bảng (nếu chưa có)
```sql
CREATE TABLE [User] (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    role NVARCHAR(50) DEFAULT 'user',
    status NVARCHAR(50) DEFAULT 'pending',
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

CREATE INDEX IX_User_Email ON [User](email);
```

