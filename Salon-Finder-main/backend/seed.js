/**
 * Seed Script - Creates admin user and sample data
 * Run with: node seed.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Salon = require('./models/Salon');
const Service = require('./models/Service');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/salon-booking';

// Admin credentials
const ADMIN_EMAIL = 'admin@salonfinder.com';
const ADMIN_PASSWORD = 'admin123';

// Sample salon owner
const SALON_OWNER_EMAIL = 'owner@salon.com';
const SALON_OWNER_PASSWORD = 'owner123';

const seedDatabase = async () => {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Create Admin User
        let admin = await User.findOne({ email: ADMIN_EMAIL });
        if (!admin) {
            admin = await User.create({
                name: 'Admin User',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                role: 'admin',
                phone: '+91 9999999999'
            });
            console.log('✅ Admin user created');
            console.log(`   Email: ${ADMIN_EMAIL}`);
            console.log(`   Password: ${ADMIN_PASSWORD}`);
        } else {
            console.log('ℹ️  Admin user already exists');
        }

        // Create Sample Salon Owner
        let salonOwner = await User.findOne({ email: SALON_OWNER_EMAIL });
        if (!salonOwner) {
            salonOwner = await User.create({
                name: 'Demo Salon Owner',
                email: SALON_OWNER_EMAIL,
                password: SALON_OWNER_PASSWORD,
                role: 'salonOwner',
                phone: '+91 8888888888'
            });
            console.log('✅ Salon owner created');
            console.log(`   Email: ${SALON_OWNER_EMAIL}`);
            console.log(`   Password: ${SALON_OWNER_PASSWORD}`);
        } else {
            console.log('ℹ️  Salon owner already exists');
        }

        // Create Sample Salon (already verified for testing)
        let salon = await Salon.findOne({ owner: salonOwner._id });
        if (!salon) {
            salon = await Salon.create({
                name: 'Premium Style Studio',
                description: 'A premium salon offering world-class grooming services with experienced stylists.',
                owner: salonOwner._id,
                phone: '+91 8888888888',
                email: SALON_OWNER_EMAIL,
                location: {
                    type: 'Point',
                    coordinates: [77.2090, 28.6139], // Delhi coordinates [lng, lat]
                    formattedAddress: '123 Main Street, Connaught Place',
                    city: 'Delhi',
                    state: 'Delhi',
                    country: 'India'
                },
                workingHours: {
                    monday: { open: '09:00', close: '21:00', isClosed: false },
                    tuesday: { open: '09:00', close: '21:00', isClosed: false },
                    wednesday: { open: '09:00', close: '21:00', isClosed: false },
                    thursday: { open: '09:00', close: '21:00', isClosed: false },
                    friday: { open: '09:00', close: '21:00', isClosed: false },
                    saturday: { open: '10:00', close: '22:00', isClosed: false },
                    sunday: { open: '10:00', close: '18:00', isClosed: false }
                },
                slotDuration: 30,
                isVerified: true,  // Pre-verified for testing
                isActive: true,
                averageRating: 4.5,
                totalReviews: 120
            });
            console.log('✅ Sample salon created (pre-verified)');

            // Add sample services
            const services = [
                { name: 'Haircut', category: 'haircut', price: 300, duration: 30, salon: salon._id },
                { name: 'Beard Trim', category: 'beard', price: 150, duration: 20, salon: salon._id },
                { name: 'Hair Color', category: 'hair-color', price: 1500, duration: 90, salon: salon._id },
                { name: 'Head Massage', category: 'massage', price: 400, duration: 30, salon: salon._id },
                { name: 'Facial', category: 'facial', price: 800, duration: 45, salon: salon._id },
                { name: 'Clean Shave', category: 'shave', price: 100, duration: 15, salon: salon._id }
            ];

            for (const service of services) {
                await Service.create(service);
            }
            console.log('✅ Sample services added (6 services)');
        } else {
            console.log('ℹ️  Sample salon already exists');
        }

        // Create a second salon in Mumbai
        const salon2Owner = await User.findOne({ email: 'mumbai@salon.com' });
        if (!salon2Owner) {
            const owner2 = await User.create({
                name: 'Mumbai Salon Owner',
                email: 'mumbai@salon.com',
                password: 'owner123',
                role: 'salonOwner',
                phone: '+91 7777777777'
            });

            const salon2 = await Salon.create({
                name: 'Urban Cuts & Style',
                description: 'Modern styling at affordable prices.',
                owner: owner2._id,
                phone: '+91 7777777777',
                email: 'mumbai@salon.com',
                location: {
                    type: 'Point',
                    coordinates: [72.8777, 19.0760], // Mumbai coordinates
                    formattedAddress: '456 Fashion Street, Colaba',
                    city: 'Mumbai',
                    state: 'Maharashtra',
                    country: 'India'
                },
                slotDuration: 30,
                isVerified: true,
                isActive: true,
                averageRating: 4.2,
                totalReviews: 85
            });

            const services2 = [
                { name: 'Men\'s Haircut', category: 'haircut', price: 250, duration: 25, salon: salon2._id },
                { name: 'Women\'s Haircut', category: 'haircut', price: 450, duration: 40, salon: salon2._id },
                { name: 'Hair Spa', category: 'spa', price: 1200, duration: 60, salon: salon2._id }
            ];

            for (const service of services2) {
                await Service.create(service);
            }
            console.log('✅ Second sample salon created (Mumbai)');
        }

        console.log('\n========================================');
        console.log('🎉 Database seeded successfully!');
        console.log('========================================');
        console.log('\nLogin Credentials:');
        console.log('------------------');
        console.log(`Admin:       ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
        console.log(`Salon Owner: ${SALON_OWNER_EMAIL} / ${SALON_OWNER_PASSWORD}`);
        console.log(`             mumbai@salon.com / owner123`);
        console.log('\n');

    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('Database connection closed.');
        process.exit(0);
    }
};

seedDatabase();
