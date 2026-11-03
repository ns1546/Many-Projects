# CatVTON Virtual Try-On System

A complete virtual try-on system for e-commerce, built with React and Express, connecting to a Google Colab CatVTON backend.

## Architecture

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion
- **Backend**: Express + Multer + Axios
- **AI Backend**: CatVTON API running on Google Colab / Cloudflare

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and add your CatVTON API URL and Key.

```bash
npm start
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Security Note

The `CATVTON_API_KEY` is securely stored in the backend `.env` file and is never exposed to the frontend or browser. The backend acts as a secure proxy and handles file validation before sending requests to the CatVTON API.
