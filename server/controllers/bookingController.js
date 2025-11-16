import Booking from "../models/Booking.js";
import Car from "../models/Car.js";
import Location from "../models/Location.js"; // --- NEW IMPORT ---

//Function to check Availability of car for a given date
const checkAvailability = async (car, pickupDate, returnDate) => {
  const bookings = await Booking.find({
    car,
    pickupDate: { $lte: returnDate },
    returnDate: { $gte: pickupDate },
  });
  return bookings.length === 0;
};

//Api to check availability of cars for the given date and location
export const checkAvailabilityofCar = async (req, res) => {
  try {
    const { location, pickupDate, returnDate } = req.body;
    //fetch all available cars for the given location
    const cars = await Car.find({ location, isAvailable: true });
    //check car availability for the given data range using promise
    const availableCarsPromises = cars.map(async (car) => {
      const isAvailable = await checkAvailability(
        car._id,
        pickupDate,
        returnDate
      );
      return { ...car._doc, isAvailable: isAvailable };
    });
    let availableCars = await Promise.all(availableCarsPromises);
    availableCars = availableCars.filter((car) => car.isAvailable === true);

    res.json({ success: true, availableCars });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Api to create booking
export const createBooking = async (req, res) => {
  try {
    const { _id } = req.user;
    const { car, pickupDate, returnDate } = req.body;
    const isAvailable = await checkAvailability(car, pickupDate, returnDate);
    if (!isAvailable) {
      return res.json({ success: false, message: "Car is not available" });
    }

    const carData = await Car.findById(car);

    //calculate price based on pickup date and returndate
    const picked = new Date(pickupDate);
    const returned = new Date(returnDate);
    const noOfDays = Math.ceil((returned - picked) / (1000 * 60 * 60 * 24));
    const price = carData.pricePerDay * noOfDays;

    await Booking.create({
      car,
      owner: carData.owner,
      user: _id,
      pickupDate,
      returnDate,
      price,
    });
    res.json({ success: true, message: "Booking created" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Api to list user bookings
export const getUserBookings = async (req, res) => {
  try {
    const { _id } = req.user;
    const bookings = await Booking.find({ user: _id })
      .populate("car")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//API to get owner bookings
export const getOwnerBookings = async (req, res) => {
  try {
    if (req.user.role !== "owner") {
      return res.json({ success: false, message: "Unauthorized" });
    }
    const bookings = await Booking.find({ owner: req.user._id })
      .populate("car user")
      .select("-user.password")
      .sort({ createdAt: -1 });
    res.json({ success: true, bookings });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Api to change booking status
export const changeBookingStatus = async (req, res) => {
  try {
    const { _id } = req.user;
    const { bookingId, status } = req.body;
    const booking = await Booking.findById(bookingId);

    if (booking.owner.toString() !== _id.toString()) {
      return res.json({ success: false, message: "Unauthorized" });
    }
    booking.status = status;
    await booking.save();
    res.json({ success: true, message: "status updated" });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// --- NEW FUNCTIONS FOR LIVE TRACKING ---

/**
 * @desc    Save a new location point for a booking
 * @route   POST /api/bookings/location
 * @access  Private (Renter only)
 */
export const updateBookingLocation = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { bookingId, latitude, longitude } = req.body;

    if (!bookingId || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    // Security Check: Verify the user is the renter for this booking
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (booking.user.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized: You are not the renter for this booking" });
    }

    // Save the new location
    await Location.create({
      bookingId,
      latitude,
      longitude,
    });

    res.json({ success: true, message: "Location updated" });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

/**
 * @desc    Get the last known location for a booking
 * @route   GET /api/bookings/location/:bookingId
 * @access  Private (Renter or Owner)
 */
export const getBookingLocation = async (req, res) => {
  try {
    const { _id: userId } = req.user;
    const { bookingId } = req.params;

    // Security Check: Verify the user is the renter OR owner
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    if (
      booking.user.toString() !== userId.toString() &&
      booking.owner.toString() !== userId.toString()
    ) {
      return res.status(403).json({ success: false, message: "Unauthorized: You are not associated with this booking" });
    }

    // Find the most recent location for this booking
    const latestLocation = await Location.findOne({ bookingId }).sort({
      timestamp: -1,
    });

    if (!latestLocation) {
      return res.status(404).json({ success: false, message: "No location data found for this vehicle" });
    }

    res.json({ success: true, location: latestLocation });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};