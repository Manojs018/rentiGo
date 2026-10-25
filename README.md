#  RentiGo – Premium Vehicle Rental Platform

> **Taxi, Bike & Vehicle Rentals in India – Easy Search, Seamless Handover, and Real-time Communication.**

RentiGo is a fully featured, production-ready, multi-role vehicle rental platform built with the MERN stack (MongoDB Express.js, React, Node.js). It connects vehicle owners looking to monetize their fleet (cars, SUVs, bikes, and scooters) with customers seeking flexible, affordable rental plans (daily, weekly, or monthly) across India. The application features a robust real-time communication system, administrative compliance workflows, service/diagnostics tracking, and an interactive earnings simulator.

---

##  Key Features

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
[![Architecture diagram](https://gitdiagram.com/diagram-badge.svg)](https://gitdiagram.com/manojs018/rentigo?utm_source=readme&utm_medium=badge)

%% Generated by https://gitdiagram.com/manojs018/rentigo
flowchart TD

subgraph group_client["Customer and role interfaces"]
  node_app["Application routes<br/>[App.jsx]"]
  node_auth["Authentication state<br/>[AuthContext.jsx]"]
  node_api_client["API client<br/>[api.js]"]
  node_rental_search["Fleet search<br/>[Rentals.jsx]"]
  node_booking_ui["Booking workflow<br/>[Booking.jsx]"]
  node_customer_dashboard["Customer dashboard"]
  node_owner_dashboard["Owner operations<br/>[OwnerDashboard.jsx]"]
  node_earnings["Earnings simulator"]
  node_admin_dashboard["Admin controls<br/>[AdminDashboard.jsx]"]
  node_handover["Handover coordination"]
end

subgraph group_api["Rental platform API"]
  node_server["HTTP and socket server<br/>[server.js]"]
  node_auth_routes["Authentication routes<br/>[auth.js]"]
  node_vehicle_routes["Vehicle routes<br/>[vehicles.js]"]
  node_booking_routes["Booking routes<br/>[bookings.js]"]
  node_review_routes["Review routes<br/>[reviews.js]"]
  node_pricing_routes["Pricing operations<br/>[pricing.js]"]
  node_admin_controller["Admin operations<br/>[adminController.js]"]
  node_auth_controller["Account operations<br/>[authController.js]"]
  node_booking_controller["Booking operations"]
  node_vehicle_controller["Vehicle operations"]
  node_middleware["Token authentication<br/>[auth.js]"]
  node_document_check["Identity document checks<br/>[authController.js]"]
end

subgraph group_data["Persistent domain data"]
  node_user_model[("User records<br/>[User.js]")]
  node_vehicle_model[("Vehicle records<br/>[Vehicle.js]")]
  node_booking_model[("Booking records<br/>[Booking.js]")]
  node_review_model[("Review records<br/>[Review.js]")]
  node_notification_model[("Notification records<br/>[Notification.js]")]
  node_message_model[("Message records<br/>[Message.js]")]
end

subgraph group_realtime["Live coordination"]
  node_socket_context["Socket client<br/>[SocketContext.jsx]"]
  node_whatsapp["WhatsApp alerts<br/>[whatsapp.js]"]
  node_email["Email delivery<br/>[sendEmail.js]"]
end

node_customer(("Customer"))
node_owner(("Vehicle owner"))
node_admin(("Administrator"))

node_customer -->|"uses"| node_app
node_owner -->|"manages fleet"| node_owner_dashboard
node_admin -->|"oversees platform"| node_admin_dashboard
node_app -->|"provides state"| node_auth
node_app -->|"provides live client"| node_socket_context
node_app -->|"routes to"| node_rental_search
node_app -->|"routes to"| node_booking_ui
node_app -->|"routes to"| node_customer_dashboard
node_app -->|"routes to"| node_owner_dashboard
node_app -->|"routes to"| node_admin_dashboard
node_owner -->|"projects income"| node_earnings
node_customer -->|"searches vehicles"| node_rental_search
node_customer -->|"requests rental"| node_booking_ui
node_booking_ui -.->|"coordinates handover"| node_handover
node_booking_ui -->|"uses API"| node_api_client
node_auth -->|"calls auth API"| node_api_client
node_api_client -.->|"sends requests"| node_server
node_server -->|"mounts routes"| node_auth_routes
node_server -->|"mounts routes"| node_vehicle_routes
node_server -->|"mounts routes"| node_booking_routes
node_server -->|"mounts routes"| node_review_routes
node_server -->|"mounts routes"| node_pricing_routes
node_server -.->|"exposes operations"| node_admin_controller
node_auth_routes -->|"routes to"| node_auth_controller
node_auth_routes -->|"protects routes"| node_middleware
node_vehicle_routes -->|"routes to"| node_vehicle_controller
node_vehicle_routes -->|"protects routes"| node_middleware
node_booking_routes -.->|"routes to"| node_booking_controller
node_review_routes -->|"reads and writes"| node_review_model
node_auth_controller -->|"reads and writes"| node_user_model
node_auth_controller -->|"sends email"| node_email
node_auth_controller -->|"validates documents"| node_document_check
node_booking_controller -->|"reads and writes"| node_booking_model
node_booking_controller -->|"reads and updates"| node_vehicle_model
node_booking_controller -->|"reads customer"| node_user_model
node_booking_controller -->|"creates alerts"| node_notification_model
node_booking_controller -->|"sends alerts"| node_whatsapp
node_booking_controller -->|"emits availability"| node_server
node_admin_controller -->|"manages accounts"| node_user_model
node_admin_controller -->|"reviews listings"| node_vehicle_model
node_admin_controller -->|"reviews bookings"| node_booking_model
node_admin_controller -->|"reads reviews"| node_review_model
node_admin_controller -->|"manages alerts"| node_notification_model
node_review_model -->|"updates ratings"| node_vehicle_model
node_socket_context -->|"connects live"| node_server
node_customer -->|"rates vehicle"| node_review_routes
node_customer -->|"checks vehicle"| node_handover
node_owner -->|"coordinates collection"| node_handover

click node_app "https://github.com/manojs018/rentigo/blob/main/client/src/App.jsx"
click node_auth "https://github.com/manojs018/rentigo/blob/main/client/src/context/AuthContext.jsx"
click node_api_client "https://github.com/manojs018/rentigo/blob/main/client/src/services/api.js"
click node_rental_search "https://github.com/manojs018/rentigo/blob/main/client/src/pages/Rentals.jsx"
click node_booking_ui "https://github.com/manojs018/rentigo/blob/main/client/src/pages/Booking.jsx"
click node_customer_dashboard "https://github.com/manojs018/rentigo/blob/main/client/src/pages/dashboard/CustomerDashboard.jsx"
click node_owner_dashboard "https://github.com/manojs018/rentigo/blob/main/client/src/pages/dashboard/OwnerDashboard.jsx"
click node_earnings "https://github.com/manojs018/rentigo/blob/main/client/src/pages/EarningsSimulator.jsx"
click node_admin_dashboard "https://github.com/manojs018/rentigo/blob/main/client/src/pages/dashboard/AdminDashboard.jsx"
click node_handover "https://github.com/manojs018/rentigo/blob/main/client/src/components/ui/HandoverChatCoordinator.jsx"
click node_server "https://github.com/manojs018/rentigo/blob/main/server/server.js"
click node_auth_routes "https://github.com/manojs018/rentigo/blob/main/server/routes/auth.js"
click node_vehicle_routes "https://github.com/manojs018/rentigo/blob/main/server/routes/vehicles.js"
click node_booking_routes "https://github.com/manojs018/rentigo/blob/main/server/routes/bookings.js"
click node_review_routes "https://github.com/manojs018/rentigo/blob/main/server/routes/reviews.js"
click node_pricing_routes "https://github.com/manojs018/rentigo/blob/main/server/routes/pricing.js"
click node_admin_controller "https://github.com/manojs018/rentigo/blob/main/server/controllers/adminController.js"
click node_auth_controller "https://github.com/manojs018/rentigo/blob/main/server/controllers/authController.js"
click node_booking_controller "https://github.com/manojs018/rentigo/blob/main/server/controllers/bookingController.js"
click node_vehicle_controller "https://github.com/manojs018/rentigo/blob/main/server/controllers/vehicleController.js"
click node_middleware "https://github.com/manojs018/rentigo/blob/main/server/middleware/auth.js"
click node_user_model "https://github.com/manojs018/rentigo/blob/main/server/models/User.js"
click node_vehicle_model "https://github.com/manojs018/rentigo/blob/main/server/models/Vehicle.js"
click node_booking_model "https://github.com/manojs018/rentigo/blob/main/server/models/Booking.js"
click node_review_model "https://github.com/manojs018/rentigo/blob/main/server/models/Review.js"
click node_notification_model "https://github.com/manojs018/rentigo/blob/main/server/models/Notification.js"
click node_message_model "https://github.com/manojs018/rentigo/blob/main/server/models/Message.js"
click node_socket_context "https://github.com/manojs018/rentigo/blob/main/client/src/context/SocketContext.jsx"
click node_whatsapp "https://github.com/manojs018/rentigo/blob/main/server/utils/whatsapp.js"
click node_email "https://github.com/manojs018/rentigo/blob/main/server/utils/sendEmail.js"
click node_document_check "https://github.com/manojs018/rentigo/blob/main/server/controllers/authController.js"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_app,node_auth,node_api_client,node_rental_search,node_booking_ui,node_customer_dashboard,node_owner_dashboard,node_earnings,node_admin_dashboard,node_handover toneBlue
class node_server,node_auth_routes,node_vehicle_routes,node_booking_routes,node_review_routes,node_pricing_routes,node_admin_controller,node_auth_controller,node_booking_controller,node_vehicle_controller,node_middleware,node_document_check toneAmber
class node_user_model,node_vehicle_model,node_booking_model,node_review_model,node_notification_model,node_message_model toneMint
class node_socket_context,node_whatsapp,node_email toneRose
class node_customer,node_owner,node_admin toneIndigo
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

### 3. Run the Development Serve
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
