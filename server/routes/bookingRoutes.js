import express from "express";
import { 
    changeBookingStatus, 
    checkAvailabilityofCar, 
    createBooking, 
    getOwnerBookings, 
    getUserBookings,
    getBookingLocation, // <-- Import new function
    updateBookingLocation // <-- Import new function
} from "../controllers/bookingController.js";
import {protect} from "../middleware/auth.js"
const bookingRouter=express.Router();

bookingRouter.post('/check-availability',checkAvailabilityofCar)
bookingRouter.post('/create',protect , createBooking)
bookingRouter.get('/user', protect,getUserBookings)
bookingRouter.get('/owner',protect,getOwnerBookings)
bookingRouter.post('/change-status',protect,changeBookingStatus)

// --- NEW LIVE TRACKING API ROUTES ---

// Get the last known location for a specific booking
bookingRouter.get('/location/:bookingId', protect, getBookingLocation);

// Update (save) the location for a specific booking
bookingRouter.post('/location', protect, updateBookingLocation);

// ------------------------------------

export default bookingRouter;