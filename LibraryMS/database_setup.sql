-- Run this in pgAdmin4 Query Tool
-- Step 1: Create the database (run this first separately)
-- CREATE DATABASE libraryms;

-- Step 2: Connect to "libraryms" database, then run the rest below

-- Users table
CREATE TABLE IF NOT EXISTS "Users" (
    "Id" SERIAL PRIMARY KEY,
    "Username" VARCHAR(100) NOT NULL,
    "Email" VARCHAR(200) UNIQUE NOT NULL,
    "PasswordHash" TEXT NOT NULL,
    "Role" VARCHAR(20) DEFAULT 'user',
    "CreatedAt" TIMESTAMP DEFAULT NOW()
);

-- Books table
CREATE TABLE IF NOT EXISTS "Books" (
    "Id" SERIAL PRIMARY KEY,
    "Title" VARCHAR(300) NOT NULL,
    "Author" VARCHAR(200) NOT NULL,
    "Genre" VARCHAR(100),
    "Quantity" INT DEFAULT 1,
    "Available" INT DEFAULT 1,
    "AddedAt" TIMESTAMP DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS "Transactions" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT REFERENCES "Users"("Id"),
    "BookId" INT REFERENCES "Books"("Id"),
    "Status" VARCHAR(20) DEFAULT 'borrowed',
    "BorrowedAt" TIMESTAMP DEFAULT NOW(),
    "ReturnedAt" TIMESTAMP
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS "ActivityLogs" (
    "Id" SERIAL PRIMARY KEY,
    "UserId" INT,
    "Username" VARCHAR(100),
    "Action" VARCHAR(50),
    "Detail" TEXT,
    "Timestamp" TIMESTAMP DEFAULT NOW()
);

-- NOTE: If using Entity Framework (dotnet), skip this file.
-- EF will auto-create tables via db.Database.EnsureCreated() in Program.cs
-- Only use this SQL if you prefer to create tables manually in pgAdmin4.
