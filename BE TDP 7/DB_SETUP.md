# 🔧 DATABASE CONNECTION SETUP

## Connection String

Sử dụng connection string với Windows Authentication:

```
Server=localhost\MSSQLSERVER01;Database=NVHDB;Trusted_Connection=True;
```

## Cách cấu hình

### Option 1: Sử dụng .env file (Recommended)

Tạo file `.env` trong thư mục `BE TDP 7/`:

```env
DB_CONNECTION_STRING=Server=localhost\MSSQLSERVER01;Database=NVHDB;Trusted_Connection=True;
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Option 2: Sử dụng Environment Variables riêng lẻ

```env
DB_SERVER=localhost
DB_INSTANCE=MSSQLSERVER01
DB_NAME=NVHDB
DB_USE_WINDOWS_AUTH=true
JWT_SECRET=your_secret_key_here
PORT=5000
```

### Option 3: SQL Server Authentication (nếu không dùng Windows Auth)

```env
DB_SERVER=localhost
DB_USER=api_user
DB_PASSWORD=your_password
DB_NAME=NVHDB
DB_PORT=1433
JWT_SECRET=your_secret_key_here
PORT=5000
```

## Lưu ý

1. **Database Name**: Luôn sử dụng `NVHDB` (không phải `master`)
2. **Windows Authentication**: Khi dùng `Trusted_Connection=True`, không cần `user` và `password`
3. **Instance Name**: `MSSQLSERVER01` là tên instance SQL Server của bạn
4. **Server**: `localhost` hoặc IP address của SQL Server

## Kiểm tra kết nối

Sau khi cấu hình, chạy server:

```bash
cd "BE TDP 7"
npm run dev
```

Nếu kết nối thành công, bạn sẽ thấy:
```
✅ Database connected successfully
```

Nếu có lỗi, kiểm tra:
- SQL Server đang chạy?
- Instance name đúng chưa?
- Database `NVHDB` đã được tạo chưa?
- Windows Authentication có quyền truy cập?
