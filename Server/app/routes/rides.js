const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rideController');
const dispatch = require('../controllers/dispatchController');
const { verifyAdmin } = require('../middleware/auth');
const { handler } = require('../middleware/passenger');


// Rides
router.get('/api/rides', ctrl.getRides);
router.get('/api/rides/:id', ctrl.getRideById);

// Ride Requests
router.get('/api/ride-requests', ctrl.getRideRequests);
router.get('/api/ride-requests/:id/drivers', verifyAdmin, handler(dispatch.drivers));
router.put('/api/ride-requests/:id/assignment', verifyAdmin, handler(dispatch.assign));
router.patch('/api/ride-requests/:id', verifyAdmin, handler(dispatch.edit));
router.post('/api/ride-requests/:id/fare-preview', verifyAdmin, handler(dispatch.previewFare));

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
