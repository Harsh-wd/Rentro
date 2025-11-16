import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoute.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// Import Node's built-in 'http' module
import { createServer } from 'http';
// Import the 'Server' class from 'socket.io'
import { Server } from 'socket.io';

// --- NEW: Define your allowed origins ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://rentro-liard.vercel.app" // Your new frontend URL from the screenshot
];

// --- NEW: CORS configuration ---
const corsOptions = {
  origin: function (origin, callback) {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      // Allow requests if origin is in the list or if there's no origin (like Postman)
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
};
// ------------------------------

//Initialize Express App
const app = express();

//connect database
await connectDB();

// --- UPDATE: Use specific CORS options ---
app.use(cors(corsOptions));
// ------------------------------------
app.use(express.json());


// --- HTTP SERVER & SOCKET.IO SETUP ---
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    // --- UPDATE: Use the same allowed origins list ---
    origin: allowedOrigins,
    // ------------------------------------------
    methods: ["GET", "POST"]
  }
});

// --- LIVE TRACKING LOGIC ---
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  socket.on('join_booking_room', (bookingId) => {
    socket.join(bookingId);
    console.log(`User ${socket.id} joined room ${bookingId}`);
  });

  socket.on('update_location', (data) => {
    const { bookingId, location } = data;
    socket.to(bookingId).emit('location_update', location);
  });

  socket.on('disconnect', () => {
    console.log(`User Disconnected: ${socket.id}`);
  });
});
// -------------------------------

// --- API ROUTES (No changes here) ---
app.get('/', (req, res) => res.send("Server is running"));
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/bookings', bookingRouter);
// ------------------------------------

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));