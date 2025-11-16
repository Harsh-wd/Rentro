import mongoose from "mongoose";

const locationSchema = new mongoose.Schema({
  // Link this location entry to a specific booking
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    // Automatically delete location data after 7 days
    expires: '7d' 
  }
});

// Create an index for faster queries by bookingId
locationSchema.index({ bookingId: 1, timestamp: -1 });

const Location = mongoose.model("Location", locationSchema);
export default Location;