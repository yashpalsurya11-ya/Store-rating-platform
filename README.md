# StorePulse — FullStack Store Rating Platform

> **Status: Deployed & Production Ready 🟢**
>
> The StorePulse application has been successfully deployed and is fully live.
> *   **Production Frontend (Vercel):** [https://store-rating-platform-beta.vercel.app]https://store-rating-platform-xi.vercel.app/user
> *   **Production Backend (Render):** [https://store-rating-platform-backend.onrender.com/api](https://store-rating-platform-backend.onrender.com/api)

StorePulse is a full-stack web application designed for listing, searching, and rating merchant stores. The platform includes a secure role-based access control system (System Administrator, Normal User, and Store Owner), strict registration and password validations, multi-column sortable datatables, and a cloud-synced database.

---

## 🚀 Tech Stack

*   **Frontend:** ReactJS, Vite, React Router, Context API, Custom Vanilla CSS (Premium light theme with HSL variables & glassmorphism details).
*   **Backend:** ExpressJS (NodeJS), Sequelize ORM.
*   **Database:** Cloud PostgreSQL (Neon.tech connection).
*   **Security:** JSON Web Tokens (JWT) for authentication, BCryptJS for password hashing.

---

## 🌟 Key Features

### 1. System Administrator Console
*   **Analytics Overview:** Metrics widgets showcasing total users, stores, and ratings with colored accent indicators.
*   **Management Directory:** Add new normal users, admins, and stores. Registering a store automatically spawns a corresponding merchant user account.
*   **Directories Listings:** Detailed listings for users and stores supporting:
    *   *Sorting:* ASC/DESC sorting on critical fields (Name, Email, etc.).
    *   *Filtering:* Case-insensitive searches on Name, Email, Address, and Roles.
    *   *View Details:* Popups displaying accounts registration addresses and linked merchant average rating stats.

### 2. Normal User Portal
*   **Store Card Grid Directory:** Replaces simple tables with clean merchant card grids showing store initials avatars, address pins, average star displays, and interactive review state badges (e.g. `★ 4 / 5`).
*   **Star Ratings Input:** Interactive star overlay sheets to submit or modify store ratings (between 1 and 5 stars).
*   **Sidebar Search & Security:** Clean sidebar container housing search input filters and credentials updates forms.

### 3. Store Owner Dashboard
*   **Metrics Banner:** Large visual header block with the store name, address, and overall rating average.
*   **CSS Progress Bar Analytics:** Graphical aggregates bar chart (5-star down to 1-star reviews) charting rating trends.
*   **Reviews History:** Tabular logs detailing all customers who rated the store, including their name, email, address, submitted score, and timestamp.

---

## 🛡️ Input Validation Rules

The application strictly enforces security validation constraints in both backend APIs and frontend forms:
*   **Name:** Between `2` and `60` characters (adjusted from `20` to accommodate standard-length names).
*   **Address:** Maximum `400` characters.
*   **Password:** Between `8` and `16` characters; must contain at least one uppercase letter and one special character (e.g. `@`, `#`, `!`).
*   **Email:** Follows standard RFC email pattern rules.

---

## 📁 Project Structure

```text
Store management/
├── Backend/
│   ├── config/              # Sequelize database connection config
│   ├── controllers/         # Authentication and dashboard business logic
│   ├── middleware/          # JWT tokens & role check parameters
│   ├── models/              # User, Store, and Rating PostgreSQL schemas
│   ├── routes/              # Express API endpoints routing
│   ├── utils/               # Common validation utilities
│   ├── scratch/             # Functional integration test scripts
│   ├── .env                 # Active connection credentials
│   ├── package.json         # Backend node packages list
│   └── server.js            # Express API bootstrap & default admin seeding
└── Frontend/
    ├── src/
    │   ├── components/      # Navbar, SortableTable, Inputs, Modals, ProtectedRoute
    │   ├── context/         # AuthContext state wrappers and fetch managers
    │   ├── pages/           # Login, Register, Admin, User, and Store Owner views
    │   ├── App.jsx          # Route tree definitions
    │   ├── index.css        # Premium Light Mode styling system
    │   └── main.jsx         # App render bootstrapper
    └── package.json         # Frontend packages list
```

---

## ⚙️ Installation & Setup

### Prerequisites
*   NodeJS (v18 or higher)
*   A running PostgreSQL instance (or a free cloud instance on [Neon.tech](https://neon.tech))

### 1. Database Setup
1. Create a database in your PostgreSQL instance:
   ```sql
   CREATE DATABASE store_management_db;
   ```

### 2. Configure Backend Credentials
1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```
2. Open the `.env` file and input your PostgreSQL credentials:
   ```env
   PORT=5000
   DB_HOST=your-database-host
   DB_PORT=5432
   DB_USER=your-database-user
   DB_PASSWORD=your-database-password
   DB_NAME=your-database-name
   JWT_SECRET=supersecretjwttokenkey123!@#
   ```

### 3. Install & Start Backend
```bash
# Install packages
npm install

# Launch Dev Server (supports hot reloading)
npm run dev
```
*Note: On first startup, the backend automatically creates all required tables and seeds a default Admin account if empty:*
*   **Admin Email:** `admin@storemanager.com`
*   **Admin Password:** `Admin@12345`

### 4. Run Integration Verification
To verify backend routing and validation constraints run:
```bash
node scratch/test_api.js
```

### 5. Install & Start Frontend
Open a new terminal window:
```bash
# Navigate to Frontend directory
cd Frontend

# Install packages
npm install

# Start local client
npm run dev
```
Open `http://localhost:5173` in your browser to test and view the application!
