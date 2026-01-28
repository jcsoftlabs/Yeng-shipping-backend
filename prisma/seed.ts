import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@yengshipping.com' },
        update: {},
        create: {
            email: 'admin@yengshipping.com',
            password: hashedPassword,
            firstName: 'Admin',
            lastName: 'Yeng',
            role: 'ADMIN',
        },
    });

    console.log('✅ Created admin user:', admin.email);

    // Create test customer
    const customerPassword = await bcrypt.hash('customer123', 10);

    const customer = await prisma.customer.upsert({
        where: { email: 'jean.pierre@example.com' },
        update: {},
        create: {
            email: 'jean.pierre@example.com',
            password: customerPassword,
            firstName: 'Jean',
            lastName: 'Pierre',
            phone: '+509 1234 5678',
            customAddress: 'YENGSHIPPINGP-Jean-4582',
            addressLine1: '123 Rue de la Paix',
            city: 'Port-au-Prince',
            country: 'Haiti',
        },
    });

    console.log('✅ Created test customer:', customer.email);
    console.log('   Custom address:', customer.customAddress);

    console.log('\n📝 Login credentials:');
    console.log('   Admin: admin@yengshipping.com / admin123');
    console.log('   Customer: jean.pierre@example.com / customer123');
    console.log('\n✨ Seeding complete!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
