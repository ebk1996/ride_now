// Import required modules
const express = require('express');
const http = require('http'); // Required for Socket.IO
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors'); // For handling Cross-Origin Resource Sharing

// Initialize Express app
const app = express();
const server = http.createServer(app); // Create HTTP server for Socket.IO
const io = socketIo(server, {
  cors: {
    origin: "*", // Allow all origins for development, restrict in production
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies

// --- MongoDB Connection ---
// Replace with your MongoDB connection string
const mongoURI = 'mongodb://localhost:27017/ridenow'; // Example local MongoDB URI
// For a production app, use environment variables: process.env.MONGO_URI

mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- MongoDB Schemas and Models (Placeholders) ---
// In a real app, these would be in separate files (e.g., models/User.js, models/Ride.js)

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // In production, hash passwords!
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['rider', 'driver'], default: 'rider' },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Ride Schema
const rideSchema = new mongoose.Schema({
  riderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, assigned when driver found
  pickupLocation: { type: String, required: true },
  destination: { type: String, required: true },
  status: { type: String, enum: ['pending', 'searching', 'accepted', 'on_the_way', 'completed', 'cancelled'], default: 'pending' },
  fare: { type: Number },
  estimatedArrivalTime: { type: String },
  pickupTime: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
const Ride = mongoose.model('Ride', rideSchema);

// --- API Endpoints ---

// Root endpoint
app.get('/', (req, res) => {
  res.send('Ride Now Backend API is running!');
});

// User Registration (Simplified - for demonstration)
app.post('/api/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  try {
    // In a real app, hash password before saving
    const newUser = new User({ username, email, password, role });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully', userId: newUser._id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
});

// User Login (Simplified - for demonstration)
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || user.password !== password) { // In real app, compare hashed passwords
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    // In a real app, generate and send a JWT token here
    res.status(200).json({ message: 'Login successful', userId: user._id, role: user.role });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Error logging in', error: error.message });
  }
});

// Request a Ride
app.post('/api/rides/request', async (req, res) => {
  // In a real app, you'd get riderId from authenticated user (e.g., JWT payload)
  const { riderId, pickupLocation, destination } = req.body;

  if (!riderId || !pickupLocation || !destination) {
    return res.status(400).json({ message: 'Missing required ride details.' });
  }

  try {
    const newRide = new Ride({
      riderId,
      pickupLocation,
      destination,
      status: 'searching' // Initial status
    });
    await newRide.save();

    // Simulate driver matching (replace with actual logic)
    // In a real app, this would involve complex algorithms to find nearby drivers
    setTimeout(async () => {
      const mockDriver = {
        _id: new mongoose.Types.ObjectId(), // Mock driver ID
        name: 'Alice Smith',
        vehicle: 'Toyota Camry (ABC-123)'
      };
      const fare = (Math.random() * 20 + 10).toFixed(2); // Random fare between $10 and $30
      const eta = `${Math.floor(Math.random() * 5) + 2} minutes`; // Random ETA 2-7 mins

      // Update ride status and details
      newRide.driverId = mockDriver._id;
      newRide.fare = parseFloat(fare);
      newRide.estimatedArrivalTime = eta;
      newRide.status = 'accepted';
      newRide.pickupTime = new Date();
      await newRide.save();

      // Emit real-time update to the rider
      io.to(riderId).emit('rideUpdate', {
        rideId: newRide._id,
        status: newRide.status,
        driverName: mockDriver.name,
        driverVehicle: mockDriver.vehicle,
        estimatedArrivalTime: newRide.estimatedArrivalTime,
        fare: newRide.fare,
        pickupTime: newRide.pickupTime.toLocaleTimeString(),
        message: 'Driver found!'
      });

      res.status(200).json({
        message: 'Ride request received and driver searching initiated.',
        rideId: newRide._id,
        status: newRide.status,
        driverName: mockDriver.name,
        driverVehicle: mockDriver.vehicle,
        estimatedArrivalTime: newRide.estimatedArrivalTime,
        fare: newRide.fare,
        pickupTime: newRide.pickupTime.toLocaleTimeString()
      });

    }, 3000); // Simulate 3-second search time

  } catch (error) {
    console.error('Error requesting ride:', error);
    res.status(500).json({ message: 'Failed to request ride', error: error.message });
  }
});

// Get Ride Status (for a specific ride)
app.get('/api/rides/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id).populate('riderId').populate('driverId');
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }
    res.status(200).json(ride);
  } catch (error) {
    console.error('Error fetching ride status:', error);
    res.status(500).json({ message: 'Failed to fetch ride status', error: error.message });
  }
});

// --- Socket.IO Real-time Communication ---
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a rider connects, they would typically join a room specific to their user ID
  // This allows us to send targeted updates to a specific rider
  socket.on('joinRideRoom', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined ride room.`);
  });

  // Example: Driver location updates (placeholder)
  socket.on('driverLocationUpdate', (data) => {
    // In a real app, validate driver, update their location in DB,
    // and then emit this update to the relevant rider's room
    console.log(`Driver ${data.driverId} location: ${data.latitude}, ${data.longitude}`);
    // Example: io.to(data.riderId).emit('driverLocation', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// --- Server Start ---
const PORT = process.env.PORT || 5000; // Use environment port or default to 5000
server.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
  console.log(`Access API at http://localhost:${PORT}`);
});
