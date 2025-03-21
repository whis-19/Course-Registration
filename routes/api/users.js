const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const { protect, admin } = require('../../middleware/auth');

// Student login
router.post('/login', userController.loginUser);

// Admin login
router.post('/admin/login', userController.loginAdmin);

// Get user profile
router.get('/profile', protect, userController.getUserProfile);

// Create student (admin only)
router.post('/create-student', protect, admin, userController.createStudentUser);

// Create admin (admin only)
router.post('/create-admin', protect, admin, userController.createAdminUser);

module.exports = router;