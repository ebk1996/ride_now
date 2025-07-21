import React, { useState, useEffect } from 'react';

// Main App component for the Ride Now application
const App = () => {
  // State variables for the ride request form
  const [pickupLocation, setPickupLocation] = useState('');
  const [destination, setDestination] = useState('');
  // State to manage the ride request process
  const [isRequesting, setIsRequesting] = useState(false);
  const [driverFound, setDriverFound] = useState(false);
  const [rideDetails, setRideDetails] = useState(null);
  const [error, setError] = useState('');

  // Function to handle ride request submission
  const handleRequestRide = async (e) => {
    e.preventDefault(); // Prevent default form submission

    // Basic validation
    if (!pickupLocation || !destination) {
      setError('Please enter both pickup location and destination.');
      return;
    }

    setError(''); // Clear any previous errors
    setIsRequesting(true); // Set requesting state to true
    setDriverFound(false); // Reset driver found state
    setRideDetails(null); // Clear previous ride details

    // Simulate an API call to a backend for ride request
    // In a real MERN app, this would be a fetch() or axios.post() call to your Express.js backend
    try {
      // Simulate network delay for finding a driver
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3-second delay

      // Simulate a successful driver match
      const mockRideData = {
        driverName: 'Alice Smith',
        driverVehicle: 'Toyota Camry (ABC-123)',
        estimatedArrivalTime: '3 minutes',
        fare: '$15.50',
        pickupTime: new Date().toLocaleTimeString(),
        status: 'Driver on the way'
      };

      setRideDetails(mockRideData);
      setDriverFound(true);
    } catch (err) {
      // In a real app, handle actual API errors here
      setError('Failed to request ride. Please try again.');
      console.error('Ride request error:', err);
    } finally {
      setIsRequesting(false); // Reset requesting state
    }
  };

  // Function to reset the ride request process
  const handleNewRide = () => {
    setPickupLocation('');
    setDestination('');
    setIsRequesting(false);
    setDriverFound(false);
    setRideDetails(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4 font-inter">
      <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          <span role="img" aria-label="car emoji">🚗</span> Ride Now
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {!driverFound && !isRequesting && (
          <form onSubmit={handleRequestRide} className="space-y-4">
            <div>
              <label htmlFor="pickup" className="block text-sm font-medium text-gray-700 mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                id="pickup"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter pickup location"
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700 mb-1">
                Destination
              </label>
              <input
                type="text"
                id="destination"
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Enter destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Request Ride
            </button>
          </form>
        )}

        {isRequesting && (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
            <p className="text-lg text-gray-700">Searching for a driver...</p>
            <p className="text-sm text-gray-500">Please wait, this might take a moment.</p>
          </div>
        )}

        {driverFound && rideDetails && (
          <div className="text-center py-4">
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              <span role="img" aria-label="check mark emoji">✅</span> Driver Found!
            </h2>
            <div className="bg-green-50 p-4 rounded-lg shadow-inner mb-6">
              <p className="text-gray-700 text-left mb-2">
                <span className="font-semibold">Driver:</span> {rideDetails.driverName}
              </p>
              <p className="text-gray-700 text-left mb-2">
                <span className="font-semibold">Vehicle:</span> {rideDetails.driverVehicle}
              </p>
              <p className="text-gray-700 text-left mb-2">
                <span className="font-semibold">ETA:</span> {rideDetails.estimatedArrivalTime}
              </p>
              <p className="text-gray-700 text-left mb-2">
                <span className="font-semibold">Fare:</span> {rideDetails.fare}
              </p>
              <p className="text-gray-700 text-left">
                <span className="font-semibold">Status:</span> {rideDetails.status}
              </p>
            </div>
            <button
              onClick={handleNewRide}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Request New Ride
            </button>
          </div>
        )}

        {/* This would be where a map component would go in a real application */}
        <div className="mt-6 bg-gray-200 h-48 rounded-lg flex items-center justify-center text-gray-500 text-sm italic">
          <p>Map Placeholder (Integrate a map API here)</p>
        </div>
      </div>
    </div>
  );
};

export default App;
