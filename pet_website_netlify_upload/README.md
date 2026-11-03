# Petopia - Modern Full-Stack E-Commerce

Petopia is a premium, modern, full-stack e-commerce platform built specifically for pet supplies. Inspired by Zooplus but featuring a unique, modern, and aesthetically pleasing design.

## 🚀 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB via Mongoose
- **Authentication:** Custom JWT with bcryptjs
- **State Management:** Zustand (Persisted Cart)
- **Icons & Animation:** Lucide React, Framer Motion
- **Image Handling:** Cloudinary (Setup ready)

## 📁 Project Architecture

- `/src/app` - Next.js App Router pages (Home, Cart, Admin)
- `/src/app/api` - Backend API Routes (Auth, Products, Orders)
- `/src/components` - Reusable UI components (Navbar, Footer, ProductCards)
- `/src/models` - MongoDB Schema Definitions (User, Product, Order, Category, Review)
- `/src/lib` - Utility functions (DB connection, JWT auth, helpers)
- `/src/store` - Zustand state management stores

## 🛠️ Features Completed in Initial Build

1. **Robust Database Schema:** Complete Mongoose models for Users, Products, Categories, Orders, and Reviews.
2. **Modern Styling System:** Tailwind CSS configured with a custom color palette (Emerald/Orange) for a premium look.
3. **Responsive Navbar & Footer:** Mega-menu ready, cart icon with badge, responsive mobile menu.
4. **Beautiful Home Page:** Hero section, Categories grid, Feature highlights, and Trending Products slider.
5. **Admin Dashboard Foundation:** A secure layout with a sidebar and an overview statistics page ready to connect to live data.
6. **Authentication API Base:** Secure register and login API routes with password hashing and JWT issuance.
7. **Cart Management:** Global Zustand store configured for adding, updating, and removing items with local storage persistence.

## ⚙️ How to Run Locally

1. Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/petopia
   JWT_SECRET=your_super_secret_jwt_key
   CLOUDINARY_URL=your_cloudinary_url
   ```
2. Make sure MongoDB is running locally (or use a MongoDB Atlas URI).
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
5. Open [http://localhost:3000/admin](http://localhost:3000/admin) to view the Admin Dashboard.

## 🔜 Next Steps

- Integrate payment gateway or finalize COD logic.
- Connect the Admin Dashboard to real MongoDB aggregation data.
- Build the dynamic product details page (`/product/[slug]`).
- Complete the checkout wizard (Cart -> Address -> Review -> Success).
