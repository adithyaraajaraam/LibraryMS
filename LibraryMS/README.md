# 📚 LibraryMS — Library Management System

A simple, clean full-stack project built with:
- **Frontend**: React + Vite
- **Backend**: .NET 8 Web API
- **Database**: PostgreSQL (pgAdmin4)
- **Auth**: JWT tokens

---

## 📁 Project Structure

```
LibraryMS/
├── backend/                  ← .NET Web API
│   ├── Controllers/
│   │   ├── AuthController.cs       ← Login / Signup
│   │   ├── BooksController.cs      ← CRUD for books
│   │   ├── TransactionsController.cs ← Borrow / Return
│   │   └── AdminController.cs      ← Stats, Logs, Users
│   ├── Data/
│   │   └── AppDbContext.cs         ← DB models + EF context
│   ├── Program.cs                  ← App startup + JWT config
│   ├── appsettings.json            ← DB connection string + JWT key
│   └── LibraryMS.csproj            ← NuGet packages
│
├── frontend/                 ← React App
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx     ← JWT session management
│   │   ├── utils/
│   │   │   └── api.js              ← All API calls (fetch wrapper)
│   │   ├── components/
│   │   │   └── Navbar.jsx          ← Top navigation bar
│   │   ├── pages/
│   │   │   ├── AuthPage.jsx        ← Login / Signup screen
│   │   │   ├── CatalogPage.jsx     ← Browse + Search books
│   │   │   ├── BorrowPage.jsx      ← My borrowed books + Return
│   │   │   └── AdminDashboard.jsx  ← Admin: stats, books, logs
│   │   ├── App.jsx                 ← Routes + protected routes
│   │   └── main.jsx                ← React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── database_setup.sql        ← Optional manual SQL setup
```

---

## ⚙️ Setup Steps

### 1. PostgreSQL Database

1. Open **pgAdmin4**
2. Create a new database called `libraryms`
3. You do NOT need to run the SQL file manually — .NET EF will auto-create tables!
4. (Optional) Run `database_setup.sql` in Query Tool if you prefer manual setup

---

### 2. Backend (.NET API)

**Open terminal in the `backend/` folder:**

```bash
# Restore NuGet packages
dotnet restore

# Update appsettings.json first! Change the password:
# "Host=localhost;Port=5432;Database=libraryms;Username=postgres;Password=YOUR_PASSWORD"

# Run the API (starts on http://localhost:5000)
dotnet run
```

**Test with Postman:**
- Import these endpoints:

| Method | URL | Body | Auth |
|--------|-----|------|------|
| POST | /api/auth/signup | `{"username":"john","email":"john@test.com","password":"John@123"}` | None |
| POST | /api/auth/login | `{"email":"john@test.com","password":"John@123"}` | None |
| GET | /api/books | - | Bearer token |
| GET | /api/books?search=clean&genre=Technology | - | Bearer token |
| POST | /api/books | `{"title":"My Book","author":"Author","genre":"Fiction","quantity":3}` | Admin token |
| DELETE | /api/books/1 | - | Admin token |
| POST | /api/transactions/borrow/1 | - | Bearer token |
| POST | /api/transactions/return/1 | - | Bearer token |
| GET | /api/transactions/my | - | Bearer token |
| GET | /api/admin/stats | - | Admin token |
| GET | /api/admin/logs | - | Admin token |

**Default Admin account** (seeded automatically):
- Email: `admin@library.com`
- Password: `Admin@123`

---

### 3. Frontend (React)

**Open terminal in the `frontend/` folder:**

```bash
# Install packages
npm install

# Start React dev server (runs on http://localhost:3000)
npm run dev
```

Open browser → `http://localhost:3000`

---

## 🔐 How Authentication Works

1. User logs in → backend checks password with BCrypt → returns **JWT token**
2. React saves token in `localStorage`
3. Every API request sends `Authorization: Bearer <token>` header
4. Backend reads token → knows who you are and your role (user/admin)
5. Admin-only routes return **401** if a regular user tries to access them

---

## 🗄️ Database Tables

| Table | Purpose |
|-------|---------|
| `Users` | Stores user accounts with hashed passwords |
| `Books` | Book catalog with available count |
| `Transactions` | Records each borrow/return (joins Users + Books) |
| `ActivityLogs` | Tracks all actions (login, borrow, return, add book) |

---

## 🌐 API Error Codes Used

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad request (validation error, already borrowed, etc.) |
| 401 | Unauthorized (wrong password, missing/invalid token) |
| 403 | Forbidden (user trying admin route) |
| 404 | Not found |

---

## 📱 Screens

| Screen | Route | Access |
|--------|-------|--------|
| Login/Signup | `/` | Public |
| Book Catalog | `/catalog` | All users |
| My Books | `/borrow` | Users |
| Admin Dashboard | `/admin` | Admin only |

---

## 🔧 Common Issues

**"Connection refused" on login?**
→ Make sure `dotnet run` is running in the backend folder

**"Invalid password" on login?**
→ Check `appsettings.json` has correct PostgreSQL password

**Tables not created?**
→ `db.Database.EnsureCreated()` in `Program.cs` auto-creates them on first run

**CORS error in browser?**
→ Make sure React is on port 3000 (matches CORS config in `Program.cs`)
