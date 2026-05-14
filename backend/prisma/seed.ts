import { PrismaClient, UserRole, PrescriptionStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for all users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@test.com' },
    update: {},
    create: {
      email: 'admin@test.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
    },
  });

  // Create Doctor User
  const doctorUser = await prisma.user.upsert({
    where: { email: 'dr@test.com' },
    update: {},
    create: {
      email: 'dr@test.com',
      password: hashedPassword,
      firstName: 'Dr. Maria',
      lastName: 'Gonzalez',
      role: UserRole.DOCTOR,
    },
  });

  // Create Doctor Profile
  const doctor = await prisma.doctor.upsert({
    where: { userId: doctorUser.id },
    update: {},
    create: {
      userId: doctorUser.id,
      specialty: 'General Medicine',
    },
  });

  // Create Patient User
  const patientUser = await prisma.user.upsert({
    where: { email: 'patient@test.com' },
    update: {},
    create: {
      email: 'patient@test.com',
      password: hashedPassword,
      firstName: 'Ana',
      lastName: 'Molina',
      role: UserRole.PATIENT,
    },
  });

  // Create Patient Profile
  const patient = await prisma.patient.upsert({
    where: { userId: patientUser.id },
    update: {},
    create: {
      userId: patientUser.id,
    },
  });

  // Create Sample Prescription
  const prescription = await prisma.prescription.upsert({
    where: { id: 'sample-prescription-1' },
    update: {},
    create: {
      id: 'sample-prescription-1',
      doctorId: doctor.id,
      patientId: patient.id,
      status: PrescriptionStatus.PENDING,
      patientEmail: patientUser.email,
      items: {
        create: [
          {
            name: 'Paracetamol',
            dosage: '500mg',
            quantity: 20,
            instructions: 'Tomar 1 tableta cada 8 horas con comida',
          },
          {
            name: 'Ibuprofeno',
            dosage: '400mg',
            quantity: 15,
            instructions: 'Tomar 1 tableta cada 6 horas si hay dolor',
          },
        ],
      },
    },
  });

  // Create another prescription with CONSUMED status
  const consumedPrescription = await prisma.prescription.upsert({
    where: { id: 'sample-prescription-2' },
    update: {},
    create: {
      id: 'sample-prescription-2',
      doctorId: doctor.id,
      patientId: patient.id,
      status: PrescriptionStatus.CONSUMED,
      patientEmail: patientUser.email,
      items: {
        create: [
          {
            name: 'Amoxicilina',
            dosage: '500mg',
            quantity: 14,
            instructions: 'Tomar 1 cápsula cada 8 horas durante 7 días',
          },
        ],
      },
    },
  });

  await prisma.prescription.upsert({
    where: { id: 'sample-prescription-3' },
    update: {},
    create: {
      id: 'sample-prescription-3',
      doctorId: doctor.id,
      patientId: patient.id,
      status: PrescriptionStatus.PENDING,
      patientEmail: patientUser.email,
      notes: 'Control de presión arterial',
      items: {
        create: [
          {
            name: 'Losartán',
            dosage: '50mg',
            quantity: 30,
            instructions: 'Tomar una vez al día en la mañana',
          },
        ],
      },
    },
  });

  await prisma.prescription.upsert({
    where: { id: 'sample-prescription-4' },
    update: {},
    create: {
      id: 'sample-prescription-4',
      doctorId: doctor.id,
      patientId: patient.id,
      status: PrescriptionStatus.CONSUMED,
      patientEmail: patientUser.email,
      notes: 'Alergia estacional',
      consumedAt: new Date(),
      items: {
        create: [
          {
            name: 'Loratadina',
            dosage: '10mg',
            quantity: 10,
            instructions: 'Tomar una tableta diaria por la mañana',
          },
        ],
      },
    },
  });

  await prisma.prescription.upsert({
    where: { id: 'sample-prescription-5' },
    update: {},
    create: {
      id: 'sample-prescription-5',
      doctorId: doctor.id,
      patientId: patient.id,
      status: PrescriptionStatus.PENDING,
      patientEmail: patientUser.email,
      notes: 'Suplemento de vitaminas',
      items: {
        create: [
          {
            name: 'Vitamina D',
            dosage: '1000 UI',
            quantity: 60,
            instructions: 'Tomar una cápsula diaria con el desayuno',
          },
        ],
      },
    },
  });

  await prisma.prescription.upsert({
    where: { id: 'sample-prescription-6' },
    update: {},
    create: {
      id: 'sample-prescription-6',
      doctorId: doctor.id,
      patientId: patient.id,
      status: PrescriptionStatus.PENDING,
      patientEmail: patientUser.email,
      notes: 'Dieta baja en sodio',
      items: {
        create: [
          {
            name: 'Complejo B',
            dosage: '1 tableta',
            quantity: 30,
            instructions: 'Tomar una tableta con agua después del desayuno',
          },
        ],
      },
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('📧 Test accounts created:');
  console.log('   Admin: admin@test.com / password123');
  console.log('   Doctor: dr@test.com / password123');
  console.log('   Patient: patient@test.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });