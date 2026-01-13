# 📊 DATABASE SCHEMA - TDP7

## Tổng quan
Database được thiết kế lại từ đầu, chuẩn chỉ với:
- ✅ Đúng data types
- ✅ Primary keys & Foreign keys
- ✅ Indexes tối ưu
- ✅ Constraints (CHECK, UNIQUE)
- ✅ Triggers tự động cập nhật timestamps
- ✅ Seed data admin mặc định

## Cấu trúc bảng

### 1. AppUser (Người dùng)
- **id**: NVARCHAR(36) - UUID
- **email**: UNIQUE, INDEXED
- **role**: 'user' | 'admin' (CHECK)
- **status**: 'active' | 'inactive' | 'pending' (CHECK)
- **household_id**: FK → Household

### 2. Household (Hộ khẩu)
- **id**: NVARCHAR(36) - UUID
- **code**: UNIQUE, INDEXED
- **owner_id**: FK → AppUser

### 3. HouseholdMember (Thành viên hộ khẩu)
- **id**: NVARCHAR(36) - UUID
- **household_id**: FK → Household (CASCADE DELETE)
- **idCard**: INDEXED

### 4. Facility (Cơ sở vật chất)
- **id**: INT IDENTITY
- **type**: INDEXED
- **status**: 'Active' | 'Inactive' | 'Maintenance' (CHECK)

### 5. FacilityBooking (Đặt chỗ)
- **id**: INT IDENTITY
- **user_id**: FK → AppUser (CASCADE DELETE)
- **facility_id**: FK → Facility (CASCADE DELETE)
- **status**: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed' (CHECK)

### 6. RegistrationRequest (Yêu cầu đăng ký)
- **id**: UNIQUEIDENTIFIER (NEWID())
- **user_id**: FK → AppUser (CASCADE DELETE)
- **status**: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' (CHECK)

### 7. Report (Báo cáo)
- **id**: INT IDENTITY
- **user_id**: FK → AppUser (CASCADE DELETE)
- **status**: 'Pending' | 'Processing' | 'Resolved' | 'Rejected' (CHECK)

### 8. Feedback (Phản hồi)
- **id**: UNIQUEIDENTIFIER (NEWID())
- **user_id**: FK → AppUser (CASCADE DELETE)
- **status**: 'Pending' | 'Reviewed' | 'Resolved' | 'Rejected' (CHECK)

### 9. Notification (Thông báo)
- **id**: INT IDENTITY
- **is_urgent**: BIT (INDEXED)

## Indexes

Mỗi bảng có indexes cho:
- Foreign keys
- Các cột thường query (status, type, email, code)
- Các cột tìm kiếm (location, category)

## Triggers

Tự động cập nhật `updated_at` khi UPDATE:
- TR_AppUser_Update
- TR_Household_Update
- TR_HouseholdMember_Update
- TR_Facility_Update
- TR_FacilityBooking_Update
- TR_RegistrationRequest_Update
- TR_Report_Update
- TR_Feedback_Update
- TR_Notification_Update

## Seed Data

**Admin mặc định:**
- Email: `admin@gmail.com`
- Password: `123456`
- Role: `admin`
- Status: `active`

## Cách sử dụng

```sql
-- Chạy script tạo database
sqlcmd -S localhost -i database_schema.sql

-- Hoặc trong SQL Server Management Studio
-- Mở file database_schema.sql và Execute
```

## Lưu ý

1. **UUID vs IDENTITY**: 
   - AppUser, Household, HouseholdMember dùng UUID (NVARCHAR(36))
   - Facility, FacilityBooking, Report, Notification dùng IDENTITY (INT)

2. **Foreign Keys**:
   - CASCADE DELETE cho các bảng phụ thuộc (Booking, Request, Report, Feedback)
   - SET NULL cho Household ↔ AppUser (tránh circular dependency)

3. **Timestamps**:
   - `created_at`: Tự động khi INSERT
   - `updated_at`: Tự động khi UPDATE (qua Trigger)
