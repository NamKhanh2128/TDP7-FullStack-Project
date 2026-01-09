USE [NVHDB]
GO

-- Drop unused tables
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Service') DROP TABLE [Service];
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Booking') DROP TABLE [Booking];
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'Statistics') DROP TABLE [Statistics];
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemAuditLog') DROP TABLE [SystemAuditLog];
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'BirthDeclaration') DROP TABLE [BirthDeclaration];
IF EXISTS (SELECT * FROM sys.tables WHERE name = 'DeathDeclaration') DROP TABLE [DeathDeclaration];

PRINT '✅ Dropped unused tables';
GO
