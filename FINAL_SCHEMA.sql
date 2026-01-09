USE [NVHDB]
GO

-- ============================================
-- MINIMAL SCHEMA - AUTH + CRUD ONLY
-- ============================================

-- AppUser (auth)
CREATE TABLE AppUser (
    id NVARCHAR(50) PRIMARY KEY,
    full_name NVARCHAR(100) NOT NULL,
    email NVARCHAR(100) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    phone NVARCHAR(20),
    role NVARCHAR(20) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    status NVARCHAR(20) CHECK (status IN ('active', 'inactive', 'pending')) DEFAULT 'pending',
    household_id NVARCHAR(50),
    cccd NVARCHAR(20),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (household_id) REFERENCES Household(id)
);

-- Household
CREATE TABLE Household (
    id NVARCHAR(50) PRIMARY KEY,
    code NVARCHAR(50) NOT NULL UNIQUE,
    address NVARCHAR(255) NOT NULL,
    area DECIMAL(10,2) DEFAULT 0,
    owner_id NVARCHAR(50),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (owner_id) REFERENCES AppUser(id)
);

-- HouseholdMember
CREATE TABLE HouseholdMember (
    id NVARCHAR(50) PRIMARY KEY,
    household_id NVARCHAR(50) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    role NVARCHAR(50),
    dob DATE NOT NULL,
    gender NVARCHAR(10),
    idCard NVARCHAR(20) NOT NULL UNIQUE,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (household_id) REFERENCES Household(id) ON DELETE CASCADE
);

-- Facility
CREATE TABLE Facility (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    type NVARCHAR(50),
    price DECIMAL(18,0) DEFAULT 0,
    status NVARCHAR(50) DEFAULT 'Active',
    location NVARCHAR(255),
    capacity INT,
    created_at DATETIME DEFAULT GETDATE()
);

-- FacilityBooking
CREATE TABLE FacilityBooking (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(50),
    facility_id INT,
    booking_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    purpose NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'Pending',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES AppUser(id),
    FOREIGN KEY (facility_id) REFERENCES Facility(id)
);

-- Report
CREATE TABLE Report (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id NVARCHAR(50) NOT NULL,
    title NVARCHAR(255),
    content NVARCHAR(MAX),
    category NVARCHAR(100),
    status NVARCHAR(50) DEFAULT 'Pending',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES AppUser(id)
);

-- Feedback
CREATE TABLE Feedback (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    user_id NVARCHAR(50),
    title NVARCHAR(200),
    content NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'Pending',
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES AppUser(id)
);

-- RegistrationRequest
CREATE TABLE RegistrationRequest (
    id UNIQUEIDENTIFIER DEFAULT NEWID() PRIMARY KEY,
    user_id NVARCHAR(50),
    type NVARCHAR(50),
    reason NVARCHAR(MAX),
    status NVARCHAR(50) DEFAULT 'Pending',
    start_date DATETIME,
    end_date DATETIME,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES AppUser(id)
);

-- Notification
CREATE TABLE Notification (
    id INT IDENTITY(1,1) PRIMARY KEY,
    title NVARCHAR(255) NOT NULL,
    type NVARCHAR(50),
    content NVARCHAR(MAX),
    location NVARCHAR(255),
    event_date DATETIME,
    is_urgent BIT DEFAULT 0,
    created_at DATETIME DEFAULT GETDATE()
);

GO
