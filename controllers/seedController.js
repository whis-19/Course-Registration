const User = require('../models/user');
const Course = require('../models/course');

const seedInitialData = async (req, res) => {
    try {
        // Check if admin exists
        const adminExists = await User.findOne({ role: 'admin' });

        if (!adminExists) {
            // Create default admin
            await User.create({
                rollNumber: 'whis',
                name: 'Muhammad abdullah',
                password: 'admin123',
                role: 'admin'
            });
        }

        // Create your student account
        const studentExists = await User.findOne({ rollNumber: '22F-3722' });

        if (!studentExists) {
            await User.create({
                rollNumber: '22F-3722',
                name: 'Muhammad Abdullah',
                password: 'whis@3722',
                role: 'student'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Initial data seeded successfully'
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    seedInitialData
};