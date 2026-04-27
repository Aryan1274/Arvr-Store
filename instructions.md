# ARVR Store Implementation Instructions

This document outlines the step-by-step phased approach for building the ARVR Store based on the Product Requirements Document.

## Phase 1: Project Setup & Core UI Foundation (Runnable State)
*Goal: Initialize both client and server, establish the basic folder structure, set up Tailwind CSS, and ensure both can run simultaneously to view changes immediately.*

1. **Folder Structure Setup:**
   - Create a root directory for the project.
   - Create two main folders: `client` (Frontend) and `server` (Backend).

2. **Backend (Server) Initialization:**
   - Initialize a Node.js project (`npm init -y`).
   - Install core dependencies: `express`, `cors`, `dotenv`, `nodemon` (dev).
   - Set up a basic Express server (`server.js`) with a simple health check endpoint (e.g., `GET /api/health`).
   - Ensure the server runs on a specific port (e.g., `5000`).

3. **Frontend (Client) Initialization:**
   - Create a Vite React application: `npm create vite@latest client -- --template react`.
   - Install and configure **Tailwind CSS**.
   - Install `react-router-dom` for routing and `lucide-react` (or `react-icons`) for the cute, minimal UI icons.
   - Set up a basic layout structure consisting of a placeholder `Navbar`, `Footer`, and `Home` page.
   - Ensure the Vite app runs on its default port (e.g., `5173`) and can proxy API requests to the backend.

4. **Concurrent Running:**
   - Create a `package.json` in the root directory to run both `client` and `server` simultaneously using a package like `concurrently`. This allows tracking updates easily during development.

---

## Phase 2: Homepage UI & Theming (Mobile-First + Responsive)
*Goal: Build the aesthetic, minimal UI for the homepage as specified in the PRD, focusing on mobile-first while scaling seamlessly to desktop.*

1. **Global Styles & Theme:**
   - Define custom color palettes (cute, aesthetic, minimal) in `tailwind.config.js`.
   - Setup global CSS/animations.
2. **Navbar & Menu:**
   - Build a responsive Navbar (Hamburger menu for mobile, inline tabs for desktop).
   - Implement the specified tabs: Shop, For Her, For Him, etc.
3. **Homepage Components:**
   - **Carousel:** Auto-scrolling image carousel with a 1-second pause.
   - **Category Cards:** Horizontal scroll view for categories.
   - **Trending Products:** Card-based grid layout (2 per row on mobile, more on desktop).
   - **Footer:** Add all links, social icons, and copyright text.

---

## Phase 3: Product Flow UI (Frontend Only)
*Goal: Complete the UI for browsing products and viewing details.*

1. **Product Page Component:**
   - Image gallery, product details, price.
   - "Buy Now" and "Add to Bag" buttons.
   - "Similar Products" horizontal scroll section.
2. **Category / Listing Pages:**
   - UI for rendering products under specific categories ("For Her", "For Him", etc.).
3. **Routing Setup:**
   - Connect Homepage components to their respective detailed views using `react-router-dom`.

---

## Phase 4: Database Modeling & Backend APIs
*Goal: Connect to MongoDB and set up the core data architecture.*

1. **Database Setup:**
   - Connect the Node.js server to MongoDB (using Mongoose).
2. **Mongoose Models:**
   - `User` Schema (Name, Email, Google ID, etc.)
   - `Product` Schema (Name, Description, Price, Images, Category, Availability)
   - `Order` Schema (User ID, Products, Status, Payment Type, etc.)
3. **Product APIs:**
   - `GET /api/products` (Fetch all/by category)
   - `GET /api/products/:id` (Fetch single product)
   - Setup Cloudinary integration for image uploads.

---

## Phase 5: State Management, Cart & Checkout UI
*Goal: Manage frontend state for shopping and build the checkout flow.*

1. **Cart Management:**
   - Implement a global state (Context API or Zustand) to manage cart items.
2. **Cart Sidebar / Page:**
   - Display added products, allow quantity adjustments (+/-), and show total price.
3. **Checkout Page UI:**
   - User Details Form (Name, Mobile, Email, Address, Pincode).
   - Payment Options selection UI (Razorpay vs COD).

---

## Phase 6: Authentication & User Profile
*Goal: Secure the application and implement user-specific features.*

1. **Google OAuth Integration:**
   - Implement Google Login on the frontend.
   - Set up backend Auth APIs and session management (JWT/Cookies).
2. **Profile Section:**
   - Connect authenticated user to their profile view.
   - Fetch and display Order History and Order Tracking (Pending orders) from the backend.

---

## Phase 7: Order Processing & Payments
*Goal: Finalize the purchase flow.*

1. **Order APIs:**
   - `POST /api/orders` to create a new order upon checkout.
2. **Razorpay Integration:**
   - Integrate Razorpay SDK on the frontend and set up order creation/verification webhooks on the backend.
3. **COD Logic:**
   - Handle Cash on Delivery order placement directly to the database.

---

## Phase 8: Admin Panel
*Goal: Provide a dashboard to manage the store.*

1. **Admin UI Layout:**
   - Protected route for Admin Dashboard.
   - Sidebar with tabs: New Orders, Pending Orders, Order History, Add Products, Manage Products, Manage Users.
2. **Admin API Integration:**
   - CRUD operations for Products (Add, Edit, Delete, Update Availability).
   - Manage Order statuses (Pending -> Processing -> Dispatched -> Delivered).

---

## Phase 9: Polish & Notifications
*Goal: Final touches before deployment.*

1. **Email Notifications:**
   - Integrate `nodemailer` with Google App Password to send order confirmation and status update emails.
2. **Performance Optimization:**
   - Optimize images, ensure lazy loading for images and routes.
   - Audit overall load times.
3. **Deployment:**
   - Deploy Frontend to Vercel/Netlify.
   - Deploy Backend to Render/Railway.
   - Ensure MongoDB Atlas is properly secured for production.
