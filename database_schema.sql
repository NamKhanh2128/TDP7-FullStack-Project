-- =============================================
-- TDP7 DATABASE SCHEMA - CHUẨN CHỈ
-- =============================================
-- Database: NVHDB
-- Version: 2.0.0
-- Created: 2024
-- =============================================

USE [master]
GO

-- Drop database nếu tồn tại
IF EXISTS (SELECT name FROM sys.databases WHERE name = N'NVHDB')
BEGIN
    ALTER DATABASE [NVHDB] SET SINGLE_USER WITH ROLLBACK IMMEDIATE
    DROP DATABASE [NVHDB]
END
GO

CREATE DATABASE [NVHDB]
GO

USE [NVHDB]
GO

-- =============================================
-- 1. BẢNG NGƯỜI DÙNG (AppUser)
-- =============================================
CREATE TABLE [dbo].[AppUser] (
    [id] NVARCHAR(36) NOT NULL,
    [full_name] NVARCHAR(100) NOT NULL,
    [email] NVARCHAR(100) NOT NULL,
    [password] NVARCHAR(255) NOT NULL,
    [phone] NVARCHAR(20) NULL,
    [role] NVARCHAR(20) NOT NULL DEFAULT 'user',
    [status] NVARCHAR(20) NOT NULL DEFAULT 'pending',
    [household_id] NVARCHAR(36) NULL,
    [avatar] NVARCHAR(255) NULL,
    [dob] DATE NULL,
    [gender] NVARCHAR(10) NULL,
    [cccd] NVARCHAR(20) NULL,
    [job] NVARCHAR(100) NULL,
    [workplace] NVARCHAR(255) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_AppUser] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_AppUser_Email] UNIQUE ([email]),
    CONSTRAINT [CK_AppUser_Role] CHECK ([role] IN ('user', 'admin')),
    CONSTRAINT [CK_AppUser_Status] CHECK ([status] IN ('active', 'inactive', 'pending'))
)
GO

CREATE NONCLUSTERED INDEX [IX_AppUser_Email] ON [dbo].[AppUser] ([email])
GO
CREATE NONCLUSTERED INDEX [IX_AppUser_HouseholdId] ON [dbo].[AppUser] ([household_id])
GO
CREATE NONCLUSTERED INDEX [IX_AppUser_Status] ON [dbo].[AppUser] ([status])
GO

-- =============================================
-- 2. BẢNG HỘ KHẨU (Household)
-- =============================================
CREATE TABLE [dbo].[Household] (
    [id] NVARCHAR(36) NOT NULL,
    [code] NVARCHAR(50) NOT NULL,
    [address] NVARCHAR(255) NOT NULL,
    [area] DECIMAL(10, 2) NOT NULL DEFAULT 0,
    [owner_id] NVARCHAR(36) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Household] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [UQ_Household_Code] UNIQUE ([code])
)
GO

CREATE NONCLUSTERED INDEX [IX_Household_Code] ON [dbo].[Household] ([code])
GO
CREATE NONCLUSTERED INDEX [IX_Household_OwnerId] ON [dbo].[Household] ([owner_id])
GO

-- Foreign Key: Household -> AppUser (owner) - Tạo sau khi AppUser đã tồn tại
ALTER TABLE [dbo].[Household]
ADD CONSTRAINT [FK_Household_Owner] 
FOREIGN KEY ([owner_id]) REFERENCES [dbo].[AppUser] ([id]) ON DELETE SET NULL
GO

-- Foreign Key: AppUser -> Household - Tạo sau khi Household đã tồn tại
ALTER TABLE [dbo].[AppUser]
ADD CONSTRAINT [FK_AppUser_Household] 
FOREIGN KEY ([household_id]) REFERENCES [dbo].[Household] ([id]) ON DELETE SET NULL
GO

-- =============================================
-- 3. BẢNG THÀNH VIÊN HỘ KHẨU (HouseholdMember)
-- =============================================
CREATE TABLE [dbo].[HouseholdMember] (
    [id] NVARCHAR(36) NOT NULL,
    [household_id] NVARCHAR(36) NOT NULL,
    [name] NVARCHAR(100) NOT NULL,
    [role] NVARCHAR(50) NULL,
    [dob] DATE NOT NULL,
    [gender] NVARCHAR(10) NULL,
    [idCard] NVARCHAR(20) NULL,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_HouseholdMember] PRIMARY KEY CLUSTERED ([id] ASC)
)
GO

CREATE NONCLUSTERED INDEX [IX_HouseholdMember_HouseholdId] ON [dbo].[HouseholdMember] ([household_id])
GO
CREATE NONCLUSTERED INDEX [IX_HouseholdMember_IdCard] ON [dbo].[HouseholdMember] ([idCard])
GO

ALTER TABLE [dbo].[HouseholdMember]
ADD CONSTRAINT [FK_HouseholdMember_Household] 
FOREIGN KEY ([household_id]) REFERENCES [dbo].[Household] ([id]) ON DELETE CASCADE
GO

-- =============================================
-- 4. BẢNG CƠ SỞ VẬT CHẤT (Facility)
-- =============================================
CREATE TABLE [dbo].[Facility] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [name] NVARCHAR(255) NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [price] DECIMAL(10, 2) NOT NULL DEFAULT 0,
    [location] NVARCHAR(255) NULL,
    [capacity] INT NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'Active',
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Facility] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [CK_Facility_Status] CHECK ([status] IN ('Active', 'Inactive', 'Maintenance'))
)
GO

CREATE NONCLUSTERED INDEX [IX_Facility_Type] ON [dbo].[Facility] ([type])
GO
CREATE NONCLUSTERED INDEX [IX_Facility_Status] ON [dbo].[Facility] ([status])
GO
CREATE NONCLUSTERED INDEX [IX_Facility_Location] ON [dbo].[Facility] ([location])
GO

-- =============================================
-- 5. BẢNG ĐẶT CHỖ CƠ SỞ VẬT CHẤT (FacilityBooking)
-- =============================================
CREATE TABLE [dbo].[FacilityBooking] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [user_id] NVARCHAR(36) NOT NULL,
    [facility_id] INT NOT NULL,
    [booking_date] DATE NOT NULL,
    [start_time] TIME(7) NOT NULL,
    [end_time] TIME(7) NOT NULL,
    [purpose] NVARCHAR(255) NULL,
    [attendees_count] INT NOT NULL DEFAULT 1,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_FacilityBooking] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [CK_FacilityBooking_Status] CHECK ([status] IN ('Pending', 'Approved', 'Rejected', 'Cancelled', 'Completed'))
)
GO

CREATE NONCLUSTERED INDEX [IX_FacilityBooking_UserId] ON [dbo].[FacilityBooking] ([user_id])
GO
CREATE NONCLUSTERED INDEX [IX_FacilityBooking_FacilityId] ON [dbo].[FacilityBooking] ([facility_id])
GO
CREATE NONCLUSTERED INDEX [IX_FacilityBooking_Status] ON [dbo].[FacilityBooking] ([status])
GO
CREATE NONCLUSTERED INDEX [IX_FacilityBooking_Date] ON [dbo].[FacilityBooking] ([booking_date])
GO

ALTER TABLE [dbo].[FacilityBooking]
ADD CONSTRAINT [FK_FacilityBooking_User] 
FOREIGN KEY ([user_id]) REFERENCES [dbo].[AppUser] ([id]) ON DELETE CASCADE
GO

ALTER TABLE [dbo].[FacilityBooking]
ADD CONSTRAINT [FK_FacilityBooking_Facility] 
FOREIGN KEY ([facility_id]) REFERENCES [dbo].[Facility] ([id]) ON DELETE CASCADE
GO

-- =============================================
-- 6. BẢNG YÊU CẦU ĐĂNG KÝ (RegistrationRequest)
-- =============================================
CREATE TABLE [dbo].[RegistrationRequest] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [user_id] NVARCHAR(36) NOT NULL,
    [type] NVARCHAR(50) NOT NULL,
    [reason] NVARCHAR(500) NULL,
    [start_date] DATETIME2(7) NULL,
    [end_date] DATETIME2(7) NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_RegistrationRequest] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [CK_RegistrationRequest_Status] CHECK ([status] IN ('Pending', 'Approved', 'Rejected', 'Cancelled'))
)
GO

CREATE NONCLUSTERED INDEX [IX_RegistrationRequest_UserId] ON [dbo].[RegistrationRequest] ([user_id])
GO
CREATE NONCLUSTERED INDEX [IX_RegistrationRequest_Status] ON [dbo].[RegistrationRequest] ([status])
GO
CREATE NONCLUSTERED INDEX [IX_RegistrationRequest_Type] ON [dbo].[RegistrationRequest] ([type])
GO

ALTER TABLE [dbo].[RegistrationRequest]
ADD CONSTRAINT [FK_RegistrationRequest_User] 
FOREIGN KEY ([user_id]) REFERENCES [dbo].[AppUser] ([id]) ON DELETE CASCADE
GO

-- =============================================
-- 7. BẢNG BÁO CÁO (Report)
-- =============================================
CREATE TABLE [dbo].[Report] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [user_id] NVARCHAR(36) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [category] NVARCHAR(50) NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Report] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [CK_Report_Status] CHECK ([status] IN ('Pending', 'Processing', 'Resolved', 'Rejected'))
)
GO

CREATE NONCLUSTERED INDEX [IX_Report_UserId] ON [dbo].[Report] ([user_id])
GO
CREATE NONCLUSTERED INDEX [IX_Report_Status] ON [dbo].[Report] ([status])
GO
CREATE NONCLUSTERED INDEX [IX_Report_Category] ON [dbo].[Report] ([category])
GO

ALTER TABLE [dbo].[Report]
ADD CONSTRAINT [FK_Report_User] 
FOREIGN KEY ([user_id]) REFERENCES [dbo].[AppUser] ([id]) ON DELETE CASCADE
GO

-- =============================================
-- 8. BẢNG PHẢN HỒI (Feedback)
-- =============================================
CREATE TABLE [dbo].[Feedback] (
    [id] UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    [user_id] NVARCHAR(36) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [content] NVARCHAR(MAX) NOT NULL,
    [status] NVARCHAR(20) NOT NULL DEFAULT 'Pending',
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Feedback] PRIMARY KEY CLUSTERED ([id] ASC),
    CONSTRAINT [CK_Feedback_Status] CHECK ([status] IN ('Pending', 'Reviewed', 'Resolved', 'Rejected'))
)
GO

CREATE NONCLUSTERED INDEX [IX_Feedback_UserId] ON [dbo].[Feedback] ([user_id])
GO
CREATE NONCLUSTERED INDEX [IX_Feedback_Status] ON [dbo].[Feedback] ([status])
GO

ALTER TABLE [dbo].[Feedback]
ADD CONSTRAINT [FK_Feedback_User] 
FOREIGN KEY ([user_id]) REFERENCES [dbo].[AppUser] ([id]) ON DELETE CASCADE
GO

-- =============================================
-- 9. BẢNG THÔNG BÁO (Notification)
-- =============================================
CREATE TABLE [dbo].[Notification] (
    [id] INT IDENTITY(1,1) NOT NULL,
    [title] NVARCHAR(255) NOT NULL,
    [type] NVARCHAR(50) NULL,
    [content] NVARCHAR(MAX) NULL,
    [location] NVARCHAR(255) NULL,
    [event_date] DATETIME2(7) NULL,
    [is_urgent] BIT NOT NULL DEFAULT 0,
    [created_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    [updated_at] DATETIME2(7) NOT NULL DEFAULT GETDATE(),
    CONSTRAINT [PK_Notification] PRIMARY KEY CLUSTERED ([id] ASC)
)
GO

CREATE NONCLUSTERED INDEX [IX_Notification_Type] ON [dbo].[Notification] ([type])
GO
CREATE NONCLUSTERED INDEX [IX_Notification_IsUrgent] ON [dbo].[Notification] ([is_urgent])
GO
CREATE NONCLUSTERED INDEX [IX_Notification_EventDate] ON [dbo].[Notification] ([event_date])
GO

-- =============================================
-- TRIGGERS: Tự động cập nhật updated_at
-- =============================================
CREATE TRIGGER [TR_AppUser_Update] ON [dbo].[AppUser]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[AppUser]
    SET [updated_at] = GETDATE()
    FROM [dbo].[AppUser] u
    INNER JOIN inserted i ON u.[id] = i.[id]
END
GO

CREATE TRIGGER [TR_Household_Update] ON [dbo].[Household]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Household]
    SET [updated_at] = GETDATE()
    FROM [dbo].[Household] h
    INNER JOIN inserted i ON h.[id] = i.[id]
END
GO

CREATE TRIGGER [TR_HouseholdMember_Update] ON [dbo].[HouseholdMember]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[HouseholdMember]
    SET [updated_at] = GETDATE()
    FROM [dbo].[HouseholdMember] m
    INNER JOIN inserted i ON m.[id] = i.[id]
END
GO

CREATE TRIGGER [TR_Facility_Update] ON [dbo].[Facility]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Facility]
    SET [updated_at] = GETDATE()
    FROM [dbo].[Facility] f
    INNER JOIN inserted i ON f.[id] = i.[id]
END
GO

CREATE TRIGGER [TR_FacilityBooking_Update] ON [dbo].[FacilityBooking]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[FacilityBooking]
    SET [updated_at] = GETDATE()
    FROM [dbo].[FacilityBooking] b
    INNER JOIN inserted i ON b.[id] = i.[id]
END
GO

CREATE TRIGGER [TR_RegistrationRequest_Update] ON [dbo].[RegistrationRequest]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[RegistrationRequest]
    SET [updated_at] = GETDATE()
    FROM [dbo].[RegistrationRequest] r
    INNER JOIN inserted i ON r.[id] = i.[id]
END
GO

CREATE TRIGGER [TR_Report_Update] ON [dbo].[Report]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Report]
    SET [updated_at] = GETDATE()
    FROM [dbo].[Report] r
    INNER JOIN inserted i ON r.[id] = i.[id]
END
GO

CREATE TRIGGER [TR_Feedback_Update] ON [dbo].[Feedback]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Feedback]
    SET [updated_at] = GETDATE()
    FROM [dbo].[Feedback] f
    INNER JOIN inserted i ON f.[id] = i.[id]
END
GO

CREATE TRIGGER [TR_Notification_Update] ON [dbo].[Notification]
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    UPDATE [dbo].[Notification]
    SET [updated_at] = GETDATE()
    FROM [dbo].[Notification] n
    INNER JOIN inserted i ON n.[id] = i.[id]
END
GO

-- =============================================
-- SEED DATA: Tài khoản test mặc định
-- =============================================
-- TẤT CẢ MẬT KHẨU: 123456
-- Hash: $2a$10$rFqy48hXWskTFJfQHeXbRu2gafF5duSLMxGt.cY1UUnSjm4q1nKa2
-- =============================================

-- 1. Admin account
INSERT INTO [dbo].[AppUser] ([id], [full_name], [email], [password], [phone], [role], [status])
VALUES 
    ('00000000-0000-0000-0000-000000000001', N'Quản trị viên', 'admin@gmail.com', '$2a$10$rFqy48hXWskTFJfQHeXbRu2gafF5duSLMxGt.cY1UUnSjm4q1nKa2', '0901234567', 'admin', 'active')
GO

-- 2. User test account
INSERT INTO [dbo].[AppUser] ([id], [full_name], [email], [password], [phone], [role], [status])
VALUES 
    ('00000000-0000-0000-0000-000000000002', N'Nguyễn Văn A', 'test@gmail.com', '$2a$10$rFqy48hXWskTFJfQHeXbRu2gafF5duSLMxGt.cY1UUnSjm4q1nKa2', '0912345678', 'user', 'active')
GO

-- 3. User account thứ 2
INSERT INTO [dbo].[AppUser] ([id], [full_name], [email], [password], [phone], [role], [status])
VALUES 
    ('00000000-0000-0000-0000-000000000003', N'Trần Thị B', 'user@gmail.com', '$2a$10$rFqy48hXWskTFJfQHeXbRu2gafF5duSLMxGt.cY1UUnSjm4q1nKa2', '0923456789', 'user', 'active')
GO

PRINT '✅ Database schema created successfully!'
PRINT '✅ 9 tables created'
PRINT '✅ All indexes and foreign keys configured'
PRINT '✅ Triggers for auto-update timestamps created'
PRINT '✅ Test accounts created:'
PRINT '   - admin@gmail.com / 123456 (admin)'
PRINT '   - test@gmail.com / 123456 (user)'
PRINT '   - user@gmail.com / 123456 (user)'
