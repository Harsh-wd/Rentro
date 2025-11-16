import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";
import userRouter from "./routes/userRoute.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";

// --- NEW IMPORTS ---
// Import Node's built-in 'http' module
import { createServer } from 'http'; 
// Import the 'Server' class from 'socket.io'
import { Server } from 'socket.io'; 
// -------------------

//Initialize Express App
const app = express();

//connect database
await connectDB();

//Middleware
app.use(cors());
app.use(express.json());

// --- NEW HTTP SERVER & SOCKET.IO SETUP ---

// Create an HTTP server from our Express app
const httpServer = createServer(app);

// Create a new Socket.IO server and attach it to the HTTP server
const io = new Server(httpServer, {
  cors: {
    // Allow connections from your local React app and your future deployed app
    // MAKE SURE to replace 'https://your-frontend-url.com' with your Vercel URL after deployment
    origin: ["http://localhost:5173", "https://your-frontend-url.com"],
    methods: ["GET", "POST"]
  }
});

// --- NEW LIVE TRACKING LOGIC ---
io.on('connection', (socket) => {
  console.log(`User Connected: ${socket.id}`);

  // When a user (renter or owner) joins a room to watch a booking
  socket.on('join_booking_room', (bookingId) => {
    socket.join(bookingId); // Join a "room" named after the booking's ID
    console.log(`User ${socket.id} joined room ${bookingId}`);
  });

  // When the renter's phone sends its location
  socket.on('update_location', (data) => {
    const { bookingId, location } = data;
    // Broadcast this location to everyone ELSE in the same room
    socket.to(bookingId).emit('location_update', location);
  });

  // When a user disconnects
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

// --- FINAL CHANGE: Start the 'httpServer' instead of 'app' ---
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));