# 🚀 TDP7 FullStack Project - Local Setup Guide

## Quick Start for Portfolio Demo

This guide will help you set up and run the project locally for your portfolio demo.

---

## 📋 Prerequisites

- **Node.js** (v14 or higher)
- **SQL Server** (Express or Full version)
- **Windows/Mac** environment

---

## 🗄️ Database Setup

### Step 1: Run the Base SQL Script

1. Open **SQL Server Management Studio (SSMS)** or your SQL Server client
2. Connect to your SQL Server instance
3. Run `script.sql` to create the base database and tables
4. Verify the database `NVHDB` was created

### Step 2: Run the Upgrade Script

1. Run `upgrade_local.sql` to add the new tables:
   - `BirthDeclaration`
   - `DeathDeclaration`
   - `SystemAuditLog`

---

## 📦 Backend Setup

### Step 1: Install Dependencies

```bash
cd "BE TDP 7"
npm install
```

This will install:
- Express
- mssql (SQL Server driver)
- multer (file uploads)
- bcryptjs (password hashing)
- jsonwebtoken (authentication)
- And other dependencies

### Step 2: Configure Environment

Create a `.env` file in `BE TDP 7/` directory:

```env
# Database Configuration
DB_SERVER=localhost
DB_USER=api_user
DB_PASSWORD=1234567890
DB_NAME=NVHDB
DB_PORT=1433

# JWT Secret
JWT_SECRET=your_secret_key_here_change_this

# Server Port
PORT=3000
```

### Step 3: Seed the Database

Run the advanced seed script to populate demo data:

```bash
npm run seed:advanced
```

This will create:
- ✅ 20 Households
- ✅ 50 Residents (Users + HouseholdMembers)
- ✅ 5 Pending Birth Requests
- ✅ 3 Pending Death Requests
- ✅ 10 Past Audit Logs

**Default Login Credentials:**
- Admin: `admin@gmail.com` / `123456`
- Users: Any email from seed / `123456`

---

## 🎯 Running the Server

### Development Mode (with auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

The server will start on `http://localhost:3000`

---

## 📁 File Upload Setup

Uploaded files are stored in:
```
BE TDP 7/public/uploads/documents/
```

Files are accessible via:
```
http://localhost:3000/uploads/documents/[filename]
```

The upload directory is created automatically on first upload.

---

## 🔌 API Endpoints

### Vital Statistics (User)

- `POST /api/user/vital-stats/birth` - Create birth declaration (with file upload)
- `POST /api/user/vital-stats/death` - Create death declaration (with file upload)
- `GET /api/user/vital-stats/birth` - Get user's birth declarations
- `GET /api/user/vital-stats/death` - Get user's death declarations
- `GET /api/user/vital-stats/birth/:id` - Get birth declaration by ID
- `GET /api/user/vital-stats/death/:id` - Get death declaration by ID

### Vital Statistics (Admin)

- `GET /api/admin/vital-stats/birth` - Get all birth declarations
- `GET /api/admin/vital-stats/death` - Get all death declarations
- `PUT /api/admin/vital-stats/birth/:id/approve` - Approve birth declaration
- `PUT /api/admin/vital-stats/birth/:id/reject` - Reject birth declaration
- `PUT /api/admin/vital-stats/death/:id/approve` - Approve death declaration
- `PUT /api/admin/vital-stats/death/:id/reject` - Reject death declaration

### Audit Logs (Admin)

- `GET /api/admin/logs` - Get audit logs (with pagination and filters)
- `GET /api/admin/logs/stats` - Get audit log statistics
- `GET /api/admin/logs/:id` - Get audit log by ID

### Dashboard Stats (Admin)

- `GET /api/admin/dashboard/stats` - Get dashboard statistics including:
  - Total households
  - Total residents
  - **Total alive residents** (new)
  - **Total deceased** (new)
  - **Pending birth requests** (new)
  - **Pending death requests** (new)
  - Gender distribution
  - Age distribution

---

## 🧪 Testing the Demo

### 1. Login as Admin

```bash
POST http://localhost:3000/api/auth/login
{
  "email": "admin@gmail.com",
  "password": "123456"
}
```

### 2. View Pending Requests

```bash
GET http://localhost:3000/api/admin/vital-stats/birth?status=Pending
GET http://localhost:3000/api/admin/vital-stats/death?status=Pending
```

### 3. Approve a Birth Request

```bash
PUT http://localhost:3000/api/admin/vital-stats/birth/[id]/approve
Headers: Authorization: Bearer [token]
```

This will:
- ✅ Update the birth declaration status
- ✅ Create a new HouseholdMember for the child
- ✅ Log the action to SystemAuditLog
- ✅ Send a mock email notification (logged to console)

### 4. View Audit Logs

```bash
GET http://localhost:3000/api/admin/logs
Headers: Authorization: Bearer [token]
```

### 5. View Dashboard Stats

```bash
GET http://localhost:3000/api/admin/dashboard/stats
Headers: Authorization: Bearer [token]
```

---

## 📧 Email Notifications

Email notifications are **mocked** for local development. They are logged to the console instead of being sent via SMTP.

Example console output:
```
📧 ===== MOCK EMAIL NOTIFICATION =====
To: user@example.com
Subject: Thông báo: Đơn khai sinh đã được duyệt
Content: ...
=====================================
```

---

## 🐛 Troubleshooting

### Database Connection Issues

1. **SQL Server not running**: Start SQL Server service
2. **Wrong credentials**: Check `.env` file
3. **Database doesn't exist**: Run `script.sql` first
4. **Connection timeout**: SQL Server might be warming up - wait a few seconds and retry

### File Upload Issues

1. **Upload directory not created**: It's created automatically on first upload
2. **File too large**: Maximum file size is 5MB
3. **Invalid file type**: Only JPEG, PNG, GIF, and PDF are allowed

### Port Already in Use

Change the `PORT` in `.env` file or kill the process using port 3000.

---

## 📝 Notes

- All file uploads are stored locally in `public/uploads/documents/`
- Email notifications are mocked (console.log) to prevent SMTP errors
- The seed script uses a simple faker-like generator (no external dependency)
- Database transactions ensure data consistency during approvals

---

## ✅ Checklist

- [ ] SQL Server is running
- [ ] Database `NVHDB` is created
- [ ] `upgrade_local.sql` has been executed
- [ ] `.env` file is configured
- [ ] Dependencies are installed (`npm install`)
- [ ] Database is seeded (`npm run seed:advanced`)
- [ ] Server is running (`npm run dev`)
- [ ] Can access `http://localhost:3000`

---

## 🎉 You're Ready!

Your portfolio demo is now set up and ready to showcase:
- ✅ Vital Statistics (Birth/Death declarations)
- ✅ File Uploads (Local storage)
- ✅ Admin Audit Logs
- ✅ Dashboard Statistics

Happy demoing! 🚀

