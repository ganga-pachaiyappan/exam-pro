# ExamPro

ExamPro is a full-stack online examination and certificate management platform. It provides a React-based frontend for candidates and administrators, along with a FastAPI backend for authentication, exam delivery, results tracking, certificate approval, and invoice generation.

## Overview

The application is split into two parts:

- `src/` contains the React + TypeScript frontend built with Vite and Tailwind CSS.
- `backend/` contains the FastAPI backend backed by SQLite.

The platform supports user registration and login, protected user and admin routes, exam attempts, dashboard analytics, certificate workflows, and payment/invoice handling for certificate unlocks.

## Features

- Secure authentication with role-based access
- Candidate dashboard with exam and certificate stats
- Exam listing, exam attempts, and result tracking
- Admin panel for managing users, exams, certificates, and results
- Certificate approval and PDF download
- Payment and invoice generation for certificate unlocks
- REST API with interactive Swagger documentation

## Tech Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router
- TanStack Query
- Axios

### Backend

- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- JWT-based authentication
- ReportLab for PDF generation

## Project Structure

```text
ExamPro/
|-- src/                  # Frontend source code
|-- public/               # Static assets
|-- backend/              # FastAPI backend
|   |-- routers/          # API route modules
|   |-- uploads/          # Uploaded files, certificates, invoices
|   |-- main.py           # Backend entry point
|   |-- models.py         # Database models
|   |-- schemas.py        # API schemas
|   |-- database.py       # Database configuration
|   `-- requirements.txt  # Python dependencies
|-- package.json          # Frontend dependencies and scripts
|-- vite.config.ts        # Vite configuration
`-- README.md
```

## Prerequisites

Make sure the following are installed:

- Node.js 18+
- npm
- Python 3.11+
- pip

## Frontend Setup

Install frontend dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The frontend runs on `http://localhost:8080`.

## Backend Setup

From the project root:

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

The backend runs on `http://localhost:8000`.

Swagger API documentation is available at `http://localhost:8000/docs`.

## Environment Configuration

The frontend reads the backend base URL from `VITE_API_URL`.

Example:

```env
VITE_API_URL=http://localhost:8000
```

If not provided, the frontend defaults to `http://localhost:8000`.

## Default Admin Account

On backend startup, a default admin account is seeded automatically if it does not already exist.

- Email: `admin@gmail.com`
- Password: `Admin@123`

For production use, change these credentials and move secrets to environment variables.

## Available Scripts

- `npm run dev` starts the frontend development server
- `npm run build` creates a production build
- `npm run preview` previews the production build locally
- `npm run lint` runs ESLint
- `npm run test` runs the test suite with Vitest

## Notes

- The backend currently uses SQLite for local development.
- Uploaded assets, certificates, and invoices are stored under `backend/uploads/`.
- The project includes both frontend and backend code in a single repository for simpler local development.

## License

This project is intended for internal use or further customization. Add a license section here if you plan to distribute it publicly.
