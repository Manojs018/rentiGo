const express = require('express');
const router = express.Router();
const {
  getVehicles, getVehicle, addVehicle, updateVehicle, deleteVehicle, getMyVehicles, toggleVehicleAvailability
} = require('../controllers/vehicleController');
const protect = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');

router.get('/', getVehicles);
router.get('/my', protect, roleGuard('owner', 'admin'), getMyVehicles);
router.get('/:id', getVehicle);
router.post('/', protect, roleGuard('owner', 'admin'), addVehicle);
router.put('/:id/availability', protect, roleGuard('owner', 'admin'), toggleVehicleAvailability);
router.put('/:id', protect, roleGuard('owner', 'admin'), updateVehicle);
router.delete('/:id', protect, roleGuard('owner', 'admin'), deleteVehicle);

module.exports = router;
