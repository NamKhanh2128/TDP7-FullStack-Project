# Hướng dẫn tạo file .env

Tạo file `.env` trong thư mục `BE TDP 7/Admin/` với nội dung sau:

```env
# Database Configuration
DB_SERVER=localhost
DB_USER=api_user
DB_PASSWORD=123456
DB_DATABASE=NVHDB
DB_PORT=1433

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Secret Key (dùng để ký và verify token)
# Lưu ý: Nên tạo một chuỗi ngẫu nhiên mạnh cho production
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
```

## Lưu ý:
- Thay đổi các giá trị phù hợp với cấu hình SQL Server của bạn
- File `.env` đã được thêm vào `.gitignore` để không commit lên git
- **JWT_SECRET**: Nên sử dụng chuỗi ngẫu nhiên mạnh (ít nhất 32 ký tự) cho môi trường production

