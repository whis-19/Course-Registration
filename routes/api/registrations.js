const express = require('express');
const router = express.Router();
const registrationController = require('../../controllers/registrationController');
const { protect, admin } = require('../../middleware/auth');

// Get all registrations / register for course
router.route('/')
    .get(protect, admin, registrationController.getAllRegistrations)
    .post(protect, registrationController.getCurrentStudentRegistrations);

// Get student's registrations
router.get('/my', protect, registrationController.getCurrentStudentRegistrations);

// Update or cancel registration
router.route('/:id')
    .put(protect, admin, registrationController.updateCourseRegistration)
    .delete(protect, registrationController.cancelCourseRegistration);

module.exports = router;