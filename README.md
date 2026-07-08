# 🚗 RentiGo – Premium Vehicle Rental Platform

> **Taxi, Bike & Vehicle Rentals in India – Easy Search, Seamless Handover, and Real-time Communication.**

RentiGo is a fully featured, production-ready, multi-role vehicle rental platform built with the MERN stack (MongoDB, Express.js, React, Node.js). It connects vehicle owners looking to monetize their fleet (cars, SUVs, bikes, and scooters) with customers seeking flexible, affordable rental plans (daily, weekly, or monthly) across India. The application features a robust real-time communication system, administrative compliance workflows, service/diagnostics tracking, and an interactive earnings simulator.

---

## 🚀 Key Features

RentiGo implements a comprehensive multi-role access control (RBAC) system with distinct workflows:

### 👤 1. Customer Experience
* **Advanced Fleet Search:** Filter vehicles by city, vehicle type, fuel type, transmission, and availability.
* **Flexible Bookings:** Rent cars, SUVs, bikes, or activas with dynamic pricing options (Daily, Weekly, Monthly plans).
* **Real-time Booking Chat:** Interact directly with vehicle owners upon booking approval to coordinate handovers.
* **Handover Checklist:** Verify vehicle details and checklist items through a real-time collaborative interface.
* **Favorites System:** Shortlist and save preferred vehicles for future rentals.
* **Review & Rating:** Submit detailed ratings and feedback for vehicles post-trip.

### 🤝 2. Owner Dashboard
* **Fleet Management:** Add, edit, remove, and toggle the availability of vehicles.
* **Real-time Diagnostics:** Monitor vehicle health indicators including tire pressure, battery charge, fuel level, and service intervals.
* **Service Logging:** Record maintenance history (e.g., oil changes, brake checks) and schedule upcoming services.
* **Earnings Simulator:** An interactive tool to project monthly/yearly earnings based on fleet size, rental rates, and utilization metrics (visualized using Recharts).
* **Booking Handlers:** Accept, reject, or mark bookings as completed.

### 🛡️ 3. Administrative Control Panel
* **Central Analytics:** Track total revenue, booking ratios, active listings, and user distributions.
* **Vehicle Verification:** Audit newly added vehicle registrations, approve listings, or place them under maintenance.
* **User Management:** Deactivate/activate customer and owner accounts.
* **Global Booking Logs:** Monitor and troubleshoot active rental bookings across the platform.

### 🔌 4. Real-time Infrastructure
* **WebSocket Integration:** Real-time booking status notifications and instant messaging powered by Socket.io.
* **Live Handover Synchronizer:** Collaborative checklists showing checks completed by both parties during vehicle collection and drop-off.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), TailwindCSS, Framer Motion, Recharts, Lucide Icons, React Hot Toast, React Router DOM, Socket.io Client, Axios |
| **Backend** | Node.js, Express.js, Socket.io (WebSockets), JSON Web Tokens (JWT), Bcrypt.js, Helmet (Security Headers), Morgan (HTTP Logger) |
| **Database** | MongoDB, Mongoose ODM |
| **Email Service** | Nodemailer (for forgot-password and booking validation alerts) |
| **Testing & Quality** | Playwright (E2E testing), Custom Node API integration tests |

---

## 📂 Project Directory Structure

```filepath
veRent/
├── client/                     # React Frontend (Vite + TailwindCSS)
│   ├── public/                 # Static assets (images, logos, icons)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer
│   │   │   ├── ui/             # ParticlesBackground, ScrollProgress, CursorGlow, etc.
│   │   │   └── sections/       # Section-specific components
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register, Forgot/Reset Password
│   │   │   ├── dashboard/      # AdminDashboard, CustomerDashboard, OwnerDashboard
│   │   │   └── ...             # Home, Rentals, Booking, Pricing, EarningsSimulator, etc.
│   │   ├── services/           # Axios API Client (api.js)
│   │   ├── App.jsx             # Main Application Routes and Providers
│   │   └── main.jsx            # Entry point
│   ├── tailwind.config.js      # TailwindCSS styling configuration
│   └── vite.config.js          # Vite configuration
│
├── server/                     # Node.js + Express Backend API
│   ├── config/                 # Database configuration (db.js)
│   ├── controllers/            # Controller logic for all API endpoints
│   ├── middleware/             # Authentication & role authorization middleware
│   ├── models/                 # Mongoose schemas (User, Vehicle, Booking, Message, etc.)
│   ├── routes/                 # Express API routes
│   ├── utils/                  # Helper utilities (email handlers, validation)
│   ├── seed.js                 # Database seeding script (mock vehicles, users, bookings)
│   ├── seed-chat.js            # Database seeding script for chat/messages
│   └── server.js               # Application entry point & Socket.io server
│
├── package.json                # Root package for orchestration
└── websiteInfo.txt             # Original product specification and brand voice documentation
```

---

## ⚙️ Environment Configuration

# Frontend Origin URL
CLIENT_URL=http://localhost:5173
```

### Frontend Setup (`client/.env`)
Create a file named `.env` in the `client` directory:
```env
VITE_API_URL=http://localhost:5005/api
```

---

## 🏁 Getting Started

Follow these steps to set up and run RentiGo locally:

### 1. Install Dependencies
You can install dependencies for both the `client` and `server` directories simultaneously from the root directory:
```bash
npm run install-all
```

### 2. Seed the Database
Make sure your MongoDB server is running. Seed the database with mock users, vehicles, and booking history to quickly test the multi-role dashboards:
```bash
npm run seed --prefix server
```
*This creates the following default accounts (password for all is `demo123`):*
* **Admin:** `admin@demo.com`
* **Owner:** `owner@demo.com`
* **Customer:** `customer@demo.com`

### 3. Run the Development Server
Launch both the Vite frontend and Express backend concurrently:
```bash
npm run dev
```
* **Frontend Access:** `http://localhost:5173`
* **Backend API Base:** `http://localhost:5005/api`

---

## 🧪 Testing & Verification

RentiGo features several diagnostic and integration scripts located in the `server` directory to validate backend validation rules and schema constraints:

* **Maintenance & Service Log Validation:**
  ```bash
  node server/test-maintenance-validation.js
  ```
* **Date & Schedule Conflict Validation:**
  ```bash
  node server/test-date-validation.js
  ```
* **Duplicate Vehicle Registry Prevention:**
  ```bash
  node server/test-duplicate-vehicle.js
  ```
* **Password Reset Workflow Test:**
  ```bash
  node server/test-password-reset.js
  ```
* **Review Sync and Metric Aggregation:**
  ```bash
  node server/test-review-sync.js
  ```

---

## ⚡ UI/UX Micro-Interactions

RentiGo features a highly modern user interface featuring premium, responsive micro-interactions:
* **Particles Background:** Immersive interactive particle effects on the home and authentication landing pages.
* **Cursor Glow Effect:** A smooth gradient glow trail following user cursor movements on dark containers.
* **Scroll Progress Bar:** Visual progress feedback indicator mounted at the top of long pages.

---

## 📄 License
This project is licensed under the ISC License.
```
© 2026 Rentigo. All Rights Reserved.
```
