const Registration = require('../models/registration');
const Course = require('../models/course');
const User = require('../models/user');

// Helper function to convert time string to minutes
function convertTimeToMinutes(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Register for a course
async function registerCourse(req, res) {
    try {
        const { courseId } = req.body;
        const studentId = req.user._id;

        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ success: false, error: 'Course not found' });
        }

        if (course.availableSeats <= 0) {
            return res.status(400).json({ success: false, error: 'No seats available for this course' });
        }

        const existingRegistration = await Registration.findOne({
            student: studentId,
            course: courseId
        });

        if (existingRegistration) {
            return res.status(400).json({ success: false, error: 'Already registered for this course' });
        }

        const userRegistrations = await Registration.find({
            student: studentId,
            status: 'approved'
        }).populate('course');

        const newCourseSchedule = course.schedule;

        for (const registration of userRegistrations) {
            const existingCourse = registration.course;

            for (const newSlot of newCourseSchedule) {
                for (const existingSlot of existingCourse.schedule) {
                    if (newSlot.day === existingSlot.day) {
                        const newStart = convertTimeToMinutes(newSlot.startTime);
                        const newEnd = convertTimeToMinutes(newSlot.endTime);
                        const existingStart = convertTimeToMinutes(existingSlot.startTime);
                        const existingEnd = convertTimeToMinutes(existingSlot.endTime);

                        if ((newStart >= existingStart && newStart < existingEnd) ||
                            (newEnd > existingStart && newEnd <= existingEnd) ||
                            (newStart <= existingStart && newEnd >= existingEnd)) {
                            return res.status(400).json({
                                success: false,
                                error: `Schedule conflict with ${existingCourse.courseCode} on ${newSlot.day}`
                            });
                        }
                    }
                }
            }
        }

        if (course.prerequisites && course.prerequisites.length > 0) {
            const completedRegistrations = await Registration.find({
                student: studentId,
                status: 'approved'
            }).select('course');

            const completedCourseIds = completedRegistrations.map(reg => reg.course.toString());

            const unmetPrerequisites = course.prerequisites.filter(
                prereq => !completedCourseIds.includes(prereq.toString())
            );

            if (unmetPrerequisites.length > 0) {
                const prereqCourses = await Course.find({
                    _id: { $in: unmetPrerequisites }
                }).select('courseCode title');

                return res.status(400).json({
                    success: false,
                    error: 'Prerequisite requirements not met',
                    prerequisites: prereqCourses
                });
            }
        }

        const registration = new Registration({
            student: studentId,
            course: courseId,
            status: 'approved'
        });

        const savedRegistration = await registration.save();

        course.availableSeats -= 1;
        await course.save();

        await User.findByIdAndUpdate(studentId, {
            $push: { registeredCourses: savedRegistration._id }
        });

        if (course.availableSeats === 0 && course.subscribers.length > 0) {
            course.subscribers = [];
            await course.save();
        }

        res.status(201).json({
            success: true,
            registration: savedRegistration
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get all registrations for admin
async function getAllRegistrations(req, res) {
    try {
        const registrations = await Registration.find({})
            .populate('student', 'name rollNumber')
            .populate('course', 'courseCode title');

        res.json({ success: true, registrations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Get student's registrations
async function getCurrentStudentRegistrations(req, res) {
    try {
        const registrations = await Registration.find({ student: req.user._id })
            .populate('course');

        res.json({ success: true, registrations });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Update registration status (admin only)
async function updateCourseRegistration(req, res) {
    try {
        const { status } = req.body;

        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        registration.status = status;
        const updatedRegistration = await registration.save();

        if (status === 'rejected' && registration.status === 'approved') {
            const course = await Course.findById(registration.course);
            if (course) {
                course.availableSeats += 1;
                await course.save();
            }
        }

        if (status === 'approved' && registration.status === 'rejected') {
            const course = await Course.findById(registration.course);
            if (course) {
                course.availableSeats -= 1;
                await course.save();
            }
        }

        res.json({ success: true, registration: updatedRegistration });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

// Cancel registration (student)
async function cancelCourseRegistration(req, res) {
    try {
        const registration = await Registration.findById(req.params.id);

        if (!registration) {
            return res.status(404).json({ success: false, error: 'Registration not found' });
        }

        if (registration.student.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ success: false, error: 'Not authorized' });
        }

        if (registration.status === 'approved') {
            const course = await Course.findById(registration.course);
            if (course) {
                course.availableSeats += 1;
                await course.save();
            }
        }

        await User.findByIdAndUpdate(registration.student, {
            $pull: { registeredCourses: registration._id }
        });

        await registration.deleteOne();

        res.json({ success: true, message: 'Registration cancelled' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
}

module.exports = {
    registerCourse,
    getAllRegistrations,
    getCurrentStudentRegistrations,
    updateCourseRegistration,
    cancelCourseRegistration
};
