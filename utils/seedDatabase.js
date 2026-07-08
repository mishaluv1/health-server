/**
 * MongoDB Database Seeder
 * Populates MongoDB with demo accounts and sample data so the showcase
 * works identically to the in-memory mode.
 *
 * Demo accounts (password: password123):
 *   - admin@example.com   (Admin User)
 *   - doctor@example.com  (Dr. Sarah Smith - Cardiology)
 *   - doctor2@example.com (Dr. Michael Johnson - General Medicine)
 *   - patient@example.com (John Patient)
 */
const User = require('../models/User.js');
const Appointment = require('../models/Appointment.js');
const AIAnalysis = require('../models/AIAnalysis.js');

const DEMO_PASSWORD = 'password123';

const seedDatabase = async () => {
    try {
        console.log('🌱 Seeding MongoDB with demo data...');

        // Check if demo users already exist
        const existingUsers = await User.find({
            email: { $in: ['admin@example.com', 'doctor@example.com', 'doctor2@example.com', 'patient@example.com'] }
        });

        // If users already exist and SEED_DB is not forcing a re-seed, skip
        const forceReseed = process.env.SEED_DB === 'true';

        if (existingUsers.length >= 4 && !forceReseed) {
            console.log('✅ Demo users already exist. Skipping seed (set SEED_DB=true to force re-seed).');
            return;
        }

        if (forceReseed) {
            console.log('🔄 SEED_DB=true - clearing existing demo data...');
            // Delete demo users and their related data
            const demoUserIds = existingUsers.map(u => u._id);
            if (demoUserIds.length > 0) {
                await Appointment.deleteMany({
                    $or: [{ patient: { $in: demoUserIds } }, { doctor: { $in: demoUserIds } }]
                });
                await AIAnalysis.deleteMany({ patient: { $in: demoUserIds } });
                await User.deleteMany({ _id: { $in: demoUserIds } });
            }
        }

        // Create demo users (password is hashed by the User model pre-save hook)
        const patient = await User.create({
            name: 'John Patient',
            email: 'patient@example.com',
            password: DEMO_PASSWORD,
            role: 'patient',
            phone: '+1234567890',
            dateOfBirth: new Date('1990-01-15'),
            bloodGroup: 'O+',
            isActive: true,
        });

        const doctor = await User.create({
            name: 'Dr. Sarah Smith',
            email: 'doctor@example.com',
            password: DEMO_PASSWORD,
            role: 'doctor',
            phone: '+1234567891',
            specialization: 'Cardiology',
            licenseNumber: 'MD12345',
            isActive: true,
        });

        const doctor2 = await User.create({
            name: 'Dr. Michael Johnson',
            email: 'doctor2@example.com',
            password: DEMO_PASSWORD,
            role: 'doctor',
            phone: '+1234567892',
            specialization: 'General Medicine',
            licenseNumber: 'MD12346',
            isActive: true,
        });

        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: DEMO_PASSWORD,
            role: 'admin',
            isActive: true,
        });

        // Create sample appointments
        await Appointment.create({
            patient: patient._id,
            doctor: doctor._id,
            appointmentDate: new Date('2024-12-20'),
            appointmentTime: '10:00',
            status: 'confirmed',
            reason: 'Regular checkup',
            symptoms: 'Mild headache',
        });

        await Appointment.create({
            patient: patient._id,
            doctor: doctor2._id,
            appointmentDate: new Date('2024-12-25'),
            appointmentTime: '14:00',
            status: 'pending',
            reason: 'Follow-up consultation',
        });

        // Create sample AI analysis
        await AIAnalysis.create({
            patient: patient._id,
            inputType: 'symptoms',
            userInput: 'I have been experiencing persistent headaches for the past week, along with mild nausea.',
            aiResponse: {
                possibleDiagnosis: [
                    {
                        condition: 'Tension Headache',
                        probability: 0.7,
                        description: 'Common type of headache often caused by stress or muscle tension.',
                    },
                    {
                        condition: 'Migraine',
                        probability: 0.3,
                        description: 'Recurrent headaches that can cause moderate to severe pain.',
                    },
                ],
                severity: 'medium',
                recommendedActions: [
                    'Rest in a quiet, dark room',
                    'Stay hydrated',
                    'Consider over-the-counter pain relief',
                    'Consult with a healthcare professional if symptoms persist',
                ],
                notes: 'Symptoms suggest possible tension headache or migraine. Monitor symptoms and seek professional advice if they worsen.',
                confidence: 75,
            },
            aiModel: 'gpt-4',
            isReviewed: false,
        });

        console.log('✅ MongoDB seeded successfully with demo data:');
        console.log(`   👤 Patient: ${patient.email}`);
        console.log(`   🩺 Doctor: ${doctor.email} (${doctor.specialization})`);
        console.log(`   🩺 Doctor: ${doctor2.email} (${doctor2.specialization})`);
        console.log(`   🛡️  Admin: ${admin.email}`);
        console.log(`   📅 Sample appointments and AI analysis created`);
    } catch (error) {
        console.error('❌ Error seeding database:', error.message);
        // Don't throw - allow server to continue even if seeding fails
    }
};

module.exports = seedDatabase;
