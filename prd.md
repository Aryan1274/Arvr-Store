# Product Requirements Document (PRD)

## Project Name
**ARVR Store (ArVr)**

---

## 1. Overview
ARVR Store is a mobile-first e-commerce website focused on trendy, aesthetic, and minimal product shopping experience. The platform will provide a smooth, visually appealing interface with easy navigation, optimized primarily for mobile users.

Additionally, the website will also support a fully responsive desktop (normal website) interface, ensuring a consistent and optimized experience across all devices including mobiles, tablets, and desktops. The design approach will follow mobile-first principles, but will scale seamlessly to larger screens with proper layout adjustments, spacing, and component alignment.

---

## 2. Tech Stack
- **Frontend:** React.js (Vite)
- **Backend:** Node.js + Express.js
- **Database:** MongoDB
- **Media Storage:** Cloudinary
- **Authentication:** Google OAuth
- **Payments:** Razorpay + Cash on Delivery (COD)
- **Email Service:** Google App Password (SMTP)
- **Styling:** Tailwind CSS / CSS

---

## 3. Design Principles
- Mobile-first design
- Cute + minimal + aesthetic UI
- Card-based layout
- Smooth animations
- Easy navigation
- Fast loading

---

## 4. User Roles
### 4.1 Customer
- Browse products
- Add to cart
- Buy products
- Track orders
- View order history

### 4.2 Admin
- Manage products
- Manage orders
- Manage users
- Update product availability

---

## 5. Features

### 5.1 Homepage
#### Navbar
- Left: Menu icon (hamburger)
- Right: Logo ("ArVr")

#### Menu Tabs
- Shop
- For Her
- For Him
- Couples Combo
- Combo
- Besties
- Contact Us

#### Category Cards
- Horizontal scroll
- Same categories as menu

#### Carousel
- Auto-scroll images
- Loop enabled
- 1-second pause per slide

#### Trending Products
- Grid layout (2 products per row for mobile)

#### Categorized Sections
- Multiple product sections based on categories

#### Footer
- Privacy Policy
- Terms & Conditions
- Shipping & Returns
- Contact Us
- About Us
- Social media icons
- Footer text: "© 2026 ARVR | Made with Love & Trends"

---

### 5.2 Product Page
- Product images
- Product details
- Price
- Buttons:
  - Buy Now
  - Add to Bag

#### Similar Products
- Horizontal scroll section

---

### 5.3 Cart & Checkout
#### Checkout Page
- Product summary
- Quantity selector (+ / -)
- Total price calculation

#### User Details Form
- Name
- Mobile Number
- Email
- Address fields:
  - Address + Landmark
  - Pincode
  - City
  - State

#### Payment Options
- Online Payment (Razorpay)
- Cash on Delivery (COD)

---

### 5.4 Profile Section
- Cart
- Order History
- Order Tracking

#### Order Tracking
- View pending orders

#### Order History
- View completed orders

---

### 5.5 Authentication
- Google OAuth login
- User session management

---

### 5.6 Admin Panel
#### Dashboard Tabs
- New Orders
- Pending Orders
- Order History
- Add Products
- Manage Products
- Manage Users

#### Product Management
- Add product
- Edit product
- Delete product
- Upload images (Cloudinary)
- Set availability status

#### Order Management
- Update order status:
  - Pending
  - Processing
  - Dispatched
  - Delivered

---

### 5.7 Email Notifications
- Order confirmation email
- Order status updates

---

## 6. Database Structure (High-Level)

### Users
- Name
- Email
- Google ID
- Orders

### Products
- Name
- Description
- Price
- Category
- Images (Cloudinary URLs)
- Availability

### Orders
- User ID
- Products
- Quantity
- Price
- Status
- Payment Type
- Address

---

## 7. API Modules
- Auth APIs
- Product APIs
- Order APIs
- Payment APIs
- Admin APIs

---

## 8. UI Components
- Navbar
- Sidebar Menu
- Product Card
- Category Card
- Carousel
- Footer
- Forms

---

## 9. Performance Requirements
- Fast loading (<2 sec)
- Optimized images
- Lazy loading

---

## 10. Security
- Secure authentication
- Input validation
- Payment verification

---

## 11. Future Enhancements
- Wishlist feature
- Coupons & discounts
- Reviews & ratings
- Push notifications

---

## 12. Deployment
- Frontend: Vercel / Netlify
- Backend: Render / Railway
- Database: MongoDB Atlas

---

## 13. Summary
ARVR Store aims to deliver a modern, mobile-friendly, and visually appealing e-commerce experience with essential features like product browsing, cart, checkout, and admin management.
