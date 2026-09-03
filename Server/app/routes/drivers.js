const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ctrl = require('../controllers/driverController');

// Configure multer for driver form uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '..', '..', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    cb(null, `driver_${uniqueSuffix}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('فقط فایل‌های تصویری مجاز هستند'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Driver Profiles
router.get('/api/driver-profiles', ctrl.getDriverProfiles);
router.post('/api/driver-profiles', upload.fields([
  { name: 'ax', maxCount: 1 },
  { name: 'scan_melli', maxCount: 1 },
  { name: 'scan_govahiname', maxCount: 1 },
  { name: 'scan_car_card', maxCount: 1 },
  { name: 'scan_car_card_back', maxCount: 1 },
  { name: 'scan_insurance', maxCount: 1 },
  { name: 'scan_insurance_Addendum', maxCount: 1 },
  { name: 'scan_so_pishineh', maxCount: 1 },
  { name: 'scan_salamat', maxCount: 1 },
  { name: 'pic_front', maxCount: 1 },
  { name: 'pic_back', maxCount: 1 },
  { name: 'pic_in_front', maxCount: 1 },
  { name: 'pic_in_back', maxCount: 1 }
]), ctrl.createDriverFromForm);
router.post('/api/drivers', ctrl.createDriver);
router.get('/api/driver-profiles/:id', ctrl.getDriverById);
router.put('/api/driver-profiles/:id', ctrl.updateDriver);
router.patch('/api/driver-profiles/:id/verify', ctrl.verifyDriver);
router.patch('/api/driver-profiles/:id/delete', ctrl.softDeleteDriver);

// Driver Documents
router.get('/api/driver-documents', ctrl.getDriverDocuments);
router.post('/api/driver-documents', upload.single('file'), ctrl.createDriverDocument);
router.patch('/api/driver-documents/:id/verify', ctrl.verifyDocument);
router.delete('/api/driver-documents/:id', ctrl.deleteDriverDocument);

// Driver Locations
router.get('/api/driver-locations', ctrl.getDriverLocations);

// Driver Schedules
router.get('/api/driver-schedules', ctrl.getDriverSchedules);
router.post('/api/driver-schedules', ctrl.createDriverSchedule);

// Vehicles
router.get('/api/vehicles', ctrl.getVehicles);
router.post('/api/vehicles', ctrl.createVehicle);
router.put('/api/vehicles/:id', ctrl.updateVehicle);
router.delete('/api/vehicles/:id', ctrl.deleteVehicle);

// Drivers list (for vehicle assignment)
router.get('/api/drivers', ctrl.getDrivers);

// Car Brands
router.get('/api/car-brands', ctrl.getCarBrands);
router.post('/api/car-brands', ctrl.createCarBrand);
router.put('/api/car-brands/:id', ctrl.updateCarBrand);
router.delete('/api/car-brands/:id', ctrl.deleteCarBrand);

// Car Models
router.get('/api/car-models', ctrl.getCarModels);
router.post('/api/car-models', ctrl.createCarModel);
router.put('/api/car-models/:id', ctrl.updateCarModel);
router.delete('/api/car-models/:id', ctrl.deleteCarModel);

module.exports = router;
