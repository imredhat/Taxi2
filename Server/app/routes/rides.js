const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rideController');

// Rides
router.get('/api/rides', ctrl.getRides);
router.get('/api/rides/:id', ctrl.getRideById);

// Ride Requests
router.get('/api/ride-requests', ctrl.getRideRequests);

// Ride Locations
router.get('/api/ride-locations', ctrl.getRideLocations);

// Ride Stops
router.get('/api/ride-stops', ctrl.getRideStops);
router.post('/api/rides', ctrl.createRide);
router.post('/api/ride-stops', ctrl.createRideStop);

// Ride Schedules
router.get('/api/ride-schedules', ctrl.getRideSchedules);

// Ride Messages
router.get('/api/ride-messages', ctrl.getRideMessages);

module.exports = router;
