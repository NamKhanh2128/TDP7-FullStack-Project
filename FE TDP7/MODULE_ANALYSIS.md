# Phân tích Các Cụm Chức năng (Modules) - Dự án TDP7

## Bảng tổng hợp các Module chính

| Tên Module | Các file Frontend liên quan | Chức năng dự đoán |
|------------|----------------------------|-------------------|
| **1. Xác thực & Đăng nhập** | `pages/auth/LoginPage.tsx`<br>`pages/auth/RegisterPage.tsx`<br>`pages/auth/ForgotPasswordPage.tsx`<br>`pages/auth/PendingPage.tsx`<br>`pages/auth/LandingPage.tsx`<br>`contexts/AuthContext.tsx` | Quản lý đăng nhập, đăng ký, quên mật khẩu, xác thực người dùng, phân quyền (User/Admin) |
| **2. Quản lý Cư dân** | `pages/admin/ResidentsPage.tsx`<br>`components/user/MemberCard.tsx`<br>`components/user/MemberDetailPopup.tsx` | Admin: Xem danh sách, tìm kiếm, lọc theo độ tuổi/giới tính, chỉnh sửa thông tin cư dân<br>User: Xem thông tin thành viên trong hộ gia đình |
| **3. Quản lý Hộ khẩu** | `pages/user/HouseholdPage.tsx`<br>`pages/admin/HouseholdsPage.tsx`<br>`components/user/MemberCard.tsx`<br>`components/user/MemberDetailPopup.tsx` | User: Xem thông tin hộ khẩu của mình, danh sách thành viên<br>Admin: Quản lý tất cả hộ khẩu, chỉnh sửa hồ sơ, tách hộ khẩu, tìm kiếm theo mã hộ/chủ hộ |
| **4. Khai báo & Biểu mẫu** | `pages/user/FormsPage.tsx`<br>`components/user/forms/TamTruForm.tsx`<br>`components/user/forms/TamVangForm.tsx`<br>`components/user/forms/BienDongForm.tsx` | User: Khai báo tạm trú (cho khách, người thuê trọ), tạm vắng (thành viên đi khỏi địa phương), biến động (sinh, tử, chuyển đi) |
| **5. Đặt lịch Nhà văn hóa** | `pages/user/BookingPage.tsx`<br>`pages/admin/BookingsPage.tsx`<br>`components/user/BookingWizard.tsx` | User: Đặt lịch sử dụng hội trường hoặc sân thể thao, chọn ngày giờ, thanh toán qua QR, xem lịch sử đặt lịch<br>Admin: Quản lý các yêu cầu đặt lịch, phê duyệt/từ chối |
| **6. Tin tức & Sự kiện** | `pages/user/NewsPage.tsx`<br>`pages/admin/AdminNewsPage.tsx`<br>`components/user/NewsCarousel.tsx` | User: Xem tin tức, thông báo, sự kiện, lịch họp tổ dân phố, tìm kiếm tin tức<br>Admin: Tạo, chỉnh sửa, xóa thông báo, phân loại tin (họp, y tế, thu phí, sự kiện), đánh dấu tin khẩn |
| **7. Phản ánh & Góp ý** | `pages/user/FeedbackPage.tsx`<br>`pages/admin/FeedbackPageManagement.tsx` | User: Gửi phản ánh về các vấn đề (an ninh, vệ sinh, hạ tầng, dịch vụ), xem lịch sử phản ánh và phản hồi từ admin<br>Admin: Xem danh sách phản ánh, cập nhật trạng thái (chờ/đang xử lý/hoàn thành), gửi phản hồi cho cư dân, xuất báo cáo |
| **8. Phê duyệt Yêu cầu** | `pages/admin/ApprovalsPage.tsx` | Admin: Duyệt các yêu cầu từ cư dân (tạm trú, tạm vắng, đặt lịch), duyệt tài khoản mới, duyệt yêu cầu đổi mật khẩu, từ chối với lý do |
| **9. Báo cáo & Thống kê** | `pages/admin/ReportsPage.tsx`<br>`pages/admin/AdminDashboard.tsx` | Admin: Xem báo cáo tổng hợp, thống kê số hộ, nhân khẩu, phân bố độ tuổi/giới tính, xuất báo cáo |
| **10. Quản lý Tài sản** | `pages/admin/AssetsPage.tsx` | Admin: Quản lý tài sản công cộng (hội trường, sân thể thao, thiết bị), theo dõi tình trạng, bảo trì |
| **11. Dashboard Tổng quan** | `pages/user/Dashboard.tsx`<br>`pages/admin/AdminDashboard.tsx` | User: Trang chủ với các chức năng nhanh (sổ hộ khẩu, khai báo, đặt lịch, phản ánh), tin tức mới nhất<br>Admin: Tổng quan hệ thống, số liệu thống kê, biểu đồ, danh sách yêu cầu chờ xử lý |
| **12. Tài khoản Cá nhân** | `pages/user/AccountPage.tsx` | User: Xem và chỉnh sửa thông tin cá nhân, đổi mật khẩu, cài đặt tài khoản |
| **13. Layout & Navigation** | `components/layout/UserLayout.tsx`<br>`components/layout/AdminLayout.tsx`<br>`components/layout/Header.tsx`<br>`components/layout/Sidebar.tsx`<br>`components/layout/BottomNav.tsx`<br>`components/layout/NotificationPopover.tsx`<br>`components/NavLink.tsx` | Layout chung cho User và Admin, điều hướng, header, sidebar, bottom navigation (mobile), thông báo |
| **14. UI Components** | `components/ui/*` (tất cả các file trong thư mục ui) | Thư viện component UI tái sử dụng: Button, Card, Dialog, Table, Form, Badge, Tabs, Select, Input, v.v. |

---

## Chi tiết theo từng Module

### Module 1: Xác thực & Đăng nhập
- **Mục đích**: Quản lý phiên đăng nhập, phân quyền người dùng
- **Tính năng chính**:
  - Đăng nhập với email/password
  - Đăng ký tài khoản mới (chờ admin duyệt)
  - Quên mật khẩu
  - Trang chờ duyệt tài khoản
  - Landing page giới thiệu

### Module 2: Quản lý Cư dân
- **Mục đích**: Quản lý thông tin nhân khẩu trong tổ dân phố
- **Tính năng chính**:
  - Admin: Xem danh sách tất cả cư dân, tìm kiếm, lọc, chỉnh sửa
  - User: Xem thông tin thành viên trong hộ của mình
  - Hiển thị chi tiết: CCCD, nghề nghiệp, trình độ học vấn

### Module 3: Quản lý Hộ khẩu
- **Mục đích**: Quản lý sổ hộ khẩu điện tử
- **Tính năng chính**:
  - User: Xem thông tin hộ khẩu của mình
  - Admin: Quản lý tất cả hộ, chỉnh sửa hồ sơ, tách hộ khẩu
  - Hiển thị địa chỉ, mã hộ, danh sách thành viên

### Module 4: Khai báo & Biểu mẫu
- **Mục đích**: Cư dân khai báo các thay đổi về nhân khẩu
- **Tính năng chính**:
  - Khai báo tạm trú (sinh viên, người thuê trọ)
  - Khai báo tạm vắng (thành viên đi khỏi địa phương)
  - Khai báo biến động (sinh, tử, chuyển đi)
  - Upload ảnh CCCD, điền form chi tiết

### Module 5: Đặt lịch Nhà văn hóa
- **Mục đích**: Đặt lịch sử dụng cơ sở vật chất công cộng
- **Tính năng chính**:
  - User: Chọn dịch vụ (hội trường/sân thể thao), chọn ngày giờ, thanh toán QR
  - Xem lịch sử đặt lịch, trạng thái (chờ duyệt/đã duyệt)
  - Admin: Quản lý và phê duyệt các yêu cầu đặt lịch

### Module 6: Tin tức & Sự kiện
- **Mục đích**: Thông báo tin tức và sự kiện đến cư dân
- **Tính năng chính**:
  - User: Xem tin tức, thông báo, lịch họp, tìm kiếm
  - Admin: Tạo/sửa/xóa thông báo, phân loại, đánh dấu khẩn
  - Hiển thị carousel tin tức trên trang chủ

### Module 7: Phản ánh & Góp ý
- **Mục đích**: Tiếp nhận và xử lý phản ánh từ cư dân
- **Tính năng chính**:
  - User: Gửi phản ánh theo danh mục, xem lịch sử và phản hồi
  - Admin: Xem danh sách, cập nhật trạng thái, gửi phản hồi
  - Theo dõi tiến độ xử lý (chờ/đang xử lý/hoàn thành)

### Module 8: Phê duyệt Yêu cầu
- **Mục đích**: Admin duyệt các yêu cầu từ cư dân
- **Tính năng chính**:
  - Duyệt khai báo (tạm trú, tạm vắng)
  - Duyệt đặt lịch
  - Duyệt tài khoản mới
  - Duyệt yêu cầu đổi mật khẩu
  - Từ chối với lý do cụ thể

### Module 9: Báo cáo & Thống kê
- **Mục đích**: Thống kê và báo cáo tổng hợp
- **Tính năng chính**:
  - Thống kê số hộ, nhân khẩu
  - Phân bố độ tuổi, giới tính (biểu đồ)
  - Xuất báo cáo

### Module 10: Quản lý Tài sản
- **Mục đích**: Quản lý tài sản công cộng
- **Tính năng chính**:
  - Quản lý hội trường, sân thể thao
  - Theo dõi tình trạng, lịch sử sử dụng

### Module 11: Dashboard Tổng quan
- **Mục đích**: Trang chủ với tổng quan hệ thống
- **Tính năng chính**:
  - User: Truy cập nhanh các chức năng, tin tức mới
  - Admin: Thống kê tổng quan, biểu đồ, yêu cầu chờ xử lý

### Module 12: Tài khoản Cá nhân
- **Mục đích**: Quản lý thông tin cá nhân
- **Tính năng chính**:
  - Xem và chỉnh sửa thông tin
  - Đổi mật khẩu
  - Cài đặt tài khoản

### Module 13: Layout & Navigation
- **Mục đích**: Cấu trúc giao diện và điều hướng
- **Tính năng chính**:
  - Layout riêng cho User và Admin
  - Header với thông báo
  - Sidebar navigation
  - Bottom navigation cho mobile
  - Responsive design

### Module 14: UI Components
- **Mục đích**: Thư viện component tái sử dụng
- **Tính năng chính**:
  - Các component cơ bản: Button, Input, Card, Dialog
  - Component phức tạp: Table, Form, Chart, Calendar
  - Component đặc biệt: StatusBadge, NotificationPopover

---

## Ghi chú
- Tất cả các module đều có tích hợp với `AuthContext` để quản lý phiên đăng nhập
- Dữ liệu mock hiện tại được lưu trong `data/mockData.ts`
- Hệ thống hỗ trợ responsive design cho cả desktop và mobile
- Sử dụng React Router để điều hướng giữa các trang
- UI được xây dựng với Tailwind CSS và shadcn/ui components

