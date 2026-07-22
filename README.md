# FinPay

FinPay is a modern, secure, and intuitive web-based banking application designed to simplify personal finance management and digital transactions. It provides users with a seamless platform to create wallets, transfer funds instantly, and track their transaction history in real-time. 

Built with security as a primary focus, FinPay features robust authentication mechanisms including JWT-based sessions, refresh tokens, and robust email OTP verification. The application maintains strict data integrity and validates all user inputs, ensuring a safe and reliable financial environment for all transactions.

Whether managing daily expenses or handling secure peer-to-peer transfers, FinPay offers a clean and responsive user interface coupled with a highly scalable backend architecture to meet the demands of modern digital banking.

## Features

- **User Authentication:** Secure login and registration.
- **JWT Authentication:** Access and refresh token management.
- **Email OTP Verification:** Secure 6-digit email verification flow.
- **Forgot Password:** Secure password recovery mechanism.
- **Reset Password:** Authenticated password resetting.
- **Wallet Management:** Automatic wallet creation and balance tracking.
- **Money Transfer:** Instant peer-to-peer internal fund transfers.
- **Transaction History:** Detailed ledger of all account activities.
- **Notifications:** Real-time system and transaction alerts.
- **Admin Dashboard:** Centralized management for administrative users.
- **User Dashboard:** Comprehensive overview of personal finances.
- **Swagger API Documentation:** Interactive API exploration and testing.
- **Logging:** Comprehensive backend event and error logging.
- **Input Validation:** Strict Zod-based request validation.

## Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form & Zod
- Lucide React (Icons)

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- Nodemailer (SMTP Email Delivery)
- JSON Web Tokens (JWT)
- Bcrypt (Password Hashing)
- Zod (Schema Validation)
- Winston (Logging)
- Swagger (API Documentation)

## Project Architecture

FinPay follows a decoupled client-server architecture:
1. **Client (React):** The frontend serves as a dynamic Single Page Application (SPA) that manages the user interface, client-side routing, and local state. It communicates with the backend exclusively through secure RESTful HTTP requests using Axios.
2. **Server (Express):** The backend acts as the core processing engine. It exposes a versioned REST API, handles authentication, validates business logic, and manages transaction atomicity. It utilizes a dependency injection container to manage services (Auth, Wallet, Notification) cleanly.
3. **Database (MongoDB):** The server connects to MongoDB to persist user profiles, wallets, transactions, and notifications. Mongoose ODM is used to define strict data models and relationships.

## Folder Structure

```text
banking_system/
├── client/                 # Frontend React Application
│   ├── public/
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── context/        # Global React context (e.g., AuthContext)
│       ├── pages/          # Full page views (Landing, Dashboard, etc.)
│       └── services/       # API integration and Axios interceptors
│
├── server/                 # Backend Express Application
│   ├── scripts/            # Database seeding and utility scripts
│   ├── src/
│   │   ├── config/         # Environment, DI container, and DB config
│   │   ├── controllers/    # Request handlers and response formatting
│   │   ├── middleware/     # Auth, error handling, and rate limiting
│   │   ├── models/         # Mongoose database schemas
│   │   ├── repositories/   # Database access layer
│   │   ├── routes/         # Express API route definitions
│   │   ├── services/       # Core business logic and email delivery
│   │   └── utils/          # Hashing, tokens, and helper functions
│   └── test/               # Backend test suite
│
└── .env                    # Root environment configuration
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- MongoDB (Running locally or via Atlas)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd banking_system
   ```

2. **Install Backend Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd ../client
   npm install
   ```

### Configuration

Create a `.env` file in the root directory (`banking_system/.env`) based on the required environment variables (see below).

### Running the Application

1. **Start the Backend Server (from the `server` directory):**
   ```bash
   npm run dev
   ```
   *The backend will typically run on `http://localhost:4000`.*

2. **Start the Frontend Development Server (from the `client` directory):**
   ```bash
   npm run dev
   ```
   *The frontend will typically run on `http://localhost:5173`.*



## API Documentation

FinPay includes comprehensive, interactive API documentation powered by Swagger UI.

Once the backend server is running, you can access the documentation at:
**`http://localhost:4000/docs`**

The Swagger interface allows you to explore all available endpoints, view required request bodies, and test API calls directly from your browser.


## Future Enhancements

- **Docker:** Containerization of both frontend and backend for simplified deployment and environment consistency.
- **Redis:** Implementation of Redis caching for improved performance and robust rate-limiting.
- **RabbitMQ:** Asynchronous message queuing for non-blocking notification and email delivery.
- **Deployment:** Production deployment configuration using modern cloud infrastructure.
