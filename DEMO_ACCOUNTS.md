# 🔐 TÀI KHOẢN DEMO - TDP7

## Mật khẩu chuẩn cho TẤT CẢ tài khoản: `123456`

---

## 📋 Danh sách tài khoản

### 1. Admin Account
- **Email:** `admin@gmail.com`
- **Password:** `123456`
- **Role:** `admin`
- **Status:** `active`
- **ID:** `00000000-0000-0000-0000-000000000001`

### 2. Test User Account
- **Email:** `test@gmail.com`
- **Password:** `123456`
- **Role:** `user`
- **Status:** `active`
- **ID:** `00000000-0000-0000-0000-000000000002`
- **Full Name:** Nguyễn Văn A
- **Phone:** 0912345678

### 3. User Account
- **Email:** `user@gmail.com`
- **Password:** `123456`
- **Role:** `user`
- **Status:** `active`
- **ID:** `00000000-0000-0000-0000-000000000003`
- **Full Name:** Trần Thị B
- **Phone:** 0923456789

---

## 🔄 Đồng nhất trong toàn bộ hệ thống

### Database Schema (`database_schema.sql`)
- ✅ Tạo 3 tài khoản mặc định khi chạy script
- ✅ Tất cả dùng cùng password hash: `$2a$10$rFqy48hXWskTFJfQHeXbRu2gafF5duSLMxGt.cY1UUnSjm4q1nKa2`

### Seed Script (`BE TDP 7/scripts/seed.js`)
- ✅ Tạo cùng 3 tài khoản với cùng IDs
- ✅ Hash password động nhưng cùng mật khẩu: `123456`

### Backend Code
- ✅ Không hardcode password
- ✅ Sử dụng bcrypt để hash/verify

---

## 🚀 Cách sử dụng

### Tạo database từ schema:
```sql
-- Chạy trong SQL Server Management Studio
sqlcmd -S localhost -i database_schema.sql
```

### Hoặc chạy seed script:
```bash
cd "BE TDP 7"
npm run seed
```

### Test login:
```bash
# Admin
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"123456"}'

# User test
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@gmail.com","password":"123456"}'

# User
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@gmail.com","password":"123456"}'
```

---

## ⚠️ Lưu ý

1. **Mật khẩu:** Tất cả tài khoản dùng mật khẩu `123456` (chỉ dùng cho demo/test)
2. **IDs cố định:** Các tài khoản có IDs cố định để đảm bảo đồng nhất giữa schema và seed
3. **Production:** Thay đổi mật khẩu ngay khi deploy production
