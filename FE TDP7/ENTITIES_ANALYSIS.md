# Phân tích Các Thực thể (Entities) - Dự án TDP7

## Tổng quan
Tài liệu này liệt kê tất cả các thực thể (Entities) mà ứng dụng cần quản lý, cùng với các thuộc tính (attributes) bắt buộc dựa trên UI đã thiết kế.

---

## 1. User (Người dùng)

**Mục đích**: Quản lý thông tin tài khoản người dùng (cư dân và admin)

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất của người dùng
- `full_name` (string): Họ và tên đầy đủ
- `email` (string): Email đăng nhập (unique)
- `password` (string): Mật khẩu (hashed)
- `phone` (string): Số điện thoại
- `role` ('admin' | 'user'): Vai trò trong hệ thống
- `status` ('pending' | 'active' | 'inactive'): Trạng thái tài khoản
- `household_id` (string, optional): ID hộ khẩu (nếu là cư dân)
- `created_at` (datetime): Ngày tạo tài khoản
- `updated_at` (datetime): Ngày cập nhật cuối

### Thuộc tính tùy chọn:
- `avatar` (string): URL ảnh đại diện
- `last_login` (datetime): Lần đăng nhập cuối
- `reset_password_token` (string): Token reset mật khẩu
- `reset_password_expires` (datetime): Thời hạn token reset

---

## 2. Household (Hộ khẩu)

**Mục đích**: Quản lý thông tin hộ gia đình

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất của hộ
- `code` (string): Mã hộ khẩu (unique, ví dụ: "TDP7-2024-001")
- `address` (string): Địa chỉ thường trú đầy đủ
- `area` (number): Diện tích nhà ở (m²)
- `created_at` (datetime): Ngày đăng ký thường trú
- `updated_at` (datetime): Ngày cập nhật cuối

### Thuộc tính tùy chọn:
- `previous_address` (string): Địa chỉ cũ (nếu chuyển đến)
- `registration_date` (date): Ngày đăng ký thường trú
- `notes` (text): Ghi chú về hộ khẩu

### Quan hệ:
- `members`: Một hộ có nhiều thành viên (HouseholdMember)

---

## 3. HouseholdMember (Thành viên hộ khẩu)

**Mục đích**: Quản lý thông tin từng thành viên trong hộ gia đình

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất của thành viên
- `household_id` (string): ID hộ khẩu (foreign key)
- `name` (string): Họ và tên đầy đủ
- `role` ('Chủ hộ' | 'Vợ/Chồng' | 'Con' | 'Cha/Mẹ' | 'Ông/Bà' | 'Cháu' | 'Khác'): Quan hệ với chủ hộ
- `dob` (date): Ngày sinh (format: DD/MM/YYYY)
- `gender` ('Nam' | 'Nữ'): Giới tính
- `idCard` (string): Số CCCD/CMND (unique)
- `idIssueDate` (date): Ngày cấp CCCD
- `idIssuePlace` (string): Nơi cấp CCCD
- `ethnicity` (string): Dân tộc
- `religion` (string): Tôn giáo
- `occupation` (string): Nghề nghiệp
- `workplace` (string): Nơi làm việc
- `registrationDate` (date): Ngày đăng ký thường trú
- `previousAddress` (string): Địa chỉ cũ

### Thuộc tính tùy chọn:
- `avatar` (string): URL ảnh đại diện
- `isTemporary` (boolean): Đánh dấu tạm trú (default: false)
- `education_level` (string): Trình độ học vấn
- `phone` (string): Số điện thoại cá nhân
- `email` (string): Email cá nhân

---

## 4. NewsItem (Tin tức & Thông báo)

**Mục đích**: Quản lý tin tức, thông báo và sự kiện

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất của tin tức
- `title` (string): Tiêu đề thông báo
- `summary` (string): Mô tả ngắn (hiển thị ở danh sách)
- `content` (text): Nội dung chi tiết đầy đủ
- `date` (date): Ngày đăng tin
- `type` ('meeting' | 'health' | 'payment' | 'event' | 'security'): Loại tin tức
- `created_at` (datetime): Thời gian tạo
- `created_by` (string): ID người tạo (admin)

### Thuộc tính tùy chọn:
- `isImportant` (boolean): Đánh dấu tin khẩn cấp (default: false)
- `eventDate` (date): Ngày diễn ra sự kiện
- `startTime` (time): Giờ bắt đầu
- `endTime` (time): Giờ kết thúc
- `location` (string): Địa điểm tổ chức
- `image` (string): URL ảnh đính kèm
- `updated_at` (datetime): Thời gian cập nhật
- `isPublished` (boolean): Đã xuất bản chưa (default: true)

---

## 5. Booking (Đặt lịch)

**Mục đích**: Quản lý đặt lịch sử dụng cơ sở vật chất

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất của đặt lịch
- `user_id` (string): ID người đặt (foreign key)
- `household_code` (string): Mã hộ khẩu người đặt
- `service_id` (string): ID dịch vụ/địa điểm (foreign key)
- `date` (date): Ngày sử dụng
- `time_start` (time): Giờ bắt đầu
- `time_end` (time): Giờ kết thúc
- `fee` (number): Phí dịch vụ (VNĐ)
- `status` ('pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'): Trạng thái đặt lịch
- `purpose` (string): Mục đích sử dụng
- `created_at` (datetime): Thời gian tạo yêu cầu
- `payment_status` ('unpaid' | 'paid' | 'refunded'): Trạng thái thanh toán

### Thuộc tính tùy chọn:
- `payment_date` (datetime): Ngày thanh toán
- `payment_method` (string): Phương thức thanh toán
- `payment_reference` (string): Mã tham chiếu thanh toán
- `approved_by` (string): ID admin phê duyệt
- `approved_at` (datetime): Thời gian phê duyệt
- `rejection_reason` (text): Lý do từ chối
- `notes` (text): Ghi chú

---

## 6. Service (Dịch vụ)

**Mục đích**: Quản lý các dịch vụ/địa điểm có thể đặt lịch

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất của dịch vụ
- `name` (string): Tên dịch vụ/địa điểm
- `code` (string): Mã dịch vụ (unique)
- `category` ('location' | 'equipment'): Loại (địa điểm hoặc thiết bị)
- `fee` (number): Phí dịch vụ (VNĐ)
- `unit` ('buổi' | 'giờ' | 'ngày' | 'lượt'): Đơn vị tính phí
- `status` ('Available' | 'Maintenance' | 'Busy' | 'Rented'): Trạng thái

### Thuộc tính tùy chọn (cho Location):
- `capacity` (number): Sức chứa (người)
- `area` (number): Diện tích (m²)
- `type` ('Indoor' | 'Outdoor'): Loại không gian
- `floor` (string): Tầng/vị trí
- `manager` (string): Người quản lý
- `location` (string): Vị trí cụ thể

### Thuộc tính tùy chọn (cho Equipment):
- `total` (number): Tổng số lượng
- `broken` (number): Số lượng hỏng
- `location` (string): Vị trí lưu trữ
- `notes` (text): Ghi chú về thiết bị

### Thuộc tính chung:
- `description` (text): Mô tả dịch vụ
- `image` (string): URL ảnh
- `created_at` (datetime): Ngày tạo
- `updated_at` (datetime): Ngày cập nhật

---

## 7. Request (Yêu cầu)

**Mục đích**: Quản lý các yêu cầu từ cư dân (tạm trú, tạm vắng, khai sinh, v.v.)

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất của yêu cầu
- `type` ('tam_vang' | 'tam_tru' | 'dat_lich' | 'bien_dong' | 'khai_sinh' | 'khai_tu'): Loại yêu cầu
- `applicant_name` (string): Tên người nộp đơn
- `household_code` (string): Mã hộ khẩu
- `user_id` (string): ID người dùng (foreign key)
- `status` ('pending' | 'approved' | 'rejected'): Trạng thái
- `submitted_at` (datetime): Thời gian nộp đơn
- `details` (jsonb): Chi tiết yêu cầu (dạng JSON)

### Thuộc tính tùy chọn:
- `reason` (text): Lý do từ chối hoặc ghi chú
- `approved_by` (string): ID admin phê duyệt
- `approved_at` (datetime): Thời gian phê duyệt
- `rejected_by` (string): ID admin từ chối
- `rejected_at` (datetime): Thời gian từ chối
- `rejection_reason` (text): Lý do từ chối chi tiết
- `attachments` (jsonb): Danh sách file đính kèm (ảnh CCCD, v.v.)

### Chi tiết theo loại yêu cầu:

#### Tam Trú (tam_tru):
- `ho_ten` (string): Họ tên khách
- `ngay_sinh` (date): Ngày sinh
- `cccd` (string): Số CCCD
- `ly_do` (string): Lý do tạm trú
- `thoi_gian_luu_tru` (string): Thời gian lưu trú
- `permanent_address` (string): Địa chỉ thường trú

#### Tạm Vắng (tam_vang):
- `ho_ten` (string): Họ tên người đi
- `ngay_di` (date): Ngày đi
- `noi_den` (string): Nơi đến
- `ly_do` (string): Lý do tạm vắng

#### Khai Sinh (khai_sinh):
- `child_name` (string): Tên trẻ
- `dob` (date): Ngày sinh
- `gender` ('Nam' | 'Nữ'): Giới tính
- `mother_name` (string): Tên mẹ
- `hospital` (string): Bệnh viện sinh

---

## 8. Feedback (Phản ánh)

**Mục đích**: Quản lý phản ánh và góp ý từ cư dân

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất của phản ánh
- `user_id` (string): ID người gửi (foreign key)
- `household_code` (string): Mã hộ khẩu
- `resident` (string): Tên người phản ánh
- `apartment` (string): Số căn hộ/phòng
- `category` ('an_ninh' | 've_sinh' | 'ha_tang' | 'dich_vu' | 'khac'): Danh mục
- `type` (string): Loại cụ thể (Vệ sinh, Kỹ thuật, An ninh, Hành chính)
- `subject` (string): Tiêu đề phản ánh
- `description` (text): Nội dung chi tiết
- `status` ('pending' | 'processing' | 'resolved'): Trạng thái xử lý
- `priority` ('low' | 'medium' | 'high'): Mức độ ưu tiên
- `created_at` (datetime): Thời gian gửi

### Thuộc tính tùy chọn:
- `admin_response` (text): Phản hồi từ admin
- `admin_name` (string): Tên admin phản hồi
- `responded_at` (datetime): Thời gian phản hồi
- `history` (jsonb): Lịch sử xử lý (mảng các bản ghi)
- `attachments` (jsonb): File đính kèm (ảnh, video)
- `resolved_at` (datetime): Thời gian hoàn thành

### Cấu trúc history:
```json
[
  {
    "date": "25/12/2024 08:00",
    "action": "Đã tiếp nhận",
    "by": "Admin"
  }
]
```

---

## 9. Asset (Tài sản)

**Mục đích**: Quản lý tài sản công cộng (địa điểm và thiết bị)

### Thuộc tính chung bắt buộc:
- `id` (string): ID duy nhất
- `name` (string): Tên tài sản
- `code` (string): Mã tài sản (unique)
- `category` (string): Danh mục (Âm thanh, Nội thất, Điện tử, Dụng cụ, Thể thao)
- `created_at` (datetime): Ngày tạo
- `updated_at` (datetime): Ngày cập nhật

### Thuộc tính cho Location (Địa điểm):
- `capacity` (number): Sức chứa (người)
- `area` (number): Diện tích (m²)
- `type` ('Indoor' | 'Outdoor'): Loại không gian
- `floor` (string): Tầng/vị trí
- `manager` (string): Người quản lý
- `status` ('Available' | 'Maintenance' | 'Busy'): Trạng thái

### Thuộc tính cho Equipment (Thiết bị):
- `total_quantity` (number): Tổng số lượng
- `broken_quantity` (number): Số lượng hỏng
- `location` (string): Vị trí lưu trữ
- `last_maintenance` (date): Lần bảo trì cuối

### Thuộc tính tùy chọn:
- `notes` (text): Ghi chú
- `image` (string): URL ảnh

---

## 10. FeePayment (Phí & Đóng góp)

**Mục đích**: Quản lý các khoản phí và đóng góp của hộ gia đình

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất
- `household_code` (string): Mã hộ khẩu
- `title` (string): Tên khoản phí (VD: "Phí vệ sinh Q4/2024")
- `amount` (number): Số tiền (VNĐ)
- `type` ('mandatory' | 'voluntary'): Loại (Bắt buộc | Tự nguyện)
- `status` ('paid' | 'unpaid'): Trạng thái thanh toán
- `due_date` (date): Hạn thanh toán
- `created_at` (datetime): Ngày tạo

### Thuộc tính tùy chọn:
- `paid_at` (datetime): Ngày thanh toán
- `payment_method` (string): Phương thức thanh toán
- `payment_reference` (string): Mã tham chiếu
- `notes` (text): Ghi chú

---

## 11. Notification (Thông báo)

**Mục đích**: Quản lý thông báo cá nhân cho từng người dùng

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất
- `user_id` (string): ID người nhận (foreign key)
- `title` (string): Tiêu đề thông báo
- `message` (text): Nội dung thông báo
- `type` (string): Loại thông báo (Lịch họp, Thanh toán, Hành chính, Cảnh báo)
- `is_read` (boolean): Đã đọc chưa (default: false)
- `created_at` (datetime): Thời gian tạo

### Thuộc tính tùy chọn:
- `read_at` (datetime): Thời gian đọc
- `link` (string): Link liên kết (nếu có)
- `related_id` (string): ID đối tượng liên quan (booking_id, request_id, v.v.)
- `related_type` (string): Loại đối tượng liên quan

---

## 12. AccountRequest (Yêu cầu tài khoản)

**Mục đích**: Quản lý yêu cầu đăng ký tài khoản mới

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất
- `name` (string): Họ và tên
- `phone` (string): Số điện thoại
- `email` (string): Email (unique)
- `household_code` (string): Mã hộ khẩu
- `idCard` (string): Số CCCD/CMND
- `address` (string): Địa chỉ đăng ký
- `role` ('Chủ hộ' | 'Thành viên'): Vai trò trong hộ
- `status` ('pending' | 'approved' | 'rejected'): Trạng thái
- `submitted_at` (datetime): Thời gian nộp đơn

### Thuộc tính tùy chọn:
- `avatar` (string): URL ảnh đại diện
- `approved_by` (string): ID admin duyệt
- `approved_at` (datetime): Thời gian duyệt
- `rejection_reason` (text): Lý do từ chối
- `password_hash` (string): Mật khẩu (sau khi duyệt)

---

## 13. PasswordRequest (Yêu cầu đổi mật khẩu)

**Mục đích**: Quản lý yêu cầu đổi mật khẩu cần admin duyệt

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất
- `user_id` (string): ID người yêu cầu (foreign key)
- `name` (string): Tên người yêu cầu
- `phone` (string): Số điện thoại
- `email` (string): Email
- `household_code` (string): Mã hộ khẩu
- `reason` (text): Lý do yêu cầu
- `status` ('pending' | 'approved' | 'rejected'): Trạng thái
- `submitted_at` (datetime): Thời gian yêu cầu
- `last_login` (datetime): Lần đăng nhập cuối

### Thuộc tính tùy chọn:
- `approved_by` (string): ID admin duyệt
- `approved_at` (datetime): Thời gian duyệt
- `rejection_reason` (text): Lý do từ chối
- `new_password_hash` (string): Mật khẩu mới (sau khi duyệt)

---

## 14. Statistics (Thống kê)

**Mục đích**: Lưu trữ dữ liệu thống kê tổng hợp

### Thuộc tính bắt buộc:
- `id` (string): ID duy nhất
- `type` (string): Loại thống kê
- `period` (string): Kỳ thống kê (tháng/năm)
- `data` (jsonb): Dữ liệu thống kê (dạng JSON)
- `created_at` (datetime): Thời gian tạo

### Cấu trúc data mẫu:
```json
{
  "general": {
    "totalHouseholds": 412,
    "totalResidents": 1723,
    "tempResidents": 45,
    "absentResidents": 12,
    "pendingRequests": 8
  },
  "ageDistribution": [...],
  "genderDistribution": [...],
  "revenue": {...}
}
```

---

## Tổng hợp Quan hệ (Relationships)

### 1. User ↔ Household
- Một User thuộc về một Household (nếu là cư dân)
- Một Household có nhiều User (các thành viên có tài khoản)

### 2. Household ↔ HouseholdMember
- Một Household có nhiều HouseholdMember
- Một HouseholdMember thuộc về một Household

### 3. User ↔ Booking
- Một User có nhiều Booking
- Một Booking thuộc về một User

### 4. Service ↔ Booking
- Một Service có nhiều Booking
- Một Booking thuộc về một Service

### 5. User ↔ Request
- Một User có nhiều Request
- Một Request thuộc về một User

### 6. User ↔ Feedback
- Một User có nhiều Feedback
- Một Feedback thuộc về một User

### 7. User ↔ Notification
- Một User có nhiều Notification
- Một Notification thuộc về một User

### 8. Household ↔ FeePayment
- Một Household có nhiều FeePayment
- Một FeePayment thuộc về một Household

---

## Ghi chú quan trọng

1. **Timestamps**: Tất cả các entity nên có `created_at` và `updated_at` để theo dõi lịch sử
2. **Soft Delete**: Cân nhắc thêm `deleted_at` cho các entity quan trọng để hỗ trợ soft delete
3. **Audit Trail**: Các thao tác quan trọng (phê duyệt, từ chối) nên lưu `created_by`, `updated_by`
4. **Validation**: 
   - Email phải unique trong User và AccountRequest
   - CCCD phải unique trong HouseholdMember
   - Mã hộ khẩu phải unique
5. **Indexes**: Nên tạo index cho các trường thường xuyên query:
   - `email` trong User
   - `household_code` trong các bảng liên quan
   - `status` trong Request, Booking, Feedback
   - `created_at` để sắp xếp theo thời gian

---

## File liên quan trong Frontend

- `src/data/mockData.ts`: Chứa các interface và mock data
- `src/contexts/AuthContext.tsx`: Định nghĩa User type
- `src/pages/**/*.tsx`: Các trang sử dụng các entities này

