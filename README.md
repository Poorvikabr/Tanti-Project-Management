# Tanti Projects - Project Management System

A comprehensive project management web application similar to Zoho Projects, built with FastAPI (Python), React, and MongoDB.

## 🚀 Features Implemented

### ✅ Phase 1: MVP Core Features

#### Authentication & Authorization
- JWT-based authentication system
- User registration and login
- Role-based access control (Admin, PM, Designer, Purchase, Finance, Region Head)
- Secure password hashing with bcrypt

#### Dashboard
- **KPI Cards**: Total Projects, Active Projects, Completed Projects, At-Risk Projects (clickable to filter)
- **Project Status Donut Chart**: Visual distribution of project statuses
- **Region Bar Chart**: Projects distribution by region
- **Financial Summary**: Total project value, active value, completed value
- **Quick Links**: Create Project, Reports, Upload Invoice, Manage Templates
- **Recent Activity Feed**: Chronological list of recent actions

#### Projects Module
- **Projects Listing**: 
  - Grid view with project cards
  - Search by project/client name
  - Filter by Region, Status, Type
  - Color-coded status badges
  - Progress indicators
  - Days remaining calculations
- **Project Cards Display**: Name, Client, Region, Value, Progress %, Days Remaining, Status

#### Layout Components
- **Fixed Left Sidebar**: Dark theme navigation with active state indicators
- **Fixed Top Bar**: 
  - Global search
  - +New dropdown (Project, Task, Material Request, Issue)
  - Notifications bell with unread count
  - Region switcher (Bengaluru, Mysuru, North Karnataka)
  - Theme toggle (Light/Dark)
  - User menu with profile and logout
- **Breadcrumb Navigation**: Dynamic path display
- **Responsive Design**: Mobile-friendly layout

### 🏗️ Backend API (Complete)

All endpoints are fully implemented and working

## 📦 Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **Motor**: Async MongoDB driver
- **PyJWT**: JWT token authentication
- **Bcrypt**: Password hashing
- **Pydantic**: Data validation
- **Boto3**: AWS S3 integration (ready, not activated)

### Frontend
- **React 19**: Latest React version
- **React Router DOM**: Client-side routing
- **Axios**: HTTP client
- **Recharts**: Chart library
- **Shadcn UI**: Component library
- **Tailwind CSS**: Utility-first CSS
- **Lucide React**: Icon library
- **Sonner**: Toast notifications

### Database
- **MongoDB**: NoSQL database

## 🚦 Getting Started

### Default Credentials
```
Email: admin@tantiprojects.com
Password: admin123
Role: Admin
```

### Sample Projects Created
1. **Skyline Residential Complex** - Active (₹50,000,000)
2. **Tech Park Phase 2** - Planning (₹75,000,000)
3. **Manufacturing Unit Expansion** - At-Risk (₹120,000,000)
4. **Green Valley Villas** - Completed (₹35,000,000)
