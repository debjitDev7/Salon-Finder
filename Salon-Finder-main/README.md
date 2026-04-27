# 🏪 Nearby Salon Slot Booking App

A full-stack web application for discovering and booking salon appointments near you.

![Salon Finder](https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800)

## ✨ Features

### For Customers
- 📍 Find nearby salons based on location (2-10 km radius)
- 🔍 View salon details, services, and prices
- ⏰ Real-time slot availability
- 📅 Book appointments instantly
- 📋 Manage upcoming and past bookings
- ❌ Cancel bookings (2+ hours before appointment)

### For Salon Owners
- 🏪 Register and manage salon profile
- 💇 Add/edit services with pricing
- 📅 Auto-generate time slots from working hours
- 📋 View and manage daily bookings
- ✅ Accept/Complete bookings

### For Admin
- 📊 Dashboard with statistics
- ✓ Verify new salons
- 🚫 Block/unblock salons and users
- 📋 Monitor all bookings

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Authentication | JWT + bcrypt |
| Frontend | React.js (Vite) |
| Styling | Custom CSS (Glassmorphism) |
| Maps | Leaflet + OpenStreetMap |

## 📁 Project Structure

```
book-my-salon/
├── backend/
│   ├── config/          # Database configuration
│   ├── controllers/     # Request handlers
│   ├── middleware/      # Auth & error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helpers (slot generator, etc.)
│   ├── server.js        # Entry point
│   └── .env             # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React Context (Auth)
│   │   ├── pages/       # Page components
│   │   ├── services/    # API integration
│   │   ├── App.jsx      # Main app with routing
│   │   └── index.css    # Global styles
│   └── .env             # Frontend env vars
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env)**:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/salon-booking
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
```

**Frontend (.env)**:
```
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Development Servers

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

- Backend: http://localhost:5000
- Frontend: http://localhost:5173

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Salons
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/salons/nearby?lat=X&lng=Y&radius=5` | Find nearby salons |
| GET | `/api/salons/:id` | Get salon details |
| POST | `/api/salons` | Create salon (owner) |

### Slots
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/slots/salon/:id?date=YYYY-MM-DD` | Get salon slots |
| POST | `/api/slots/generate` | Generate slots (owner) |

### Bookings
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/my` | My bookings |
| PUT | `/api/bookings/:id/cancel` | Cancel booking |

## 🔐 User Roles

| Role | Access |
|------|--------|
| `customer` | Search salons, book slots, manage bookings |
| `salonOwner` | Manage salon, services, slots, view bookings |
| `admin` | Verify salons, manage users, view all data |

## 🎨 Design

The app features a modern dark theme with:
- Glassmorphism effects
- Purple-pink gradient accents
- Smooth animations
- Mobile-responsive layout

## 📦 Deployment

### Backend (Render)
1. Connect GitHub repo
2. Set environment variables
3. Build: `npm install`
4. Start: `node server.js`

### Frontend (Vercel/Netlify)
1. Connect GitHub repo
2. Set `VITE_API_URL` to backend URL
3. Build: `npm run build`
4. Publish: `dist`

## 🔮 Future Enhancements

- [ ] Payment integration (Razorpay/Stripe)
- [ ] Email/SMS notifications
- [ ] Review and rating system
- [ ] Salon image gallery
- [ ] Advanced search filters
- [ ] Mobile app (React Native)

## 📄 License

MIT License - Free for personal and commercial use.

---

Built with ❤️ for the perfect salon experience.
