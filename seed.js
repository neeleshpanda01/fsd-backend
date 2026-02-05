const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Plan = require('./src/models/Plan');

const seed = async () => {
    try {
        await connectDB();

        // Create Admin
        const adminEmail = 'admin@example.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                email: adminEmail,
                password: hashedPassword,
                fullName: 'System Admin',
                role: 'ADMIN'
            });
            console.log('Admin user created');
        }

        // Create Initial Plans
        const plans = [
            {
                name: 'Basic Plan',
                description: 'Essential features for starters',
                price: 9.99,
                duration: 30,
                features: ['Feature 1', 'Feature 2']
            },
            {
                name: 'Premium Plan',
                description: 'Full access to all features',
                price: 29.99,
                duration: 30,
                features: ['Feature 1', 'Feature 2', 'Feature 3', 'Priority Support']
            }
        ];

        for (const planData of plans) {
            const existingPlan = await Plan.findOne({ name: planData.name });
            if (!existingPlan) {
                await Plan.create(planData);
                console.log(`Plan ${planData.name} created`);
            }
        }

        console.log('Seeding completed');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
