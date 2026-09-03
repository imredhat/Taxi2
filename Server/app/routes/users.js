const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/api/users', userController.getUsers);
router.post('/api/users', userController.createUser);
router.get('/api/users/:id', userController.getUserById);
router.put('/api/users/:id', userController.updateUser);
router.patch('/api/users/:id/status', userController.toggleUserStatus);

module.exports = router;
