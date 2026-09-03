const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/pricingController');

// Base Fares
router.get('/api/base-fares', ctrl.getBaseFares);
router.post('/api/base-fares', ctrl.createBaseFare);
router.put('/api/base-fares/:id', ctrl.updateBaseFare);
router.delete('/api/base-fares/:id', ctrl.deleteBaseFare);

// Intercity Pricing
router.get('/api/intercity-pricing', ctrl.getIntercityPricing);
router.post('/api/intercity-pricing', ctrl.createIntercityPricing);
router.put('/api/intercity-pricing/:id', ctrl.updateIntercityPricing);
router.delete('/api/intercity-pricing/:id', ctrl.deleteIntercityPricing);

// Surge Rules
router.get('/api/surge-rules', ctrl.getSurgeRules);
router.post('/api/surge-rules', ctrl.createSurgeRule);
router.put('/api/surge-rules/:id', ctrl.updateSurgeRule);
router.delete('/api/surge-rules/:id', ctrl.deleteSurgeRule);

// Time Pricing
router.get('/api/time-pricing', ctrl.getTimePricing);
router.post('/api/time-pricing', ctrl.createTimePricing);
router.put('/api/time-pricing/:id', ctrl.updateTimePricing);
router.delete('/api/time-pricing/:id', ctrl.deleteTimePricing);

// Weather Pricing
router.get('/api/weather-pricing', ctrl.getWeatherPricing);
router.post('/api/weather-pricing', ctrl.createWeatherPricing);
router.put('/api/weather-pricing/:id', ctrl.updateWeatherPricing);
router.delete('/api/weather-pricing/:id', ctrl.deleteWeatherPricing);

// Road Condition Pricing
router.get('/api/road-condition-pricing', ctrl.getRoadConditionPricing);
router.post('/api/road-condition-pricing', ctrl.createRoadConditionPricing);
router.put('/api/road-condition-pricing/:id', ctrl.updateRoadConditionPricing);
router.delete('/api/road-condition-pricing/:id', ctrl.deleteRoadConditionPricing);

// Toll Rules
router.get('/api/toll-rules', ctrl.getTollRules);
router.post('/api/toll-rules', ctrl.createTollRule);
router.put('/api/toll-rules/:id', ctrl.updateTollRule);
router.delete('/api/toll-rules/:id', ctrl.deleteTollRule);

module.exports = router;
